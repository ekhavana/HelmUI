import { ModeScreen } from '../screens/ModeScreen';
import { BottomNav } from './BottomNav';
import { SafetyStrip } from './SafetyStrip';
import { StatusBar } from './StatusBar';

export function AppShell() {
  return (
    <main className="grid h-full w-full grid-rows-[112px_minmax(0,1fr)_80px_56px] gap-3 overflow-hidden p-4">
      <SafetyStrip />
      <ModeScreen />
      <BottomNav />
      <StatusBar />
    </main>
  );
}
