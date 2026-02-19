#!/bin/bash
# Stop Garmin Grafana Dashboard
# Usage: ~/garmin-kpi-dashboard/garmin-stop.sh
# Note: Your data is safely stored in Docker volumes and will persist.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER="/Applications/Docker.app/Contents/Resources/bin/docker"

echo "Stopping Garmin Grafana stack..."
cd "$SCRIPT_DIR"
"$DOCKER" compose down

echo ""
echo "All containers stopped. Your data is preserved."
echo "To start again: ~/garmin-kpi-dashboard/garmin-start.sh"
