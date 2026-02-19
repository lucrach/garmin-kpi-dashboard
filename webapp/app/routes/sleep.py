from fastapi import APIRouter, Depends, Query

from app.influxdb_client import query_influxdb
from app.routes.utils import require_auth, validate_date

router = APIRouter()


@router.get("/sleep/summary")
async def sleep_summary(
    start: str = Query(...),
    end: str = Query(...),
    _=Depends(require_auth),
):
    validate_date(start)
    validate_date(end)
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
    _=Depends(require_auth),
):
    validate_date(date)
    # Sleep spans from previous evening to morning — extend 24h back
    q = (
        "SELECT SleepStageLevel, heartRate, spo2Reading, "
        "respirationValue, stressValue, bodyBattery, hrvData "
        "FROM SleepIntraday "
        f"WHERE time >= '{date}T00:00:00Z' - 24h AND time <= '{date}T23:59:59Z' "
        "ORDER BY time ASC"
    )
    return {"data": query_influxdb(q)}
