import { Waves } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatNumber } from '../../utils/formatters';
import { getDepthSafetyState } from '../../utils/thresholds';
import { Card } from '../ui/Card';

export function DepthSafetyCard() {
  const depth = useBoatStore((state) => state.data.depth.belowTransducerFt);
  const safety = getDepthSafetyState(depth);
  const tone = safety === 'danger' ? 'danger' : safety === 'warning' ? 'warning' : 'safe';

  return (
    <Card className="h-full px-3 py-2 lg:px-6 lg:py-4" tone={tone}>
      <div className="flex h-full items-center gap-2 lg:gap-4">
        <Waves className="h-5 w-5 shrink-0 lg:h-9 lg:w-9" />
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-300 lg:text-sm">Depth</div>
          <div className="flex items-baseline gap-1 font-bold tabular-nums text-white lg:gap-2">
            <span className="text-2xl leading-none lg:text-6xl">{formatNumber(depth)}</span>
            <span className="text-xs text-slate-300 lg:text-2xl">ft</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
