import type { SignalKConnectionState, SignalKDeltaMessage } from './types';

interface SignalKClientOptions {
  url: string;
  onDelta: (delta: SignalKDeltaMessage) => void;
  onStateChange?: (state: SignalKConnectionState) => void;
}

export function createSignalKClient({ url, onDelta, onStateChange }: SignalKClientOptions) {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let manuallyClosed = false;

  function setState(state: SignalKConnectionState): void {
    onStateChange?.(state);
  }

  function clearReconnectTimer(): void {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect(): void {
    if (manuallyClosed || reconnectTimer !== null) return;
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 3000);
  }

  function connect(): void {
    clearReconnectTimer();
    manuallyClosed = false;
    setState('connecting');

    socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      setState('connected');
      socket?.send(JSON.stringify({ context: 'vessels.self', subscribe: [{ path: '*', policy: 'instant' }] }));
    });

    socket.addEventListener('message', (event) => {
      try {
        onDelta(JSON.parse(event.data) as SignalKDeltaMessage);
      } catch {
        setState('error');
      }
    });

    socket.addEventListener('close', () => {
      socket = null;
      setState('disconnected');
      scheduleReconnect();
    });

    socket.addEventListener('error', () => {
      setState('error');
      socket?.close();
    });
  }

  function disconnect(): void {
    manuallyClosed = true;
    clearReconnectTimer();
    socket?.close();
    socket = null;
    setState('disabled');
  }

  return { connect, disconnect };
}
