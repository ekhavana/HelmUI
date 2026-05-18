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
        <div className="text-5xl font-bold tabular-nums text-white">{formatNumber(waterTemp)}<span className="text-2xl text-slate-300"> °C</span></div>
        <ThermometerSun className="h-14 w-14 shrink-0 text-cyan-200/80" />
      </div>
      <div className="mt-3">
        <MiniTrend />
      </div>
    </Card>
  );
}
