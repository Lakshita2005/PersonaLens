from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analysis, auth, health
from app.core.config import get_settings
from app.services.auth_store import init_auth_store


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.2.0",
        description="PersonaLens academic personality intelligence API",
    )

    allow_credentials = "*" not in settings.cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(health.router, prefix=settings.api_v1_prefix)
    app.include_router(analysis.router, prefix=settings.api_v1_prefix)
    app.include_router(auth.router, prefix=settings.api_v1_prefix)
    app.include_router(analysis.legacy_router)

    @app.on_event("startup")
    async def startup() -> None:
        init_auth_store()

    return app


app = create_app()
