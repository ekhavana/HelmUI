import { ModeScreen } from '../screens/ModeScreen';
import { BottomNav } from './BottomNav';
import { SafetyStrip } from './SafetyStrip';
import { StatusBar } from './StatusBar';

export function AppShell() {
  return (
    <main className="flex h-full w-full flex-col gap-4 overflow-hidden p-5">
      <SafetyStrip />
      <ModeScreen />
      <BottomNav />
      <StatusBar />
    </main>
  );
}
