import { useEffect } from 'react';
import { useBoatStore } from '../store/boatStore';
import { useLogStore } from '../store/logStore';

export function useAlarmLogSync() {
  const alarms = useBoatStore((state) => state.alarms);
  const append = useLogStore((state) => state.append);

  useEffect(() => {
    const entries = useLogStore.getState().entries;
    const activeIds = new Set(alarms.map((alarm) => alarm.id));

    for (const alarm of alarms) {
      const last = entries.find((entry) => entry.detail === alarm.id);
      if (last?.kind === 'alarm') continue;
      append({
        kind: 'alarm',
        severity: alarm.severity,
        title: alarm.message,
        detail: alarm.id,
      });
    }

    const seen = new Set<string>();
    for (const entry of entries) {
      if (!entry.detail || seen.has(entry.detail)) continue;
      seen.add(entry.detail);
      if (entry.kind === 'alarm' && !activeIds.has(entry.detail)) {
        append({
          kind: 'event',
          severity: 'info',
          title: `Cleared: ${entry.title}`,
          detail: entry.detail,
        });
      }
    }
  }, [alarms, append]);
}
