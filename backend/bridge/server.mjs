import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import mqtt from 'mqtt';
import { defaultSourceState, normalizeSignalKDelta } from './normalize.mjs';

const PORT = Number(process.env.BRIDGE_PORT ?? 4300);
const SIGNALK_WS_URL = process.env.BRIDGE_SIGNALK_WS_URL ?? 'ws://localhost:3000/signalk/v1/stream?subscribe=none';
const MQTT_URL = process.env.BRIDGE_MQTT_URL ?? 'mqtt://localhost:1883';
const MQTT_STATUS_TOPIC = process.env.BRIDGE_MQTT_STATUS_TOPIC ?? 'helmui/bridge/nodered/status';
const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));

const sourceState = defaultSourceState();
const lastPatch = {};

function markSource(name, connected, detail = '') {
  sourceState[name] = {
    connected,
    lastSeen: connected ? new Date().toISOString() : sourceState[name].lastSeen,
    detail,
  };
}

const server = createServer((req, res) => {
  if (req.url.startsWith('/tiles/')) {
    const fileName = req.url.replace('/tiles/', '');
    const filePath = join(__dirname, 'tiles', fileName);
    readFile(filePath)
      .then((content) => {
        res.writeHead(200, { 'content-type': fileName.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream' });
        res.end(content);
      })
      .catch(() => {
        res.writeHead(404).end();
      });
    return;
  }

  if (!req.url) {
    res.writeHead(404).end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, timestamp: new Date().toISOString(), sources: sourceState }));
    return;
  }

  if (req.url === '/sources') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(sourceState));
    return;
  }

  if (req.url === '/last-seen') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ timestamp: new Date().toISOString(), sources: sourceState, patch: lastPatch }));
    return;
  }

  res.writeHead(404).end();
});

const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(payload) {
  const encoded = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(encoded);
    }
  }
}

function emitHealth() {
  broadcast({ type: 'health', timestamp: new Date().toISOString(), sources: sourceState });
}

function emitDelta(patch) {
  Object.assign(lastPatch, patch);
  broadcast({ type: 'delta', timestamp: new Date().toISOString(), patch, sources: sourceState });
}

function setupSignalK() {
  const ws = new WebSocket(SIGNALK_WS_URL);
  ws.on('open', () => {
    markSource('signalk', true, 'connected');
    ws.send(JSON.stringify({ context: 'vessels.self', subscribe: [{ path: '*', policy: 'instant' }] }));
    emitHealth();
  });
  ws.on('message', (buffer) => {
    try {
      const delta = JSON.parse(buffer.toString());
      const patch = normalizeSignalKDelta(delta);
      if (Object.keys(patch).length > 0) {
        markSource('signalk', true, 'streaming');
        emitDelta(patch);
      }
    } catch {
      markSource('signalk', false, 'parse error');
      emitHealth();
    }
  });
  ws.on('close', () => {
    markSource('signalk', false, 'socket closed');
    emitHealth();
    setTimeout(setupSignalK, 3000);
  });
  ws.on('error', () => {
    markSource('signalk', false, 'socket error');
    emitHealth();
  });
}

function setupMqtt() {
  const client = mqtt.connect(MQTT_URL);
  client.on('connect', () => {
    markSource('mqtt', true, 'connected');
    markSource('nodered', true, 'mqtt bridge');
    client.subscribe(MQTT_STATUS_TOPIC);
    emitHealth();
  });
  client.on('message', (topic, payload) => {
    if (topic !== MQTT_STATUS_TOPIC) return;
    const status = payload.toString().trim().toLowerCase();
    markSource('mqtt', true, 'streaming');
    markSource('nodered', status !== 'down', `status:${status}`);
    emitHealth();
  });
  client.on('close', () => {
    markSource('mqtt', false, 'broker closed');
    emitHealth();
  });
  client.on('error', () => {
    markSource('mqtt', false, 'broker error');
    emitHealth();
  });
}

wss.on('connection', (socket) => {
  socket.send(
    JSON.stringify({
      type: 'snapshot',
      timestamp: new Date().toISOString(),
      data: lastPatch,
      sources: sourceState,
    }),
  );
});

server.listen(PORT, () => {
  console.log(`HelmUI bridge listening on http://localhost:${PORT}`);
  setupSignalK();
  setupMqtt();
});
