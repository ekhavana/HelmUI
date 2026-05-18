import type { BoatData } from '../data/mockBoatData';
import type { SignalKDeltaMessage, SignalKValueUpdate } from './types';
import { kelvinToCelsius, metersPerSecondToKnots, metersToFeet, radiansToDegrees } from './units';

type BoatDataPatch = Partial<{
  depth: Partial<BoatData['depth']>;
  speed: Partial<BoatData['speed']>;
  navigation: Partial<BoatData['navigation']>;
  wind: Partial<BoatData['wind']>;
  battery: Partial<BoatData['battery']>;
  bilge: Partial<BoatData['bilge']>;
  engine: Partial<BoatData['engine']>;
  environment: Partial<BoatData['environment']>;
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
    target[key] = { ...target[key], ...patch[key] } as never;
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
    case 'electrical.batteries.house.voltage':
      return numberValue === null ? {} : { battery: { houseVoltage: numberValue } };
    case 'electrical.batteries.house.current':
      return numberValue === null ? {} : { battery: { currentAmps: numberValue } };
    case 'environment.inside.bilge.floodDetected': {
      const alarm = bool(value);
      return alarm === null ? {} : { bilge: { alarm, message: alarm ? 'Water Detected' : 'No Water Detected' } };
    }
    case 'propulsion.main.coolantTemperature':
      return numberValue === null ? {} : { engine: { coolantTempC: kelvinToCelsius(numberValue) } };
    case 'electrical.alternators.0.voltage':
      return numberValue === null ? {} : { engine: { alternatorVoltage: numberValue } };
    case 'navigation.gnss.methodQuality': {
      const gpsFix = text(value);
      return gpsFix === null ? {} : { navigation: { gpsFix } };
    }
    case 'navigation.gnss.satellites':
      return numberValue === null ? {} : { navigation: { satellites: Math.round(numberValue) } };
    default:
      return {};
  }
}

export function mapSignalKDelta(delta: SignalKDeltaMessage): BoatDataPatch {
  const patch: BoatDataPatch = {};

  for (const updateGroup of delta.updates ?? []) {
    for (const valueUpdate of updateGroup.values ?? []) {
      mergePatch(patch, mapValue(valueUpdate));
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
    battery: { ...data.battery, ...patch.battery },
    bilge: { ...data.bilge, ...patch.bilge },
    engine: { ...data.engine, ...patch.engine },
    environment: { ...data.environment, ...patch.environment },
  };
}
