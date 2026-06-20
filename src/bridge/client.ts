import type { BridgeMessage } from './types';

type BridgeConnectionState = 'disabled' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface BridgeClientOptions {
  url: string;
  onMessage: (message: BridgeMessage) => void;
  onStateChange?: (state: BridgeConnectionState) => void;
}

export function createBridgeClient({ url, onMessage, onStateChange }: BridgeClientOptions) {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let manuallyClosed = false;

  const setState = (state: BridgeConnectionState) => onStateChange?.(state);

  const clearReconnect = () => {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (manuallyClosed || reconnectTimer !== null) return;
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 3000);
  };

  const connect = () => {
    clearReconnect();
    manuallyClosed = false;
    setState('connecting');
    socket = new WebSocket(url);

    socket.addEventListener('open', () => setState('connected'));
    socket.addEventListener('message', (event) => {
      try {
        onMessage(JSON.parse(event.data) as BridgeMessage);
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
  };

  const disconnect = () => {
    manuallyClosed = true;
    clearReconnect();
    socket?.close();
    socket = null;
    setState('disabled');
  };

  return { connect, disconnect };
}
