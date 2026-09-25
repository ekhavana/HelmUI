import type { BoatData } from '../data/boatData';

export type BridgeSourceName = 'signalk' | 'mqtt' | 'nodered';

export interface BridgeSourceState {
  connected: boolean;
  lastSeen: string | null;
  detail?: string;
}

export interface BridgeSnapshotMessage {
  type: 'snapshot';
  timestamp: string;
  data: Partial<BoatData>;
  ui?: { brightness?: number };
  sources: Record<BridgeSourceName, BridgeSourceState>;
}

export interface BridgeDeltaMessage {
  type: 'delta';
  timestamp: string;
  patch: Partial<BoatData>;
  ui?: { brightness?: number };
  sources: Record<BridgeSourceName, BridgeSourceState>;
}

export interface BridgeHealthMessage {
  type: 'health';
  timestamp: string;
  sources: Record<BridgeSourceName, BridgeSourceState>;
}

export type BridgeMessage = BridgeSnapshotMessage | BridgeDeltaMessage | BridgeHealthMessage;
