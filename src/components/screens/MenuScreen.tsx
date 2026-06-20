import { Monitor, MoonStar, Radio, Shield, SlidersHorizontal, Sun, Wifi } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { Card } from '../ui/Card';

export function MenuScreen() {
  const signalKState = useBoatStore((state) => state.signalKState);
  const depth = useBoatStore((state) => state.data.depth);
  const anchor = useBoatStore((state) => state.data.anchor);
  const sourceHealth = useBoatStore((state) => state.sourceHealth);
  const settings = useBoatStore((state) => state.settings);
  const updateSettings = useBoatStore((state) => state.updateSettings);
  const resetSettings = useBoatStore((state) => state.resetSettings);
  const setAnchorRadius = useBoatStore((state) => state.setAnchorRadius);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_420px] gap-4">
      <div className="grid min-h-0 grid-cols-2 gap-4">
        <Card title="Display" eyebrow="Brightness + Theme" tone="active">
          <div className="space-y-3 text-sm font-semibold text-slate-200">
            <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2">
              <span className="flex items-center gap-2"><Monitor className="h-4 w-4 text-cyan-200" /> Brightness</span>
              <span className="text-cyan-100">{settings.brightness}%</span>
            </div>
            <input
              className="w-full accent-cyan-300"
              max={100}
              min={35}
              onChange={(event) => updateSettings({ brightness: Number(event.target.value) })}
              type="range"
              value={settings.brightness}
            />
            <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2">
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 ${settings.theme === 'day' ? 'bg-emerald-500/20 text-emerald-200' : 'text-slate-200'}`}
                onClick={() => updateSettings({ theme: 'day' })}
                type="button"
              >
                <Sun className="h-4 w-4 text-amber-200" /> Day
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 ${settings.theme === 'auto' ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-200'}`}
                onClick={() => updateSettings({ theme: 'auto' })}
                type="button"
              >
                Auto
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 ${settings.theme === 'night' ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-200'}`}
                onClick={() => updateSettings({ theme: 'night' })}
                type="button"
              >
                <MoonStar className="h-4 w-4 text-cyan-200" /> Night
              </button>
            </div>
          </div>
        </Card>

        <Card title="Data Sources" eyebrow="Signal Pipeline">
          <div className="space-y-3 text-sm font-semibold text-slate-200">
            <div className="flex items-center justify-between rounded-xl bg-slate-950/50 px-3 py-2">
              <span className="flex items-center gap-2"><Radio className="h-4 w-4 text-cyan-200" /> Signal K</span>
              <span className={`rounded-full px-2 py-0.5 text-xs uppercase ${sourceHealth.signalk.connected || signalKState === 'disabled' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{signalKState === 'disabled' ? 'sim' : sourceHealth.signalk.connected ? 'online' : 'down'}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-950/50 px-3 py-2">
              <span className="flex items-center gap-2"><Wifi className="h-4 w-4 text-cyan-200" /> MQTT</span>
              <span className={`rounded-full px-2 py-0.5 text-xs uppercase ${sourceHealth.mqtt.connected ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{sourceHealth.mqtt.connected ? 'online' : 'down'}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-950/50 px-3 py-2">
              <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-cyan-200" /> Node-RED</span>
              <span className={`rounded-full px-2 py-0.5 text-xs uppercase ${sourceHealth.nodered.connected ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{sourceHealth.nodered.connected ? 'online' : 'down'}</span>
            </div>
          </div>
        </Card>

        <Card title="Safety Thresholds" eyebrow="Quick Tune" tone="warning">
          <div className="space-y-3 text-sm font-semibold text-slate-200">
            <div className="rounded-xl bg-slate-950/50 px-3 py-2">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Depth Warning</div>
              <div className="mt-1 text-xl font-bold text-white">{settings.depthWarningFt.toFixed(1)} ft</div>
              <input
                className="mt-2 w-full accent-amber-300"
                max={20}
                min={4}
                onChange={(event) => updateSettings({ depthWarningFt: Number(event.target.value) })}
                step={0.5}
                type="range"
                value={settings.depthWarningFt}
              />
              <div className="text-xs text-slate-400">Current depth: {depth.belowTransducerFt.toFixed(1)} ft</div>
            </div>
            <div className="rounded-xl bg-slate-950/50 px-3 py-2">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Anchor Radius Alarm</div>
              <div className="mt-1 text-xl font-bold text-white">{anchor.radiusMeters.toFixed(0)} m</div>
              <input
                className="mt-2 w-full accent-cyan-300"
                max={80}
                min={10}
                onChange={(event) => setAnchorRadius(Number(event.target.value))}
                type="range"
                value={anchor.radiusMeters}
              />
            </div>
          </div>
        </Card>

        <Card title="Kiosk Settings" eyebrow="Runtime">
          <div className="space-y-2 text-sm font-semibold text-slate-200">
            <button className="flex w-full items-center justify-between rounded-xl bg-slate-950/50 px-3 py-2 text-left" onClick={() => updateSettings({ autoLaunch: !settings.autoLaunch })} type="button"><span>Auto-launch on boot</span><span className={settings.autoLaunch ? 'text-emerald-200' : 'text-slate-300'}>{settings.autoLaunch ? 'On' : 'Off'}</span></button>
            <button className="flex w-full items-center justify-between rounded-xl bg-slate-950/50 px-3 py-2 text-left" onClick={() => updateSettings({ touchLock: !settings.touchLock })} type="button"><span>Touch input lock</span><span className={settings.touchLock ? 'text-amber-200' : 'text-slate-300'}>{settings.touchLock ? 'On' : 'Off'}</span></button>
            <button className="flex w-full items-center justify-between rounded-xl bg-slate-950/50 px-3 py-2 text-left" onClick={() => updateSettings({ offlineMode: !settings.offlineMode })} type="button"><span>Offline mode</span><span className={settings.offlineMode ? 'text-emerald-200' : 'text-slate-300'}>{settings.offlineMode ? 'Ready' : 'Disabled'}</span></button>
          </div>
        </Card>
      </div>

      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="System Integrity" eyebrow="Health" tone="safe">
          <div className="flex items-start gap-3 text-sm font-semibold text-emerald-100">
            <Shield className="mt-0.5 h-5 w-5 shrink-0" />
            Core helm telemetry and alarms are active. Menu actions do not interrupt safety strip or bottom status updates.
          </div>
        </Card>
        <Card title="Reset" eyebrow="Defaults" tone="warning">
          <button
            className="w-full rounded-xl border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
            onClick={resetSettings}
            type="button"
          >
            Reset menu settings to defaults
          </button>
        </Card>
        <Card title="Pending Tasks" eyebrow="Setup">
          <ul className="space-y-2 text-sm font-semibold text-slate-200">
            <li>Calibrate depth offset with loaded fuel/water profile</li>
            <li>Bind physical brightness knob input</li>
            <li>Connect autopilot sentence bridge</li>
            <li>Export settings profile to backup USB</li>
          </ul>
        </Card>
      </aside>
    </section>
  );
}
