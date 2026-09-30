import { Waves } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { displayedDepthFt } from '../../utils/depth';
import { formatNumber } from '../../utils/formatters';
import { getDepthSafetyState } from '../../utils/thresholds';
import { Card } from '../ui/Card';

export function DepthSafetyCard() {
  const belowTransducerFt = useBoatStore((state) => state.data.depth.belowTransducerFt);
  const depthOffsetFt = useBoatStore((state) => state.settings.depthOffsetFt);
  const depthWarningFt = useBoatStore((state) => state.settings.depthWarningFt);
  const depth = displayedDepthFt(belowTransducerFt, depthOffsetFt);
  const safety = depth === null ? null : getDepthSafetyState(depth, depthWarningFt);
  const tone = safety === 'danger' ? 'danger' : safety === 'warning' ? 'warning' : safety === 'safe' ? 'safe' : 'default';

  return (
    <Card className="h-full px-6 py-4" tone={tone}>
      <div className="flex h-full items-center gap-4">
        <Waves className="h-9 w-9 shrink-0" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.22em] text-slate-300">Depth</div>
          <div className="flex items-baseline gap-2 font-bold tabular-nums text-white">
            <span className="text-6xl leading-none">{formatNumber(depth)}</span>
            <span className="text-2xl text-slate-300">ft</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
