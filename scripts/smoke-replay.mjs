import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const port = Number(process.env.SMOKE_BRIDGE_PORT ?? 4398);
const fixture = resolve(fileURLToPath(new URL('../backend/bridge/fixtures/bench-pass.json', import.meta.url)));
const child = spawn(process.execPath, ['backend/bridge/server.mjs'], {
  env: {
    ...process.env,
    BRIDGE_PORT: String(port),
    BRIDGE_HOST: '127.0.0.1',
    BRIDGE_REPLAY_FILE: fixture,
    BRIDGE_REPLAY_LOOP: 'false',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let finished = false;

function shutdown(code) {
  if (finished) return;
  finished = true;
  child.kill();
  process.exit(code);
}

const timeout = setTimeout(() => {
  console.error('smoke-replay: timed out waiting for fixture telemetry');
  shutdown(1);
}, 8000);

async function waitForPatch() {
  const deadline = Date.now() + 6000;
  let lastError = new Error('no last-seen yet');
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/last-seen`);
      const body = await response.json();
      const contact = body.patch?.ais?.contacts?.['366123456'];
      if (contact?.name === 'PILOT BOAT' && body.patch?.autopilot?.state === 'auto' && body.sources?.signalk?.connected) {
        console.log('smoke-replay: fixture AIS and autopilot ok');
        clearTimeout(timeout);
        shutdown(0);
        return;
      }
      lastError = new Error('fixture not complete yet');
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw lastError;
}

child.stdout.on('data', (chunk) => {
  const text = String(chunk);
  if (!text.includes('listening')) return;
  waitForPatch().catch((error) => {
    console.error(error);
    clearTimeout(timeout);
    shutdown(1);
  });
});

child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

child.on('exit', (code) => {
  if (!finished) {
    console.error(`smoke-replay: bridge exited early (${code ?? 'null'})`);
    shutdown(1);
  }
});
