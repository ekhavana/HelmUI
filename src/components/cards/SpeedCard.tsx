import { GaugeCircle } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { ValueReadout } from '../ui/ValueReadout';

export function SpeedCard() {
  const speed = useBoatStore((state) => state.data.speed);

  return (
    <Card title="Speed" eyebrow="Motion" tone="active">
      <div className="flex items-center justify-between gap-2 xl:gap-4">
        <ValueReadout label="SOG" value={formatNumber(speed.sogKts)} unit="kt" size="lg" accent="text-cyan-100" />
        <GaugeCircle className="h-8 w-8 shrink-0 text-cyan-200/80 xl:h-16 xl:w-16" />
      </div>
      <div className="mt-1 rounded-xl bg-slate-950/45 p-1.5 xl:mt-4 xl:rounded-2xl xl:p-3">
        <ValueReadout label="STW" value={formatNumber(speed.stwKts)} unit="kt" size="md" />
      </div>
    </Card>
  );
}
