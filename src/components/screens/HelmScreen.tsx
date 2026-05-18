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
    <section className="grid h-full min-h-0 grid-cols-[320px_minmax(0,1fr)_360px] gap-4 overflow-hidden">
      <aside className="grid min-h-0 grid-rows-[1fr_1fr_1fr] gap-4 overflow-hidden">
        <SpeedCard />
        <HeadingCard />
        <WaterTempCard />
      </aside>
      <ChartPanel />
      <aside className="grid min-h-0 grid-rows-[1.3fr_1.15fr_0.78fr_0.78fr] gap-4 overflow-hidden">
        <WindCard />
        <BatteryCard />
        <BilgeCard />
        <EngineCard />
      </aside>
    </section>
  );
}
