import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { runtimeConfig } from '../config/runtime';
import { emptyBoatData, type BoatData } from '../data/boatData';
import { mergeAisContacts, summarizeAis } from '../domain/ais/aggregateAis';
import type { BridgeMessage, BridgeSourceName, BridgeSourceState } from '../bridge/types';
import { evaluateAlarms } from '../domain/alarms/evaluateAlarms';
import { isHelmSettingsProfile, SETTINGS_PROFILE_VERSION, type HelmSettingsProfile } from '../domain/settings/profile';
import type { AlarmItem } from '../domain/alarms/types';
import { mapSignalKDelta, type BoatDataPatch } from '../signalk/mapDelta';
import type { SignalKConnectionState, SignalKDeltaMessage } from '../signalk/types';
import { haversineMeters } from '../utils/geo';

export type AppMode = 'helm' | 'chart' | 'anchor' | 'engine' | 'systems' | 'ai' | 'menu';

export type DisplayTheme = 'day' | 'night' | 'auto';

export interface UiSettings {
  brightness: number;
  theme: DisplayTheme;
  depthWarningFt: number;
  depthOffsetFt: number;
  autoLaunch: boolean;
  touchLock: boolean;
}

export interface AssistantMessage {
  role: 'assistant' | 'user';
  text: string;
}

interface BoatStore {
  data: BoatData;
  mode: AppMode;
  settings: UiSettings;
  aiMessages: AssistantMessage[];
  signalKState: SignalKConnectionState;
  sourceHealth: Record<BridgeSourceName, BridgeSourceState>;
  telemetryUpdatedAt: string | null;
  alarms: AlarmItem[];
  setMode: (mode: AppMode) => void;
  setBoatData: (data: BoatData) => void;
  updateSettings: (patch: Partial<UiSettings>) => void;
  resetSettings: () => void;
  setAnchorRadius: (radiusMeters: number) => void;
  setAnchorPosition: (lat: number, lon: number) => void;
  clearAnchorPosition: () => void;
  addAiMessage: (message: AssistantMessage) => void;
  clearAiMessages: () => void;
  setSignalKState: (signalKState: SignalKConnectionState) => void;
  applyBridgeMessage: (message: BridgeMessage) => void;
  applySignalKDelta: (delta: SignalKDeltaMessage, selfContext?: string) => void;
  refreshAlarms: () => void;
  exportSettingsProfile: () => HelmSettingsProfile;
  importSettingsProfile: (value: unknown) => boolean;
}

const defaultSettings: UiSettings = {
  brightness: 82,
  theme: 'auto',
  depthWarningFt: 6,
  depthOffsetFt: 0,
  autoLaunch: true,
  touchLock: false,
};

const defaultAiMessages: AssistantMessage[] = [
  { role: 'assistant', text: 'Assistant online. Ask for route status, engine summary, anchor watch, or systems snapshot.' },
];

const defaultSourceHealth: Record<BridgeSourceName, BridgeSourceState> = {
  signalk: { connected: false, lastSeen: null },
  mqtt: { connected: false, lastSeen: null },
  nodered: { connected: false, lastSeen: null },
};

const activeTelemetrySources = runtimeConfig.telemetry.activeSources;

function evaluateStateAlarms(input: {
  data: BoatData;
  settings: UiSettings;
  sourceHealth: Record<BridgeSourceName, BridgeSourceState>;
}): AlarmItem[] {
  return evaluateAlarms({ ...input, activeSources: activeTelemetrySources });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function withAnchorDrift(data: BoatData): BoatData {
  const { anchorLat, anchorLon } = data.anchor;
  const { latitude, longitude } = data.navigation;
  if (anchorLat === null || anchorLon === null || latitude === null || longitude === null) return data;
  const distanceFromSetMeters = haversineMeters(anchorLat, anchorLon, latitude, longitude);
  return { ...data, anchor: { ...data.anchor, distanceFromSetMeters } };
}

function withLiveAis(data: BoatData): BoatData {
  return { ...data, ais: summarizeAis(data.ais.contacts, data.navigation) };
}

function withDerivedTelemetry(data: BoatData): BoatData {
  return withLiveAis(withAnchorDrift(data));
}

function mergeBoatData(base: BoatData, patch: Partial<BoatData> | BoatDataPatch): BoatData {
  const next = patch as Partial<BoatData> & BoatDataPatch;
  return {
    ...base,
    ...next,
    depth: { ...base.depth, ...(next.depth ?? {}) },
    speed: { ...base.speed, ...(next.speed ?? {}) },
    navigation: { ...base.navigation, ...(next.navigation ?? {}) },
    wind: { ...base.wind, ...(next.wind ?? {}) },
    ais: {
      ...base.ais,
      ...(next.ais ?? {}),
      contacts: mergeAisContacts(base.ais.contacts, next.ais?.contacts),
    },
    autopilot: { ...base.autopilot, ...(next.autopilot ?? {}) },
    battery: { ...base.battery, ...(next.battery ?? {}) },
    bilge: { ...base.bilge, ...(next.bilge ?? {}) },
    engine: { ...base.engine, ...(next.engine ?? {}) },
    tanks: { ...base.tanks, ...(next.tanks ?? {}) },
    power: { ...base.power, ...(next.power ?? {}) },
    network: { ...base.network, ...(next.network ?? {}) },
    anchor: { ...base.anchor, ...(next.anchor ?? {}) },
    route: { ...base.route, ...(next.route ?? {}) },
    environment: { ...base.environment, ...(next.environment ?? {}) },
    time: { ...base.time, ...(next.time ?? {}) },
  };
}

export const useBoatStore = create<BoatStore>()(
  persist(
    (set, get) => ({
      data: emptyBoatData,
      mode: 'helm' as AppMode,
      settings: defaultSettings,
      aiMessages: defaultAiMessages,
      signalKState: 'disabled',
      sourceHealth: defaultSourceHealth,
      telemetryUpdatedAt: null as string | null,
      alarms: [] as AlarmItem[],
      setMode: (mode) => set({ mode }),
      setBoatData: (data) => set({ data }),
      updateSettings: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
          },
          alarms: evaluateStateAlarms({
            data: state.data,
            settings: { ...state.settings, ...patch },
            sourceHealth: state.sourceHealth,
          }),
        })),
      resetSettings: () =>
        set((state) => ({
          settings: defaultSettings,
          data: {
            ...state.data,
            anchor: {
              ...state.data.anchor,
              radiusMeters: emptyBoatData.anchor.radiusMeters,
            },
          },
          alarms: evaluateStateAlarms({
            data: {
              ...state.data,
              anchor: {
                ...state.data.anchor,
                radiusMeters: emptyBoatData.anchor.radiusMeters,
              },
            },
            settings: defaultSettings,
            sourceHealth: state.sourceHealth,
          }),
        })),
      setAnchorPosition: (lat, lon) =>
        set((state) => ({
          data: {
            ...state.data,
            anchor: { ...state.data.anchor, anchorLat: lat, anchorLon: lon, deployed: true },
          },
        })),
      clearAnchorPosition: () =>
        set((state) => ({
          data: {
            ...state.data,
            anchor: { ...state.data.anchor, anchorLat: null, anchorLon: null, deployed: false },
          },
        })),
      setAnchorRadius: (radiusMeters) =>
        set((state) => {
          const data = {
            ...state.data,
            anchor: {
              ...state.data.anchor,
              radiusMeters: clamp(radiusMeters, 8, 120),
            },
          };
          return {
            data,
            alarms: evaluateStateAlarms({
              data,
              settings: state.settings,
              sourceHealth: state.sourceHealth,
            }),
          };
        }),
      addAiMessage: (message) =>
        set((state) => ({
          aiMessages: [...state.aiMessages, message].slice(-40),
        })),
      clearAiMessages: () => set({ aiMessages: [...defaultAiMessages] }),
      setSignalKState: (signalKState) =>
        set((state) => {
          const nextSourceHealth = {
            ...state.sourceHealth,
            signalk: {
              connected: signalKState === 'connected',
              lastSeen: signalKState === 'connected' ? new Date().toISOString() : state.sourceHealth.signalk.lastSeen,
              detail: signalKState,
            },
          };
          return {
            signalKState,
            sourceHealth: nextSourceHealth,
            alarms: evaluateStateAlarms({
              data: state.data,
              settings: state.settings,
              sourceHealth: nextSourceHealth,
            }),
          };
        }),
      applyBridgeMessage: (message) =>
        set((state) => {
          const sourceHealth = message.sources ?? state.sourceHealth;
          const nextData = withDerivedTelemetry(
            message.type === 'snapshot'
              ? mergeBoatData(state.data, message.data)
              : message.type === 'delta'
                ? mergeBoatData(state.data, message.patch)
                : state.data,
          );
          const brightness = message.type === 'health' ? undefined : message.ui?.brightness;
          const settings =
            typeof brightness === 'number'
              ? { ...state.settings, brightness: clamp(brightness, 35, 100) }
              : state.settings;
          const alarms = evaluateStateAlarms({
            data: nextData,
            settings,
            sourceHealth,
          });

          return {
            data: nextData,
            settings,
            sourceHealth,
            telemetryUpdatedAt: message.timestamp ?? new Date().toISOString(),
            alarms,
          };
        }),
      applySignalKDelta: (delta, selfContext = 'vessels.self') =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const data = withDerivedTelemetry(mergeBoatData(state.data, mapSignalKDelta(delta, selfContext)));
          const sourceHealth = {
            ...state.sourceHealth,
            signalk: {
              connected: true,
              lastSeen: timestamp,
              detail: 'streaming',
            },
          };
          return {
            data,
            sourceHealth,
            telemetryUpdatedAt: timestamp,
            alarms: evaluateStateAlarms({
              data,
              settings: state.settings,
              sourceHealth,
            }),
          };
        }),
      refreshAlarms: () =>
        set((state) => ({
          alarms: evaluateStateAlarms({
            data: state.data,
            settings: state.settings,
            sourceHealth: state.sourceHealth,
          }),
        })),
      exportSettingsProfile: (): HelmSettingsProfile => {
        const state = get();
        return {
          version: SETTINGS_PROFILE_VERSION,
          exportedAt: new Date().toISOString(),
          settings: { ...state.settings },
          anchorRadiusMeters: state.data.anchor.radiusMeters,
        };
      },
      importSettingsProfile: (value: unknown) => {
        if (!isHelmSettingsProfile(value)) return false;
        set((state) => {
          const settings = {
            ...state.settings,
            ...value.settings,
            brightness: clamp(value.settings.brightness, 35, 100),
            depthWarningFt: clamp(value.settings.depthWarningFt, 4, 20),
            depthOffsetFt: clamp(value.settings.depthOffsetFt, -6, 6),
          };
          const data = {
            ...state.data,
            anchor: {
              ...state.data.anchor,
              radiusMeters: clamp(value.anchorRadiusMeters, 8, 120),
            },
          };
          return {
            settings,
            data,
            alarms: evaluateStateAlarms({
              data,
              settings,
              sourceHealth: state.sourceHealth,
            }),
          };
        });
        return true;
      },
    }),
    {
      name: 'helmui-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        settings: state.settings,
        aiMessages: state.aiMessages,
        data: {
          anchor: {
            radiusMeters: state.data.anchor.radiusMeters,
          },
        },
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<{
          mode: AppMode;
          settings: UiSettings;
          aiMessages: AssistantMessage[];
          data: {
            anchor: {
              radiusMeters: number;
            };
          };
        }>;

        return {
          ...currentState,
          mode: persisted.mode ?? currentState.mode,
          settings: {
            ...currentState.settings,
            ...(persisted.settings ?? {}),
            depthOffsetFt: persisted.settings?.depthOffsetFt ?? currentState.settings.depthOffsetFt,
          },
          aiMessages: persisted.aiMessages?.length ? persisted.aiMessages : currentState.aiMessages,
          sourceHealth: currentState.sourceHealth,
          telemetryUpdatedAt: currentState.telemetryUpdatedAt,
          alarms: currentState.alarms,
          data: {
            ...currentState.data,
            anchor: {
              ...currentState.data.anchor,
              radiusMeters: persisted.data?.anchor?.radiusMeters ?? currentState.data.anchor.radiusMeters,
            },
          },
        } as BoatStore;
      },
    },
  ),
);
