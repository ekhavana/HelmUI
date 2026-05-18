import { AisRiskCard } from '../cards/AisRiskCard';
import { AutopilotCard } from '../cards/AutopilotCard';
import { BatterySafetyCard } from '../cards/BatterySafetyCard';
import { DepthSafetyCard } from '../cards/DepthSafetyCard';
import { GpsCard } from '../cards/GpsCard';

export function SafetyStrip() {
  return (
    <div className="grid h-32 grid-cols-[1.25fr_1fr_1fr_1fr_1fr] gap-4">
      <DepthSafetyCard />
      <AisRiskCard />
      <AutopilotCard />
      <BatterySafetyCard />
      <GpsCard />
    </div>
  );
}
