from fastapi import APIRouter, Depends, Query

from app.influxdb_client import query_influxdb
from app.routes.utils import require_auth, validate_date

router = APIRouter()


@router.get("/body-battery/intraday")
async def body_battery_intraday(
    date: str = Query(...),
    _=Depends(require_auth),
):
    validate_date(date)
    q = (
        "SELECT BodyBatteryLevel FROM BodyBatteryIntraday "
        f"WHERE time >= '{date}T00:00:00Z' AND time <= '{date}T23:59:59Z' "
        "ORDER BY time ASC"
    )
    return {"data": query_influxdb(q)}
