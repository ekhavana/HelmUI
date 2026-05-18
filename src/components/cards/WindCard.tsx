import { Wind } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function WindCard() {
  const wind = useBoatStore((state) => state.data.wind);

  return (
    <Card title="Wind" eyebrow="Apparent" tone="active">
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        <div>
          <div className="text-2xl font-bold leading-none tabular-nums text-white lg:text-6xl">{formatDegrees(wind.awaDeg)}</div>
          <div className="text-[9px] font-semibold text-cyan-100 lg:mt-1 lg:text-lg">{wind.side}</div>
        </div>
        <Wind className="h-6 w-6 shrink-0 text-cyan-200/80 lg:h-16 lg:w-16" />
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1 lg:mt-5 lg:gap-3">
        <div className="rounded-lg bg-slate-950/45 px-1.5 py-0.5 lg:rounded-2xl lg:p-3">
          <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400 lg:text-xs">AWS</div>
          <div className="text-xs font-bold leading-tight tabular-nums text-white lg:text-3xl">{formatNumber(wind.awsKts)} kt</div>
        </div>
        <div className="rounded-lg bg-slate-950/45 px-1.5 py-0.5 lg:rounded-2xl lg:p-3">
          <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400 lg:text-xs">TWS</div>
          <div className="text-xs font-bold leading-tight tabular-nums text-white lg:text-3xl">{formatNumber(wind.twsKts)} kt</div>
        </div>
      </div>
    </Card>
  );
}
