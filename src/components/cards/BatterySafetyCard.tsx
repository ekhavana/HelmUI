import { BatteryCharging } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { getBatterySafetyState } from '../../utils/thresholds';
import { Card } from '../ui/Card';

export function BatterySafetyCard() {
  const battery = useBoatStore((state) => state.data.battery);
  const safety = getBatterySafetyState(battery.housePercent, battery.houseVoltage);
  const tone = safety === 'danger' ? 'danger' : safety === 'warning' ? 'warning' : 'safe';

  return (
    <Card className="h-full px-3 py-2 lg:px-5 lg:py-4" tone={tone}>
      <div className="flex h-full items-center gap-2 lg:gap-3">
        <BatteryCharging className="h-5 w-5 shrink-0 lg:h-8 lg:w-8" />
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 lg:text-sm">Battery</div>
          <div className="text-sm font-bold leading-tight tabular-nums text-white lg:mt-1 lg:text-3xl">{battery.housePercent}%</div>
          <div className="text-[9px] leading-tight text-slate-300 lg:text-sm">{battery.houseVoltage.toFixed(1)} V · {battery.currentAmps.toFixed(1)} A</div>
        </div>
      </div>
    </Card>
  );
}
