import re

from fastapi import APIRouter, Cookie, HTTPException, Query

from app.auth import validate_session
from app.influxdb_client import query_influxdb

router = APIRouter()

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _require_auth(session_id: str | None):
    if not session_id or not validate_session(session_id):
        raise HTTPException(status_code=401, detail="Not authenticated")


def _validate_date(d: str):
    if not DATE_RE.match(d):
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")


@router.get("/sleep/summary")
async def sleep_summary(
    start: str = Query(...),
    end: str = Query(...),
    session_id: str = Cookie(None),
):
    _require_auth(session_id)
    _validate_date(start)
    _validate_date(end)
    q = (
        "SELECT sleepTimeSeconds, deepSleepSeconds, lightSleepSeconds, "
        "remSleepSeconds, awakeSleepSeconds, averageSpO2Value, "
        "avgSleepStress, sleepScore, avgOvernightHrv, "
        "bodyBatteryChange, restingHeartRate "
        "FROM SleepSummary "
        f"WHERE time >= '{start}T00:00:00Z' - 24h AND time <= '{end}T23:59:59Z' + 24h "
        "ORDER BY time ASC"
    )
    return {"data": query_influxdb(q)}


@router.get("/sleep/intraday")
async def sleep_intraday(
    date: str = Query(...),
    session_id: str = Cookie(None),
):
    _require_auth(session_id)
    _validate_date(date)
    # Sleep spans from previous evening to morning — extend 12h back
    q = (
        "SELECT SleepStageLevel, heartRate, spo2Reading, "
        "respirationValue, stressValue, bodyBattery, hrvData "
        "FROM SleepIntraday "
        f"WHERE time >= '{date}T00:00:00Z' - 12h AND time <= '{date}T23:59:59Z' "
        "ORDER BY time ASC"
    )
    return {"data": query_influxdb(q)}
