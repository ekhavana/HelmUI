import { useBoatStore } from '../../store/boatStore';
import { ModeScreen } from '../screens/ModeScreen';
import { BottomNav } from './BottomNav';
import { EventLogOverlay } from './EventLogOverlay';
import { SafetyStrip } from './SafetyStrip';
import { StatusBar } from './StatusBar';
import { TouchLockOverlay } from './TouchLockOverlay';

export function AppShell() {
  const settings = useBoatStore((state) => state.settings);
  const telemetryMode = useBoatStore((state) => state.telemetryMode);

  return (
    <main
      className="relative flex h-full w-full flex-col gap-3 overflow-hidden p-4"
      style={{ filter: `brightness(${settings.brightness / 100})` }}
    >
      {/* Leaflet's own panes run up to z-index 1000, so every app-level overlay
          has to clear that to stay above the chart. */}
      {settings.theme === 'night' ? <div className="pointer-events-none absolute inset-0 z-[1200] bg-slate-950/15" /> : null}
      {telemetryMode === 'replay' ? (
        <div className="pointer-events-none absolute left-1/2 top-0 z-[1300] -translate-x-1/2 rounded-b-xl border border-t-0 border-amber-400/70 bg-amber-500/25 px-5 py-1 text-xs font-bold uppercase tracking-[0.28em] text-amber-100">
          Replay data · not a live vessel
        </div>
      ) : null}
      <SafetyStrip />
      <ModeScreen />
      <BottomNav />
      <StatusBar />
      <EventLogOverlay />
      <TouchLockOverlay />
    </main>
  );
}
