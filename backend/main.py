"""
FastAPI Backend for Bus Delay Prediction and Notification System
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn
import socketio
from datetime import datetime
import logging

# Import custom modules
from app.database.mongodb import init_database, close_database
from app.core.config import settings
from app.api.routes import api_router
from app.websocket.manager import websocket_manager
from app.simulation.engine import simulation_engine
from app.services.realtime import realtime_service

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
    
    # Start real-time service
    await realtime_service.start()
    logger.info("✅ Real-time service started")
    
    logger.info("🚀 Bus Notification System is running!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Bus Notification System...")
    
    # Stop real-time service
    await realtime_service.stop()
    logger.info("✅ Real-time service stopped")
    
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

# Mount WebSocket app
sio_app = socketio.ASGIApp(websocket_manager.sio, app)
app.mount("/socket.io", sio_app)

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
    # Get real-time service stats
    rt_stats = await realtime_service.get_realtime_stats()
    ws_stats = websocket_manager.get_connection_stats()
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "simulation": "running",
            "websocket": f"active ({ws_stats['total_connections']} connections)",
            "realtime_service": rt_stats.get("service_status", "unknown"),
            "ml_engine": "ready"
        },
        "stats": {
            "active_trips": rt_stats.get("active_trips", 0),
            "websocket_connections": ws_stats["total_connections"],
            "tracked_locations": rt_stats.get("tracked_locations", 0)
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