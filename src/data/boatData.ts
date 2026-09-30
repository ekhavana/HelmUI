import type { AisContacts } from '../domain/ais/types';

// Production-safe seed state.
//
// Every telemetry-derived field starts unknown (null) so the interface can
// only ever display values that actually arrived from the vessel. Live
// patches merge over this object; nothing here should look like real data.
export const emptyBoatData = {
  depth: {
    belowTransducerFt: null as number | null,
  },
  speed: {
    sogKts: null as number | null,
    stwKts: null as number | null,
  },
  navigation: {
    headingTrue: null as number | null,
    cogTrue: null as number | null,
    gpsFix: null as string | null,
    satellites: null as number | null,
    latitude: null as number | null,
    longitude: null as number | null,
  },
  wind: {
    awaDeg: null as number | null,
    awsKts: null as number | null,
    twsKts: null as number | null,
    side: '—',
  },
  ais: {
    riskLevel: 'safe' as 'safe' | 'warning' | 'danger',
    targets: 0,
    closestNm: null as number | null,
    closestName: null as string | null,
    bearing: '—',
    contacts: {} as AisContacts,
  },
  autopilot: {
    state: 'standby',
    headingTarget: null as number | null,
  },
  battery: {
    housePercent: null as number | null,
    houseVoltage: null as number | null,
    currentAmps: null as number | null,
  },
  bilge: {
    alarm: null as boolean | null,
    message: 'Waiting for data',
  },
  engine: {
    rpm: null as number | null,
    coolantTempC: null as number | null,
    oilPressurePsi: null as number | null,
    hours: null as number | null,
    fuelRateLph: null as number | null,
    alternatorVoltage: null as number | null,
  },
  tanks: {
    fuelPercent: null as number | null,
    freshWaterPercent: null as number | null,
    wastePercent: null as number | null,
  },
  power: {
    solarWatts: null as number | null,
    loadWatts: null as number | null,
    inverterOn: null as boolean | null,
  },
  network: {
    signalK: 'unknown',
    mqtt: 'unknown',
    nodered: 'unknown',
  },
  anchor: {
    deployed: false,
    rodeMeters: null as number | null,
    scopeRatio: null as number | null,
    radiusMeters: 24,
    distanceFromSetMeters: null as number | null,
    alarmArmed: true,
    anchorLat: null as number | null,
    anchorLon: null as number | null,
  },
  route: {
    nextWaypoint: '—',
    distanceNm: null as number | null,
    etaMinutes: null as number | null,
    crossTrackErrorNm: null as number | null,
  },
  environment: {
    waterTempC: null as number | null,
  },
  time: {
    local: '--:--',
    eta: '--:--',
    sunsetCountdown: '--:--',
  },
};

export type BoatData = typeof emptyBoatData;
