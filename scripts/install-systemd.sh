#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo ./scripts/install-systemd.sh [user] [repo_path]"
  exit 1
fi

APP_USER="${1:-pi}"
REPO_PATH="${2:-/opt/helmui}"
SYSTEMD_DIR="/etc/systemd/system"
DEFAULTS_FILE="/etc/default/helmui-bridge"

if [[ ! -d "$REPO_PATH/deploy/systemd" ]]; then
  echo "Could not find deploy/systemd in $REPO_PATH"
  exit 1
fi

echo "Installing HelmUI systemd templates..."
cp "$REPO_PATH/deploy/systemd/helmui-bridge.service" "$SYSTEMD_DIR/helmui-bridge.service"
cp "$REPO_PATH/deploy/systemd/helmui-web.service" "$SYSTEMD_DIR/helmui-web.service"
cp "$REPO_PATH/deploy/systemd/helmui-bridge.env" "$DEFAULTS_FILE"

echo "Setting runtime user to: $APP_USER"
sed -i "s/^User=.*/User=$APP_USER/" "$SYSTEMD_DIR/helmui-bridge.service"
sed -i "s/^User=.*/User=$APP_USER/" "$SYSTEMD_DIR/helmui-web.service"
sed -i "s#^WorkingDirectory=.*#WorkingDirectory=$REPO_PATH#" "$SYSTEMD_DIR/helmui-bridge.service"
sed -i "s#^WorkingDirectory=.*#WorkingDirectory=$REPO_PATH#" "$SYSTEMD_DIR/helmui-web.service"

systemctl daemon-reload
systemctl enable --now helmui-bridge
systemctl enable --now helmui-web

echo
echo "Installed successfully."
echo "Check status:"
echo "  systemctl status helmui-bridge"
echo "  systemctl status helmui-web"
