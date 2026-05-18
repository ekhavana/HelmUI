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
    <section className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
      <aside className="grid min-h-0 grid-rows-3 gap-4">
        <SpeedCard />
        <HeadingCard />
        <WaterTempCard />
      </aside>
      <ChartPanel />
      <aside className="grid min-h-0 grid-rows-4 gap-4">
        <WindCard />
        <BatteryCard />
        <BilgeCard />
        <EngineCard />
      </aside>
    </section>
  );
}
