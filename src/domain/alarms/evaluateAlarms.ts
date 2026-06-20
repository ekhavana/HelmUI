import type { BoatData } from '../../data/mockBoatData';
import type { UiSettings } from '../../store/boatStore';
import type { AlarmItem } from './types';

interface SourceState {
  connected: boolean;
  lastSeen: string | null;
}

export function evaluateAlarms(input: {
  data: BoatData;
  settings: UiSettings;
  sourceHealth: Record<string, SourceState>;
  staleThresholdMs?: number;
}): AlarmItem[] {
  const { data, settings, sourceHealth, staleThresholdMs = 20_000 } = input;
  const alarms: AlarmItem[] = [];
  const now = Date.now();

  const dangerDepth = Math.max(2, settings.depthWarningFt - 3);
  if (data.depth.belowTransducerFt <= dangerDepth) {
    alarms.push({ id: 'depth-danger', severity: 'danger', message: `Critical depth ${data.depth.belowTransducerFt.toFixed(1)} ft` });
  } else if (data.depth.belowTransducerFt <= settings.depthWarningFt) {
    alarms.push({ id: 'depth-warning', severity: 'warning', message: `Depth low ${data.depth.belowTransducerFt.toFixed(1)} ft` });
  }

  if (data.anchor.distanceFromSetMeters > data.anchor.radiusMeters) {
    alarms.push({ id: 'anchor-drift', severity: 'danger', message: 'Anchor drift beyond guard radius' });
  }

  if (data.battery.housePercent < 25 || data.battery.houseVoltage < 12.0) {
    alarms.push({ id: 'battery-low', severity: 'danger', message: 'House battery critical' });
  } else if (data.battery.housePercent < 45 || data.battery.houseVoltage < 12.4) {
    alarms.push({ id: 'battery-warn', severity: 'warning', message: 'House battery low' });
  }

  if (data.bilge.alarm) {
    alarms.push({ id: 'bilge-flood', severity: 'danger', message: 'Bilge flood detected' });
  }

  for (const [source, state] of Object.entries(sourceHealth)) {
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
