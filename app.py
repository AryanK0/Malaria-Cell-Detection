from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app import app as api_app
from backend.app import load_model

ROOT_DIR = Path(__file__).resolve().parent
DIST_DIR = ROOT_DIR / "frontend" / "dist"

app = FastAPI(title="Malaria Cell Detection")
app.mount("/api", api_app)


@app.on_event("startup")
def startup():
    load_model()

if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    samples_dir = DIST_DIR / "samples"

    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    if samples_dir.exists():
        app.mount("/samples", StaticFiles(directory=samples_dir), name="samples")

    @app.get("/{path:path}", include_in_schema=False)
    async def serve_frontend(path: str):
        requested_file = DIST_DIR / path
        if path and requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/", include_in_schema=False)
    async def missing_frontend():
        return JSONResponse(
            status_code=503,
            content={"error": "Frontend build missing. Run `npm --prefix frontend run build`."},
        )
