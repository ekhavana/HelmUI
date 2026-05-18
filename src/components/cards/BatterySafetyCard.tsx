import { BatteryCharging } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { getBatterySafetyState } from '../../utils/thresholds';
import { Card } from '../ui/Card';

export function BatterySafetyCard() {
  const battery = useBoatStore((state) => state.data.battery);
  const safety = getBatterySafetyState(battery.housePercent, battery.houseVoltage);
  const tone = safety === 'danger' ? 'danger' : safety === 'warning' ? 'warning' : 'safe';

  return (
    <Card className="h-full px-5 py-4" tone={tone}>
      <div className="flex h-full items-center gap-3">
        <BatteryCharging className="h-8 w-8 shrink-0" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">Battery</div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-white">{battery.housePercent}%</div>
          <div className="text-sm text-slate-300">{battery.houseVoltage.toFixed(1)} V · {battery.currentAmps.toFixed(1)} A</div>
        </div>
      </div>
    </Card>
  );
}
