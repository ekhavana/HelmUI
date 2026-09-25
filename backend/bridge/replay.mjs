import { normalizeMqttMessage, normalizeSignalKDelta } from './normalize.mjs';

export function applyReplayEvent(event, options = {}) {
  const selfContext = event.selfContext ?? options.selfContext ?? 'vessels.self';
  const patch = {};
  let ui;
  const sources = [];

  if (event.signalk) {
    Object.assign(patch, normalizeSignalKDelta(event.signalk, { selfContext }));
    sources.push('signalk');
  }

  if (event.mqtt) {
    const parsed = normalizeMqttMessage(event.mqtt.topic, event.mqtt.payload);
    sources.push('mqtt', 'nodered');
    if (parsed.patch) Object.assign(patch, parsed.patch);
    if (parsed.ui) ui = parsed.ui;
  }

  return { patch, ui, sources };
}

export async function playReplayFile(fileUrl, handlers, options = {}) {
  const { readFile } = await import('node:fs/promises');
  const raw = JSON.parse(await readFile(fileUrl, 'utf8'));
  const events = Array.isArray(raw.events) ? raw.events : [];
  const loop = Boolean(options.loop ?? raw.loop);

  async function runOnce() {
    for (const event of events) {
      const waitMs = Number(event.waitMs ?? 0);
      if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
      const applied = applyReplayEvent(event, options);
      handlers.onEvent?.(applied, event);
    }
  }

  await runOnce();
  if (loop) {
    const pauseMs = Number(raw.loopPauseMs ?? 1500);
    setTimeout(() => {
      playReplayFile(fileUrl, handlers, options).catch((error) => handlers.onError?.(error));
    }, pauseMs);
  }
}
