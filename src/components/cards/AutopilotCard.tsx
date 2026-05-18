import { Navigation2 } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function AutopilotCard() {
  const autopilot = useBoatStore((state) => state.data.autopilot);

  return (
    <Card className="h-full px-5 py-4" tone="default">
      <div className="flex items-center gap-3">
        <Navigation2 className="h-8 w-8 text-cyan-200" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">Autopilot</div>
          <div className="mt-1 text-3xl font-bold capitalize text-white">{autopilot.state}</div>
          <div className="text-sm text-slate-300">Target {formatDegrees(autopilot.headingTarget)}</div>
        </div>
      </div>
    </Card>
  );
}
