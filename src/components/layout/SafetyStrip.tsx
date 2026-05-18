import { AisRiskCard } from '../cards/AisRiskCard';
import { AutopilotCard } from '../cards/AutopilotCard';
import { BatterySafetyCard } from '../cards/BatterySafetyCard';
import { DepthSafetyCard } from '../cards/DepthSafetyCard';
import { GpsCard } from '../cards/GpsCard';

export function SafetyStrip() {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:h-16 lg:h-32 lg:grid-cols-[1.25fr_1fr_1fr_1fr_1fr] lg:gap-4">
      <DepthSafetyCard />
      <AisRiskCard />
      <AutopilotCard />
      <BatterySafetyCard />
      <GpsCard />
    </div>
  );
}
