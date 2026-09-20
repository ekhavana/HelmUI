import type { BoatData } from '../../data/boatData';
import type { UiSettings } from '../../store/boatStore';
import {
  engineThresholds,
  getAisSafetyState,
  getBatterySafetyState,
  getDepthSafetyState,
} from '../../utils/thresholds';
import type { AlarmItem } from './types';

interface SourceState {
  connected: boolean;
  lastSeen: string | null;
}

export function evaluateAlarms(input: {
  data: BoatData;
  settings: UiSettings;
  sourceHealth: Record<string, SourceState>;
  activeSources?: readonly string[];
  staleThresholdMs?: number;
}): AlarmItem[] {
  const { data, settings, sourceHealth, activeSources, staleThresholdMs = 20_000 } = input;
  const alarms: AlarmItem[] = [];
  const now = Date.now();

  if (data.depth.belowTransducerFt !== null) {
    const depthSafety = getDepthSafetyState(data.depth.belowTransducerFt, settings.depthWarningFt);
    if (depthSafety !== 'safe') {
      alarms.push({
        id: `depth-${depthSafety}`,
        severity: depthSafety,
        message: `${depthSafety === 'danger' ? 'Critical' : 'Low'} depth ${data.depth.belowTransducerFt.toFixed(1)} ft`,
      });
    }
  }

  if (data.anchor.distanceFromSetMeters !== null && data.anchor.distanceFromSetMeters > data.anchor.radiusMeters) {
    alarms.push({ id: 'anchor-drift', severity: 'danger', message: 'Anchor drift beyond guard radius' });
  }

  const batterySafety = data.battery.housePercent === null || data.battery.houseVoltage === null
    ? null
    : getBatterySafetyState(data.battery.housePercent, data.battery.houseVoltage);
  if (batterySafety !== null && batterySafety !== 'safe') {
    alarms.push({
      id: `battery-${batterySafety === 'danger' ? 'critical' : 'low'}`,
      severity: batterySafety,
      message: `House battery ${batterySafety === 'danger' ? 'critical' : 'low'}`,
    });
  }

  if (data.bilge.alarm === true) {
    alarms.push({ id: 'bilge-flood', severity: 'danger', message: 'Bilge flood detected' });
  }

  if (data.ais.closestNm !== null) {
    const aisSafety = getAisSafetyState(data.ais.closestNm, data.ais.targets);
    if (aisSafety !== 'safe') {
      alarms.push({
        id: `ais-close-${aisSafety}`,
        severity: aisSafety,
        message: `AIS target ${aisSafety === 'danger' ? 'within' : 'approaching'} ${data.ais.closestNm.toFixed(1)} nm`,
      });
    }
  }

  if (data.engine.coolantTempC !== null && data.engine.coolantTempC > engineThresholds.coolantDangerC) {
    alarms.push({ id: 'engine-overheat', severity: 'danger', message: `Engine coolant overheat ${data.engine.coolantTempC.toFixed(0)} °C` });
  } else if (data.engine.coolantTempC !== null && data.engine.coolantTempC > engineThresholds.coolantWarningC) {
    alarms.push({ id: 'engine-temp-high', severity: 'warning', message: `Engine coolant high ${data.engine.coolantTempC.toFixed(0)} °C` });
  }

  if (data.engine.oilPressurePsi !== null && data.engine.oilPressurePsi < engineThresholds.oilDangerPsi) {
    alarms.push({ id: 'engine-oil-critical', severity: 'danger', message: `Engine oil pressure critical ${data.engine.oilPressurePsi.toFixed(0)} psi` });
  } else if (data.engine.oilPressurePsi !== null && data.engine.oilPressurePsi < engineThresholds.oilWarningPsi) {
    alarms.push({ id: 'engine-oil-low', severity: 'warning', message: `Engine oil pressure low ${data.engine.oilPressurePsi.toFixed(0)} psi` });
  }

  for (const [source, state] of Object.entries(sourceHealth)) {
    if (activeSources && !activeSources.includes(source)) continue;
    if (!state.connected) {
      alarms.push({ id: `source-down-${source}`, severity: 'danger', message: `${source} source disconnected` });
      continue;
    }
    if (state.lastSeen) {
      const age = now - Date.parse(state.lastSeen);
      if (Number.isFinite(age) && age > staleThresholdMs) {
        alarms.push({ id: `source-stale-${source}`, severity: 'warning', message: `${source} data stale` });
      }
    }
  }

  return alarms;
}
