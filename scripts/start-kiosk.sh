#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:4173}"

if command -v chromium-browser >/dev/null 2>&1; then
  CHROME_BIN="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
  CHROME_BIN="chromium"
elif command -v google-chrome >/dev/null 2>&1; then
  CHROME_BIN="google-chrome"
else
  echo "Chromium/Chrome was not found on PATH."
  exit 1
fi

exec "$CHROME_BIN" \
  --kiosk "$URL" \
  --app="$URL" \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000
