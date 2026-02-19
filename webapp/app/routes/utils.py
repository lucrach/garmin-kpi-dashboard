import re

from fastapi import Cookie, HTTPException

from app.auth import validate_session

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def require_auth(session_id: str | None = Cookie(None)):
    if not session_id or not validate_session(session_id):
        raise HTTPException(status_code=401, detail="Not authenticated")


def validate_date(d: str):
    if not DATE_RE.match(d):
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
