import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mockBoatData, type BoatData } from '../data/mockBoatData';
import type { BridgeMessage, BridgeSourceName, BridgeSourceState } from '../bridge/types';
import { evaluateAlarms } from '../domain/alarms/evaluateAlarms';
import type { AlarmItem } from '../domain/alarms/types';
import { applyBoatDataPatch, mapSignalKDelta } from '../signalk/mapDelta';
import type { SignalKConnectionState, SignalKDeltaMessage } from '../signalk/types';

export type AppMode = 'helm' | 'chart' | 'anchor' | 'engine' | 'systems' | 'ai' | 'menu';

export type DisplayTheme = 'day' | 'night' | 'auto';

export interface UiSettings {
  brightness: number;
  theme: DisplayTheme;
  depthWarningFt: number;
  autoLaunch: boolean;
  touchLock: boolean;
  offlineMode: boolean;
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
  addAiMessage: (message: AssistantMessage) => void;
  clearAiMessages: () => void;
  setSignalKState: (signalKState: SignalKConnectionState) => void;
  applyBridgeMessage: (message: BridgeMessage) => void;
  applySignalKDelta: (delta: SignalKDeltaMessage) => void;
  tickSimulation: () => void;
}

const defaultSettings: UiSettings = {
  brightness: 82,
  theme: 'auto',
  depthWarningFt: 6,
  autoLaunch: true,
  touchLock: false,
  offlineMode: true,
};

const defaultAiMessages: AssistantMessage[] = [
  { role: 'assistant', text: 'Assistant online. Ask for route status, engine summary, anchor watch, or systems snapshot.' },
];

const defaultSourceHealth: Record<BridgeSourceName, BridgeSourceState> = {
  signalk: { connected: false, lastSeen: null },
  mqtt: { connected: false, lastSeen: null },
  nodered: { connected: false, lastSeen: null },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function drift(value: number, amount: number, min: number, max: number): number {
  return clamp(value + (Math.random() - 0.5) * amount, min, max);
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function currentLocalTime(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function mergeBoatData(base: BoatData, patch: Partial<BoatData>): BoatData {
  return {
    ...base,
    ...patch,
    depth: { ...base.depth, ...(patch.depth ?? {}) },
    speed: { ...base.speed, ...(patch.speed ?? {}) },
    navigation: { ...base.navigation, ...(patch.navigation ?? {}) },
    wind: { ...base.wind, ...(patch.wind ?? {}) },
    ais: { ...base.ais, ...(patch.ais ?? {}) },
    autopilot: { ...base.autopilot, ...(patch.autopilot ?? {}) },
    battery: { ...base.battery, ...(patch.battery ?? {}) },
    bilge: { ...base.bilge, ...(patch.bilge ?? {}) },
    engine: { ...base.engine, ...(patch.engine ?? {}) },
    tanks: { ...base.tanks, ...(patch.tanks ?? {}) },
    power: { ...base.power, ...(patch.power ?? {}) },
    network: { ...base.network, ...(patch.network ?? {}) },
    anchor: { ...base.anchor, ...(patch.anchor ?? {}) },
    route: { ...base.route, ...(patch.route ?? {}) },
    environment: { ...base.environment, ...(patch.environment ?? {}) },
    time: { ...base.time, ...(patch.time ?? {}) },
  };
}

export const useBoatStore = create<BoatStore>()(
  persist(
    (set) => ({
      data: mockBoatData,
      mode: 'helm',
      settings: defaultSettings,
      aiMessages: defaultAiMessages,
      signalKState: 'disabled',
      sourceHealth: defaultSourceHealth,
      telemetryUpdatedAt: null,
      alarms: [],
      setMode: (mode) => set({ mode }),
      setBoatData: (data) => set({ data }),
      updateSettings: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
          },
          alarms: evaluateAlarms({
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
              radiusMeters: mockBoatData.anchor.radiusMeters,
            },
          },
          alarms: evaluateAlarms({
            data: {
              ...state.data,
              anchor: {
                ...state.data.anchor,
                radiusMeters: mockBoatData.anchor.radiusMeters,
              },
            },
            settings: defaultSettings,
            sourceHealth: state.sourceHealth,
          }),
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
            alarms: evaluateAlarms({
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
            alarms: evaluateAlarms({
              data: state.data,
              settings: state.settings,
              sourceHealth: nextSourceHealth,
            }),
          };
        }),
      applyBridgeMessage: (message) =>
        set((state) => {
          const sourceHealth = message.sources ?? state.sourceHealth;
          const nextData =
            message.type === 'snapshot'
              ? mergeBoatData(state.data, message.data)
              : message.type === 'delta'
                ? mergeBoatData(state.data, message.patch)
                : state.data;
          const alarms = evaluateAlarms({
            data: nextData,
            settings: state.settings,
            sourceHealth,
          });

          return {
            data: nextData,
            sourceHealth,
            telemetryUpdatedAt: message.timestamp ?? new Date().toISOString(),
            alarms,
          };
        }),
      applySignalKDelta: (delta) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const data = applyBoatDataPatch(state.data, mapSignalKDelta(delta));
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
            alarms: evaluateAlarms({
              data,
              settings: state.settings,
              sourceHealth,
            }),
          };
        }),
      tickSimulation: () =>
        set((state) => {
          const depth = drift(state.data.depth.belowTransducerFt, 0.28, 4.8, 18);
          const closestNm = drift(state.data.ais.closestNm, 0.16, 0.45, 3.8);
          const awaDeg = Math.round(drift(state.data.wind.awaDeg, 8, 60, 170));
          const targets = closestNm < 1.8 ? 2 : closestNm < 2.6 ? 1 : 0;

          const data = {
            ...state.data,
            depth: {
              ...state.data.depth,
              belowTransducerFt: depth,
              trend: depth < state.data.depth.belowTransducerFt - 0.03 ? 'falling' : depth > state.data.depth.belowTransducerFt + 0.03 ? 'rising' : 'stable',
            },
            speed: {
              sogKts: drift(state.data.speed.sogKts, 0.18, 0, 8.5),
              stwKts: drift(state.data.speed.stwKts, 0.2, 0, 8.5),
            },
            navigation: {
              ...state.data.navigation,
              headingTrue: Math.round(drift(state.data.navigation.headingTrue, 2, 0, 359)),
              cogTrue: Math.round(drift(state.data.navigation.cogTrue, 2.5, 0, 359)),
            },
            wind: {
              ...state.data.wind,
              awaDeg,
              awsKts: drift(state.data.wind.awsKts, 0.45, 3, 18),
              twsKts: drift(state.data.wind.twsKts, 0.4, 4, 20),
              side: 'Port',
            },
            ais: {
              ...state.data.ais,
              targets,
              closestNm,
              riskLevel: closestNm < 0.75 ? 'danger' : closestNm < 2 ? 'warning' : 'safe',
            },
            battery: {
              housePercent: Math.round(drift(state.data.battery.housePercent, 0.12, 55, 96)),
              houseVoltage: drift(state.data.battery.houseVoltage, 0.04, 12.4, 13.7),
              currentAmps: drift(state.data.battery.currentAmps, 0.22, -5.5, 3.2),
            },
            engine: {
              ...state.data.engine,
              rpm: Math.round(drift(state.data.engine.rpm, 70, 650, 2900)),
              coolantTempC: drift(state.data.engine.coolantTempC, 0.3, 62, 88),
              oilPressurePsi: drift(state.data.engine.oilPressurePsi, 0.8, 32, 65),
              hours: state.data.engine.hours + 0.002,
              fuelRateLph: drift(state.data.engine.fuelRateLph, 0.25, 1.2, 13.5),
              alternatorVoltage: drift(state.data.engine.alternatorVoltage, 0.08, 13.6, 14.6),
            },
            tanks: {
              fuelPercent: drift(state.data.tanks.fuelPercent, 0.04, 12, 100),
              freshWaterPercent: drift(state.data.tanks.freshWaterPercent, 0.05, 20, 100),
              wastePercent: drift(state.data.tanks.wastePercent, 0.05, 5, 95),
            },
            power: {
              ...state.data.power,
              solarWatts: Math.round(drift(state.data.power.solarWatts, 18, 20, 720)),
              loadWatts: Math.round(drift(state.data.power.loadWatts, 12, 140, 980)),
              inverterOn: state.data.power.loadWatts > 600 ? true : state.data.power.loadWatts < 420 ? false : state.data.power.inverterOn,
            },
            network: {
              ...state.data.network,
              nodered: Math.random() < 0.98 ? 'online' : 'degraded',
            },
            anchor: {
              ...state.data.anchor,
              distanceFromSetMeters: drift(state.data.anchor.distanceFromSetMeters, 0.7, 1, 20),
            },
            route: {
              ...state.data.route,
              distanceNm: drift(state.data.route.distanceNm, 0.12, 0.1, 24),
              etaMinutes: Math.max(2, Math.round(drift(state.data.route.etaMinutes, 1.8, 2, 240))),
              crossTrackErrorNm: drift(state.data.route.crossTrackErrorNm, 0.01, 0, 0.45),
            },
            time: {
              ...state.data.time,
              local: currentLocalTime(),
            },
          };
          const sourceHealth = {
            signalk: { connected: true, lastSeen: new Date().toISOString() },
            mqtt: { connected: true, lastSeen: new Date().toISOString() },
            nodered: { connected: true, lastSeen: new Date().toISOString() },
          } satisfies Record<BridgeSourceName, BridgeSourceState>;

          return {
            data: {
              ...data,
            },
            sourceHealth,
            telemetryUpdatedAt: new Date().toISOString(),
            alarms: evaluateAlarms({ data, settings: state.settings, sourceHealth }),
          };
        }),
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
        };
      },
    },
  ),
);
