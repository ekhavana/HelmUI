import { ModeScreen } from '../screens/ModeScreen';
import { BottomNav } from './BottomNav';
import { SafetyStrip } from './SafetyStrip';
import { StatusBar } from './StatusBar';

export function AppShell() {
  return (
    <main className="mx-auto flex h-screen max-h-[1080px] min-h-[560px] w-screen max-w-[1920px] flex-col gap-2 p-2 xl:gap-4 xl:p-5">
      <SafetyStrip />
      <ModeScreen />
      <BottomNav />
      <StatusBar />
    </main>
  );
}
