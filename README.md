# HelmUI

Modern Touch Interface for OpenPlotter Marine Systems.

HelmUI is a fullscreen browser/PWA frontend for a Raspberry Pi 5 running OpenPlotter and the wider marine stack. It is not a replacement for OpenPlotter, Signal K, OpenCPN, Node-RED, MQTT, AIS-catcher, or Pypilot.

## Current status

- Touch-first Helm dashboard
- Simulated live data by default
- Optional Signal K WebSocket client
- Persistent safety strip
- Mode shells for Helm, Chart, Anchor, Engine, Systems, AI Assistant, and Menu
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

By default HelmUI uses simulated live data.

To enable Signal K:

```bash
VITE_SIGNALK_ENABLED=true VITE_SIGNALK_WS_URL='ws://localhost:3000/signalk/v1/stream?subscribe=none' npm run dev
```

For production builds, place the environment values in `.env.production` before running `npm run build`.

## Raspberry Pi kiosk concept

For kiosk use, build the app, serve it locally, and launch Chromium in kiosk mode pointing at the local URL.

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
