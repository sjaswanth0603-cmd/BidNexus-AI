import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.seed import seed_database
from app.database.mongodb import check_mongodb_connection
from app.api import auth, bids, vendors, compliance, reviews, reports, assistant, audit, mongodb

logger = logging.getLogger("bidnexus")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed MongoDB Atlas on serverless startup if empty
    try:
        seed_database()
    except Exception as e:
        logger.warning(f"Startup seed skipped or deferred: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    redirect_slashes=False,
    lifespan=lifespan
)

# CORS Configuration allowing Vercel domains, local dev, and custom subdomains
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
if "*" not in origins:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers on /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(bids.router, prefix=settings.API_V1_STR)
app.include_router(vendors.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(mongodb.router, prefix=settings.API_V1_STR)

# Also mount on /api for full reverse compatibility
app.include_router(auth.router, prefix="/api")
app.include_router(bids.router, prefix="/api")
app.include_router(vendors.router, prefix="/api")
app.include_router(compliance.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(mongodb.router, prefix="/api")

# Run automatic seeding on startup
try:
    seed_database()
except Exception as e:
    logger.warning(f"Initial seed notice: {e}")

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    db_status = check_mongodb_connection()
    return {
        "platform": settings.PROJECT_NAME,
        "status": "Online",
        "version": "1.0.0",
        "database": db_status.get("status", "connected"),
        "mongodb_connected": db_status.get("status") == "connected",
        "docs_url": f"{settings.API_V1_STR}/docs"
    }

