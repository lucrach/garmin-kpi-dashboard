import os
import shutil
import uuid

from garminconnect import Garmin, GarminConnectAuthenticationError
from garth.exc import GarthHTTPError

from app.config import TOKEN_DIR

# In-memory session store (single-user app)
sessions: dict[str, dict] = {}

# Pending MFA challenges (keyed by temporary ID)
_pending_mfa: dict[str, dict] = {}


def authenticate_garmin(email: str, password: str) -> dict:
    try:
        garmin = Garmin(email=email, password=password, is_cn=False, return_on_mfa=True)
        result1, result2 = garmin.login()

        if result1 == "needs_mfa":
            pending_id = str(uuid.uuid4())
            _pending_mfa[pending_id] = {"garmin": garmin, "client_state": result2}
            return {"success": False, "needs_mfa": True, "pending_id": pending_id}

        # No MFA needed — login succeeded
        garmin.garth.dump(TOKEN_DIR)
        return {"success": True}
    except (GarminConnectAuthenticationError, GarthHTTPError) as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"Login failed: {str(e)}"}


def complete_mfa(pending_id: str, code: str) -> dict:
    pending = _pending_mfa.pop(pending_id, None)
    if not pending:
        return {"success": False, "error": "MFA session expired. Please log in again."}

    try:
        garmin = pending["garmin"]
        garmin.resume_login(pending["client_state"], code)
        garmin.garth.dump(TOKEN_DIR)
        return {"success": True}
    except (GarminConnectAuthenticationError, GarthHTTPError) as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"MFA verification failed: {str(e)}"}


def check_existing_tokens() -> bool:
    try:
        garmin = Garmin()
        garmin.login(TOKEN_DIR)
        return True
    except Exception:
        return False


def clear_tokens():
    if os.path.isdir(TOKEN_DIR):
        shutil.rmtree(TOKEN_DIR)
        os.makedirs(TOKEN_DIR, exist_ok=True)


def create_session() -> str:
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"authenticated": True}
    return session_id


def validate_session(session_id: str) -> bool:
    return session_id in sessions and sessions[session_id].get("authenticated", False)


def destroy_session(session_id: str):
    sessions.pop(session_id, None)
