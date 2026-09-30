import { spawn } from 'node:child_process';

const port = Number(process.env.SMOKE_BRIDGE_PORT ?? 4399);
const child = spawn(process.execPath, ['backend/bridge/server.mjs'], {
  env: {
    ...process.env,
    BRIDGE_PORT: String(port),
    BRIDGE_HOST: '127.0.0.1',
    BRIDGE_SIGNALK_WS_URL: 'ws://127.0.0.1:9/signalk/v1/stream',
    BRIDGE_MQTT_URL: 'mqtt://127.0.0.1:9',
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
  console.error('smoke: timed out waiting for bridge health');
  shutdown(1);
}, 8000);

async function checkHealth() {
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await response.json();
  if (body.ok !== true) throw new Error('health.ok is not true');
  if (!body.sources?.signalk || !body.sources?.mqtt || !body.sources?.nodered) {
    throw new Error('health.sources missing expected keys');
  }
  console.log('smoke: bridge health ok');
  clearTimeout(timeout);
  shutdown(0);
}

child.stdout.on('data', (chunk) => {
  if (!String(chunk).includes('listening')) return;
  checkHealth().catch((error) => {
    console.error(error);
    clearTimeout(timeout);
    shutdown(1);
  });
});

child.on('exit', (code) => {
  if (!finished) {
    console.error(`smoke: bridge exited early (${code ?? 'null'})`);
    shutdown(1);
  }
});
