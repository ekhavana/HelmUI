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

Two transport options are available. Choose one.

### Option A — Bridge (recommended for MQTT + Signal K combined)

The bridge process connects to both Signal K and MQTT, normalises the data, and streams it to the UI over a local WebSocket. Requires the `helmui-bridge` service (sections 7–8).

Create `.env.production` in repo root:

```bash
cat > /opt/helmui/.env.production <<'EOF'
VITE_RUNTIME_PROFILE=production-live
VITE_TELEMETRY_TRANSPORT=bridge
VITE_TELEMETRY_BRIDGE_WS_URL=ws://127.0.0.1:4300/ws
VITE_TELEMETRY_BRIDGE_HTTP_URL=http://127.0.0.1:4300
VITE_AI_ASSISTANT_ENABLED=false
EOF
```

### Option B — Direct Signal K (no bridge, no MQTT)

The UI connects directly to Signal K. No bridge service needed. Only Signal K paths are available (no MQTT status topics).

```bash
cat > /opt/helmui/.env.production <<'EOF'
VITE_RUNTIME_PROFILE=staging-live
VITE_TELEMETRY_TRANSPORT=signalk
VITE_AI_ASSISTANT_ENABLED=false
EOF
```

The Signal K WebSocket URL is auto-detected from the browser's hostname at runtime (e.g. `ws://<pi-hostname>:3000/signalk/v1/stream`). No URL variable required.

## 7) Configure bridge service environment

> Skip this section if using **Option B** (direct Signal K) from section 6.

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

Signal K paths subscribed by the bridge (and direct client):

- `navigation.position`, `navigation.headingTrue`, `navigation.speedOverGround`, `navigation.speedThroughWater`
- `navigation.courseOverGroundTrue`, `navigation.gnss.methodQuality`, `navigation.gnss.satellites`
- `navigation.courseRhumbline.nextPoint.distance/name`, `navigation.courseRhumbline.crossTrackError`
- `environment.depth.belowTransducer`, `environment.wind.*`, `environment.water.temperature`
- `electrical.batteries.house.voltage/current/capacity.stateOfCharge`
- `propulsion.main.coolantTemperature/revolutions/oilPressure/fuel.rate/runTime`
- `electrical.alternators.0.voltage`, `environment.inside.bilge.floodDetected`

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
ExecStart=/usr/bin/env npm run bridge
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
ExecStart=/usr/bin/env npm run preview
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

> IMPORTANT: The autostart file must keep the normal desktop components
> (`lxpanel` and `pcmanfm --desktop`) **in addition to** the kiosk line. If the
> file contains only the kiosk entry, the LXDE panel and desktop wallpaper never
> start — so when Chromium exits you are left with a **black screen instead of
> the desktop**. Always launch the kiosk *on top of* a running desktop.

```bash
mkdir -p ~/.config/lxsession/LXDE-pi
cat > ~/.config/lxsession/LXDE-pi/autostart <<'EOF'
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@/opt/helmui/scripts/start-kiosk.sh http://127.0.0.1:4173
EOF
```

With this ordering the desktop (panel + wallpaper) is always running underneath,
so stopping/exiting the kiosk drops you back to the desktop instead of a black
screen.

If your image does not use LXDE, configure equivalent autostart in your
compositor/session manager. On Raspberry Pi OS Bookworm (Wayland/labwc or
wayfire) add the kiosk to `~/.config/wayfire.ini` under `[autostart]` instead,
and do **not** disable the default panel/background entries.

### Returning to the desktop (exit kiosk)

Stop the kiosk at any time and return to the desktop with:

```bash
/opt/helmui/scripts/stop-kiosk.sh
```

This removes the kiosk autostart entry, kills the running Chromium kiosk, and
restarts the LXDE session so the desktop reappears. See section 17 for full
emergency recovery over SSH/TTY.

## 11) Pre-departure production checks

Before real operation:

1. `helmui-bridge` service is active (skip if using direct Signal K).
2. `/health` reports all required sources up (bridge mode only).
3. `helmui-web` service is active and reachable.
4. Status bar in HelmUI does not show source `down`.
5. Chart map renders with vessel marker at correct GPS position.
6. Anchor screen shows GPS fix — "Set Anchor" button becomes enabled.
7. Engine screen shows live RPM and coolant temperature.
8. Battery percent updates (requires `stateOfCharge` from your BMS via Signal K).
9. AI Assistant input is disabled (production policy).
10. Alarms are visible when forcing test conditions.
11. Sunset countdown in status bar updates from GPS position.

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
- No live telemetry (bridge mode):
  - Check `helmui-bridge` status and logs.
  - Validate Signal K URL and MQTT URL in `/etc/default/helmui-bridge`.
  - Verify `/sources` reports expected `connected` states.
- No live telemetry (direct Signal K mode):
  - Confirm Signal K is running: `curl http://127.0.0.1:3000/signalk`.
  - Check browser console for WebSocket connection errors.
- No GPS position / map blank:
  - Confirm `navigation.position` is published by your GPS source in Signal K admin UI.
  - Check Signal K Data Browser at `http://<pi>:3000` for live `navigation.position` values.
- Anchor watch drift always zero:
  - Anchor set point must be captured first (tap "Set Anchor" in Anchor screen when GPS fix is active).
- Engine data missing:
  - Confirm your engine interface (NMEA 2000 / NMEA 0183 / CAN) is publishing `propulsion.main.*` in Signal K.
- Battery % missing:
  - Requires a BMS or shunt that publishes `electrical.batteries.house.capacity.stateOfCharge` to Signal K.
- Kiosk not opening:
  - Ensure Chromium package exists (`chromium-browser` or `chromium`).
  - Test script manually from shell first.
- Black screen after kiosk stops (no desktop):
  - The kiosk autostart entry replaced the desktop autostart entries. Restore
    the full autostart file from section 10 so `lxpanel` and
    `pcmanfm --desktop` run alongside the kiosk.
  - For immediate recovery, see section 17.

## 17) Emergency recovery: get the desktop back now

The kiosk is **not** a systemd service — it is Chromium launched from the LXDE
autostart file (`~/.config/lxsession/LXDE-pi/autostart`). So there is no
`systemctl stop` for the kiosk itself; you stop the browser and restart the
graphical session.

Connect over SSH, or on the Pi press `Ctrl+Alt+F2` to open a text console (TTY)
and log in, then run:

```bash
# 1) Stop the kiosk autostart from relaunching this session / on next boot
sed -i '/start-kiosk.sh/d' ~/.config/lxsession/LXDE-pi/autostart 2>/dev/null || true
# (Bookworm / Wayland users, also run:)
sed -i '/start-kiosk.sh/d' ~/.config/wayfire.ini 2>/dev/null || true

# 2) Kill the kiosk launcher and Chromium
pkill -f start-kiosk.sh 2>/dev/null || true
pkill -f chromium 2>/dev/null || true
pkill -f chromium-browser 2>/dev/null || true

# 3) Bring the desktop back by restarting the display manager
#    (Raspberry Pi OS desktop uses LightDM; the generic alias also works)
sudo systemctl restart display-manager 2>/dev/null \
  || sudo systemctl restart lightdm
```

If the screen is still black (the graphical session is not running at all):

```bash
# Make sure the machine is set to boot to the graphical desktop and start it now
sudo systemctl set-default graphical.target
sudo systemctl start display-manager 2>/dev/null || sudo systemctl start lightdm
sudo systemctl isolate graphical.target
```

Notes:

- Stopping `helmui-web`/`helmui-bridge` does **not** affect the display — those
  services only serve the app and telemetry, they do not own the screen.
- If you removed the kiosk line in step 1, it will not relaunch on the next
  reboot. To re-enable the kiosk later, restore the autostart file from
  section 10.
- The convenience script does steps 1–3 for you:

```bash
/opt/helmui/scripts/stop-kiosk.sh
```

## 16) Security and safety notes

- Restrict management ports/firewall rules on vessel network.
- Use a dedicated low-privilege runtime user where possible.
- Do not treat HelmUI as sole safety-critical navigation instrument.
- Keep fallback navigation and independent alarms available.
