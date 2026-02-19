#!/bin/bash
# Start Garmin KPI Dashboard
# Usage: ~/garmin-kpi-dashboard/garmin-start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER="/Applications/Docker.app/Contents/Resources/bin/docker"

# Check if Docker Desktop is running
if ! "$DOCKER" info &>/dev/null; then
    echo "Starting Docker Desktop..."
    open /Applications/Docker.app
    echo "Waiting for Docker to be ready..."
    while ! "$DOCKER" info &>/dev/null; do
        sleep 2
    done
    echo "Docker is ready!"
fi

# Start the stack (build webapp if needed)
echo "Starting Garmin KPI Dashboard..."
cd "$SCRIPT_DIR"
"$DOCKER" compose up -d --build

echo ""
echo "All containers started!"
echo ""
echo "  KPI Dashboard:     http://localhost:5001"
echo "  Grafana (advanced): http://localhost:3030  (admin / admin)"
echo ""
echo "To stop: ~/garmin-kpi-dashboard/garmin-stop.sh"
