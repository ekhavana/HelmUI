export interface SignalKValueUpdate {
  path: string;
  value: unknown;
}

export interface SignalKUpdateGroup {
  source?: unknown;
  timestamp?: string;
  values?: SignalKValueUpdate[];
}

export interface SignalKDeltaMessage {
  context?: string;
  updates?: SignalKUpdateGroup[];
}

export type SignalKConnectionState = 'disabled' | 'connecting' | 'connected' | 'disconnected' | 'error';
