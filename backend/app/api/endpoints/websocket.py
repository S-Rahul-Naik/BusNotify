"""
WebSocket API endpoints for real-time communication
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Dict, Any

from app.core.security import get_current_user
from app.models.schemas import User
from app.websocket import websocket_manager
from app.services.realtime import realtime_service

router = APIRouter(prefix="/websocket", tags=["WebSocket"])

@router.get("/stats")
async def get_websocket_stats(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get WebSocket connection statistics"""
    
    # Get WebSocket connection stats
    ws_stats = websocket_manager.get_connection_stats()
    
    # Get real-time service stats
    rt_stats = await realtime_service.get_realtime_stats()
    
    return {
        "websocket": ws_stats,
        "realtime_service": rt_stats,
        "timestamp": datetime.utcnow()
    }

@router.get("/health")
async def websocket_health_check() -> Dict[str, Any]:
    """Check WebSocket service health"""
    
    ws_stats = websocket_manager.get_connection_stats()
    is_healthy = ws_stats["total_connections"] >= 0  # Basic health check
    
    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "websocket_active": True,
        "total_connections": ws_stats["total_connections"],
        "uptime_seconds": ws_stats["uptime_seconds"],
        "timestamp": datetime.utcnow()
    }

@router.post("/broadcast")
async def broadcast_system_alert(
    alert_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Broadcast system alert to all connected clients (admin only)"""
    
    # Check admin permissions
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    message = alert_data.get("message", "System Alert")
    alert_type = alert_data.get("type", "info")
    
    # Broadcast to all clients
    await websocket_manager.emit_system_alert(message, alert_type)
    
    return {
        "status": "success",
        "message": "Alert broadcasted to all connected clients"
    }

@router.get("/connections")
async def get_active_connections(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get details about active WebSocket connections (admin only)"""
    
    # Check admin permissions
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    stats = websocket_manager.get_connection_stats()
    
    return {
        "summary": stats,
        "details": {
            "user_sessions": len(websocket_manager.user_sessions),
            "route_subscribers": len(websocket_manager.route_subscribers),
            "trip_subscribers": len(websocket_manager.trip_subscribers)
        },
        "timestamp": datetime.utcnow()
    }