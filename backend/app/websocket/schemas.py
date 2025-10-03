"""
WebSocket schemas for real-time communication

Defines data structures for WebSocket messages and real-time updates.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class WebSocketMessage(BaseModel):
    """Base WebSocket message structure"""
    type: str = Field(..., description="Message type")
    data: Dict[str, Any] = Field(default_factory=dict, description="Message data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")

class TripUpdate(BaseModel):
    """Real-time trip update message"""
    trip_id: str = Field(..., description="Trip identifier")
    route_id: str = Field(..., description="Route identifier")
    current_stop_id: Optional[str] = Field(None, description="Current stop ID")
    next_stop_id: Optional[str] = Field(None, description="Next stop ID")
    current_location: Optional[Dict[str, float]] = Field(None, description="Current GPS location")
    speed: Optional[float] = Field(None, description="Current speed in km/h")
    heading: Optional[float] = Field(None, description="Current heading in degrees")
    delay_minutes: Optional[float] = Field(None, description="Current delay in minutes")
    predicted_delay_minutes: Optional[float] = Field(None, description="Predicted delay in minutes")
    status: str = Field(..., description="Trip status (active, delayed, completed, cancelled)")
    passengers_count: Optional[int] = Field(None, description="Current passenger count")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

class NotificationAlert(BaseModel):
    """User notification alert"""
    user_id: str = Field(..., description="Target user ID")
    notification_id: str = Field(..., description="Notification identifier")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    type: str = Field(..., description="Notification type (delay, arrival, service_alert)")
    priority: str = Field(default="normal", description="Priority level (low, normal, high, urgent)")
    route_id: Optional[str] = Field(None, description="Related route ID")
    trip_id: Optional[str] = Field(None, description="Related trip ID")
    stop_id: Optional[str] = Field(None, description="Related stop ID")
    action_url: Optional[str] = Field(None, description="Optional action URL")
    expires_at: Optional[datetime] = Field(None, description="Notification expiration time")

class RouteStatus(BaseModel):
    """Route operational status"""
    route_id: str = Field(..., description="Route identifier")
    status: str = Field(..., description="Route status (active, disrupted, suspended)")
    active_trips: int = Field(default=0, description="Number of active trips")
    average_delay: Optional[float] = Field(None, description="Average delay across all trips")
    service_alerts: List[str] = Field(default_factory=list, description="Active service alerts")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

class SystemAlert(BaseModel):
    """System-wide alert message"""
    alert_id: str = Field(..., description="Alert identifier")
    type: str = Field(..., description="Alert type (maintenance, emergency, weather)")
    severity: str = Field(..., description="Severity level (info, warning, critical)")
    title: str = Field(..., description="Alert title")
    message: str = Field(..., description="Alert message")
    affected_routes: List[str] = Field(default_factory=list, description="Affected route IDs")
    start_time: datetime = Field(default_factory=datetime.utcnow, description="Alert start time")
    end_time: Optional[datetime] = Field(None, description="Alert end time")
    auto_dismiss: bool = Field(default=False, description="Auto-dismiss when end_time reached")

class ConnectionStatus(BaseModel):
    """Client connection status"""
    connected: bool = Field(..., description="Connection status")
    authenticated: bool = Field(default=False, description="Authentication status")
    user_id: Optional[str] = Field(None, description="Authenticated user ID")
    connected_at: datetime = Field(default_factory=datetime.utcnow, description="Connection timestamp")
    subscribed_routes: List[str] = Field(default_factory=list, description="Subscribed route IDs")
    subscribed_trips: List[str] = Field(default_factory=list, description="Subscribed trip IDs")

class SubscriptionRequest(BaseModel):
    """WebSocket subscription request"""
    type: str = Field(..., description="Subscription type (route, trip, user)")
    target_id: str = Field(..., description="Target ID (route_id, trip_id, user_id)")
    filters: Optional[Dict[str, Any]] = Field(None, description="Optional filters")

class SubscriptionResponse(BaseModel):
    """WebSocket subscription response"""
    type: str = Field(..., description="Subscription type")
    target_id: str = Field(..., description="Target ID")
    status: str = Field(..., description="Subscription status (confirmed, denied)")
    message: Optional[str] = Field(None, description="Status message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")

class BusLocation(BaseModel):
    """Real-time bus location update"""
    trip_id: str = Field(..., description="Trip identifier")
    vehicle_id: Optional[str] = Field(None, description="Vehicle identifier")
    location: Dict[str, float] = Field(..., description="GPS coordinates (lat, lng)")
    heading: Optional[float] = Field(None, description="Vehicle heading in degrees")
    speed: Optional[float] = Field(None, description="Speed in km/h")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Location timestamp")

class StopArrival(BaseModel):
    """Stop arrival prediction"""
    trip_id: str = Field(..., description="Trip identifier")
    stop_id: str = Field(..., description="Stop identifier")
    scheduled_time: datetime = Field(..., description="Scheduled arrival time")
    predicted_time: datetime = Field(..., description="Predicted arrival time")
    delay_minutes: float = Field(..., description="Delay in minutes")
    confidence: float = Field(..., description="Prediction confidence (0-1)")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

class ServiceAlert(BaseModel):
    """Service disruption alert"""
    alert_id: str = Field(..., description="Alert identifier")
    type: str = Field(..., description="Alert type (delay, cancellation, detour, weather)")
    severity: str = Field(..., description="Severity (minor, major, severe)")
    title: str = Field(..., description="Alert title")
    description: str = Field(..., description="Detailed description")
    affected_routes: List[str] = Field(..., description="Affected route IDs")
    affected_stops: List[str] = Field(default_factory=list, description="Affected stop IDs")
    start_time: datetime = Field(default_factory=datetime.utcnow, description="Alert start time")
    end_time: Optional[datetime] = Field(None, description="Expected end time")
    url: Optional[str] = Field(None, description="More information URL")

class WebSocketStats(BaseModel):
    """WebSocket connection statistics"""
    total_connections: int = Field(..., description="Total active connections")
    authenticated_connections: int = Field(..., description="Authenticated connections")
    anonymous_connections: int = Field(..., description="Anonymous connections")
    unique_users: int = Field(..., description="Unique authenticated users")
    route_subscriptions: int = Field(..., description="Active route subscriptions")
    trip_subscriptions: int = Field(..., description="Active trip subscriptions")
    uptime_seconds: float = Field(..., description="WebSocket server uptime")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Stats timestamp")