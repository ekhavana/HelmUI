import { Activity, Fuel, Thermometer, Zap } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatCelsius, formatNumber, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';

export function EngineRpmTile() {
  const engine = useBoatStore((state) => state.data.engine);
  return (
    <Card title="RPM" eyebrow="Main Engine" tone="active">
      <div className="flex items-end justify-between">
        <div className="text-6xl font-bold leading-none tabular-nums text-white">
          {engine.rpm === null ? '--' : Math.round(engine.rpm)}
        </div>
        <Activity className="h-12 w-12 text-cyan-200/80" />
      </div>
      <div className="mt-3">
        <Gauge max={3200} value={engine.rpm} />
      </div>
    </Card>
  );
}

export function EngineFuelTile() {
  const engine = useBoatStore((state) => state.data.engine);
  const tanks = useBoatStore((state) => state.data.tanks);
  return (
    <Card title="Fuel" eyebrow="Consumption">
      <div className="text-4xl font-bold text-white">
        {formatNumber(engine.fuelRateLph)}
        <span className="ml-1 text-xl text-slate-300">L/h</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-300">Tank level {formatNumber(tanks.fuelPercent)}%</div>
      <div className="mt-2">
        <Gauge value={tanks.fuelPercent} tone="amber" />
      </div>
    </Card>
  );
}

export function EngineMonitorTile() {
  const engine = useBoatStore((state) => state.data.engine);
  const battery = useBoatStore((state) => state.data.battery);
  return (
    <Card title="Engine Monitoring" eyebrow="Propulsion">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            <Thermometer className="h-4 w-4" /> Coolant
          </div>
          <div className="text-4xl font-bold text-white">{formatCelsius(engine.coolantTempC)}</div>
          <div className="mt-2">
            <Gauge
              max={110}
              tone={engine.coolantTempC == null ? 'cyan' : engine.coolantTempC > 90 ? 'red' : engine.coolantTempC > 82 ? 'amber' : 'green'}
              value={engine.coolantTempC}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            <Fuel className="h-4 w-4" /> Oil Pressure
          </div>
          <div className="text-4xl font-bold text-white">
            {formatNumber(engine.oilPressurePsi)}
            <span className="text-xl text-slate-300"> psi</span>
          </div>
          <div className="mt-2">
            <Gauge
              max={90}
              tone={engine.oilPressurePsi == null ? 'cyan' : engine.oilPressurePsi < 30 ? 'red' : engine.oilPressurePsi < 40 ? 'amber' : 'green'}
              value={engine.oilPressurePsi}
            />
          </div>
        </div>
        <div className="col-span-2 rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Runtime + Charging</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-slate-400">Hours</div>
              <div className="text-2xl font-bold text-white">{formatNumber(engine.hours)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Alternator</div>
              <div className="text-2xl font-bold text-white">{formatVoltage(engine.alternatorVoltage)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">House</div>
              <div className="text-2xl font-bold text-white">{formatVoltage(battery.houseVoltage)}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function EnginePowerTile() {
  const engine = useBoatStore((state) => state.data.engine);
  return (
    <Card title="Power" eyebrow="Charging">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-white">{formatVoltage(engine.alternatorVoltage)}</div>
          <div className="text-sm text-slate-300">Alternator output</div>
        </div>
        <Zap className="h-11 w-11 text-cyan-200/80" />
      </div>
    </Card>
  );
}

export function EngineRuntimeTile() {
  const engine = useBoatStore((state) => state.data.engine);
  return (
    <Card title="Runtime" eyebrow="Engine Hours">
      <div className="text-4xl font-bold text-white">{formatNumber(engine.hours)}</div>
      <div className="mt-2 text-sm font-semibold text-slate-300">Hours from live propulsion data</div>
    </Card>
  );
}
