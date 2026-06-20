export function defaultSourceState() {
  return {
    signalk: { connected: false, lastSeen: null, detail: 'not connected' },
    mqtt: { connected: false, lastSeen: null, detail: 'not connected' },
    nodered: { connected: false, lastSeen: null, detail: 'not connected' },
  };
}

export function normalizeSignalKDelta(delta) {
  const patch = {};
  const updates = Array.isArray(delta?.updates) ? delta.updates : [];
  for (const group of updates) {
    for (const item of group.values ?? []) {
      const value = item?.value;
      switch (item?.path) {
        case 'environment.depth.belowTransducer':
          if (typeof value === 'number') patch.depth = { ...(patch.depth ?? {}), belowTransducerFt: value * 3.28084 };
          break;
        case 'navigation.speedOverGround':
          if (typeof value === 'number') patch.speed = { ...(patch.speed ?? {}), sogKts: value * 1.94384 };
          break;
        case 'navigation.speedThroughWater':
          if (typeof value === 'number') patch.speed = { ...(patch.speed ?? {}), stwKts: value * 1.94384 };
          break;
        case 'navigation.headingTrue':
          if (typeof value === 'number') patch.navigation = { ...(patch.navigation ?? {}), headingTrue: (value * 180) / Math.PI };
          break;
        case 'navigation.courseOverGroundTrue':
          if (typeof value === 'number') patch.navigation = { ...(patch.navigation ?? {}), cogTrue: (value * 180) / Math.PI };
          break;
        case 'environment.wind.angleApparent':
          if (typeof value === 'number') patch.wind = { ...(patch.wind ?? {}), awaDeg: (value * 180) / Math.PI };
          break;
        case 'environment.wind.speedApparent':
          if (typeof value === 'number') patch.wind = { ...(patch.wind ?? {}), awsKts: value * 1.94384 };
          break;
        case 'environment.wind.speedTrue':
          if (typeof value === 'number') patch.wind = { ...(patch.wind ?? {}), twsKts: value * 1.94384 };
          break;
        case 'navigation.gnss.satellites':
          if (typeof value === 'number') patch.navigation = { ...(patch.navigation ?? {}), satellites: Math.round(value) };
          break;
        case 'navigation.gnss.methodQuality':
          if (typeof value === 'string') patch.navigation = { ...(patch.navigation ?? {}), gpsFix: value };
          break;
        case 'electrical.batteries.house.voltage':
          if (typeof value === 'number') patch.battery = { ...(patch.battery ?? {}), houseVoltage: value };
          break;
        case 'electrical.batteries.house.current':
          if (typeof value === 'number') patch.battery = { ...(patch.battery ?? {}), currentAmps: value };
          break;
        case 'propulsion.main.coolantTemperature':
          if (typeof value === 'number') patch.engine = { ...(patch.engine ?? {}), coolantTempC: value - 273.15 };
          break;
        case 'electrical.alternators.0.voltage':
          if (typeof value === 'number') patch.engine = { ...(patch.engine ?? {}), alternatorVoltage: value };
          break;
        default:
          break;
      }
    }
  }
  return patch;
}
