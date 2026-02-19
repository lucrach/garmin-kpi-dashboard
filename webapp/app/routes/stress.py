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


@router.get("/stress/intraday")
async def stress_intraday(
    date: str = Query(...),
    session_id: str = Cookie(None),
):
    _require_auth(session_id)
    _validate_date(date)
    q = (
        "SELECT stressLevel FROM StressIntraday "
        f"WHERE time >= '{date}T00:00:00Z' AND time <= '{date}T23:59:59Z' "
        "ORDER BY time ASC"
    )
    return {"data": query_influxdb(q)}
