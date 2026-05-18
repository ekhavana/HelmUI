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
        },
      };
    }),
}));
