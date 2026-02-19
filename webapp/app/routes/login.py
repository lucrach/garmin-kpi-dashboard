from fastapi import APIRouter, Cookie
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.auth import (
    authenticate_garmin,
    check_existing_tokens,
    create_session,
    validate_session,
    destroy_session,
)

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(req: LoginRequest):
    result = authenticate_garmin(req.email, req.password)
    if result["success"]:
        session_id = create_session()
        response = JSONResponse({"success": True})
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        return response
    return JSONResponse(
        {"success": False, "error": result["error"]}, status_code=401
    )


@router.get("/auth-status")
async def auth_status(session_id: str = Cookie(None)):
    if session_id and validate_session(session_id):
        return {"authenticated": True}
    if check_existing_tokens():
        new_session = create_session()
        response = JSONResponse({"authenticated": True})
        response.set_cookie(key="session_id", value=new_session, httponly=True)
        return response
    return {"authenticated": False}


@router.post("/logout")
async def logout(session_id: str = Cookie(None)):
    if session_id:
        destroy_session(session_id)
    response = JSONResponse({"success": True})
    response.delete_cookie("session_id")
    return response
