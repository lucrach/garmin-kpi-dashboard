from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routes import login, sleep, stress, body_battery, hrv, breathing, daily

app = FastAPI(title="Garmin Health Dashboard")

# API routes
app.include_router(login.router, prefix="/api")
app.include_router(sleep.router, prefix="/api")
app.include_router(stress.router, prefix="/api")
app.include_router(body_battery.router, prefix="/api")
app.include_router(hrv.router, prefix="/api")
app.include_router(breathing.router, prefix="/api")
app.include_router(daily.router, prefix="/api")

# Serve static assets (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")


# HTML pages
@app.get("/")
async def serve_login():
    return FileResponse("static/index.html")


@app.get("/dashboard")
async def serve_dashboard():
    return FileResponse("static/dashboard.html")
