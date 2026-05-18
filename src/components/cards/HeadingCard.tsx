import { Compass } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function HeadingCard() {
  const navigation = useBoatStore((state) => state.data.navigation);

  return (
    <Card title="Heading" eyebrow="True">
      <div className="flex items-center justify-between">
        <div className="text-4xl font-bold tabular-nums text-white xl:text-6xl">{formatDegrees(navigation.headingTrue)}</div>
        <Compass className="h-8 w-8 shrink-0 text-cyan-200/80 xl:h-16 xl:w-16" />
      </div>
      <div className="mt-1 grid grid-cols-5 gap-1 text-center text-[9px] font-semibold text-slate-400 xl:mt-5 xl:gap-2 xl:text-xs">
        <span>N</span>
        <span>030</span>
        <span className="rounded-full bg-cyan-400/20 py-1 text-cyan-100">045</span>
        <span>060</span>
        <span>E</span>
      </div>
    </Card>
  );
}
