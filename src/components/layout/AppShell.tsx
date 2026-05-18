import { BatteryCard } from '../cards/BatteryCard';
import { BilgeCard } from '../cards/BilgeCard';
import { ChartPanel } from '../cards/ChartPanel';
import { EngineCard } from '../cards/EngineCard';
import { HeadingCard } from '../cards/HeadingCard';
import { SpeedCard } from '../cards/SpeedCard';
import { WaterTempCard } from '../cards/WaterTempCard';
import { WindCard } from '../cards/WindCard';
import { BottomNav } from './BottomNav';
import { SafetyStrip } from './SafetyStrip';
import { StatusBar } from './StatusBar';

export function AppShell() {
  return (
    <main className="mx-auto flex h-screen max-h-[1080px] min-h-[720px] w-screen max-w-[1920px] flex-col gap-4 p-5">
      <SafetyStrip />
      <section className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
        <aside className="flex min-h-0 flex-col gap-4">
          <SpeedCard />
          <HeadingCard />
          <WaterTempCard />
        </aside>
        <ChartPanel />
        <aside className="flex min-h-0 flex-col gap-4">
          <WindCard />
          <BatteryCard />
          <BilgeCard />
          <EngineCard />
        </aside>
      </section>
      <BottomNav />
      <StatusBar />
    </main>
  );
}
