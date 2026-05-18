import { BatteryFull } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatAmps, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';

export function BatteryCard() {
  const battery = useBoatStore((state) => state.data.battery);

  return (
    <Card title="House Battery" eyebrow="Electrical" className="min-h-44">
      <div className="flex items-center justify-between">
        <div className="text-6xl font-bold tabular-nums text-white">{battery.housePercent}<span className="text-2xl text-slate-300">%</span></div>
        <BatteryFull className="h-16 w-16 text-emerald-300/85" />
      </div>
      <div className="mt-4">
        <Gauge value={battery.housePercent} tone="green" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-lg font-semibold text-slate-200">
        <div>{formatVoltage(battery.houseVoltage)}</div>
        <div>{formatAmps(battery.currentAmps)}</div>
      </div>
    </Card>
  );
}
