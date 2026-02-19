import logging

from influxdb import InfluxDBClient
from fastapi import HTTPException

from app.config import (
    INFLUXDB_HOST, INFLUXDB_PORT, INFLUXDB_USERNAME,
    INFLUXDB_PASSWORD, INFLUXDB_DATABASE,
)

log = logging.getLogger(__name__)

_client = None


def get_client():
    global _client
    if _client is None:
        _client = InfluxDBClient(
            host=INFLUXDB_HOST,
            port=INFLUXDB_PORT,
            username=INFLUXDB_USERNAME,
            password=INFLUXDB_PASSWORD,
            database=INFLUXDB_DATABASE,
        )
    return _client


def query_influxdb(query_string: str) -> list[dict]:
    try:
        client = get_client()
        result = client.query(query_string)
        return list(result.get_points())
    except Exception as e:
        log.error("InfluxDB query failed: %s", e)
        raise HTTPException(status_code=503, detail="Database unavailable")
