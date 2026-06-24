export const mockBoatData = {
  depth: {
    belowTransducerFt: 8.6,
    trend: 'stable',
    status: 'safe',
  },
  speed: {
    sogKts: 6.2,
    stwKts: 6.7,
  },
  navigation: {
    headingTrue: 45,
    cogTrue: 45,
    gpsFix: '3D',
    satellites: 12,
    latitude: null as number | null,
    longitude: null as number | null,
  },
  wind: {
    awaDeg: 135,
    awsKts: 9.8,
    twsKts: 11.4,
    side: 'Port',
  },
  ais: {
    riskLevel: 'warning',
    targets: 2,
    closestNm: 1.2,
    bearing: 'Port Bow',
  },
  autopilot: {
    state: 'standby',
    headingTarget: 45,
  },
  battery: {
    housePercent: 84,
    houseVoltage: 13.2,
    currentAmps: -2.1,
  },
  bilge: {
    alarm: false,
    message: 'No Water Detected',
  },
  engine: {
    rpm: 2450,
    coolantTempC: 68,
    oilPressurePsi: 51,
    hours: 1286.4,
    fuelRateLph: 7.6,
    alternatorVoltage: 14.1,
  },
  tanks: {
    fuelPercent: 72,
    freshWaterPercent: 58,
    wastePercent: 33,
  },
  power: {
    solarWatts: 420,
    loadWatts: 360,
    inverterOn: false,
  },
  network: {
    signalK: 'online',
    mqtt: 'online',
    nodered: 'degraded',
  },
  anchor: {
    deployed: true,
    rodeMeters: 38,
    scopeRatio: 4.2,
    radiusMeters: 24,
    distanceFromSetMeters: 9.2,
    alarmArmed: true,
    anchorLat: null as number | null,
    anchorLon: null as number | null,
  },
  route: {
    nextWaypoint: 'Harbor Approach',
    distanceNm: 6.4,
    etaMinutes: 62,
    crossTrackErrorNm: 0.08,
  },
  environment: {
    waterTempC: 17.2,
  },
  time: {
    local: '16:42',
    eta: '18:54',
    sunsetCountdown: '01:27',
  },
};

export type BoatData = typeof mockBoatData;
