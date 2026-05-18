import { Compass } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function HeadingCard() {
  const navigation = useBoatStore((state) => state.data.navigation);

  return (
    <Card title="Heading" eyebrow="True">
      <div className="flex items-center justify-between">
        <div className="text-6xl font-bold tabular-nums text-white">{formatDegrees(navigation.headingTrue)}</div>
        <Compass className="h-12 w-12 shrink-0 text-cyan-200/80" />
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs font-semibold text-slate-400">
        <span>N</span>
        <span>030</span>
        <span className="rounded-full bg-cyan-400/20 py-1 text-cyan-100">045</span>
        <span>060</span>
        <span>E</span>
      </div>
    </Card>
  );
}
