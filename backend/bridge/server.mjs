import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import mqtt from 'mqtt';
import { defaultSourceState, normalizeMqttMessage, normalizeSignalKDelta } from './normalize.mjs';
import { playReplayFile } from './replay.mjs';

const PORT = Number(process.env.BRIDGE_PORT ?? 4300);
const HOST = process.env.BRIDGE_HOST ?? '0.0.0.0';
const SIGNALK_WS_URL = process.env.BRIDGE_SIGNALK_WS_URL ?? 'ws://localhost:3000/signalk/v1/stream?subscribe=none';
const MQTT_URL = process.env.BRIDGE_MQTT_URL ?? 'mqtt://localhost:1883';
const MQTT_STATUS_TOPIC = process.env.BRIDGE_MQTT_STATUS_TOPIC ?? 'helmui/bridge/nodered/status';
const MQTT_BRIGHTNESS_TOPIC = process.env.BRIDGE_MQTT_BRIGHTNESS_TOPIC ?? 'helmui/kiosk/brightness';
const MQTT_AUTOPILOT_STATE_TOPIC = process.env.BRIDGE_MQTT_AUTOPILOT_STATE_TOPIC ?? 'helmui/autopilot/state';
const MQTT_AUTOPILOT_HEADING_TOPIC = process.env.BRIDGE_MQTT_AUTOPILOT_HEADING_TOPIC ?? 'helmui/autopilot/heading';
const REPLAY_FILE = process.env.BRIDGE_REPLAY_FILE ?? '';
// Replayed telemetry must never be presentable as a live vessel feed.
const MODE = REPLAY_FILE ? 'replay' : 'live';
const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));
const TILES_ROOT = resolve(join(__dirname, 'tiles'));

const sourceState = defaultSourceState();
const lastPatch = {};
const lastUi = {};

function markSource(name, connected, detail = '') {
  sourceState[name] = {
    connected,
    lastSeen: connected ? new Date().toISOString() : sourceState[name].lastSeen,
    detail,
  };
}

const server = createServer((req, res) => {
  if (req.url.startsWith('/tiles/')) {
    const fileName = req.url.slice('/tiles/'.length).split('?')[0];
    const filePath = resolve(TILES_ROOT, fileName);
    if (!filePath.startsWith(TILES_ROOT + sep)) {
      res.writeHead(403).end();
      return;
    }
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
    res.end(JSON.stringify({ ok: true, mode: MODE, timestamp: new Date().toISOString(), sources: sourceState }));
    return;
  }

  if (req.url === '/sources') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ mode: MODE, sources: sourceState }));
    return;
  }

  if (req.url === '/last-seen') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ mode: MODE, timestamp: new Date().toISOString(), sources: sourceState, patch: lastPatch }));
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
  broadcast({ type: 'health', mode: MODE, timestamp: new Date().toISOString(), sources: sourceState });
}

function mergeLastPatch(patch) {
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const current = lastPatch[key] && typeof lastPatch[key] === 'object' ? lastPatch[key] : {};
      lastPatch[key] = { ...current, ...value };
      if (key === 'ais' && value.contacts) {
        lastPatch.ais.contacts = { ...(current.contacts ?? {}), ...value.contacts };
      }
    } else {
      lastPatch[key] = value;
    }
  }
}

function emitDelta(patch, ui) {
  if (patch && Object.keys(patch).length > 0) mergeLastPatch(patch);
  if (ui && Object.keys(ui).length > 0) Object.assign(lastUi, ui);
  broadcast({
    type: 'delta',
    mode: MODE,
    timestamp: new Date().toISOString(),
    patch: patch ?? {},
    ui: Object.keys(lastUi).length > 0 ? lastUi : undefined,
    sources: sourceState,
  });
}

const AIS_SUBSCRIBE_PATHS = [
  'navigation.position',
  'navigation.speedOverGround',
  'navigation.courseOverGroundTrue',
  'navigation.headingTrue',
  'name',
  'mmsi',
];

function setupSignalK() {
  const ws = new WebSocket(SIGNALK_WS_URL);
  let selfContext = 'vessels.self';
  ws.on('open', () => {
    markSource('signalk', true, 'connected');
    ws.send(JSON.stringify({ context: 'vessels.self', subscribe: [{ path: '*', policy: 'instant' }] }));
    ws.send(
      JSON.stringify({
        context: 'vessels.*',
        subscribe: AIS_SUBSCRIBE_PATHS.map((path) => ({ path, policy: 'instant', minPeriod: 1000 })),
      }),
    );
    emitHealth();
  });
  ws.on('message', (buffer) => {
    try {
      const delta = JSON.parse(buffer.toString());
      if (typeof delta.self === 'string' && !delta.updates) {
        selfContext = delta.self;
        return;
      }
      const patch = normalizeSignalKDelta(delta, { selfContext });
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
    client.subscribe([
      MQTT_STATUS_TOPIC,
      MQTT_BRIGHTNESS_TOPIC,
      MQTT_AUTOPILOT_STATE_TOPIC,
      MQTT_AUTOPILOT_HEADING_TOPIC,
      'helmui/autopilot/mode',
      'helmui/autopilot/headingTarget',
    ]);
    emitHealth();
  });
  client.on('message', (topic, payload) => {
    markSource('mqtt', true, 'streaming');
    if (topic === MQTT_STATUS_TOPIC) {
      const status = payload.toString().trim().toLowerCase();
      markSource('nodered', status !== 'down', `status:${status}`);
      emitHealth();
      return;
    }
    const parsed = normalizeMqttMessage(topic, payload);
    if (parsed.patch && Object.keys(parsed.patch).length > 0) {
      markSource('nodered', true, `mqtt:${topic}`);
      emitDelta(parsed.patch, parsed.ui);
      return;
    }
    if (parsed.ui) {
      emitDelta({}, parsed.ui);
    }
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

function setupReplay(filePath) {
  const resolved = resolve(filePath);
  console.log(`HelmUI bridge replay from ${resolved}`);
  playReplayFile(
    resolved,
    {
      onEvent: (applied) => {
        for (const name of applied.sources) {
          markSource(name, true, 'replay');
        }
        if (Object.keys(applied.patch).length > 0 || applied.ui) {
          emitDelta(applied.patch, applied.ui);
        } else {
          emitHealth();
        }
      },
      onError: (error) => {
        console.error('replay failed', error);
      },
    },
    { loop: process.env.BRIDGE_REPLAY_LOOP !== 'false' },
  ).catch((error) => {
    console.error('replay failed', error);
  });
}

wss.on('connection', (socket) => {
  socket.send(
    JSON.stringify({
      type: 'snapshot',
      mode: MODE,
      timestamp: new Date().toISOString(),
      data: lastPatch,
      ui: Object.keys(lastUi).length > 0 ? lastUi : undefined,
      sources: sourceState,
    }),
  );
});

server.listen(PORT, HOST, () => {
  console.log(`HelmUI bridge listening on http://${HOST}:${PORT}`);
  if (REPLAY_FILE) {
    setupReplay(REPLAY_FILE);
    return;
  }
  setupSignalK();
  setupMqtt();
});
