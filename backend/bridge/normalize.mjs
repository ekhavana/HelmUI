export function defaultSourceState() {
  return {
    signalk: { connected: false, lastSeen: null, detail: 'not connected' },
    mqtt: { connected: false, lastSeen: null, detail: 'not connected' },
    nodered: { connected: false, lastSeen: null, detail: 'not connected' },
  };
}

function isOwnVesselContext(context, selfContext = 'vessels.self') {
  if (!context || context === 'vessels.self') return true;
  return context === selfContext;
}

function vesselIdFromContext(context) {
  const mmsi = String(context).match(/mmsi[:.](\d+)/i);
  if (mmsi) return mmsi[1];
  return String(context).replace(/^vessels\./, '');
}

function numeric(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeAisDelta(delta, context) {
  const id = vesselIdFromContext(context);
  const contact = { id, mmsi: id };
  let touched = false;
  const timestamp = delta?.updates?.find((group) => typeof group?.timestamp === 'string')?.timestamp;

  for (const group of Array.isArray(delta?.updates) ? delta.updates : []) {
    for (const item of group.values ?? []) {
      const value = item?.value;
      switch (item?.path) {
        case 'navigation.position':
          if (value && typeof value === 'object') {
            const lat = numeric(value.latitude);
            const lon = numeric(value.longitude);
            if (lat !== null && lon !== null) {
              contact.latitude = lat;
              contact.longitude = lon;
              touched = true;
            }
          }
          break;
        case 'navigation.speedOverGround': {
          const sog = numeric(value);
          if (sog !== null) {
            contact.sogKts = sog * 1.94384;
            touched = true;
          }
          break;
        }
        case 'navigation.courseOverGroundTrue': {
          const cog = numeric(value);
          if (cog !== null) {
            contact.cogTrue = (cog * 180) / Math.PI;
            touched = true;
          }
          break;
        }
        case 'navigation.headingTrue': {
          const heading = numeric(value);
          if (heading !== null) {
            contact.headingTrue = (heading * 180) / Math.PI;
            touched = true;
          }
          break;
        }
        case 'name':
          if (typeof value === 'string' && value.trim()) {
            contact.name = value.trim();
            touched = true;
          }
          break;
        case 'mmsi':
          if (value !== undefined && value !== null && String(value).trim()) {
            contact.mmsi = String(value).trim();
            touched = true;
          }
          break;
        default:
          break;
      }
    }
  }

  if (!touched) return {};
  contact.lastSeen = timestamp ?? new Date().toISOString();
  return { ais: { contacts: { [id]: contact } } };
}

export function normalizeSignalKDelta(delta, options = {}) {
  const selfContext = options.selfContext ?? 'vessels.self';
  const context = typeof delta?.context === 'string' ? delta.context : 'vessels.self';
  if (!isOwnVesselContext(context, selfContext)) {
    return normalizeAisDelta(delta, context);
  }

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
    case 'steering.autopilot.mode':
    case 'steering.autopilot.state':
      if (typeof value === 'string') patch.autopilot = { ...(patch.autopilot ?? {}), state: value.toLowerCase() };
      break;
    case 'steering.autopilot.target.headingTrue':
      if (typeof value === 'number') {
        const headingDeg = ((value * 180) / Math.PI % 360 + 360) % 360;
        patch.autopilot = { ...(patch.autopilot ?? {}), headingTarget: headingDeg };
      }
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
        case 'environment.inside.bilge.floodDetected':
          if (typeof value === 'boolean') {
            patch.bilge = {
              ...(patch.bilge ?? {}),
              alarm: value,
              message: value ? 'Water Detected' : 'No Water Detected',
            };
          }
          break;
        default:
          break;
      }
    }
  }
  return patch;
}

export function normalizeMqttMessage(topic, rawPayload) {
  const text = String(rawPayload ?? '').trim();
  const normalizedTopic = String(topic ?? '');

  if (normalizedTopic === 'helmui/kiosk/brightness' || normalizedTopic.endsWith('/kiosk/brightness')) {
    const value = Number(text);
    if (!Number.isFinite(value)) return {};
    return { ui: { brightness: Math.min(100, Math.max(35, Math.round(value))) } };
  }

  if (
    normalizedTopic === 'helmui/autopilot/state' ||
    normalizedTopic === 'helmui/autopilot/mode' ||
    normalizedTopic.endsWith('/autopilot/state') ||
    normalizedTopic.endsWith('/autopilot/mode')
  ) {
    if (!text) return {};
    return { patch: { autopilot: { state: text.toLowerCase() } } };
  }

  if (
    normalizedTopic === 'helmui/autopilot/heading' ||
    normalizedTopic === 'helmui/autopilot/headingTarget' ||
    normalizedTopic.endsWith('/autopilot/heading') ||
    normalizedTopic.endsWith('/autopilot/headingTarget')
  ) {
    const value = Number(text);
    if (!Number.isFinite(value)) return {};
    const headingDeg = ((value % 360) + 360) % 360;
    return { patch: { autopilot: { headingTarget: headingDeg } } };
  }

  return {};
}
