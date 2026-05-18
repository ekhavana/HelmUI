import { Wind } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function WindCard() {
  const wind = useBoatStore((state) => state.data.wind);

  return (
    <Card title="Wind" eyebrow="Apparent" tone="active">
      <div className="flex items-center justify-between gap-2 xl:gap-4">
        <div>
          <div className="text-4xl font-bold leading-none tabular-nums text-white xl:text-6xl">{formatDegrees(wind.awaDeg)}</div>
          <div className="mt-0.5 text-[10px] font-semibold text-cyan-100 xl:mt-1 xl:text-lg">{wind.side}</div>
        </div>
        <Wind className="h-8 w-8 shrink-0 text-cyan-200/80 xl:h-16 xl:w-16" />
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1.5 xl:mt-5 xl:gap-3">
        <div className="rounded-xl bg-slate-950/45 p-1.5 xl:rounded-2xl xl:p-3">
          <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400 xl:text-xs">AWS</div>
          <div className="text-sm font-bold tabular-nums text-white xl:text-3xl">{formatNumber(wind.awsKts)} kt</div>
        </div>
        <div className="rounded-xl bg-slate-950/45 p-1.5 xl:rounded-2xl xl:p-3">
          <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400 xl:text-xs">TWS</div>
          <div className="text-sm font-bold tabular-nums text-white xl:text-3xl">{formatNumber(wind.twsKts)} kt</div>
        </div>
      </div>
    </Card>
  );
}
