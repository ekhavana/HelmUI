// Pure mapping from an AutopilotCommand to the wire representation each
// transport needs. Keeping this transport-agnostic and side-effect free lets us
// unit test the exact paths/values we send to a real autopilot without a server.

import type { AutopilotCommand } from './commands';
import { normalizeHeading } from './commands';

// Classic Signal K autopilot PUT surface (as used by the signalk-autopilot
// plugin): a path under steering.autopilot.* and a value.
export interface SignalKPut {
  path: string;
  value: number | string;
}

// Neutral command envelope the browser POSTs to the bridge, which republishes
// it to MQTT as helmui/autopilot/command/<type>. Node-RED maps it to hardware.
export interface BridgeAutopilotCommand {
  type: 'state' | 'heading' | 'adjust' | 'tack' | 'advance';
  value: string;
}

function degreesToRadians(degrees: number): number {
  return (normalizeHeading(degrees) * Math.PI) / 180;
}

export function toSignalKPut(command: AutopilotCommand): SignalKPut {
  switch (command.kind) {
    case 'setState':
      return { path: 'steering.autopilot.state', value: command.state };
    case 'setHeading':
      return { path: 'steering.autopilot.target.headingTrue', value: degreesToRadians(command.headingDegrees) };
    case 'adjustHeading':
      return { path: 'steering.autopilot.actions.adjustHeading', value: Math.round(command.deltaDegrees) };
    case 'tack':
      return { path: 'steering.autopilot.actions.tack', value: command.direction };
    case 'advanceWaypoint':
      return { path: 'steering.autopilot.actions.advanceWaypoint', value: 1 };
  }
}

export function toBridgeCommand(command: AutopilotCommand): BridgeAutopilotCommand {
  switch (command.kind) {
    case 'setState':
      return { type: 'state', value: command.state };
    case 'setHeading':
      return { type: 'heading', value: String(normalizeHeading(command.headingDegrees)) };
    case 'adjustHeading':
      return { type: 'adjust', value: String(Math.round(command.deltaDegrees)) };
    case 'tack':
      return { type: 'tack', value: command.direction };
    case 'advanceWaypoint':
      return { type: 'advance', value: '1' };
  }
}
