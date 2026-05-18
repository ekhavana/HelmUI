import { Cog } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatCelsius, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function EngineCard() {
  const engine = useBoatStore((state) => state.data.engine);

  return (
    <Card title="Engine" eyebrow="Main">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 text-base font-semibold text-slate-200">
          <div>Coolant <span className="text-white">{formatCelsius(engine.coolantTempC)}</span></div>
          <div>Alternator <span className="text-white">{formatVoltage(engine.alternatorVoltage)}</span></div>
        </div>
        <Cog className="h-10 w-10 shrink-0 text-cyan-200/80" />
      </div>
    </Card>
  );
}
