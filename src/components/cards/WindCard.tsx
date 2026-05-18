import { Wind } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function WindCard() {
  const wind = useBoatStore((state) => state.data.wind);

  return (
    <Card title="Wind" eyebrow="Apparent" tone="active">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-6xl font-bold tabular-nums text-white">{formatDegrees(wind.awaDeg)}</div>
          <div className="mt-1 text-lg font-semibold text-cyan-100">{wind.side}</div>
        </div>
        <Wind className="h-16 w-16 shrink-0 text-cyan-200/80" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-950/45 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">AWS</div>
          <div className="text-3xl font-bold tabular-nums text-white">{formatNumber(wind.awsKts)} kt</div>
        </div>
        <div className="rounded-2xl bg-slate-950/45 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">TWS</div>
          <div className="text-3xl font-bold tabular-nums text-white">{formatNumber(wind.twsKts)} kt</div>
        </div>
      </div>
    </Card>
  );
}
