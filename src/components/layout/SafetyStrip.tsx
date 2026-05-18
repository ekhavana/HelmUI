import { AisRiskCard } from '../cards/AisRiskCard';
import { AutopilotCard } from '../cards/AutopilotCard';
import { BatterySafetyCard } from '../cards/BatterySafetyCard';
import { DepthSafetyCard } from '../cards/DepthSafetyCard';
import { GpsCard } from '../cards/GpsCard';

export function SafetyStrip() {
  return (
    <div className="grid h-[68px] shrink-0 grid-cols-[1.15fr_0.95fr_0.95fr_0.95fr_0.95fr] gap-2 xl:h-32 xl:grid-cols-[1.25fr_1fr_1fr_1fr_1fr] xl:gap-4">
      <DepthSafetyCard />
      <AisRiskCard />
      <AutopilotCard />
      <BatterySafetyCard />
      <GpsCard />
    </div>
  );
}
