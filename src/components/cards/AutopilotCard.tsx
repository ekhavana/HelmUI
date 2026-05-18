import { Navigation2 } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function AutopilotCard() {
  const autopilot = useBoatStore((state) => state.data.autopilot);

  return (
    <Card className="h-full px-3 py-2 lg:px-5 lg:py-4" tone="default">
      <div className="flex h-full items-center gap-2 lg:gap-3">
        <Navigation2 className="h-5 w-5 shrink-0 text-cyan-200 lg:h-8 lg:w-8" />
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 lg:text-sm">Autopilot</div>
          <div className="text-sm font-bold capitalize leading-tight text-white lg:mt-1 lg:text-3xl">{autopilot.state}</div>
          <div className="text-[9px] leading-tight text-slate-300 lg:text-sm">Target {formatDegrees(autopilot.headingTarget)}</div>
        </div>
      </div>
    </Card>
  );
}
