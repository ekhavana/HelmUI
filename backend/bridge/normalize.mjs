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
        case 'navigation.position':
          if (value && typeof value === 'object' && typeof value.latitude === 'number' && typeof value.longitude === 'number') {
            patch.navigation = { ...(patch.navigation ?? {}), latitude: value.latitude, longitude: value.longitude };
          }
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
        case 'electrical.batteries.house.capacity.stateOfCharge':
          if (typeof value === 'number') patch.battery = { ...(patch.battery ?? {}), housePercent: Math.round(value * 100) };
          break;
        case 'propulsion.main.coolantTemperature':
          if (typeof value === 'number') patch.engine = { ...(patch.engine ?? {}), coolantTempC: value - 273.15 };
          break;
        case 'propulsion.main.revolutions':
          if (typeof value === 'number') patch.engine = { ...(patch.engine ?? {}), rpm: Math.round(value * 60) };
          break;
        case 'propulsion.main.oilPressure':
          if (typeof value === 'number') patch.engine = { ...(patch.engine ?? {}), oilPressurePsi: value * 0.000145038 };
          break;
        case 'propulsion.main.fuel.rate':
          if (typeof value === 'number') patch.engine = { ...(patch.engine ?? {}), fuelRateLph: value * 3600 };
          break;
        case 'propulsion.main.runTime':
          if (typeof value === 'number') patch.engine = { ...(patch.engine ?? {}), hours: value / 3600 };
          break;
        case 'environment.water.temperature':
          if (typeof value === 'number') patch.environment = { ...(patch.environment ?? {}), waterTempC: value - 273.15 };
          break;
        case 'navigation.courseRhumbline.nextPoint.distance':
          if (typeof value === 'number') patch.route = { ...(patch.route ?? {}), distanceNm: value / 1852 };
          break;
        case 'navigation.courseRhumbline.crossTrackError':
          if (typeof value === 'number') patch.route = { ...(patch.route ?? {}), crossTrackErrorNm: Math.abs(value) / 1852 };
          break;
        case 'navigation.courseRhumbline.nextPoint.name':
          if (typeof value === 'string') patch.route = { ...(patch.route ?? {}), nextWaypoint: value };
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
