import { Bell, BookOpen, Clock, Flag, Sunset } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';

export function StatusBar() {
  const time = useBoatStore((state) => state.data.time);

  return (
    <footer className="grid h-14 grid-cols-[1.3fr_1fr_1.3fr_1fr_auto] items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-950/55 px-5 text-base font-semibold text-slate-200 backdrop-blur-md">
      <div className="flex items-center gap-2 text-emerald-200"><Bell className="h-5 w-5" /> Alarm Status: Clear</div>
      <div className="flex items-center gap-2"><Sunset className="h-5 w-5 text-amber-200" /> Sunset: {time.sunsetCountdown}</div>
      <div className="flex items-center gap-2"><Flag className="h-5 w-5 text-cyan-200" /> Next WP: Harbor Approach</div>
      <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-cyan-200" /> ETA: {time.eta}</div>
      <button className="flex min-h-10 items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-5 text-cyan-100" type="button"><BookOpen className="h-5 w-5" /> Log</button>
    </footer>
  );
}
