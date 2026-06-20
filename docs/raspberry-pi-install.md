# HelmUI Raspberry Pi Installation Guide

This guide walks through a production-style install of HelmUI on Raspberry Pi (recommended: Pi 5 with OpenPlotter).

## 1) Recommended target setup

- Raspberry Pi 5 (4GB+ RAM)
- 64-bit Raspberry Pi OS or OpenPlotter image
- Touchscreen attached and calibrated
- Stable power supply (marine-grade, protected)
- Network access to your telemetry stack:
  - Signal K
  - MQTT broker
  - Node-RED status topic(s)

## 2) Base OS preparation

Update system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

Install required runtime packages:

```bash
sudo apt install -y git curl chromium-browser
```

If your distro package is named `chromium`, install that instead:

```bash
sudo apt install -y chromium
```

## 3) Install Node.js (LTS)

HelmUI should run on current LTS (Node 20+ recommended).

Using NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 4) Clone and install HelmUI

Choose an install location, e.g. `/opt/helmui`:

```bash
sudo mkdir -p /opt/helmui
sudo chown -R "$USER":"$USER" /opt/helmui
git clone <YOUR_REPO_URL> /opt/helmui
cd /opt/helmui
npm install
```

## 5) Build once (sanity check)

```bash
npm run build
```

If this fails, stop and resolve before moving to services.

## 6) Configure production environment

Create `.env.production` in repo root:

```bash
cat > /opt/helmui/.env.production <<'EOF'
VITE_RUNTIME_PROFILE=production-live
VITE_TELEMETRY_TRANSPORT=bridge
VITE_TELEMETRY_BRIDGE_WS_URL=ws://127.0.0.1:4300/ws
VITE_TELEMETRY_BRIDGE_HTTP_URL=http://127.0.0.1:4300
VITE_CHART_OFFLINE_ONLY=true
VITE_CHART_TILE_URL_TEMPLATE=/tiles/base.svg
VITE_AI_ASSISTANT_ENABLED=false
EOF
```

## 7) Configure bridge service environment

Create bridge env file:

```bash
sudo tee /etc/default/helmui-bridge >/dev/null <<'EOF'
BRIDGE_PORT=4300
BRIDGE_SIGNALK_WS_URL=ws://127.0.0.1:3000/signalk/v1/stream?subscribe=none
BRIDGE_MQTT_URL=mqtt://127.0.0.1:1883
BRIDGE_MQTT_STATUS_TOPIC=helmui/bridge/nodered/status
EOF
```

Adjust hosts/ports/topic names for your vessel network.

## 8) Create systemd service: HelmUI bridge

### Fast path (recommended)

Use included templates and installer:

```bash
cd /opt/helmui
sudo ./scripts/install-systemd.sh pi /opt/helmui
```

This installs:

- `deploy/systemd/helmui-bridge.service` → `/etc/systemd/system/helmui-bridge.service`
- `deploy/systemd/helmui-web.service` → `/etc/systemd/system/helmui-web.service`
- `deploy/systemd/helmui-bridge.env` → `/etc/default/helmui-bridge`

Then it enables and starts both services.

### Manual path

Create `/etc/systemd/system/helmui-bridge.service`:

```ini
[Unit]
Description=HelmUI Telemetry Bridge
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/helmui
EnvironmentFile=/etc/default/helmui-bridge
ExecStart=/usr/bin/npm run bridge
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Replace `User=pi` if your runtime user is different.

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now helmui-bridge
sudo systemctl status helmui-bridge
```

Health check:

```bash
curl http://127.0.0.1:4300/health
curl http://127.0.0.1:4300/sources
```

## 9) Serve HelmUI in production preview mode

Create `/etc/systemd/system/helmui-web.service`:

```ini
[Unit]
Description=HelmUI Web Runtime
After=network-online.target helmui-bridge.service
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/helmui
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now helmui-web
sudo systemctl status helmui-web
```

Verify:

```bash
curl -I http://127.0.0.1:4173
```

## 10) Configure kiosk startup (Chromium fullscreen)

You can reuse the included script:

```bash
cd /opt/helmui
./scripts/start-kiosk.sh http://127.0.0.1:4173
```

To auto-launch on boot for desktop sessions:

```bash
mkdir -p ~/.config/lxsession/LXDE-pi
grep -q "start-kiosk.sh" ~/.config/lxsession/LXDE-pi/autostart 2>/dev/null || \
  echo "@/opt/helmui/scripts/start-kiosk.sh http://127.0.0.1:4173" >> ~/.config/lxsession/LXDE-pi/autostart
```

If your image does not use LXDE, configure equivalent autostart in your compositor/session manager.

## 11) Pre-departure production checks

Before real operation:

1. `helmui-bridge` service is active.
2. `/health` reports all required sources up.
3. `helmui-web` service is active and reachable.
4. Status bar in HelmUI does not show source `down`.
5. AI Assistant input is disabled (production policy).
6. Chart layer loads local tile background.
7. Alarms are visible when forcing test conditions.

## 12) Logs and diagnostics

Bridge logs:

```bash
journalctl -u helmui-bridge -f
```

Web runtime logs:

```bash
journalctl -u helmui-web -f
```

Restart services:

```bash
sudo systemctl restart helmui-bridge helmui-web
```

## 13) Updating HelmUI

```bash
cd /opt/helmui
git pull
npm install
npm run build
sudo systemctl restart helmui-bridge helmui-web
```

## 14) Rollback / uninstall services

To remove HelmUI systemd units and bridge defaults:

```bash
cd /opt/helmui
sudo ./scripts/uninstall-systemd.sh
```

This stops/disables services and removes:

- `/etc/systemd/system/helmui-bridge.service`
- `/etc/systemd/system/helmui-web.service`
- `/etc/default/helmui-bridge`

## 15) Troubleshooting quick reference

- White screen:
  - Check `helmui-web` status and logs.
  - Confirm preview endpoint responds.
- No live telemetry:
  - Check `helmui-bridge` status.
  - Validate Signal K URL and MQTT URL in `/etc/default/helmui-bridge`.
  - Verify `/sources` reports expected `connected` states.
- Kiosk not opening:
  - Ensure Chromium package exists (`chromium-browser` or `chromium`).
  - Test script manually from shell first.

## 16) Security and safety notes

- Restrict management ports/firewall rules on vessel network.
- Use a dedicated low-privilege runtime user where possible.
- Do not treat HelmUI as sole safety-critical navigation instrument.
- Keep fallback navigation and independent alarms available.
