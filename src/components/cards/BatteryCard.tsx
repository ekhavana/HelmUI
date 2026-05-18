import { BatteryFull } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatAmps, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';

export function BatteryCard() {
  const battery = useBoatStore((state) => state.data.battery);

  return (
    <Card title="House Battery" eyebrow="Electrical">
      <div className="flex items-center justify-between">
        <div className="text-5xl font-bold leading-none tabular-nums text-white">{battery.housePercent}<span className="text-xl text-slate-300">%</span></div>
        <BatteryFull className="h-12 w-12 shrink-0 text-emerald-300/85" />
      </div>
      <div className="mt-3">
        <Gauge value={battery.housePercent} tone="green" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-base font-semibold text-slate-200">
        <div>{formatVoltage(battery.houseVoltage)}</div>
        <div>{formatAmps(battery.currentAmps)}</div>
      </div>
    </Card>
  );
}
