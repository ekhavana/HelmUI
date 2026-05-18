import { Anchor, BellRing, Wind } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatFeet, formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function AnchorScreen() {
  const anchor = useBoatStore((state) => state.data.anchor);
  const depth = useBoatStore((state) => state.data.depth.belowTransducerFt);
  const wind = useBoatStore((state) => state.data.wind);

  const distancePercent = Math.min(95, (anchor.distanceFromSetMeters / Math.max(anchor.radiusMeters, 1)) * 100);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Anchor State" eyebrow="Watch" tone={anchor.alarmArmed ? 'active' : 'default'}>
          <div className="text-3xl font-bold text-white">{anchor.deployed ? 'Set' : 'Not Deployed'}</div>
          <div className="mt-3 space-y-2 text-sm font-semibold text-slate-200">
            <div>Rode: <span className="text-white">{formatNumber(anchor.rodeMeters)} m</span></div>
            <div>Scope: <span className="text-white">{formatNumber(anchor.scopeRatio, 1)} : 1</span></div>
            <div>Depth: <span className="text-white">{formatFeet(depth)}</span></div>
          </div>
        </Card>
        <Card title="Wind + Drift" eyebrow="Context">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{formatNumber(wind.twsKts)} kt</div>
              <div className="text-sm text-slate-300">True wind speed</div>
            </div>
            <Wind className="h-10 w-10 text-cyan-200/80" />
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-300">Current offset from set point: {formatNumber(anchor.distanceFromSetMeters)} m</div>
        </Card>
      </aside>

      <Card title="Swing Radius" eyebrow="Visual Watch" className="relative rounded-[2rem]" tone="active">
        <div className="absolute inset-0 opacity-35">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.22),transparent_50%)]" />
        </div>
        <div className="relative flex h-full items-center justify-center">
          <div className="relative h-[520px] w-[520px] rounded-full border-2 border-cyan-300/35">
            <div className="absolute inset-[22%] rounded-full border border-cyan-300/20" />
            <div className="absolute inset-[42%] rounded-full border border-cyan-300/20" />
            <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
            <div className="absolute left-1/2 top-1/2 h-[2px] origin-left bg-amber-300" style={{ transform: `rotate(118deg)`, width: `${distancePercent * 2.3}px` }} />
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(250,204,21,0.8)]" style={{ transform: `translate(${distancePercent * 2.3}px, -50%)` }} />
          </div>
        </div>
      </Card>

      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Watch Limits" eyebrow="Alarm" tone={anchor.distanceFromSetMeters > anchor.radiusMeters * 0.8 ? 'warning' : 'safe'}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Radius</div>
              <div className="text-3xl font-bold text-white">{formatNumber(anchor.radiusMeters)} m</div>
            </div>
            <BellRing className="h-9 w-9 text-cyan-200/80" />
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-300">Alarm {anchor.alarmArmed ? 'armed' : 'disarmed'}</div>
        </Card>
        <Card title="Recommendations" eyebrow="Safety">
          <ul className="space-y-2 text-sm font-semibold text-slate-200">
            <li>Confirm GPS lock before sleep cycle.</li>
            <li>Set high-wind alarm at 22 kt.</li>
            <li>Re-check bearings if drift exceeds 75% of radius.</li>
          </ul>
        </Card>
      </aside>
    </section>
  );
}
