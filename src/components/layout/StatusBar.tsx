import { Bell, BookOpen, Clock, Flag, Sunset } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';

export function StatusBar() {
  const time = useBoatStore((state) => state.data.time);
  const route = useBoatStore((state) => state.data.route);
  const signalKState = useBoatStore((state) => state.signalKState);
  const alarms = useBoatStore((state) => state.alarms);
  const sourceHealth = useBoatStore((state) => state.sourceHealth);
  const alarmSummary = alarms.find((item) => item.severity === 'danger') ?? alarms[0];
  const sourceSummary = Object.entries(sourceHealth)
    .map(([name, source]) => `${name}:${source.connected ? 'up' : 'down'}`)
    .join(' ');

  return (
    <footer className="grid h-14 shrink-0 grid-cols-[1.3fr_0.9fr_1.1fr_0.9fr_0.7fr_1fr_0.55fr_auto] items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/55 px-4 text-sm font-semibold text-slate-200 backdrop-blur-md">
      <div className={`flex items-center gap-2 ${alarmSummary ? (alarmSummary.severity === 'danger' ? 'text-red-200' : 'text-amber-200') : 'text-emerald-200'}`}><Bell className="h-5 w-5" /> Alarm: {alarmSummary ? alarmSummary.message : 'Clear'}</div>
      <div className="flex items-center gap-2"><Sunset className="h-5 w-5 text-amber-200" /> Sunset: {time.sunsetCountdown}</div>
      <div className="flex items-center gap-2"><Flag className="h-5 w-5 text-cyan-200" /> Next WP: {route.nextWaypoint}</div>
      <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-cyan-200" /> ETA: {time.eta}</div>
      <div className="text-cyan-100">Data: {signalKState === 'disabled' ? 'Sim' : signalKState}</div>
      <div className="text-[11px] text-slate-300">{sourceSummary}</div>
      <div className="text-right text-cyan-100">{time.local}</div>
      <button className="flex min-h-10 items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-5 text-cyan-100" type="button"><BookOpen className="h-5 w-5" /> Log</button>
    </footer>
  );
}
