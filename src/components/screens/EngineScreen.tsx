import { Activity, Fuel, Thermometer, Zap } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatCelsius, formatNumber, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';

export function EngineScreen() {
  const engine = useBoatStore((state) => state.data.engine);
  const tanks = useBoatStore((state) => state.data.tanks);
  const battery = useBoatStore((state) => state.data.battery);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)_340px] gap-4">
      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="RPM" eyebrow="Main Engine" tone="active">
          <div className="flex items-end justify-between">
            <div className="text-6xl font-bold leading-none tabular-nums text-white">{Math.round(engine.rpm)}</div>
            <Activity className="h-12 w-12 text-cyan-200/80" />
          </div>
          <div className="mt-3"><Gauge max={3200} value={engine.rpm} /></div>
        </Card>
        <Card title="Fuel" eyebrow="Consumption">
          <div className="text-4xl font-bold text-white">{formatNumber(engine.fuelRateLph)}<span className="ml-1 text-xl text-slate-300">L/h</span></div>
          <div className="mt-2 text-sm font-semibold text-slate-300">Tank level {formatNumber(tanks.fuelPercent)}%</div>
          <div className="mt-2"><Gauge value={tanks.fuelPercent} tone="amber" /></div>
        </Card>
      </aside>

      <Card className="grid grid-cols-2 gap-4" title="Engine Monitoring" eyebrow="Propulsion">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400"><Thermometer className="h-4 w-4" /> Coolant</div>
          <div className="text-4xl font-bold text-white">{formatCelsius(engine.coolantTempC)}</div>
          <div className="mt-2"><Gauge max={110} tone={engine.coolantTempC > 90 ? 'red' : engine.coolantTempC > 82 ? 'amber' : 'green'} value={engine.coolantTempC} /></div>
        </div>
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400"><Fuel className="h-4 w-4" /> Oil Pressure</div>
          <div className="text-4xl font-bold text-white">{formatNumber(engine.oilPressurePsi)}<span className="text-xl text-slate-300"> psi</span></div>
          <div className="mt-2"><Gauge max={90} tone={engine.oilPressurePsi < 30 ? 'red' : engine.oilPressurePsi < 40 ? 'amber' : 'green'} value={engine.oilPressurePsi} /></div>
        </div>
        <div className="col-span-2 rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Runtime + Charging</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-xs text-slate-400">Hours</div><div className="text-2xl font-bold text-white">{formatNumber(engine.hours)}</div></div>
            <div><div className="text-xs text-slate-400">Alternator</div><div className="text-2xl font-bold text-white">{formatVoltage(engine.alternatorVoltage)}</div></div>
            <div><div className="text-xs text-slate-400">House</div><div className="text-2xl font-bold text-white">{formatVoltage(battery.houseVoltage)}</div></div>
          </div>
        </div>
      </Card>

      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Power" eyebrow="Charging">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white">{formatVoltage(engine.alternatorVoltage)}</div>
              <div className="text-sm text-slate-300">Alternator output</div>
            </div>
            <Zap className="h-11 w-11 text-cyan-200/80" />
          </div>
        </Card>
        <Card title="Service Notes" eyebrow="Maintenance">
          <ul className="space-y-2 text-sm font-semibold text-slate-200">
            <li>Next oil + filter: at 1300 h</li>
            <li>Impeller inspection due: 14 days</li>
            <li>Belts and clamps: visual check clear</li>
          </ul>
        </Card>
      </aside>
    </section>
  );
}
