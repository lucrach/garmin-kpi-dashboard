# Garmin Health Dashboard

A self-hosted web dashboard that pulls your health data from Garmin Connect and visualises it in a clean, dark-themed UI. No Grafana expertise needed — just log in with your Garmin account and browse your data.

Built with Python (FastAPI), InfluxDB, and plain HTML / Tailwind CSS / Chart.js. Runs entirely on your machine via Docker.

## What it shows

- **Sleep** — Score, duration, stages (deep / light / REM / awake), overnight HRV, SpO2
- **Stress** — Intraday stress levels throughout the day
- **Body Battery** — Charge and drain patterns over 24 hours
- **HRV** — Heart rate variability measurements
- **Breathing Rate** — Respiratory rate data
- **7-Day Trends** — Sleep score and resting heart rate over the past week

## How it works

```
Garmin Watch → Garmin Connect cloud → garmin-fetch-data (every 5 min) → InfluxDB → Web Dashboard
```

Four Docker containers run locally:

| Container | Purpose | Port |
|-----------|---------|------|
| **garmin-webapp** | Web dashboard (FastAPI + static frontend) | `localhost:5001` |
| **garmin-fetch-data** | Pulls data from Garmin Connect API every 5 min | internal |
| **influxdb** | Time-series database storing all health metrics | internal |
| **grafana** | Alternative advanced dashboard (optional) | `localhost:3030` |

All data stays on your machine. Nothing is sent to third parties.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes `docker compose`)
- A Garmin Connect account with a synced Garmin device

## Quick start

```bash
# Clone
git clone https://github.com/lucrach/garmin-health-dashboard.git
cd garmin-health-dashboard

# Setup
mkdir -p garminconnect-tokens && chmod 777 garminconnect-tokens
cp compose-example.yml compose.yml
sed -i '' 's/\${DS_GARMIN_STATS}/garmin_influxdb/g' Grafana_Dashboard/Garmin-Grafana-Dashboard.json

# Authenticate with Garmin (enter your email, password, and 2FA code when prompted)
docker compose run --rm garmin-fetch-data

# Start everything
./garmin-start.sh
```

Open **http://localhost:5001** and your health dashboard is live.

## Daily usage

```bash
# Start (also launches Docker Desktop if needed)
./garmin-start.sh

# Stop (data is preserved)
./garmin-stop.sh
```

## Backfill historical data

By default only the last 7 days are fetched. To pull older data:

```bash
docker compose run --rm \
  -e MANUAL_START_DATE=2024-01-01 \
  -e MANUAL_END_DATE=2025-12-31 \
  garmin-fetch-data
```

> **Warning:** Never run `docker compose down -v` — the `-v` flag deletes all stored data.

## Project structure

```
webapp/                  # Custom health dashboard web app
  app/                   # FastAPI backend
    routes/              # API endpoints (sleep, stress, HRV, body battery, etc.)
    auth.py              # Garmin Connect login + session management
    influxdb_client.py   # InfluxDB query helper
  static/                # Frontend (HTML + Tailwind CSS + Chart.js via CDN)
compose.yml              # Docker Compose for all 4 services
garmin-start.sh          # Easy start script
garmin-stop.sh           # Easy stop script
```

## Credits

Data fetching powered by [garmin-grafana](https://github.com/arpanghosh8453/garmin-grafana) by Arpan Ghosh.
