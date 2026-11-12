import { Navigation2 } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';
import { headingDeviation, isEngaged } from '../../domain/autopilot/commands';
import { Card } from '../ui/Card';

export function AutopilotCard() {
  const autopilot = useBoatStore((state) => state.data.autopilot);
  const headingTrue = useBoatStore((state) => state.data.navigation.headingTrue);
  const engaged = isEngaged(autopilot.state);
  const deviation = headingDeviation(autopilot.headingTarget, headingTrue);

  return (
    <Card className="h-full px-5 py-4" tone={engaged ? 'active' : 'default'}>
      <div className="flex h-full items-center gap-3">
        <Navigation2 className={`h-8 w-8 shrink-0 ${engaged ? 'text-cyan-200' : 'text-slate-400'}`} />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">Autopilot</div>
          <div className="mt-1 text-3xl font-bold capitalize text-white">{autopilot.state}</div>
          <div className="text-sm text-slate-300">
            Target {formatDegrees(autopilot.headingTarget)}
            {deviation !== null && (
              <span className="text-cyan-200"> · Δ{deviation > 0 ? '+' : ''}{Math.round(deviation)}°</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
