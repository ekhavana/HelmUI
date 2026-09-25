import type { BoatData } from '../data/boatData';
import { isOwnVesselContext, vesselIdFromContext } from '../domain/ais/context';
import type { AisContact } from '../domain/ais/types';
import type { SignalKDeltaMessage, SignalKValueUpdate } from './types';
import { kelvinToCelsius, metersPerSecondToKnots, metersToFeet, radiansToDegrees } from './units';

type AisContactPatch = Partial<AisContact> & { id: string };

export type BoatDataPatch = Partial<{
  depth: Partial<BoatData['depth']>;
  speed: Partial<BoatData['speed']>;
  navigation: Partial<BoatData['navigation']>;
  wind: Partial<BoatData['wind']>;
  ais: {
    riskLevel?: BoatData['ais']['riskLevel'];
    targets?: number;
    closestNm?: number | null;
    closestName?: string | null;
    bearing?: string;
    contacts?: Record<string, AisContactPatch>;
  };
  autopilot: Partial<BoatData['autopilot']>;
  battery: Partial<BoatData['battery']>;
  bilge: Partial<BoatData['bilge']>;
  engine: Partial<BoatData['engine']>;
  environment: Partial<BoatData['environment']>;
  route: Partial<BoatData['route']>;
}>;

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function bool(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function mergePatch(target: BoatDataPatch, patch: BoatDataPatch): void {
  for (const key of Object.keys(patch) as Array<keyof BoatDataPatch>) {
    if (key === 'ais') {
      target.ais = {
        ...target.ais,
        ...patch.ais,
        contacts: { ...target.ais?.contacts, ...patch.ais?.contacts },
      };
      continue;
    }
    target[key] = { ...target[key], ...patch[key] } as never;
  }
}

function mapAisValue(id: string, update: SignalKValueUpdate, lastSeen: string): BoatDataPatch {
  const value = update.value;
  const contact: AisContactPatch = { id, lastSeen };

  switch (update.path) {
    case 'navigation.position': {
      if (value && typeof value === 'object' && 'latitude' in value && 'longitude' in value) {
        const lat = numeric((value as Record<string, unknown>).latitude);
        const lon = numeric((value as Record<string, unknown>).longitude);
        if (lat !== null && lon !== null) {
          contact.latitude = lat;
          contact.longitude = lon;
          return { ais: { contacts: { [id]: contact } } };
        }
      }
      return {};
    }
    case 'navigation.speedOverGround': {
      const sog = numeric(value);
      if (sog === null) return {};
      contact.sogKts = metersPerSecondToKnots(sog);
      return { ais: { contacts: { [id]: contact } } };
    }
    case 'navigation.courseOverGroundTrue': {
      const cog = numeric(value);
      if (cog === null) return {};
      contact.cogTrue = radiansToDegrees(cog);
      return { ais: { contacts: { [id]: contact } } };
    }
    case 'navigation.headingTrue': {
      const heading = numeric(value);
      if (heading === null) return {};
      contact.headingTrue = radiansToDegrees(heading);
      return { ais: { contacts: { [id]: contact } } };
    }
    case 'name': {
      const name = text(value);
      if (!name) return {};
      contact.name = name;
      return { ais: { contacts: { [id]: contact } } };
    }
    case 'mmsi': {
      if (value === undefined || value === null) return {};
      contact.mmsi = String(value);
      return { ais: { contacts: { [id]: contact } } };
    }
    default:
      return {};
  }
}

function mapValue(update: SignalKValueUpdate): BoatDataPatch {
  const value = update.value;
  const numberValue = numeric(value);

  switch (update.path) {
    case 'environment.depth.belowTransducer':
      return numberValue === null ? {} : { depth: { belowTransducerFt: metersToFeet(numberValue) } };
    case 'navigation.speedThroughWater':
      return numberValue === null ? {} : { speed: { stwKts: metersPerSecondToKnots(numberValue) } };
    case 'navigation.speedOverGround':
      return numberValue === null ? {} : { speed: { sogKts: metersPerSecondToKnots(numberValue) } };
    case 'navigation.courseOverGroundTrue':
      return numberValue === null ? {} : { navigation: { cogTrue: radiansToDegrees(numberValue) } };
    case 'navigation.headingTrue':
      return numberValue === null ? {} : { navigation: { headingTrue: radiansToDegrees(numberValue) } };
    case 'environment.wind.angleApparent':
      return numberValue === null ? {} : { wind: { awaDeg: radiansToDegrees(numberValue) } };
    case 'environment.wind.speedApparent':
      return numberValue === null ? {} : { wind: { awsKts: metersPerSecondToKnots(numberValue) } };
    case 'environment.wind.speedTrue':
      return numberValue === null ? {} : { wind: { twsKts: metersPerSecondToKnots(numberValue) } };
    case 'steering.autopilot.mode':
    case 'steering.autopilot.state': {
      const mode = text(value);
      return mode === null ? {} : { autopilot: { state: mode.toLowerCase() } };
    }
    case 'steering.autopilot.target.headingTrue':
      return numberValue === null ? {} : { autopilot: { headingTarget: radiansToDegrees(numberValue) } };
    case 'electrical.batteries.house.voltage':
      return numberValue === null ? {} : { battery: { houseVoltage: numberValue } };
    case 'electrical.batteries.house.current':
      return numberValue === null ? {} : { battery: { currentAmps: numberValue } };
    case 'electrical.batteries.house.capacity.stateOfCharge':
      return numberValue === null ? {} : { battery: { housePercent: Math.round(numberValue * 100) } };
    case 'environment.inside.bilge.floodDetected': {
      const alarm = bool(value);
      return alarm === null ? {} : { bilge: { alarm, message: alarm ? 'Water Detected' : 'No Water Detected' } };
    }
    case 'propulsion.main.coolantTemperature':
      return numberValue === null ? {} : { engine: { coolantTempC: kelvinToCelsius(numberValue) } };
    case 'propulsion.main.revolutions':
      return numberValue === null ? {} : { engine: { rpm: Math.round(numberValue * 60) } };
    case 'propulsion.main.oilPressure':
      return numberValue === null ? {} : { engine: { oilPressurePsi: numberValue * 0.000145038 } };
    case 'propulsion.main.fuel.rate':
      return numberValue === null ? {} : { engine: { fuelRateLph: numberValue * 3600 } };
    case 'propulsion.main.runTime':
      return numberValue === null ? {} : { engine: { hours: numberValue / 3600 } };
    case 'electrical.alternators.0.voltage':
      return numberValue === null ? {} : { engine: { alternatorVoltage: numberValue } };
    case 'navigation.gnss.methodQuality': {
      const gpsFix = text(value);
      return gpsFix === null ? {} : { navigation: { gpsFix } };
    }
    case 'navigation.gnss.satellites':
      return numberValue === null ? {} : { navigation: { satellites: Math.round(numberValue) } };
    case 'environment.water.temperature':
      return numberValue === null ? {} : { environment: { waterTempC: kelvinToCelsius(numberValue) } };
    case 'navigation.courseRhumbline.nextPoint.distance':
      return numberValue === null ? {} : { route: { distanceNm: numberValue / 1852 } };
    case 'navigation.courseRhumbline.crossTrackError':
      return numberValue === null ? {} : { route: { crossTrackErrorNm: Math.abs(numberValue) / 1852 } };
    case 'navigation.courseRhumbline.nextPoint.name': {
      const name = text(value);
      return name === null ? {} : { route: { nextWaypoint: name } };
    }
    case 'navigation.position': {
      if (value && typeof value === 'object' && 'latitude' in value && 'longitude' in value) {
        const lat = numeric((value as Record<string, unknown>).latitude);
        const lon = numeric((value as Record<string, unknown>).longitude);
        if (lat !== null && lon !== null) return { navigation: { latitude: lat, longitude: lon } };
      }
      return {};
    }
    default:
      return {};
  }
}

export function mapSignalKDelta(delta: SignalKDeltaMessage, selfContext = 'vessels.self'): BoatDataPatch {
  const patch: BoatDataPatch = {};
  const context = delta.context ?? 'vessels.self';
  const ownVessel = isOwnVesselContext(context, selfContext);

  for (const updateGroup of delta.updates ?? []) {
    const lastSeen = updateGroup.timestamp ?? new Date().toISOString();
    for (const valueUpdate of updateGroup.values ?? []) {
      mergePatch(
        patch,
        ownVessel ? mapValue(valueUpdate) : mapAisValue(vesselIdFromContext(context), valueUpdate, lastSeen),
      );
    }
  }

  return patch;
}

export function applyBoatDataPatch(data: BoatData, patch: BoatDataPatch): BoatData {
  return {
    ...data,
    depth: { ...data.depth, ...patch.depth },
    speed: { ...data.speed, ...patch.speed },
    navigation: { ...data.navigation, ...patch.navigation },
    wind: { ...data.wind, ...patch.wind },
    ais: {
      ...data.ais,
      ...patch.ais,
      contacts: { ...data.ais.contacts, ...patch.ais?.contacts } as BoatData['ais']['contacts'],
    },
    autopilot: { ...data.autopilot, ...patch.autopilot },
    battery: { ...data.battery, ...patch.battery },
    bilge: { ...data.bilge, ...patch.bilge },
    engine: { ...data.engine, ...patch.engine },
    environment: { ...data.environment, ...patch.environment },
    route: { ...data.route, ...patch.route },
  };
}
