import { Cog } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatCelsius, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function EngineCard() {
  const engine = useBoatStore((state) => state.data.engine);

  return (
    <Card title="Engine" eyebrow="Main">
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        <div className="space-y-0 text-[10px] font-semibold leading-tight text-slate-200 lg:space-y-2 lg:text-lg">
          <div>Coolant <span className="text-white">{formatCelsius(engine.coolantTempC)}</span></div>
          <div>Alternator <span className="text-white">{formatVoltage(engine.alternatorVoltage)}</span></div>
        </div>
        <Cog className="h-6 w-6 shrink-0 text-cyan-200/80 lg:h-14 lg:w-14" />
      </div>
    </Card>
  );
}
