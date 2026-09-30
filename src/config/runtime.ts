import type { BridgeSourceName } from '../bridge/types';

export type RuntimeProfile = 'staging-live' | 'production-live';

export type ChartLayer = 'esri-ocean' | 'noaa-enc' | 'noaa-rnc' | 'osm';

export interface ChartTileSpec {
  url: string;
  // Deepest zoom the service actually renders; Leaflet upscales beyond it.
  maxNativeZoom?: number;
  // Beyond this the chart is hidden so the detailed street base shows through,
  // which matters at anchor-watch zoom where upscaled chart tiles are useless.
  maxZoom?: number;
  opacity?: number;
}

export interface ChartLayerSpec {
  label: string;
  // Chart rasters painted over the street base. NOAA charts only cover US
  // waters, so the base stays visible wherever a chart has no coverage.
  tiles: ChartTileSpec[];
  seamarks: boolean;
}

const ESRI_OCEAN = 'https://services.arcgisonline.com/arcgis/rest/services/Ocean';

export const CHART_LAYERS: Record<ChartLayer, ChartLayerSpec> = {
  'esri-ocean': {
    label: 'Esri Ocean + Seamarks',
    tiles: [
      { url: `${ESRI_OCEAN}/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}`, maxNativeZoom: 13, maxZoom: 15 },
      { url: `${ESRI_OCEAN}/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}`, maxNativeZoom: 13, maxZoom: 15 },
    ],
    seamarks: true,
  },
  'noaa-enc': {
    label: 'NOAA ENC',
    tiles: [{ url: 'https://tileservice.charts.noaa.gov/tiles/encdisplay/{z}/{x}/{y}.png', maxNativeZoom: 17 }],
    seamarks: false,
  },
  'noaa-rnc': {
    label: 'NOAA RNC',
    tiles: [{ url: 'https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', maxNativeZoom: 17 }],
    seamarks: false,
  },
  osm: {
    label: 'OSM + Seamarks',
    tiles: [],
    seamarks: true,
  },
};

const profile = (import.meta.env.VITE_RUNTIME_PROFILE as RuntimeProfile | undefined) ?? 'staging-live';
const isProductionLive = profile === 'production-live';

function resolveSignalKUrl(): string {
  if (import.meta.env.VITE_SIGNALK_WS_URL) return import.meta.env.VITE_SIGNALK_WS_URL as string;
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `ws://${host}:3000/signalk/v1/stream?subscribe=all`;
}

export interface ConnectivitySettings {
  signalKUrl: string;
  bridgeWsUrl: string;
  bridgeHttpUrl: string;
}

// Endpoints baked from env/defaults. In-app connectivity edits are persisted to
// the store and layered on top of these; they take effect on the next reload.
export const connectivityDefaults: ConnectivitySettings = {
  signalKUrl: resolveSignalKUrl(),
  bridgeWsUrl: (import.meta.env.VITE_TELEMETRY_BRIDGE_WS_URL as string | undefined) ?? 'ws://localhost:4300/ws',
  bridgeHttpUrl: (import.meta.env.VITE_TELEMETRY_BRIDGE_HTTP_URL as string | undefined) ?? 'http://localhost:4300',
};

// The persisted store hydrates synchronously, but the module-level connection
// URLs below are read before React mounts, so we peek at localStorage directly
// to honor a user's saved endpoints on cold start.
function readPersistedConnectivity(): Partial<ConnectivitySettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('helmui-settings');
    if (!raw) return {};
    const conn = (JSON.parse(raw) as { state?: { settings?: { connectivity?: unknown } } })?.state?.settings
      ?.connectivity as Partial<Record<keyof ConnectivitySettings, unknown>> | undefined;
    if (!conn || typeof conn !== 'object') return {};
    const pick = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
    return {
      signalKUrl: pick(conn.signalKUrl),
      bridgeWsUrl: pick(conn.bridgeWsUrl),
      bridgeHttpUrl: pick(conn.bridgeHttpUrl),
    };
  } catch {
    return {};
  }
}

const connectivityOverrides = readPersistedConnectivity();
const resolvedSignalKUrl = connectivityOverrides.signalKUrl ?? connectivityDefaults.signalKUrl;
const resolvedBridgeWsUrl = connectivityOverrides.bridgeWsUrl ?? connectivityDefaults.bridgeWsUrl;
const resolvedBridgeHttpUrl = connectivityOverrides.bridgeHttpUrl ?? connectivityDefaults.bridgeHttpUrl;

const signalKEnabledEnv = import.meta.env.VITE_SIGNALK_ENABLED;
const signalKEnabled = signalKEnabledEnv !== undefined ? signalKEnabledEnv === 'true' : true;

const telemetryTransport = (import.meta.env.VITE_TELEMETRY_TRANSPORT ?? 'signalk') as 'signalk' | 'bridge';
const aiEnabledEnv = import.meta.env.VITE_AI_ASSISTANT_ENABLED;

const chartOfflineOnly = import.meta.env.VITE_CHART_OFFLINE_ONLY === 'true';
const chartLayerEnv = import.meta.env.VITE_CHART_LAYER as ChartLayer | undefined;
const chartLayer = chartLayerEnv && chartLayerEnv in CHART_LAYERS ? chartLayerEnv : 'esri-ocean';
const seamarksEnv = import.meta.env.VITE_CHART_SEAMARKS;
const chartSeamarks = seamarksEnv !== undefined ? seamarksEnv === 'true' : CHART_LAYERS[chartLayer].seamarks;

export const runtimeConfig = {
  profile,
  telemetry: {
    transport: telemetryTransport,
    bridgeWsUrl: resolvedBridgeWsUrl,
    bridgeHttpUrl: resolvedBridgeHttpUrl,
    requireLiveData: import.meta.env.VITE_REQUIRE_LIVE_DATA !== 'false',
    activeSources: (telemetryTransport === 'bridge'
      ? ['signalk', 'mqtt', 'nodered']
      : ['signalk']) as BridgeSourceName[],
  },
  signalK: {
    enabled: signalKEnabled,
    url: resolvedSignalKUrl,
  },
  chart: {
    tileUrlTemplate: import.meta.env.VITE_CHART_TILE_URL_TEMPLATE ?? '',
    offlineOnly: chartOfflineOnly,
    layer: chartLayer,
    seamarks: chartSeamarks,
    label: chartOfflineOnly ? 'Offline tiles' : CHART_LAYERS[chartLayer].label,
  },
  ai: {
    enabled: !isProductionLive && aiEnabledEnv !== 'false',
  },
};
