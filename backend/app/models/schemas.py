"""
Pydantic models for the bus notification system
"""

from pydantic import BaseModel, Field, validator, EmailStr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, time
from enum import Enum
import uuid

class UserRole(str, Enum):
    """User roles in the system"""
    PASSENGER = "passenger"
    ADMIN = "admin"
    DRIVER = "driver"

class NotificationType(str, Enum):
    """Types of notifications"""
    DELAY = "delay"
    APPROACHING = "approaching"
    DEVIATION = "deviation"
    EMERGENCY = "emergency"
    CANCELLATION = "cancellation"

class TripStatus(str, Enum):
    """Trip status enumeration"""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DELAYED = "delayed"

# Base Models
class BaseDocument(BaseModel):
    """Base document model with common fields"""
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# Location Models
class Coordinate(BaseModel):
    """Geographic coordinates"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class Stop(BaseDocument):
    """Bus stop model"""
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=50)
    location: Coordinate
    address: Optional[str] = None
    amenities: List[str] = Field(default_factory=list)
    is_active: bool = True
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Central Station",
                "code": "CS001",
                "location": {
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                "address": "123 Main St, City, State",
                "amenities": ["shelter", "bench", "digital_display"],
                "is_active": True
            }
        }

class Route(BaseDocument):
    """Bus route model"""
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    stops: List[str] = Field(..., min_items=2)  # Stop IDs in order
    is_active: bool = True
    distance_km: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Downtown Express",
                "code": "DTE001",
                "description": "Express route connecting downtown to suburbs",
                "stops": ["stop1_id", "stop2_id", "stop3_id"],
                "is_active": True,
                "distance_km": 15.5,
                "estimated_duration_minutes": 45
            }
        }

# Schedule Models
class ScheduleEntry(BaseModel):
    """Single schedule entry for a stop"""
    stop_id: str
    scheduled_arrival: time
    scheduled_departure: time
    
class Schedule(BaseDocument):
    """Route schedule model"""
    route_id: str
    service_type: str = Field(..., description="weekday, weekend, holiday")
    direction: str = Field(..., description="inbound, outbound")
    entries: List[ScheduleEntry] = Field(..., min_items=1)
    valid_from: datetime
    valid_until: Optional[datetime] = None
    
    class Config:
        schema_extra = {
            "example": {
                "route_id": "route1_id",
                "service_type": "weekday",
                "direction": "inbound",
                "entries": [
                    {
                        "stop_id": "stop1_id",
                        "scheduled_arrival": "08:00:00",
                        "scheduled_departure": "08:01:00"
                    }
                ],
                "valid_from": "2024-01-01T00:00:00"
            }
        }

# Trip Models
class TripPosition(BaseModel):
    """Current position of a bus on a trip"""
    location: Coordinate
    next_stop_id: str
    distance_to_next_stop_km: float = Field(..., ge=0)
    estimated_arrival: datetime
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class Trip(BaseDocument):
    """Active trip model"""
    route_id: str
    schedule_id: str
    trip_start_time: datetime
    status: TripStatus = TripStatus.SCHEDULED
    current_position: Optional[TripPosition] = None
    delay_minutes: float = 0.0
    next_stop_id: Optional[str] = None
    completed_stops: List[str] = Field(default_factory=list)
    
    class Config:
        schema_extra = {
            "example": {
                "route_id": "route1_id",
                "schedule_id": "schedule1_id",
                "trip_start_time": "2024-01-01T08:00:00",
                "status": "in_progress",
                "delay_minutes": 2.5,
                "next_stop_id": "stop2_id",
                "completed_stops": ["stop1_id"]
            }
        }

# User Models
class UserPreferences(BaseModel):
    """User notification preferences"""
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    delay_threshold_minutes: int = 5
    quiet_hours_start: Optional[time] = None
    quiet_hours_end: Optional[time] = None

class User(BaseDocument):
    """User model"""
    email: EmailStr
    phone: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=200)
    role: UserRole = UserRole.PASSENGER
    is_active: bool = True
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    hashed_password: str
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "phone": "+1234567890",
                "name": "John Doe",
                "role": "passenger",
                "is_active": True,
                "preferences": {
                    "email_notifications": True,
                    "sms_notifications": False,
                    "push_notifications": True,
                    "delay_threshold_minutes": 5
                }
            }
        }

# Subscription Models
class Subscription(BaseDocument):
    """User route subscription"""
    user_id: str
    route_id: str
    stop_ids: List[str] = Field(default_factory=list)  # Specific stops, empty = all stops
    is_active: bool = True
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user1_id",
                "route_id": "route1_id",
                "stop_ids": ["stop1_id", "stop2_id"],
                "is_active": True
            }
        }

# Notification Models
class Notification(BaseDocument):
    """Notification model"""
    user_id: str
    type: NotificationType
    title: str
    message: str
    trip_id: Optional[str] = None
    route_id: Optional[str] = None
    stop_id: Optional[str] = None
    is_read: bool = False
    sent_at: Optional[datetime] = None
    delivery_status: Dict[str, str] = Field(default_factory=dict)  # email, sms, push status
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user1_id",
                "type": "delay",
                "title": "Bus Delay Alert",
                "message": "Your bus on Route DTE001 is delayed by 5 minutes",
                "trip_id": "trip1_id",
                "route_id": "route1_id",
                "stop_id": "stop1_id",
                "is_read": False,
                "delivery_status": {
                    "email": "sent",
                    "push": "delivered"
                }
            }
        }

# Request/Response Models
class UserCreate(BaseModel):
    """User creation request"""
    email: EmailStr
    phone: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=200)
    password: str = Field(..., min_length=8)
    preferences: Optional[UserPreferences] = None

class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: EmailStr
    phone: Optional[str] = None
    name: str
    role: UserRole
    is_active: bool
    preferences: UserPreferences
    created_at: datetime
    
class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class SubscriptionCreate(BaseModel):
    """Subscription creation request"""
    route_id: str
    stop_ids: List[str] = Field(default_factory=list)

class TripPrediction(BaseModel):
    """Trip delay prediction"""
    trip_id: str
    route_id: str
    predicted_delay_minutes: float
    confidence: float = Field(..., ge=0, le=1)
    next_stop_id: str
    estimated_arrival: datetime
    factors: Dict[str, Any] = Field(default_factory=dict)

class RouteStatus(BaseModel):
    """Real-time route status"""
    route_id: str
    active_trips: List[Trip]
    average_delay_minutes: float
    total_buses: int
    last_updated: datetime

# WebSocket Models
class WebSocketMessage(BaseModel):
    """WebSocket message structure"""
    type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
class TripUpdate(BaseModel):
    """Trip update for WebSocket"""
    trip_id: str
    route_id: str
    current_position: Optional[TripPosition] = None
    delay_minutes: float
    next_stop_id: Optional[str] = None
    estimated_arrivals: Dict[str, datetime] = Field(default_factory=dict)  # stop_id -> eta
    
class NotificationAlert(BaseModel):
    """Notification alert for WebSocket"""
    user_id: str
    notification: Notification