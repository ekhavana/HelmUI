import { useState } from 'react';
import { AlertTriangle, Navigation2, Power } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees } from '../../utils/formatters';
import {
  ENGAGE_MODE_LABELS,
  HEADING_NUDGES_DEGREES,
  headingDeviation,
  isEngaged,
  requiresConfirmation,
  type AutopilotCommand,
  type AutopilotMode,
} from '../../domain/autopilot/commands';
import { Card } from '../ui/Card';

const ENGAGE_MODES: AutopilotMode[] = ['auto', 'wind', 'route'];

function trimLabel(delta: number): string {
  return `${delta > 0 ? '+' : ''}${delta}\u00b0`;
}

export function AutopilotControl() {
  const autopilot = useBoatStore((state) => state.data.autopilot);
  const headingTrue = useBoatStore((state) => state.data.navigation.headingTrue);
  const control = useBoatStore((state) => state.autopilotControl);
  const telemetryMode = useBoatStore((state) => state.telemetryMode);
  const sendCommand = useBoatStore((state) => state.sendAutopilotCommand);
  const [confirming, setConfirming] = useState<{ command: AutopilotCommand; label: string } | null>(null);

  const replay = telemetryMode === 'replay';
  const engaged = isEngaged(autopilot.state);
  const deviation = headingDeviation(autopilot.headingTarget, headingTrue);
  const disabled = replay || control.pending;

  const request = (command: AutopilotCommand, label: string) => {
    if (disabled) return;
    if (requiresConfirmation(command)) {
      setConfirming({ command, label });
      return;
    }
    void sendCommand(command);
  };

  const confirm = () => {
    if (confirming) void sendCommand(confirming.command);
    setConfirming(null);
  };

  const engagedTone = engaged ? 'active' : 'default';
  const btn =
    'rounded-xl border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40';
  const neutralBtn = `${btn} border-slate-600/70 bg-slate-900/60 text-slate-100 hover:border-cyan-300/60`;

  return (
    <Card title="Autopilot" eyebrow="Pilot" tone={engagedTone} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Navigation2 className={`h-7 w-7 shrink-0 ${engaged ? 'text-cyan-200' : 'text-slate-400'}`} />
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold capitalize text-white">{autopilot.state ?? '—'}</div>
          <div className="text-sm text-slate-300">
            Target {formatDegrees(autopilot.headingTarget)} · Heading {formatDegrees(headingTrue)}
            {deviation !== null && (
              <span className="text-cyan-200"> · {deviation > 0 ? 'Δ+' : 'Δ'}{Math.round(deviation)}°</span>
            )}
          </div>
        </div>
      </div>

      {/* Engage / mode selection */}
      <div className="grid grid-cols-4 gap-2">
        {ENGAGE_MODES.map((mode) => {
          const active = engaged && autopilot.state?.toLowerCase() === mode;
          return (
            <button
              key={mode}
              type="button"
              disabled={disabled}
              onClick={() => request({ kind: 'setState', state: mode }, `Engage ${ENGAGE_MODE_LABELS[mode]} mode`)}
              className={`${btn} ${
                active
                  ? 'border-cyan-300 bg-cyan-500/20 text-cyan-100'
                  : 'border-slate-600/70 bg-slate-900/60 text-slate-100 hover:border-cyan-300/60'
              }`}
            >
              {ENGAGE_MODE_LABELS[mode]}
            </button>
          );
        })}
        <button
          type="button"
          disabled={disabled || !engaged}
          onClick={() => request({ kind: 'setState', state: 'standby' }, 'Disengage (Standby)')}
          className={`${btn} flex items-center justify-center gap-1 border-red-400/60 bg-red-500/15 text-red-200 hover:bg-red-500/25`}
        >
          <Power className="h-4 w-4" /> Std
        </button>
      </div>

      {/* Heading trim */}
      <div className="grid grid-cols-4 gap-2">
        {HEADING_NUDGES_DEGREES.map((delta) => (
          <button
            key={delta}
            type="button"
            disabled={disabled || !engaged}
            onClick={() => request({ kind: 'adjustHeading', deltaDegrees: delta }, trimLabel(delta))}
            className={neutralBtn}
          >
            {trimLabel(delta)}
          </button>
        ))}
      </div>

      {/* Tack */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || !engaged}
          onClick={() => request({ kind: 'tack', direction: 'port' }, 'Tack to port')}
          className={neutralBtn}
        >
          ◀ Tack Port
        </button>
        <button
          type="button"
          disabled={disabled || !engaged}
          onClick={() => request({ kind: 'tack', direction: 'starboard' }, 'Tack to starboard')}
          className={neutralBtn}
        >
          Tack Stbd ▶
        </button>
      </div>

      {/* Status / confirm / replay notice */}
      {replay ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-200">
          <AlertTriangle className="h-4 w-4" /> Controls disabled in replay mode
        </div>
      ) : confirming ? (
        <div className="rounded-xl border border-amber-400/60 bg-amber-950/30 px-3 py-2">
          <div className="text-xs font-semibold text-amber-100">Confirm: {confirming.label}</div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={confirm}
              className="flex-1 rounded-lg border border-amber-300 bg-amber-500/25 px-3 py-1.5 text-sm font-bold text-amber-100"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-1.5 text-sm font-bold text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[1.25rem] text-xs font-semibold">
          {control.pending ? (
            <span className="text-cyan-200">Sending {control.lastCommand}…</span>
          ) : control.lastResult ? (
            <span className={control.lastResult.ok ? 'text-emerald-300' : 'text-red-300'}>
              {control.lastResult.ok ? '✓' : '✕'} {control.lastCommand}
              <span className="text-slate-400"> · {control.lastResult.detail}</span>
            </span>
          ) : (
            <span className="text-slate-500">Ready</span>
          )}
        </div>
      )}
    </Card>
  );
}
