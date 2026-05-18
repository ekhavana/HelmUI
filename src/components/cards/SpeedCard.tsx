import { GaugeCircle } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { ValueReadout } from '../ui/ValueReadout';

export function SpeedCard() {
  const speed = useBoatStore((state) => state.data.speed);

  return (
    <Card title="Speed" eyebrow="Motion" tone="active">
      <div className="flex items-center justify-between gap-4">
        <ValueReadout label="SOG" value={formatNumber(speed.sogKts)} unit="kt" size="lg" accent="text-cyan-100" />
        <GaugeCircle className="h-12 w-12 shrink-0 text-cyan-200/80" />
      </div>
      <div className="mt-3 rounded-2xl bg-slate-950/45 p-3">
        <ValueReadout label="STW" value={formatNumber(speed.stwKts)} unit="kt" size="md" />
      </div>
    </Card>
  );
}
