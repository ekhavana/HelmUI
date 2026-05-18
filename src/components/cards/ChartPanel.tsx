import { LocateFixed, Map } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';

export function ChartPanel() {
  const navigation = useBoatStore((state) => state.data.navigation);

  return (
    <section className="relative h-full overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-slate-950/45 shadow-glow backdrop-blur-md">
      <div className="absolute inset-0 opacity-35">
        <div className="h-full w-full bg-[linear-gradient(rgba(34,211,238,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.18)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_48%,rgba(34,211,238,0.22),transparent_15%),radial-gradient(circle_at_60%_36%,rgba(14,165,233,0.2),transparent_12%),linear-gradient(135deg,rgba(15,118,110,0.12),rgba(15,23,42,0.1))]" />
      <div className="absolute left-10 top-8 flex items-center gap-3 rounded-2xl border border-cyan-300/25 bg-slate-950/55 px-5 py-3 text-cyan-100">
        <Map className="h-7 w-7" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Chart Placeholder</div>
          <div className="text-xl font-semibold">Coastal Navigation View</div>
        </div>
      </div>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-cyan-100">
        <LocateFixed className="h-24 w-24 drop-shadow-[0_0_24px_rgba(34,211,238,0.55)]" />
        <div className="mt-3 rounded-full border border-cyan-300/40 bg-slate-950/60 px-5 py-2 text-xl font-bold">HDG {formatDegrees(navigation.headingTrue)}</div>
      </div>
      <div className="absolute bottom-8 right-10 rounded-2xl border border-slate-600/60 bg-slate-950/65 px-5 py-4 text-right">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">COG</div>
        <div className="text-4xl font-bold text-white">{formatDegrees(navigation.cogTrue)}</div>
      </div>
    </section>
  );
}
