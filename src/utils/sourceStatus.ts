import type { TelemetryMode } from '../bridge/types';

// Replayed telemetry reports its sources as reachable, so every status readout
// has to distinguish it from a real vessel feed.
export function sourceStatusLabel(connected: boolean, mode: TelemetryMode, active = true): string {
  if (!active) return 'n/a';
  if (!connected) return 'down';
  return mode === 'replay' ? 'replay' : 'online';
}

export function sourceStatusClass(connected: boolean, mode: TelemetryMode, active = true): string {
  if (!active) return 'bg-slate-700/40 text-slate-300';
  if (!connected) return 'bg-red-500/20 text-red-200';
  return mode === 'replay' ? 'bg-amber-500/25 text-amber-100' : 'bg-emerald-500/20 text-emerald-200';
}
