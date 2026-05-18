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
        <div className="text-4xl font-bold leading-none tabular-nums text-white xl:text-6xl">{battery.housePercent}<span className="text-xl text-slate-300 xl:text-2xl">%</span></div>
        <BatteryFull className="h-8 w-8 shrink-0 text-emerald-300/85 xl:h-16 xl:w-16" />
      </div>
      <div className="mt-1.5 xl:mt-4">
        <Gauge value={battery.housePercent} tone="green" />
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-200 xl:mt-4 xl:gap-3 xl:text-lg">
        <div>{formatVoltage(battery.houseVoltage)}</div>
        <div>{formatAmps(battery.currentAmps)}</div>
      </div>
    </Card>
  );
}
