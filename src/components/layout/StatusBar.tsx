import { Bell, BookOpen, Clock, Flag, Sunset } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';

export function StatusBar() {
  const time = useBoatStore((state) => state.data.time);
  const signalKState = useBoatStore((state) => state.signalKState);

  return (
    <footer className="grid h-8 shrink-0 grid-cols-[1.1fr_1fr_1.25fr_1fr_0.8fr_0.75fr_auto] items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-950/55 px-3 text-[10px] font-semibold text-slate-200 backdrop-blur-md lg:h-14 lg:gap-4 lg:rounded-2xl lg:px-5 lg:text-base">
      <div className="flex items-center gap-1.5 text-emerald-200 lg:gap-2"><Bell className="h-3 w-3 lg:h-5 lg:w-5" /> Alarm: Clear</div>
      <div className="flex items-center gap-1.5 lg:gap-2"><Sunset className="h-3 w-3 text-amber-200 lg:h-5 lg:w-5" /> Sunset {time.sunsetCountdown}</div>
      <div className="flex items-center gap-1.5 lg:gap-2"><Flag className="h-3 w-3 text-cyan-200 lg:h-5 lg:w-5" /> Next WP: Harbor</div>
      <div className="flex items-center gap-1.5 lg:gap-2"><Clock className="h-3 w-3 text-cyan-200 lg:h-5 lg:w-5" /> ETA {time.eta}</div>
      <div className="text-cyan-100">Data: {signalKState === 'disabled' ? 'Sim' : signalKState}</div>
      <div className="text-right text-cyan-100">{time.local}</div>
      <button className="flex min-h-6 items-center gap-1 rounded-lg border border-cyan-300/35 bg-cyan-400/10 px-2 text-cyan-100 lg:min-h-10 lg:gap-2 lg:rounded-xl lg:px-5" type="button"><BookOpen className="h-3 w-3 lg:h-5 lg:w-5" /> Log</button>
    </footer>
  );
}
