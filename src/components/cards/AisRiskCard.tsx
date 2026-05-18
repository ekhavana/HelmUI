import { Radar } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { getAisSafetyState } from '../../utils/thresholds';
import { Card } from '../ui/Card';

export function AisRiskCard() {
  const ais = useBoatStore((state) => state.data.ais);
  const safety = getAisSafetyState(ais.closestNm, ais.targets);
  const tone = safety === 'danger' ? 'danger' : safety === 'warning' ? 'warning' : 'safe';

  return (
    <Card className="h-full px-5 py-4" tone={tone}>
      <div className="flex items-center gap-3">
        <Radar className="h-8 w-8" />
        <div className="min-w-0">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">AIS Risk</div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-white">{ais.targets} targets</div>
          <div className="text-sm text-slate-300">{ais.closestNm.toFixed(1)} NM · {ais.bearing}</div>
        </div>
      </div>
    </Card>
  );
}
