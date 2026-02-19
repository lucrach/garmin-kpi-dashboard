from fastapi import APIRouter, Depends, Query

from app.influxdb_client import query_influxdb
from app.routes.utils import require_auth, validate_date

router = APIRouter()


@router.get("/daily/summary")
async def daily_summary(
    start: str = Query(...),
    end: str = Query(...),
    _=Depends(require_auth),
):
    validate_date(start)
    validate_date(end)
    q = (
        "SELECT restingHeartRate, averageSpo2, "
        "bodyBatteryHighestValue, bodyBatteryLowestValue, "
        "highStressDuration, mediumStressDuration, lowStressDuration, "
        "totalSteps "
        "FROM DailyStats "
        f"WHERE time >= '{start}T00:00:00Z' - 24h AND time <= '{end}T23:59:59Z' + 24h "
        "ORDER BY time ASC"
    )
    return {"data": query_influxdb(q)}
