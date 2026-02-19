import uuid

from garminconnect import Garmin, GarminConnectAuthenticationError
from garth.exc import GarthHTTPError

from app.config import TOKEN_DIR

# In-memory session store (single-user app)
sessions: dict[str, dict] = {}


def authenticate_garmin(email: str, password: str) -> dict:
    try:
        garmin = Garmin(email=email, password=password, is_cn=False)
        garmin.login()
        garmin.garth.dump(TOKEN_DIR)
        return {"success": True}
    except (GarminConnectAuthenticationError, GarthHTTPError) as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"Login failed: {str(e)}"}


def check_existing_tokens() -> bool:
    try:
        garmin = Garmin()
        garmin.login(TOKEN_DIR)
        return True
    except Exception:
        return False


def create_session() -> str:
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"authenticated": True}
    return session_id


def validate_session(session_id: str) -> bool:
    return session_id in sessions and sessions[session_id].get("authenticated", False)


def destroy_session(session_id: str):
    sessions.pop(session_id, None)
