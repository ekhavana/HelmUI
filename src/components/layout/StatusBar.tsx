import { Bell, BookOpen, Clock, Flag, Sunset } from 'lucide-react';
import { runtimeConfig } from '../../config/runtime';
import type { BridgeSourceName } from '../../bridge/types';
import { useBoatStore } from '../../store/boatStore';
import { useLogStore } from '../../store/logStore';
import { useAlarmLogSync } from '../../utils/useAlarmLogSync';
import { computeEta } from '../../utils/useLiveEta';
import { useLiveClock } from '../../utils/useLiveClock';

export function StatusBar() {
  const route = useBoatStore((state) => state.data.route);
  const navigation = useBoatStore((state) => state.data.navigation);
  const sogKts = useBoatStore((state) => state.data.speed.sogKts);
  const signalKState = useBoatStore((state) => state.signalKState);
  const alarms = useBoatStore((state) => state.alarms);
  const sourceHealth = useBoatStore((state) => state.sourceHealth);
  const telemetryMode = useBoatStore((state) => state.telemetryMode);
  const overlayOpen = useLogStore((state) => state.overlayOpen);
  const toggleLog = useLogStore((state) => state.toggleLog);

  useAlarmLogSync();

  const { local, sunsetCountdown } = useLiveClock(navigation.latitude, navigation.longitude);

  const alarmSummary = alarms.find((item) => item.severity === 'danger') ?? alarms[0];
  const sourceSummary = Object.entries(sourceHealth)
    .filter(([name]) => runtimeConfig.telemetry.activeSources.includes(name as BridgeSourceName))
    .map(([name, source]) => `${name}:${source.connected ? (telemetryMode === 'replay' ? 'replay' : 'up') : 'down'}`)
    .join(' ');

  return (
    <footer className="grid h-14 shrink-0 grid-cols-[1.3fr_0.9fr_1.1fr_0.9fr_0.7fr_1fr_0.55fr_auto] items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/55 px-4 text-sm font-semibold text-slate-200 backdrop-blur-md">
      <div className={`flex items-center gap-2 ${alarmSummary ? (alarmSummary.severity === 'danger' ? 'text-red-200' : 'text-amber-200') : 'text-emerald-200'}`}><Bell className="h-5 w-5" /> Alarm: {alarmSummary ? alarmSummary.message : 'Clear'}</div>
      <div className="flex items-center gap-2"><Sunset className="h-5 w-5 text-amber-200" /> Sunset: {sunsetCountdown}</div>
      <div className="flex items-center gap-2"><Flag className="h-5 w-5 text-cyan-200" /> Next WP: {route.nextWaypoint}</div>
      <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-cyan-200" /> ETA: {computeEta(route.distanceNm ?? 0, sogKts ?? 0)}</div>
      <div className={telemetryMode === 'replay' ? 'text-amber-200' : 'text-cyan-100'}>Data: {telemetryMode === 'replay' ? 'replay' : signalKState === 'disabled' ? 'Off' : signalKState}</div>
      <div className={`text-[11px] ${telemetryMode === 'replay' ? 'text-amber-200/90' : 'text-slate-300'}`}>{sourceSummary}</div>
      <div className="text-right text-cyan-100">{local}</div>
      <button
        className={`flex min-h-10 items-center gap-2 rounded-xl border px-5 ${overlayOpen ? 'border-cyan-300/70 bg-cyan-400/20 text-cyan-50' : 'border-cyan-300/35 bg-cyan-400/10 text-cyan-100'}`}
        onClick={toggleLog}
        type="button"
      >
        <BookOpen className="h-5 w-5" /> Log
      </button>
    </footer>
  );
}
