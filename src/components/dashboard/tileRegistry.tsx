import type { ComponentType } from 'react';
import { AisRiskCard } from '../cards/AisRiskCard';
import { AutopilotCard } from '../cards/AutopilotCard';
import { BatteryCard } from '../cards/BatteryCard';
import { BatterySafetyCard } from '../cards/BatterySafetyCard';
import { BilgeCard } from '../cards/BilgeCard';
import { ChartPanel } from '../cards/ChartPanel';
import { DepthSafetyCard } from '../cards/DepthSafetyCard';
import { EngineCard } from '../cards/EngineCard';
import {
  EngineFuelTile,
  EngineMonitorTile,
  EnginePowerTile,
  EngineRpmTile,
  EngineRuntimeTile,
} from '../cards/engineTiles';
import { GpsCard } from '../cards/GpsCard';
import { HeadingCard } from '../cards/HeadingCard';
import { SpeedCard } from '../cards/SpeedCard';
import { ElectricalTile, FluidsTile, NetworkTile } from '../cards/systemsTiles';
import { WaterTempCard } from '../cards/WaterTempCard';
import { WindCard } from '../cards/WindCard';

// Maps a tile id (from the pure layout catalog) to the component that renders
// it. Every id in TILE_CATALOG must have an entry here.
export const TILE_COMPONENTS: Record<string, ComponentType> = {
  speed: SpeedCard,
  heading: HeadingCard,
  waterTemp: WaterTempCard,
  wind: WindCard,
  battery: BatteryCard,
  bilge: BilgeCard,
  engine: EngineCard,
  gps: GpsCard,
  depthSafety: DepthSafetyCard,
  batterySafety: BatterySafetyCard,
  aisRisk: AisRiskCard,
  autopilot: AutopilotCard,
  chart: ChartPanel,
  engineRpm: EngineRpmTile,
  engineFuel: EngineFuelTile,
  engineMonitor: EngineMonitorTile,
  enginePower: EnginePowerTile,
  engineRuntime: EngineRuntimeTile,
  electrical: ElectricalTile,
  fluids: FluidsTile,
  network: NetworkTile,
};
