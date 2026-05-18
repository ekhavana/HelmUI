import { Cog } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatCelsius, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';

export function EngineCard() {
  const engine = useBoatStore((state) => state.data.engine);

  return (
    <Card title="Engine" eyebrow="Main">
      <div className="flex items-center justify-between gap-2 xl:gap-4">
        <div className="space-y-0.5 text-[11px] font-semibold text-slate-200 xl:space-y-2 xl:text-lg">
          <div>Coolant <span className="text-white">{formatCelsius(engine.coolantTempC)}</span></div>
          <div>Alternator <span className="text-white">{formatVoltage(engine.alternatorVoltage)}</span></div>
        </div>
        <Cog className="h-7 w-7 shrink-0 text-cyan-200/80 xl:h-14 xl:w-14" />
      </div>
    </Card>
  );
}
