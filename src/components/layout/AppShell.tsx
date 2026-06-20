import { useBoatStore } from '../../store/boatStore';
import { ModeScreen } from '../screens/ModeScreen';
import { BottomNav } from './BottomNav';
import { SafetyStrip } from './SafetyStrip';
import { StatusBar } from './StatusBar';

export function AppShell() {
  const settings = useBoatStore((state) => state.settings);

  return (
    <main
      className="relative flex h-full w-full flex-col gap-3 overflow-hidden p-4"
      style={{ filter: `brightness(${settings.brightness / 100})` }}
    >
      {settings.theme === 'night' ? <div className="pointer-events-none absolute inset-0 z-10 bg-slate-950/15" /> : null}
      <SafetyStrip />
      <ModeScreen />
      <BottomNav />
      <StatusBar />
    </main>
  );
}
