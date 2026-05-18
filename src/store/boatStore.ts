import { create } from 'zustand';
import { mockBoatData, type BoatData } from '../data/mockBoatData';
import { applyBoatDataPatch, mapSignalKDelta } from '../signalk/mapDelta';
import type { SignalKConnectionState, SignalKDeltaMessage } from '../signalk/types';

export type AppMode = 'helm' | 'chart' | 'anchor' | 'engine' | 'systems' | 'ai' | 'menu';

interface BoatStore {
  data: BoatData;
  mode: AppMode;
  signalKState: SignalKConnectionState;
  setMode: (mode: AppMode) => void;
  setBoatData: (data: BoatData) => void;
  setSignalKState: (signalKState: SignalKConnectionState) => void;
  applySignalKDelta: (delta: SignalKDeltaMessage) => void;
  tickSimulation: () => void;
}

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

export const useBoatStore = create<BoatStore>((set) => ({
  data: mockBoatData,
  mode: 'helm',
  signalKState: 'disabled',
  setMode: (mode) => set({ mode }),
  setBoatData: (data) => set({ data }),
  setSignalKState: (signalKState) => set({ signalKState }),
  applySignalKDelta: (delta) =>
    set((state) => ({
      data: applyBoatDataPatch(state.data, mapSignalKDelta(delta)),
    })),
  tickSimulation: () =>
    set((state) => {
      const depth = drift(state.data.depth.belowTransducerFt, 0.28, 4.8, 18);
      const closestNm = drift(state.data.ais.closestNm, 0.16, 0.45, 3.8);
      const awaDeg = Math.round(drift(state.data.wind.awaDeg, 8, 60, 170));
      const targets = closestNm < 1.8 ? 2 : closestNm < 2.6 ? 1 : 0;

      return {
        data: {
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
          time: {
            ...state.data.time,
            local: currentLocalTime(),
          },
        },
      };
    }),
}));
