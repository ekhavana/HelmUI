import { Radar } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { getAisSafetyState } from '../../utils/thresholds';
import { Card } from '../ui/Card';

export function AisRiskCard() {
  const ais = useBoatStore((state) => state.data.ais);
  const safety = getAisSafetyState(ais.closestNm, ais.targets);
  const tone = safety === 'danger' ? 'danger' : safety === 'warning' ? 'warning' : 'safe';

  return (
    <Card className="h-full px-3 py-2 lg:px-5 lg:py-4" tone={tone}>
      <div className="flex h-full items-center gap-2 lg:gap-3">
        <Radar className="h-5 w-5 shrink-0 lg:h-8 lg:w-8" />
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 lg:text-sm">AIS Risk</div>
          <div className="text-sm font-bold leading-tight tabular-nums text-white lg:mt-1 lg:text-3xl">{ais.targets} targets</div>
          <div className="text-[9px] leading-tight text-slate-300 lg:text-sm">{ais.closestNm.toFixed(1)} NM · {ais.bearing}</div>
        </div>
      </div>
    </Card>
  );
}
