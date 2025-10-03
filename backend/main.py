"""
FastAPI Backend for Bus Delay Prediction and Notification System
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime
import logging

# Import custom modules
from app.database.mongodb import init_database, close_database
from app.core.config import settings
from app.api.routes import api_router
from app.websocket.manager import websocket_manager
from app.simulation.engine import simulation_engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚌 Starting Bus Notification System...")
    
    # Initialize database
    await init_database()
    logger.info("✅ Database initialized")
    
    # Start simulation engine
    await simulation_engine.start()
    logger.info("✅ Simulation engine started")
    
    # Start WebSocket manager
    await websocket_manager.start()
    logger.info("✅ WebSocket manager started")
    
    logger.info("🚀 Bus Notification System is running!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Bus Notification System...")
    
    # Stop simulation engine
    await simulation_engine.stop()
    logger.info("✅ Simulation engine stopped")
    
    # Stop WebSocket manager
    await websocket_manager.stop()
    logger.info("✅ WebSocket manager stopped")
    
    # Close database
    await close_database()
    logger.info("✅ Database closed")

# Create FastAPI app
app = FastAPI(
    title="Bus Delay Prediction & Notification System",
    description="A software-only bus delay prediction and real-time passenger notification system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Bus Delay Prediction & Notification System",
        "status": "active",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "simulation": "running",
            "websocket": "active",
            "ml_engine": "ready"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )