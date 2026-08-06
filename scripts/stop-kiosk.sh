#!/usr/bin/env bash
# Stop the HelmUI Chromium kiosk and return to the Raspberry Pi desktop.
#
# The kiosk is launched from the LXDE autostart file (see
# docs/raspberry-pi-install.md section 10), NOT from a systemd service, so this
# script removes the autostart entry, kills the running browser, and restarts
# the graphical session so the desktop reappears.
#
# Usage:
#   ./scripts/stop-kiosk.sh            # stop kiosk, keep it disabled this session
#   ./scripts/stop-kiosk.sh --keep     # stop kiosk but leave autostart entry intact
set -uo pipefail

KEEP_AUTOSTART=false
if [[ "${1:-}" == "--keep" ]]; then
  KEEP_AUTOSTART=true
fi

LXDE_AUTOSTART="$HOME/.config/lxsession/LXDE-pi/autostart"
WAYFIRE_INI="$HOME/.config/wayfire.ini"

if [[ "$KEEP_AUTOSTART" == false ]]; then
  echo "Removing kiosk autostart entries (so it won't relaunch)..."
  [[ -f "$LXDE_AUTOSTART" ]] && sed -i '/start-kiosk.sh/d' "$LXDE_AUTOSTART" || true
  [[ -f "$WAYFIRE_INI" ]] && sed -i '/start-kiosk.sh/d' "$WAYFIRE_INI" || true
fi

echo "Stopping kiosk browser..."
pkill -f start-kiosk.sh 2>/dev/null || true
pkill -f chromium-browser 2>/dev/null || true
pkill -f chromium 2>/dev/null || true

echo "Restarting the desktop session..."
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl restart display-manager 2>/dev/null \
    || sudo systemctl restart lightdm 2>/dev/null \
    || {
      echo "Could not restart the display manager automatically."
      echo "Try: sudo systemctl start display-manager   (or: sudo systemctl start lightdm)"
      echo "     sudo systemctl isolate graphical.target"
    }
fi

echo "Done. The desktop should now be visible."
if [[ "$KEEP_AUTOSTART" == false ]]; then
  echo "The kiosk will NOT relaunch on reboot. Restore the autostart file"
  echo "(docs section 10) to re-enable it."
fi
