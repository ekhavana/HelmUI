import { LocateFixed, Map, Navigation, Ship } from 'lucide-react';
import { runtimeConfig } from '../../config/runtime';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatNumber } from '../../utils/formatters';

export function ChartPanel() {
  const navigation = useBoatStore((state) => state.data.navigation);
  const ais = useBoatStore((state) => state.data.ais);
  const route = useBoatStore((state) => state.data.route);

  return (
    <section className="relative h-full overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-slate-950/45 shadow-glow backdrop-blur-md">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${runtimeConfig.chart.tileUrlTemplate})`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
      <div className="absolute inset-0 opacity-35">
        <div className="h-full w-full bg-[linear-gradient(rgba(34,211,238,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.18)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_48%,rgba(34,211,238,0.22),transparent_15%),radial-gradient(circle_at_60%_36%,rgba(14,165,233,0.2),transparent_12%),linear-gradient(135deg,rgba(15,118,110,0.12),rgba(15,23,42,0.1))]" />
      <svg className="absolute inset-0 h-full w-full opacity-75" viewBox="0 0 1000 700" role="img" aria-label="helm chart">
        <path d="M-20 535 C120 470 155 560 268 510 C356 472 420 522 536 492 C650 462 770 502 1020 402" fill="none" stroke="rgba(34,211,238,0.32)" strokeWidth="6" />
        <path d="M120 622 C180 582 240 592 296 552 C338 522 386 532 450 502" fill="none" stroke="rgba(125,211,252,0.3)" strokeWidth="4" />
        <path d="M100 620 C262 518 348 584 470 450 C610 340 690 420 920 250" fill="none" stroke="rgba(34,211,238,0.7)" strokeDasharray="12 10" strokeWidth="6" />
        <circle cx="470" cy="450" fill="rgba(34,211,238,0.2)" r="28" stroke="rgba(34,211,238,0.95)" strokeWidth="3" />
        <circle cx="780" cy="320" fill="rgba(248,113,113,0.23)" r="22" stroke="rgba(248,113,113,0.9)" strokeWidth="3" />
        <circle cx="700" cy="525" fill="rgba(250,204,21,0.23)" r="18" stroke="rgba(250,204,21,0.85)" strokeWidth="3" />
        <g transform={`translate(470 450) rotate(${navigation.headingTrue})`}>
          <polygon fill="rgba(34,211,238,0.95)" points="0,-34 16,22 0,12 -16,22" />
        </g>
      </svg>
      <div className="absolute left-10 top-8 flex items-center gap-3 rounded-2xl border border-cyan-300/25 bg-slate-950/55 px-5 py-3 text-cyan-100">
        <Map className="h-7 w-7" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Live Helm Chart</div>
          <div className="text-xl font-semibold">{route.nextWaypoint}</div>
        </div>
      </div>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-cyan-100">
        <LocateFixed className="h-24 w-24 drop-shadow-[0_0_24px_rgba(34,211,238,0.55)]" />
        <div className="mt-3 rounded-full border border-cyan-300/40 bg-slate-950/60 px-5 py-2 text-xl font-bold">HDG {formatDegrees(navigation.headingTrue)}</div>
      </div>
      <div className="absolute bottom-8 right-10 rounded-2xl border border-slate-600/60 bg-slate-950/65 px-5 py-4 text-right">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">COG</div>
        <div className="text-4xl font-bold text-white">{formatDegrees(navigation.cogTrue)}</div>
        <div className="mt-2 flex items-center justify-end gap-1 text-xs font-semibold text-slate-300"><Ship className="h-3.5 w-3.5" /> AIS {ais.targets} · {formatNumber(ais.closestNm)} nm</div>
      </div>
      <div className="absolute bottom-8 left-10 rounded-2xl border border-slate-600/60 bg-slate-950/65 px-4 py-3 text-left">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Route</div>
        <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-cyan-100"><Navigation className="h-4 w-4" /> {formatNumber(route.distanceNm)} nm to WP</div>
      </div>
    </section>
  );
}
