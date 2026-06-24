export type RuntimeProfile = 'development-sim' | 'staging-live' | 'production-live';

const profile = (import.meta.env.VITE_RUNTIME_PROFILE as RuntimeProfile | undefined) ?? 'staging-live';

const isProductionLike = profile === 'production-live' || profile === 'staging-live';

function resolveSignalKUrl(): string {
  if (import.meta.env.VITE_SIGNALK_WS_URL) return import.meta.env.VITE_SIGNALK_WS_URL as string;
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `ws://${host}:3000/signalk/v1/stream?subscribe=all`;
}

const signalKEnabledEnv = import.meta.env.VITE_SIGNALK_ENABLED;
const signalKEnabled = signalKEnabledEnv !== undefined ? signalKEnabledEnv === 'true' : true;

export const runtimeConfig = {
  profile,
  telemetry: {
    transport: (import.meta.env.VITE_TELEMETRY_TRANSPORT ?? 'signalk') as 'signalk' | 'bridge',
    bridgeWsUrl: import.meta.env.VITE_TELEMETRY_BRIDGE_WS_URL ?? 'ws://localhost:4300/ws',
    bridgeHttpUrl: import.meta.env.VITE_TELEMETRY_BRIDGE_HTTP_URL ?? 'http://localhost:4300',
    requireLiveData: import.meta.env.VITE_REQUIRE_LIVE_DATA === 'true' || isProductionLike,
  },
  signalK: {
    enabled: signalKEnabled,
    url: resolveSignalKUrl(),
  },
  chart: {
    tileUrlTemplate: import.meta.env.VITE_CHART_TILE_URL_TEMPLATE ?? '',
    offlineOnly: import.meta.env.VITE_CHART_OFFLINE_ONLY === 'true',
  },
  ai: {
    enabled:
      (import.meta.env.VITE_AI_ASSISTANT_ENABLED
        ? import.meta.env.VITE_AI_ASSISTANT_ENABLED === 'true'
        : profile !== 'production-live') && profile !== 'production-live',
  },
};
