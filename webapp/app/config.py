import os

INFLUXDB_HOST = os.getenv("INFLUXDB_HOST", "influxdb")
INFLUXDB_PORT = int(os.getenv("INFLUXDB_PORT", "8086"))
INFLUXDB_USERNAME = os.getenv("INFLUXDB_USERNAME", "influxdb_user")
INFLUXDB_PASSWORD = os.getenv("INFLUXDB_PASSWORD", "influxdb_secret_password")
INFLUXDB_DATABASE = os.getenv("INFLUXDB_DATABASE", "GarminStats")
TOKEN_DIR = os.getenv("TOKEN_DIR", "/home/appuser/.garminconnect")
