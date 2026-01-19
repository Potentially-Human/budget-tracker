from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import engine, Base
from app.api import auth, peer_groups, ai_insights, transactions, voice

# for later, when actually importing functions/endpoints
# from app.api import auth, transactions, budgets, voice, insights, circles


settings = get_settings()


# to create database automatically upon startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    print("Starting up...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered budget tracker to help achieve your New Year's financial resolutions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - LATER
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
# app.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
app.include_router(voice.router, prefix="/voice", tags=["Voice Input"])
app.include_router(ai_insights.router, prefix="/insights", tags=["AI Insights"])
app.include_router(peer_groups.router, prefix="/circles", tags=["Spending Circles"])


@app.get("/")
async def root():
    return {
        "message": "Budget Tracker API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# to run uvicorn
# uvicorn app.main:app --reload