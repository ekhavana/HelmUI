import { Cpu, Droplets, PlugZap, Radio, Server, Waves } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatAmps, formatNumber, formatVoltage } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';

export function SystemsScreen() {
  const battery = useBoatStore((state) => state.data.battery);
  const bilge = useBoatStore((state) => state.data.bilge);
  const tanks = useBoatStore((state) => state.data.tanks);
  const power = useBoatStore((state) => state.data.power);
  const network = useBoatStore((state) => state.data.network);
  const sourceHealth = useBoatStore((state) => state.sourceHealth);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[1fr_1fr_1fr] gap-4">
      <Card title="Electrical" eyebrow="DC Bus" tone="active">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-950/45 p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">House</div>
            <div className="text-3xl font-bold text-white">{formatVoltage(battery.houseVoltage)}</div>
            <div className="text-sm font-semibold text-slate-300">{formatAmps(battery.currentAmps)}</div>
          </div>
          <div className="rounded-2xl bg-slate-950/45 p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Battery</div>
            <div className="text-3xl font-bold text-white">{formatNumber(battery.housePercent)}%</div>
            <div className="mt-2"><Gauge tone="green" value={battery.housePercent} /></div>
          </div>
          <div className="col-span-2 rounded-2xl bg-slate-950/45 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Solar</div>
                <div className="text-2xl font-bold text-white">{power.solarWatts} W</div>
              </div>
              <PlugZap className="h-8 w-8 text-cyan-200/85" />
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-300">Load {power.loadWatts} W · Inverter {power.inverterOn ? 'ON' : 'OFF'}</div>
          </div>
        </div>
      </Card>

      <Card title="Fluid Systems" eyebrow="Tanks + Bilge">
        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-950/45 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><Droplets className="h-4 w-4" /> Fresh Water</div>
            <div className="text-xl font-bold text-white">{formatNumber(tanks.freshWaterPercent)}%</div>
            <div className="mt-1"><Gauge max={100} tone="cyan" value={tanks.freshWaterPercent} /></div>
          </div>
          <div className="rounded-2xl bg-slate-950/45 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><Waves className="h-4 w-4" /> Waste</div>
            <div className="text-xl font-bold text-white">{formatNumber(tanks.wastePercent)}%</div>
            <div className="mt-1"><Gauge max={100} tone={tanks.wastePercent > 80 ? 'red' : tanks.wastePercent > 65 ? 'amber' : 'green'} value={tanks.wastePercent} /></div>
          </div>
          <div className={`rounded-2xl border p-3 ${bilge.alarm ? 'border-red-400/55 bg-red-950/30' : 'border-emerald-400/40 bg-emerald-950/20'}`}>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Bilge</div>
            <div className="mt-1 text-lg font-bold text-white">{bilge.alarm ? 'Flood alarm active' : 'No water detected'}</div>
          </div>
        </div>
      </Card>

      <Card title="Network + Automation" eyebrow="Node Health">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-slate-950/45 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Radio className="h-4 w-4 text-cyan-200" /> Signal K</div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${sourceHealth.signalk.connected ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{sourceHealth.signalk.connected ? 'online' : 'down'}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-950/45 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Server className="h-4 w-4 text-cyan-200" /> MQTT Broker</div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${sourceHealth.mqtt.connected ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{sourceHealth.mqtt.connected ? 'online' : 'down'}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-950/45 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Cpu className="h-4 w-4 text-cyan-200" /> Node-RED</div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${sourceHealth.nodered.connected ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{sourceHealth.nodered.connected ? 'online' : 'down'}</span>
          </div>
          <div className="rounded-2xl bg-slate-950/45 p-3 text-xs font-semibold text-slate-300">Last Node-RED seen: {sourceHealth.nodered.lastSeen ?? network.nodered}</div>
        </div>
      </Card>
    </section>
  );
}
