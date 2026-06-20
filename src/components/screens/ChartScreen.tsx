import { LocateFixed, Navigation, Ship, Triangle } from 'lucide-react';
import { runtimeConfig } from '../../config/runtime';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatKts, formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function ChartScreen() {
  const navigation = useBoatStore((state) => state.data.navigation);
  const speed = useBoatStore((state) => state.data.speed);
  const route = useBoatStore((state) => state.data.route);
  const ais = useBoatStore((state) => state.data.ais);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Route" eyebrow="Navigator" tone="active">
          <div className="text-3xl font-bold text-white">{route.nextWaypoint}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-200">
            <div>
              <div className="text-slate-400">Distance</div>
              <div className="text-xl text-white">{formatNumber(route.distanceNm)} nm</div>
            </div>
            <div>
              <div className="text-slate-400">ETA</div>
              <div className="text-xl text-white">{route.etaMinutes} min</div>
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold text-cyan-100">XTE {formatNumber(route.crossTrackErrorNm, 2)} nm</div>
        </Card>
        <Card title="Vessel" eyebrow="Motion">
          <div className="space-y-3 text-base font-semibold text-slate-200">
            <div className="flex items-center justify-between"><span>Heading</span><span className="text-white">{formatDegrees(navigation.headingTrue)}</span></div>
            <div className="flex items-center justify-between"><span>COG</span><span className="text-white">{formatDegrees(navigation.cogTrue)}</span></div>
            <div className="flex items-center justify-between"><span>SOG</span><span className="text-white">{formatKts(speed.sogKts)}</span></div>
            <div className="flex items-center justify-between"><span>STW</span><span className="text-white">{formatKts(speed.stwKts)}</span></div>
          </div>
        </Card>
      </aside>

      <Card className="relative overflow-hidden rounded-[2rem]" tone="active">
        <div className="absolute inset-0 opacity-35" style={{ backgroundImage: `url(${runtimeConfig.chart.tileUrlTemplate})`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[linear-gradient(rgba(34,211,238,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.14)_1px,transparent_1px)] bg-[size:52px_52px]" />
        </div>
        <svg className="relative h-full w-full" viewBox="0 0 1000 700" role="img" aria-label="chart view">
          <path d="M60 620 C260 480 330 560 470 450 C610 340 690 420 920 250" fill="none" stroke="rgba(34,211,238,0.5)" strokeDasharray="12 10" strokeWidth="8" />
          <circle cx="470" cy="450" fill="rgba(34,211,238,0.25)" r="28" stroke="rgba(34,211,238,0.9)" strokeWidth="4" />
          <circle cx="780" cy="320" fill="rgba(248,113,113,0.25)" r="26" stroke="rgba(248,113,113,0.85)" strokeWidth="4" />
          <circle cx="700" cy="525" fill="rgba(250,204,21,0.25)" r="22" stroke="rgba(250,204,21,0.85)" strokeWidth="4" />
          <g transform={`translate(470 450) rotate(${navigation.headingTrue})`}>
            <polygon fill="rgba(34,211,238,0.95)" points="0,-44 24,28 0,16 -24,28" />
          </g>
        </svg>
        <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-3 rounded-2xl border border-cyan-300/30 bg-slate-950/65 px-4 py-2 text-cyan-100">
          <LocateFixed className="h-6 w-6" />
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Live Chart</div>
            <div className="text-base font-semibold">AIS + Route Overlay</div>
          </div>
        </div>
        <div className="pointer-events-none absolute right-6 top-6 rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
          {runtimeConfig.chart.offlineOnly ? 'Offline Tiles' : 'Hybrid Tiles'}
        </div>
      </Card>

      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="AIS Contacts" eyebrow="Traffic" tone={ais.riskLevel === 'danger' ? 'danger' : ais.riskLevel === 'warning' ? 'warning' : 'safe'}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-white">{ais.targets}</div>
              <div className="text-sm text-slate-300">targets nearby</div>
            </div>
            <Ship className="h-12 w-12 text-cyan-200/85" />
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-200">Closest {formatNumber(ais.closestNm)} nm · {ais.bearing}</div>
        </Card>
        <Card title="Guidance" eyebrow="Pilot">
          <div className="space-y-2 text-sm font-semibold text-slate-200">
            <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-cyan-200" /> Keep waypoint corridor centered</div>
            <div className="flex items-center gap-2"><Triangle className="h-4 w-4 text-amber-200" /> Monitor crossing traffic starboard side</div>
            <div className="flex items-center gap-2"><Triangle className="h-4 w-4 text-cyan-200" /> Current heading aligns with route plan</div>
          </div>
        </Card>
      </aside>
    </section>
  );
}
