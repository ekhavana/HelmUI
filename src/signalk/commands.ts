// Client-side autopilot command dispatch.
//
// Picks the transport for the active runtime profile: a Signal K HTTP PUT for
// the direct (staging-live) profile, or a POST to the bridge command route
// (which republishes to MQTT) for the production/bridge profile. The pure
// command->wire mapping lives in src/domain/autopilot/dispatch.ts.

import { runtimeConfig } from '../config/runtime';
import type { AutopilotCommand } from '../domain/autopilot/commands';
import { toBridgeCommand, toSignalKPut } from '../domain/autopilot/dispatch';

export interface CommandResult {
  ok: boolean;
  detail: string;
}

// Derive the Signal K REST base from the streaming WebSocket URL, e.g.
// ws://boat:3000/signalk/v1/stream?subscribe=all -> http://boat:3000/signalk/v1/api
export function signalKHttpBase(wsUrl: string): string {
  try {
    const url = new URL(wsUrl);
    const httpProtocol = url.protocol === 'wss:' ? 'https:' : 'http:';
    return `${httpProtocol}//${url.host}/signalk/v1/api`;
  } catch {
    return '';
  }
}

async function putSignalK(command: AutopilotCommand): Promise<CommandResult> {
  const base = signalKHttpBase(runtimeConfig.signalK.url);
  if (!base) return { ok: false, detail: 'Signal K endpoint is not configured' };
  const { path, value } = toSignalKPut(command);
  const url = `${base}/vessels/self/${path.split('.').join('/')}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  // 200 = applied, 202 = accepted/pending (e.g. awaiting a security approval).
  if (res.ok) return { ok: true, detail: res.status === 202 ? 'accepted (pending)' : 'applied' };
  return { ok: false, detail: `Signal K responded ${res.status}` };
}

async function postBridge(command: AutopilotCommand): Promise<CommandResult> {
  const body = { target: 'autopilot', ...toBridgeCommand(command) };
  const res = await fetch(`${runtimeConfig.telemetry.bridgeHttpUrl}/command`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; topic?: string };
  if (res.ok && payload?.ok) return { ok: true, detail: `published ${payload.topic ?? 'command'}` };
  return { ok: false, detail: payload?.error ?? `bridge responded ${res.status}` };
}

export async function dispatchAutopilotCommand(command: AutopilotCommand): Promise<CommandResult> {
  try {
    return runtimeConfig.telemetry.transport === 'bridge'
      ? await postBridge(command)
      : await putSignalK(command);
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : 'command failed' };
  }
}
