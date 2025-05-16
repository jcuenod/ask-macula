from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from app.api.query import router as query_router

# Create app instance
app = FastAPI()
app.include_router(query_router, prefix="/api", tags=["API"])


# when the user visits the root URL, serve the index.html file from the static directory
@app.get("/", include_in_schema=False)
async def serve_index():
    """
    Serve the index.html file from the static directory when the root URL is accessed.
    """
    static_dir = Path(__file__).parent.parent / "app" / "static"
    index_html_path = static_dir / "index.html"
    return FileResponse(index_html_path)


# Serve static files from the static directory
app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.parent / "app" / "static"),
    name="static",
)


# You will later import and include your API routers here, for example:
# from .api.endpoints import query
# app.include_router(query.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    # This is for local development.
    # The Dockerfile CMD will run uvicorn in production.
    uvicorn.run(app, host="0.0.0.0", port=8000)
