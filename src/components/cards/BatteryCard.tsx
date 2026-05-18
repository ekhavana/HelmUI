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
        <div className="text-2xl font-bold leading-none tabular-nums text-white lg:text-6xl">{battery.housePercent}<span className="text-sm text-slate-300 lg:text-2xl">%</span></div>
        <BatteryFull className="h-6 w-6 shrink-0 text-emerald-300/85 lg:h-16 lg:w-16" />
      </div>
      <div className="mt-1 lg:mt-4">
        <Gauge value={battery.housePercent} tone="green" />
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-[10px] font-semibold leading-tight text-slate-200 lg:mt-4 lg:gap-3 lg:text-lg">
        <div>{formatVoltage(battery.houseVoltage)}</div>
        <div>{formatAmps(battery.currentAmps)}</div>
      </div>
    </Card>
  );
}
