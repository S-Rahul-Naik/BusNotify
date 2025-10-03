"""
Simple FastAPI Backend for Bus Delay Prediction and Notification System
(Development version without MongoDB dependency)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="BusNotify API",
    description="Smart Campus Bus Tracking and Delay Prediction System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for development
mock_routes = [
    {
        "id": "route-42",
        "name": "Route 42", 
        "description": "Main Campus ↔ Engineering Building",
        "color": "#3B82F6",
        "buses": 8,
        "frequency": "15 min",
        "stops": 12,
        "hours": "7:00 AM - 10:00 PM",
        "active": True
    },
    {
        "id": "route-15",
        "name": "Route 15",
        "description": "Dormitories ↔ Library Complex", 
        "color": "#10B981",
        "buses": 6,
        "frequency": "20 min",
        "stops": 8,
        "hours": "6:30 AM - 11:30 PM",
        "active": True
    },
    {
        "id": "route-88",
        "name": "Route 88",
        "description": "Medical Center ↔ Sports Complex",
        "color": "#8B5CF6", 
        "buses": 4,
        "frequency": "25 min",
        "stops": 10,
        "hours": "8:00 AM - 9:00 PM",
        "active": True
    },
    {
        "id": "route-23",
        "name": "Route 23",
        "description": "Student Housing ↔ Academic Center",
        "color": "#F59E0B",
        "buses": 6,
        "frequency": "12 min", 
        "stops": 15,
        "hours": "7:30 AM - 10:30 PM",
        "active": True
    }
]

mock_buses = [
    {
        "id": "bus-001",
        "route_id": "route-42",
        "route_name": "Route 42",
        "current_stop": "Main Campus",
        "next_stop": "Engineering Building",
        "eta": "3 minutes",
        "delay": 0,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "capacity": 45,
        "occupancy": 23,
        "status": "on_time"
    },
    {
        "id": "bus-002",
        "route_id": "route-15", 
        "route_name": "Route 15",
        "current_stop": "Library Complex",
        "next_stop": "Dormitories",
        "eta": "5 minutes",
        "delay": 2,
        "latitude": 40.7589,
        "longitude": -73.9851,
        "capacity": 40,
        "occupancy": 18,
        "status": "delayed"
    },
    {
        "id": "bus-003",
        "route_id": "route-88",
        "route_name": "Route 88", 
        "current_stop": "Sports Complex",
        "next_stop": "Medical Center",
        "eta": "7 minutes",
        "delay": 0,
        "latitude": 40.7505,
        "longitude": -73.9934,
        "capacity": 35,
        "occupancy": 12,
        "status": "on_time"
    },
    {
        "id": "bus-004",
        "route_id": "route-23",
        "route_name": "Route 23",
        "current_stop": "Academic Center", 
        "next_stop": "Student Housing",
        "eta": "2 minutes",
        "delay": 1,
        "latitude": 40.7282,
        "longitude": -73.7949,
        "capacity": 50,
        "occupancy": 31,
        "status": "delayed"
    },
    {
        "id": "bus-005",
        "route_id": "route-42",
        "route_name": "Route 42",
        "current_stop": "Engineering Building",
        "next_stop": "Main Campus",
        "eta": "4 minutes", 
        "delay": 0,
        "latitude": 40.7411,
        "longitude": -74.0023,
        "capacity": 45,
        "occupancy": 28,
        "status": "on_time"
    }
]

# API Routes
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "🚌 BusNotify API is running!",
        "version": "1.0.0",
        "description": "Smart Campus Bus Tracking and Delay Prediction System",
        "docs": "/docs",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "routes": "/api/routes",
            "buses": "/api/buses", 
            "predictions": "/api/predictions/{route_id}",
            "health": "/api/health"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "database": "mock_mode",
            "websocket": "disabled",
            "ml_predictions": "mock_mode"
        },
        "version": "1.0.0"
    }

@app.get("/api/routes")
async def get_routes():
    """Get all campus bus routes"""
    return {
        "success": True,
        "count": len(mock_routes),
        "routes": mock_routes
    }

@app.get("/api/routes/{route_id}")
async def get_route(route_id: str):
    """Get specific route by ID"""
    route = next((r for r in mock_routes if r["id"] == route_id), None)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route {route_id} not found")
    return {
        "success": True,
        "route": route
    }

@app.get("/api/buses")
async def get_buses():
    """Get all active buses"""
    return {
        "success": True,
        "count": len(mock_buses),
        "buses": mock_buses
    }

@app.get("/api/buses/{bus_id}")
async def get_bus(bus_id: str):
    """Get specific bus by ID"""
    bus = next((b for b in mock_buses if b["id"] == bus_id), None)
    if not bus:
        raise HTTPException(status_code=404, detail=f"Bus {bus_id} not found")
    return {
        "success": True,
        "bus": bus
    }

@app.get("/api/routes/{route_id}/buses")
async def get_route_buses(route_id: str):
    """Get all buses for a specific route"""
    # Check if route exists
    route = next((r for r in mock_routes if r["id"] == route_id), None)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route {route_id} not found")
    
    route_buses = [b for b in mock_buses if b["route_id"] == route_id]
    return {
        "success": True,
        "route_id": route_id,
        "route_name": route["name"],
        "count": len(route_buses),
        "buses": route_buses
    }

@app.get("/api/predictions/{route_id}")
async def get_predictions(route_id: str):
    """Get AI delay predictions for a route"""
    # Check if route exists
    route = next((r for r in mock_routes if r["id"] == route_id), None)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route {route_id} not found")
    
    # Mock prediction data
    predictions = [
        {"stop_name": "Main Campus", "eta": "3 minutes", "confidence": 0.87, "delay_probability": 0.15},
        {"stop_name": "Engineering Building", "eta": "8 minutes", "confidence": 0.92, "delay_probability": 0.08},
        {"stop_name": "Library Complex", "eta": "15 minutes", "confidence": 0.78, "delay_probability": 0.25},
        {"stop_name": "Academic Center", "eta": "22 minutes", "confidence": 0.85, "delay_probability": 0.12}
    ]
    
    return {
        "success": True,
        "route_id": route_id,
        "route_name": route["name"],
        "predictions": predictions,
        "overall_accuracy": 87.3,
        "model_version": "v2.1",
        "last_updated": datetime.now().isoformat(),
        "factors_considered": ["weather", "traffic", "time_of_day", "historical_patterns"]
    }

@app.get("/api/notifications")
async def get_notifications():
    """Get recent notifications"""
    mock_notifications = [
        {
            "id": "notif-001",
            "type": "delay",
            "route_id": "route-15",
            "route_name": "Route 15",
            "message": "Route 15 experiencing 5-minute delay due to traffic",
            "severity": "medium",
            "timestamp": datetime.now().isoformat()
        },
        {
            "id": "notif-002", 
            "type": "arrival",
            "route_id": "route-42",
            "route_name": "Route 42",
            "message": "Bus arriving at Main Campus in 2 minutes",
            "severity": "info",
            "timestamp": datetime.now().isoformat()
        }
    ]
    
    return {
        "success": True,
        "notifications": mock_notifications
    }

if __name__ == "__main__":
    logger.info("🚌 Starting BusNotify Development Server...")
    logger.info("📍 API URL: http://localhost:8000")
    logger.info("📖 API Documentation: http://localhost:8000/docs")
    logger.info("🔧 Interactive API: http://localhost:8000/redoc")
    logger.info("💾 Running in mock data mode (no database required)")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )