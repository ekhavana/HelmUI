import { Compass } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function HeadingCard() {
  const navigation = useBoatStore((state) => state.data.navigation);

  return (
    <Card title="Heading" eyebrow="True">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold leading-none tabular-nums text-white lg:text-6xl">{formatDegrees(navigation.headingTrue)}</div>
        <Compass className="h-7 w-7 shrink-0 text-cyan-200/80 lg:h-16 lg:w-16" />
      </div>
      <div className="mt-1 grid grid-cols-5 gap-1 text-center text-[9px] font-semibold text-slate-400 lg:mt-5 lg:gap-2 lg:text-xs">
        <span>N</span>
        <span>030</span>
        <span className="rounded-full bg-cyan-400/20 py-1 text-cyan-100">045</span>
        <span>060</span>
        <span>E</span>
      </div>
    </Card>
  );
}
