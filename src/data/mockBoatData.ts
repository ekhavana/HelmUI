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
    coolantTempC: 68,
    alternatorVoltage: 14.1,
  },
  environment: {
    waterTempC: 17.2,
  },
  time: {
    local: '16:42',
    eta: '18:54',
    sunsetCountdown: '01:27',
  },
} as const;

export type BoatData = typeof mockBoatData;
