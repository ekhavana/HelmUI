import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { KioskFit } from './components/layout/KioskFit';
import { runtimeConfig } from './config/runtime';
import { createSignalKClient } from './signalk/client';
import { useBoatStore } from './store/boatStore';

export default function App() {
  const tickSimulation = useBoatStore((state) => state.tickSimulation);
  const applySignalKDelta = useBoatStore((state) => state.applySignalKDelta);
  const setSignalKState = useBoatStore((state) => state.setSignalKState);

  useEffect(() => {
    if (runtimeConfig.signalK.enabled) return;

    const interval = window.setInterval(tickSimulation, 1000);

    return () => window.clearInterval(interval);
  }, [tickSimulation]);

  useEffect(() => {
    if (!runtimeConfig.signalK.enabled) {
      setSignalKState('disabled');
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
