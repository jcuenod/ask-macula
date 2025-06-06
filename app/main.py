from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.query import router as query_router
from app.api.visualize import router as vis_router

limiter = Limiter(key_func=get_remote_address)

# Create app instance
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the API router before mounting static files to ensure API routes have priority
app.include_router(query_router, prefix="/api/query", tags=["API"])
app.include_router(vis_router, prefix="/api/visualize", tags=["API"])

# Mount static files directory
app.mount(
    "/",  # Mount at the root path
    StaticFiles(
        directory=Path(__file__).parent / "static", html=True
    ),  # html=True enables serving index.html for directory paths
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
