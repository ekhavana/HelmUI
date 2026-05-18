import { ModeScreen } from '../screens/ModeScreen';
import { BottomNav } from './BottomNav';
import { SafetyStrip } from './SafetyStrip';
import { StatusBar } from './StatusBar';

export function AppShell() {
  return (
    <main className="mx-auto flex min-h-screen w-screen max-w-[1920px] flex-col gap-2 overflow-auto p-2 lg:h-screen lg:max-h-[1200px] lg:gap-4 lg:overflow-hidden lg:p-5">
      <SafetyStrip />
      <ModeScreen />
      <BottomNav />
      <StatusBar />
    </main>
  );
}
