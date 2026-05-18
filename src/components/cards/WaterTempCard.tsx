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
        <div className="text-3xl font-bold tabular-nums text-white xl:text-5xl">{formatNumber(waterTemp)}<span className="text-sm text-slate-300 xl:text-2xl"> °C</span></div>
        <ThermometerSun className="h-8 w-8 shrink-0 text-cyan-200/80 xl:h-14 xl:w-14" />
      </div>
      <div className="mt-1 xl:mt-3">
        <MiniTrend />
      </div>
    </Card>
  );
}
