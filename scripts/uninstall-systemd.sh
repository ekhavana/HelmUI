#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo ./scripts/uninstall-systemd.sh"
  exit 1
fi

SYSTEMD_DIR="/etc/systemd/system"
DEFAULTS_FILE="/etc/default/helmui-bridge"

echo "Stopping HelmUI services (if running)..."
systemctl stop helmui-web 2>/dev/null || true
systemctl stop helmui-bridge 2>/dev/null || true

echo "Disabling HelmUI services (if enabled)..."
systemctl disable helmui-web 2>/dev/null || true
systemctl disable helmui-bridge 2>/dev/null || true

echo "Removing installed service files..."
rm -f "$SYSTEMD_DIR/helmui-web.service"
rm -f "$SYSTEMD_DIR/helmui-bridge.service"

echo "Removing bridge defaults file..."
rm -f "$DEFAULTS_FILE"

systemctl daemon-reload
systemctl reset-failed

echo
echo "HelmUI systemd services removed."
echo "If desired, remove app files manually (e.g. /opt/helmui)."
