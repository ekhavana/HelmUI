import { ThermometerSun } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { MiniTrend } from '../ui/MiniTrend';

export function WaterTempCard() {
  const waterTemp = useBoatStore((state) => state.data.environment.waterTempC);

  return (
    <Card title="Water Temp" eyebrow="Sea">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold leading-none tabular-nums text-white lg:text-5xl">{formatNumber(waterTemp)}<span className="text-xs text-slate-300 lg:text-2xl"> °C</span></div>
        <ThermometerSun className="h-7 w-7 shrink-0 text-cyan-200/80 lg:h-14 lg:w-14" />
      </div>
      <div className="mt-1 lg:mt-3">
        <MiniTrend />
      </div>
    </Card>
  );
}
