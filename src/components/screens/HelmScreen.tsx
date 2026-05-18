import { BatteryCard } from '../cards/BatteryCard';
import { BilgeCard } from '../cards/BilgeCard';
import { ChartPanel } from '../cards/ChartPanel';
import { EngineCard } from '../cards/EngineCard';
import { HeadingCard } from '../cards/HeadingCard';
import { SpeedCard } from '../cards/SpeedCard';
import { WaterTempCard } from '../cards/WaterTempCard';
import { WindCard } from '../cards/WindCard';

export function HelmScreen() {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto lg:grid lg:grid-cols-[320px_minmax(0,1fr)_360px] lg:gap-4 lg:overflow-hidden">
      <div className="h-40 shrink-0 sm:h-56 md:h-64 lg:hidden">
        <ChartPanel />
      </div>
      <aside className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid lg:grid-cols-1 lg:grid-rows-[1.12fr_1fr_1fr] lg:gap-4">
        <SpeedCard />
        <HeadingCard />
        <WaterTempCard />
      </aside>
      <div className="hidden lg:block">
        <ChartPanel />
      </div>
      <aside className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid lg:grid-cols-1 lg:grid-rows-[1.18fr_1.02fr_0.9fr_0.9fr] lg:gap-4">
        <WindCard />
        <BatteryCard />
        <BilgeCard />
        <EngineCard />
      </aside>
    </section>
  );
}
