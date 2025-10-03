"""
Simple FastAPI Backend for BusNotify Development
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
import json

# Create FastAPI app
app = FastAPI(
    title="BusNotify API",
    description="Smart Campus Bus Tracking API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
mock_routes = [
    {
        "id": "route-42",
        "name": "Route 42",
        "description": "Main Campus ↔ Engineering Building",
        "color": "#3B82F6",
        "buses": 8,
        "frequency": "15 min",
        "stops": 12,
        "hours": "7:00 AM - 10:00 PM"
    },
    {
        "id": "route-15", 
        "name": "Route 15",
        "description": "Dormitories ↔ Library Complex",
        "color": "#10B981",
        "buses": 6,
        "frequency": "20 min", 
        "stops": 8,
        "hours": "6:30 AM - 11:30 PM"
    },
    {
        "id": "route-88",
        "name": "Route 88", 
        "description": "Medical Center ↔ Sports Complex",
        "color": "#8B5CF6",
        "buses": 4,
        "frequency": "25 min",
        "stops": 10, 
        "hours": "8:00 AM - 9:00 PM"
    },
    {
        "id": "route-23",
        "name": "Route 23",
        "description": "Student Housing ↔ Academic Center", 
        "color": "#F59E0B",
        "buses": 6,
        "frequency": "12 min",
        "stops": 15,
        "hours": "7:30 AM - 10:30 PM"
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
        "occupancy": 23
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
        "occupancy": 18
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
        "occupancy": 12
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
        "occupancy": 31
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
        "occupancy": 28
    }
]

# API Routes
@app.get("/")
async def root():
    return {
        "message": "BusNotify API is running!",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/routes")
async def get_routes():
    return {"routes": mock_routes}

@app.get("/api/routes/{route_id}")
async def get_route(route_id: str):
    route = next((r for r in mock_routes if r["id"] == route_id), None)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"route": route}

@app.get("/api/buses")
async def get_buses():
    return {"buses": mock_buses}

@app.get("/api/buses/{bus_id}")
async def get_bus(bus_id: str):
    bus = next((b for b in mock_buses if b["id"] == bus_id), None)
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    return {"bus": bus}

@app.get("/api/routes/{route_id}/buses")
async def get_route_buses(route_id: str):
    route_buses = [b for b in mock_buses if b["route_id"] == route_id]
    return {"buses": route_buses}

@app.get("/api/predictions/{route_id}")
async def get_predictions(route_id: str):
    return {
        "route_id": route_id,
        "predictions": [
            {"stop_name": "Main Campus", "eta": "3 minutes", "confidence": 0.87},
            {"stop_name": "Engineering Building", "eta": "8 minutes", "confidence": 0.92},
            {"stop_name": "Library", "eta": "15 minutes", "confidence": 0.78}
        ],
        "accuracy": 87.3,
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "database": "connected",
            "real_time": "active"
        }
    }

if __name__ == "__main__":
    print("🚌 Starting BusNotify Development Server...")
    print("📍 API will be available at: http://localhost:8000")
    print("📖 API Documentation at: http://localhost:8000/docs")
    print("🔄 Auto-reload enabled for development")
    
    uvicorn.run(
        "simple_backend:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )