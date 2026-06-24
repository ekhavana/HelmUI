import { useEffect } from 'react';
import { createBridgeClient } from './bridge/client';
import { AppShell } from './components/layout/AppShell';
import { KioskFit } from './components/layout/KioskFit';
import { runtimeConfig } from './config/runtime';
import { createSignalKClient } from './signalk/client';
import { useBoatStore } from './store/boatStore';

export default function App() {
  const tickSimulation = useBoatStore((state) => state.tickSimulation);
  const applyBridgeMessage = useBoatStore((state) => state.applyBridgeMessage);
  const applySignalKDelta = useBoatStore((state) => state.applySignalKDelta);
  const setSignalKState = useBoatStore((state) => state.setSignalKState);

  useEffect(() => {
    if (runtimeConfig.profile !== 'production-live') return;
    if (runtimeConfig.telemetry.transport !== 'bridge') {
      console.error('production-live requires VITE_TELEMETRY_TRANSPORT=bridge');
      setSignalKState('error');
      return;
    }
    if (runtimeConfig.ai.enabled) {
      console.error('production-live requires VITE_AI_ASSISTANT_ENABLED=false');
    }
  }, [setSignalKState]);

  useEffect(() => {
    if (runtimeConfig.profile !== 'development-sim') return;
    if (runtimeConfig.telemetry.requireLiveData) return;
    if (runtimeConfig.signalK.enabled) return;

    const interval = window.setInterval(tickSimulation, 1000);

    return () => window.clearInterval(interval);
  }, [tickSimulation]);

  useEffect(() => {
    if (runtimeConfig.telemetry.transport !== 'bridge') return;

    const client = createBridgeClient({
      url: runtimeConfig.telemetry.bridgeWsUrl,
      onMessage: applyBridgeMessage,
      onStateChange: setSignalKState,
    });

    client.connect();

    return () => client.disconnect();
  }, [applyBridgeMessage, setSignalKState]);

  useEffect(() => {
    if (runtimeConfig.telemetry.transport === 'bridge') return;
    if (!runtimeConfig.signalK.enabled) {
      setSignalKState(runtimeConfig.telemetry.requireLiveData ? 'disconnected' : 'disabled');
      return;
    }

    const client = createSignalKClient({
      url: runtimeConfig.signalK.url,
      onDelta: applySignalKDelta,
      onStateChange: setSignalKState,
    });

    client.connect();

    return () => client.disconnect();
  }, [applySignalKDelta, setSignalKState]);

  return (
    <KioskFit width={1920} height={1080}>
      <AppShell />
    </KioskFit>
  );
}
