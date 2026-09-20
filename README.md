# HelmUI

Modern Touch Interface for OpenPlotter Marine Systems.

HelmUI is a fullscreen browser/PWA frontend for a Raspberry Pi 5 running OpenPlotter and the wider marine stack. It is not a replacement for OpenPlotter, Signal K, OpenCPN, Node-RED, MQTT, AIS-catcher, or Pypilot.

## Current status

- Touch-first Helm dashboard
- Runtime profiles: staging live (direct Signal K) and production live (bridge)
- Optional Signal K direct client for staging
- Multi-source production bridge path (Signal K + MQTT + Node-RED)
- Persistent safety strip
- Production screens for Helm, Chart, Anchor, Engine, Systems, AI Assistant policy shell, and Menu
- PWA manifest and service worker foundation

## Commands

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The command is `npm run dev`, not `npm dev build`.

## Viewing locally

After running `npm run dev`, open the Vite URL, usually:

```text
http://localhost:5173
```

For fullscreen testing on macOS Chrome, press `Control + Command + F`.

## Data modes

HelmUI is live-data only. There is no simulation mode: every displayed value
must arrive from the vessel, and unknown values render as `--` until real
telemetry fills them in.

- `staging-live`: direct Signal K WebSocket connection
- `production-live`: requires the bridge transport (Signal K + MQTT + Node-RED)

### Signal K direct (staging)

```bash
VITE_RUNTIME_PROFILE=staging-live \
VITE_TELEMETRY_TRANSPORT=signalk \
VITE_SIGNALK_ENABLED=true \
VITE_SIGNALK_WS_URL='ws://localhost:3000/signalk/v1/stream?subscribe=none' \
npm run dev
```

### Bridge live mode (recommended for production)

Start bridge:

```bash
BRIDGE_PORT=4300 \
BRIDGE_SIGNALK_WS_URL='ws://localhost:3000/signalk/v1/stream?subscribe=none' \
BRIDGE_MQTT_URL='mqtt://localhost:1883' \
npm run bridge
```

Start HelmUI:

```bash
VITE_RUNTIME_PROFILE=production-live \
VITE_TELEMETRY_TRANSPORT=bridge \
VITE_TELEMETRY_BRIDGE_WS_URL='ws://localhost:4300/ws' \
VITE_TELEMETRY_BRIDGE_HTTP_URL='http://localhost:4300' \
VITE_CHART_OFFLINE_ONLY=true \
VITE_CHART_TILE_URL_TEMPLATE='/tiles/base.svg' \
VITE_AI_ASSISTANT_ENABLED=false \
npm run dev
```

## Raspberry Pi kiosk concept

For kiosk use, build the app, serve it locally, and launch Chromium in kiosk mode pointing at the local URL.

For a full production install walkthrough (Node setup, systemd services, bridge wiring, kiosk autostart), see:

- [Raspberry Pi Installation Guide](docs/raspberry-pi-install.md)
- [Systemd Templates](deploy/systemd/)
- [Systemd Uninstall Script](scripts/uninstall-systemd.sh)

Example:

```bash
npm run build
npm run preview
```

Then launch Chromium with:

```bash
./scripts/start-kiosk.sh http://localhost:4173
```

## Safety note

HelmUI is currently an MVP interface. Do not rely on it as the only safety-critical navigation or vessel monitoring system until real hardware integration, alarms, failure states, and marine-grade testing are complete.

## Bridge APIs

The bridge exposes:

- `GET /health` source and timestamp health
- `GET /sources` source connectivity summary
- `GET /last-seen` last normalized patch metadata
- `WS /ws` canonical telemetry stream (`snapshot`, `delta`, `health`)

## Production smoke checklist

Run this before vessel operations:

1. Start bridge and confirm `GET /health` returns `ok: true`.
2. Confirm all expected sources are connected (`signalk`, `mqtt`, `nodered`).
3. Start HelmUI in `production-live` profile with `bridge` transport.
4. Confirm status bar source summary does not show `down`.
5. Confirm alarms trigger on forced test conditions (depth/bilge/source disconnect).
6. Confirm Chart mode renders offline tile layer.
7. Confirm AI Assistant input is disabled in production profile.
8. Confirm restarting browser preserves settings and anchor radius.
