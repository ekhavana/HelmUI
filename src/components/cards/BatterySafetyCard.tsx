import { BatteryCharging } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatAmps, formatVoltage } from '../../utils/formatters';
import { getBatterySafetyState } from '../../utils/thresholds';
import { Card } from '../ui/Card';

export function BatterySafetyCard() {
  const battery = useBoatStore((state) => state.data.battery);
  const safety = battery.housePercent === null || battery.houseVoltage === null
    ? null
    : getBatterySafetyState(battery.housePercent, battery.houseVoltage);
  const tone = safety === 'danger' ? 'danger' : safety === 'warning' ? 'warning' : safety === 'safe' ? 'safe' : 'default';

  return (
    <Card className="h-full px-5 py-4" tone={tone}>
      <div className="flex h-full items-center gap-3">
        <BatteryCharging className="h-8 w-8 shrink-0" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">Battery</div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-white">{battery.housePercent === null ? '--' : `${battery.housePercent}%`}</div>
          <div className="text-sm text-slate-300">{formatVoltage(battery.houseVoltage)} · {formatAmps(battery.currentAmps)}</div>
        </div>
      </div>
    </Card>
  );
}
