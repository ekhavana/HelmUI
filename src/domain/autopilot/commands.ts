// Pure autopilot command model.
//
// This module holds the safety-critical command vocabulary and the heading math
// used to build commands, kept free of React and any transport so it can be unit
// tested in isolation. Nothing here talks to a real autopilot; dispatching lives
// in the transport layer (src/signalk/commands.ts and the bridge command route).

export type AutopilotMode = 'auto' | 'wind' | 'route';

// The engaged modes the UI can request, plus disengage.
export type EngageTarget = AutopilotMode | 'standby';

export type TackDirection = 'port' | 'starboard';

export type AutopilotCommand =
  | { kind: 'setState'; state: EngageTarget }
  | { kind: 'adjustHeading'; deltaDegrees: number }
  | { kind: 'setHeading'; headingDegrees: number }
  | { kind: 'tack'; direction: TackDirection }
  | { kind: 'advanceWaypoint' };

// Routine heading trims exposed as buttons. Larger/engagement actions are
// treated as deliberate and gated behind a confirmation (see requiresConfirmation).
export const HEADING_NUDGES_DEGREES = [-10, -1, 1, 10] as const;

export const ENGAGE_MODE_LABELS: Record<AutopilotMode, string> = {
  auto: 'Compass',
  wind: 'Wind',
  route: 'Route',
};

// Normalize any heading into the [0, 360) range.
export function normalizeHeading(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  return ((degrees % 360) + 360) % 360;
}

// Apply a relative trim to the current target heading. Autopilots take integer
// degrees, so we round. Returns null when there is no heading to trim yet.
export function applyHeadingDelta(current: number | null, deltaDegrees: number): number | null {
  if (current === null || !Number.isFinite(current)) return null;
  return normalizeHeading(Math.round(current + deltaDegrees));
}

// Angular difference target - actual, expressed in [-180, 180]. Positive means
// the target is to starboard of the current heading.
export function headingDeviation(target: number | null, actual: number | null): number | null {
  if (target === null || actual === null) return null;
  const diff = normalizeHeading(target - actual);
  return diff > 180 ? diff - 360 : diff;
}

// Engaging, disengaging, tacking, and skipping a waypoint change the boat's
// behavior materially, so they must be confirmed. Small heading trims do not.
export function requiresConfirmation(command: AutopilotCommand): boolean {
  switch (command.kind) {
    case 'setState':
    case 'tack':
    case 'advanceWaypoint':
      return true;
    case 'adjustHeading':
    case 'setHeading':
      return false;
  }
}

export function describeCommand(command: AutopilotCommand): string {
  switch (command.kind) {
    case 'setState':
      return command.state === 'standby'
        ? 'Disengage autopilot (Standby)'
        : `Engage autopilot in ${ENGAGE_MODE_LABELS[command.state]} mode`;
    case 'adjustHeading': {
      const dir = command.deltaDegrees >= 0 ? 'starboard' : 'port';
      return `Adjust target heading ${Math.abs(command.deltaDegrees)}\u00b0 to ${dir}`;
    }
    case 'setHeading':
      return `Set target heading to ${normalizeHeading(command.headingDegrees)}\u00b0`;
    case 'tack':
      return `Tack to ${command.direction}`;
    case 'advanceWaypoint':
      return 'Advance to next waypoint';
  }
}

// Whether a given incoming autopilot state string means the pilot is steering.
export function isEngaged(state: string | null | undefined): boolean {
  if (!state) return false;
  return state.toLowerCase() !== 'standby' && state.toLowerCase() !== 'off';
}
