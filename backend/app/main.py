from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import predict, patients, stats
from app.tasks.scheduler import start_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()         # starts weekly retrain job
    yield

app = FastAPI(title="Healthcare ML API", version="1.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"], allow_headers=["*"])

app.include_router(predict.router, prefix="/api/v1", tags=["predict"])
app.include_router(patients.router, prefix="/api/v1", tags=["patients"])
app.include_router(stats.router, prefix="/api/v1", tags=["stats"])