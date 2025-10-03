"""
Real-time Service Manager

Handles background tasks for real-time trip updates, delay predictions,
and WebSocket communication.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import random
import json

from app.database.mongodb import database_manager
from app.ml.prediction_engine import prediction_engine
from app.websocket import websocket_manager
from app.websocket.schemas import TripUpdate, NotificationAlert, BusLocation, StopArrival
from app.models.schemas import TripStatus

logger = logging.getLogger(__name__)

class RealTimeService:
    """Manages real-time trip tracking and updates"""
    
    def __init__(self):
        self.is_running = False
        self.background_tasks: List[asyncio.Task] = []
        self.active_trips: Dict[str, Dict[str, Any]] = {}
        self.update_interval = 30  # seconds
        
    async def start(self):
        """Start the real-time service"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Starting real-time service...")
        
        # Start background tasks
        trip_monitor_task = asyncio.create_task(self._monitor_trips())
        prediction_task = asyncio.create_task(self._update_predictions())
        notification_task = asyncio.create_task(self._process_notifications())
        
        self.background_tasks.extend([
            trip_monitor_task,
            prediction_task,
            notification_task
        ])
        
        logger.info("Real-time service started")
    
    async def stop(self):
        """Stop the real-time service"""
        self.is_running = False
        
        # Cancel all background tasks
        for task in self.background_tasks:
            task.cancel()
        
        # Wait for tasks to complete
        if self.background_tasks:
            await asyncio.gather(*self.background_tasks, return_exceptions=True)
        
        self.background_tasks.clear()
        logger.info("Real-time service stopped")
    
    async def _monitor_trips(self):
        """Monitor active trips and generate updates"""
        while self.is_running:
            try:
                # Get active trips from database
                trips_collection = database_manager.db.trips
                active_trips = await trips_collection.find({
                    "status": TripStatus.IN_PROGRESS
                }).to_list(length=None)
                
                for trip in active_trips:
                    trip_id = str(trip["_id"])
                    await self._update_trip_location(trip_id, trip)
                    
                await asyncio.sleep(self.update_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error monitoring trips: {e}")
                await asyncio.sleep(5)
    
    async def _update_trip_location(self, trip_id: str, trip_data: Dict[str, Any]):
        """Update trip location and status"""
        try:
            route_id = trip_data.get("route_id")
            
            # Simulate location update (in real system, this would come from GPS)
            current_location = self._simulate_bus_movement(trip_id, trip_data)
            
            # Get current and next stops
            current_stop_id, next_stop_id = await self._get_trip_stops(trip_id, trip_data)
            
            # Calculate delay using ML prediction
            delay_prediction = await prediction_engine.predict_delay({
                "route_id": route_id,
                "trip_id": trip_id,
                "current_time": datetime.utcnow(),
                "weather_condition": "clear",  # Would come from weather API
                "traffic_level": random.uniform(0.3, 0.9),
                "passenger_load": random.randint(5, 40)
            })
            
            current_delay = delay_prediction.get("predicted_delay_minutes", 0)
            
            # Create trip update
            trip_update = TripUpdate(
                trip_id=trip_id,
                route_id=route_id,
                current_stop_id=current_stop_id,
                next_stop_id=next_stop_id,
                current_location=current_location,
                speed=random.uniform(20, 50),  # km/h
                heading=random.uniform(0, 360),  # degrees
                delay_minutes=current_delay,
                predicted_delay_minutes=current_delay,
                status="active" if current_delay < 10 else "delayed",
                passengers_count=random.randint(5, 40),
                last_updated=datetime.utcnow()
            )
            
            # Emit WebSocket update
            await websocket_manager.emit_trip_update(trip_update)
            
            # Update database
            await self._update_trip_in_database(trip_id, trip_update)
            
            # Check for delay notifications
            if current_delay > 5:  # 5+ minutes delay
                await self._create_delay_notification(trip_id, route_id, current_delay)
            
        except Exception as e:
            logger.error(f"Error updating trip location for {trip_id}: {e}")
    
    def _simulate_bus_movement(self, trip_id: str, trip_data: Dict[str, Any]) -> Dict[str, float]:
        """Simulate realistic bus movement along route"""
        # In a real system, this would be actual GPS data
        # For simulation, we'll create realistic movement patterns
        
        if trip_id not in self.active_trips:
            # Initialize trip with starting location
            self.active_trips[trip_id] = {
                "lat": 40.7128 + random.uniform(-0.01, 0.01),  # NYC area
                "lng": -74.0060 + random.uniform(-0.01, 0.01),
                "last_update": datetime.utcnow()
            }
        
        trip_state = self.active_trips[trip_id]
        
        # Simulate movement (small incremental changes)
        lat_change = random.uniform(-0.0001, 0.0001)
        lng_change = random.uniform(-0.0001, 0.0001)
        
        trip_state["lat"] += lat_change
        trip_state["lng"] += lng_change
        trip_state["last_update"] = datetime.utcnow()
        
        return {
            "lat": trip_state["lat"],
            "lng": trip_state["lng"]
        }
    
    async def _get_trip_stops(self, trip_id: str, trip_data: Dict[str, Any]) -> tuple:
        """Get current and next stops for a trip"""
        try:
            # Get route stops
            routes_collection = database_manager.db.routes
            route = await routes_collection.find_one({"_id": trip_data.get("route_id")})
            
            if not route or not route.get("stops"):
                return None, None
            
            stops = route["stops"]
            
            # Simulate progression through stops
            current_time = datetime.utcnow()
            trip_start = trip_data.get("start_time", current_time)
            minutes_elapsed = (current_time - trip_start).total_seconds() / 60
            
            # Estimate current position (assuming 2 minutes per stop)
            stop_index = min(int(minutes_elapsed / 2), len(stops) - 1)
            current_stop_id = stops[stop_index] if stop_index < len(stops) else stops[-1]
            next_stop_id = stops[stop_index + 1] if stop_index + 1 < len(stops) else None
            
            return str(current_stop_id), str(next_stop_id) if next_stop_id else None
            
        except Exception as e:
            logger.error(f"Error getting trip stops: {e}")
            return None, None
    
    async def _update_trip_in_database(self, trip_id: str, trip_update: TripUpdate):
        """Update trip information in database"""
        try:
            trips_collection = database_manager.db.trips
            
            update_data = {
                "current_location": trip_update.current_location,
                "current_stop_id": trip_update.current_stop_id,
                "next_stop_id": trip_update.next_stop_id,
                "delay_minutes": trip_update.delay_minutes,
                "last_updated": trip_update.last_updated,
                "status": trip_update.status
            }
            
            await trips_collection.update_one(
                {"_id": trip_id},
                {"$set": update_data}
            )
            
        except Exception as e:
            logger.error(f"Error updating trip in database: {e}")
    
    async def _create_delay_notification(self, trip_id: str, route_id: str, delay_minutes: float):
        """Create notifications for significant delays"""
        try:
            # Get users subscribed to this route
            subscriptions_collection = database_manager.db.subscriptions
            subscriptions = await subscriptions_collection.find({
                "route_id": route_id,
                "is_active": True
            }).to_list(length=None)
            
            # Create notifications for each subscriber
            notifications_collection = database_manager.db.notifications
            
            for subscription in subscriptions:
                user_id = subscription["user_id"]
                
                # Check if we already sent a delay notification for this trip
                existing_notification = await notifications_collection.find_one({
                    "user_id": user_id,
                    "trip_id": trip_id,
                    "type": "delay"
                })
                
                if existing_notification:
                    continue  # Already notified
                
                # Create notification
                notification_data = {
                    "user_id": user_id,
                    "title": f"Bus Delay Alert",
                    "message": f"Your bus on route {route_id} is delayed by {delay_minutes:.0f} minutes",
                    "type": "delay",
                    "priority": "high" if delay_minutes > 15 else "normal",
                    "route_id": route_id,
                    "trip_id": trip_id,
                    "is_read": False,
                    "created_at": datetime.utcnow()
                }
                
                result = await notifications_collection.insert_one(notification_data)
                notification_id = str(result.inserted_id)
                
                # Send WebSocket notification
                notification_alert = NotificationAlert(
                    user_id=user_id,
                    notification_id=notification_id,
                    title=notification_data["title"],
                    message=notification_data["message"],
                    type=notification_data["type"],
                    priority=notification_data["priority"],
                    route_id=route_id,
                    trip_id=trip_id
                )
                
                await websocket_manager.emit_notification(notification_alert)
                
        except Exception as e:
            logger.error(f"Error creating delay notification: {e}")
    
    async def _update_predictions(self):
        """Periodically update ML predictions"""
        while self.is_running:
            try:
                # Retrain models with latest data every hour
                await prediction_engine.retrain_models()
                logger.info("ML models updated with latest data")
                
                await asyncio.sleep(3600)  # 1 hour
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error updating predictions: {e}")
                await asyncio.sleep(300)  # 5 minutes
    
    async def _process_notifications(self):
        """Process and clean up old notifications"""
        while self.is_running:
            try:
                # Clean up old notifications (older than 30 days)
                cutoff_date = datetime.utcnow() - timedelta(days=30)
                notifications_collection = database_manager.db.notifications
                
                result = await notifications_collection.delete_many({
                    "created_at": {"$lt": cutoff_date}
                })
                
                if result.deleted_count > 0:
                    logger.info(f"Cleaned up {result.deleted_count} old notifications")
                
                await asyncio.sleep(86400)  # 24 hours
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error processing notifications: {e}")
                await asyncio.sleep(3600)  # 1 hour
    
    async def get_realtime_stats(self) -> Dict[str, Any]:
        """Get real-time service statistics"""
        try:
            trips_collection = database_manager.db.trips
            notifications_collection = database_manager.db.notifications
            
            # Count active trips
            active_trips_count = await trips_collection.count_documents({
                "status": TripStatus.IN_PROGRESS
            })
            
            # Count unread notifications (last 24 hours)
            yesterday = datetime.utcnow() - timedelta(hours=24)
            unread_notifications = await notifications_collection.count_documents({
                "is_read": False,
                "created_at": {"$gte": yesterday}
            })
            
            # WebSocket stats
            ws_stats = websocket_manager.get_connection_stats()
            
            return {
                "service_status": "running" if self.is_running else "stopped",
                "active_trips": active_trips_count,
                "tracked_locations": len(self.active_trips),
                "unread_notifications_24h": unread_notifications,
                "websocket_connections": ws_stats["total_connections"],
                "update_interval_seconds": self.update_interval,
                "background_tasks": len(self.background_tasks),
                "last_updated": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error getting realtime stats: {e}")
            return {
                "service_status": "error",
                "error": str(e),
                "last_updated": datetime.utcnow()
            }

# Global real-time service instance
realtime_service = RealTimeService()