"""
WebSocket Manager for Real-time Communication

This module handles WebSocket connections, room management, and real-time event broadcasting.
"""

import asyncio
import logging
from typing import Dict, Set, List, Any, Optional
from datetime import datetime
import json
import socketio
from socketio import AsyncServer

from app.core.config import settings
from app.core.security import security_manager
from app.models.schemas import TripUpdate, NotificationAlert, WebSocketMessage

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections and real-time communication"""
    
    def __init__(self):
        self.sio = AsyncServer(
            cors_allowed_origins=settings.ALLOWED_ORIGINS,
            logger=True,
            engineio_logger=True
        )
        
        # Connection tracking
        self.connected_clients: Dict[str, Dict[str, Any]] = {}  # sid -> client_info
        self.user_sessions: Dict[str, Set[str]] = {}  # user_id -> set of session_ids
        self.route_subscribers: Dict[str, Set[str]] = {}  # route_id -> set of session_ids
        self.trip_subscribers: Dict[str, Set[str]] = {}  # trip_id -> set of session_ids
        
        # Setup event handlers
        self._setup_event_handlers()
        
        # Background tasks
        self.background_tasks: List[asyncio.Task] = []
        self.is_running = False
    
    def _setup_event_handlers(self):
        """Setup WebSocket event handlers"""
        
        @self.sio.event
        async def connect(sid, environ, auth):
            """Handle client connection"""
            logger.info(f"Client {sid} attempting to connect")
            
            # Authenticate client if token provided
            client_info = {
                "sid": sid,
                "connected_at": datetime.utcnow(),
                "user_id": None,
                "authenticated": False,
                "subscribed_routes": set(),
                "subscribed_trips": set()
            }
            
            if auth and "token" in auth:
                try:
                    # Verify JWT token
                    payload = security_manager.verify_token(auth["token"])
                    user_id = payload.get("sub")
                    
                    if user_id:
                        client_info["user_id"] = user_id
                        client_info["authenticated"] = True
                        
                        # Track user sessions
                        if user_id not in self.user_sessions:
                            self.user_sessions[user_id] = set()
                        self.user_sessions[user_id].add(sid)
                        
                        logger.info(f"Client {sid} authenticated as user {user_id}")
                    
                except Exception as e:
                    logger.warning(f"Authentication failed for client {sid}: {e}")
            
            self.connected_clients[sid] = client_info
            
            # Send connection status
            await self.sio.emit('connection_status', {
                'connected': True,
                'authenticated': client_info["authenticated"],
                'timestamp': datetime.utcnow().isoformat()
            }, to=sid)
            
            logger.info(f"Client {sid} connected successfully")
        
        @self.sio.event
        async def disconnect(sid):
            """Handle client disconnection"""
            logger.info(f"Client {sid} disconnecting")
            
            client_info = self.connected_clients.get(sid, {})
            user_id = client_info.get("user_id")
            
            # Remove from user sessions
            if user_id and user_id in self.user_sessions:
                self.user_sessions[user_id].discard(sid)
                if not self.user_sessions[user_id]:
                    del self.user_sessions[user_id]
            
            # Remove from route subscriptions
            subscribed_routes = client_info.get("subscribed_routes", set())
            for route_id in subscribed_routes:
                if route_id in self.route_subscribers:
                    self.route_subscribers[route_id].discard(sid)
                    if not self.route_subscribers[route_id]:
                        del self.route_subscribers[route_id]
            
            # Remove from trip subscriptions
            subscribed_trips = client_info.get("subscribed_trips", set())
            for trip_id in subscribed_trips:
                if trip_id in self.trip_subscribers:
                    self.trip_subscribers[trip_id].discard(sid)
                    if not self.trip_subscribers[trip_id]:
                        del self.trip_subscribers[trip_id]
            
            # Remove client
            del self.connected_clients[sid]
            
            logger.info(f"Client {sid} disconnected")
        
        @self.sio.event
        async def join_user_room(sid, data):
            """Join user-specific room for notifications"""
            try:
                user_id = data.get("user_id")
                client_info = self.connected_clients.get(sid, {})
                
                if not client_info.get("authenticated"):
                    await self.sio.emit('error', {
                        'message': 'Authentication required'
                    }, to=sid)
                    return
                
                if client_info.get("user_id") != user_id:
                    await self.sio.emit('error', {
                        'message': 'Unauthorized'
                    }, to=sid)
                    return
                
                await self.sio.enter_room(sid, f"user_{user_id}")
                logger.info(f"Client {sid} joined user room {user_id}")
                
            except Exception as e:
                logger.error(f"Error joining user room: {e}")
                await self.sio.emit('error', {
                    'message': 'Failed to join user room'
                }, to=sid)
        
        @self.sio.event
        async def subscribe_route(sid, data):
            """Subscribe to route updates"""
            try:
                route_id = data.get("route_id")
                if not route_id:
                    await self.sio.emit('error', {
                        'message': 'Route ID required'
                    }, to=sid)
                    return
                
                client_info = self.connected_clients.get(sid, {})
                
                # Add to route subscribers
                if route_id not in self.route_subscribers:
                    self.route_subscribers[route_id] = set()
                self.route_subscribers[route_id].add(sid)
                
                # Update client info
                client_info["subscribed_routes"].add(route_id)
                
                await self.sio.emit('subscription_confirmed', {
                    'type': 'route',
                    'id': route_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, to=sid)
                
                logger.info(f"Client {sid} subscribed to route {route_id}")
                
            except Exception as e:
                logger.error(f"Error subscribing to route: {e}")
                await self.sio.emit('error', {
                    'message': 'Failed to subscribe to route'
                }, to=sid)
        
        @self.sio.event
        async def unsubscribe_route(sid, data):
            """Unsubscribe from route updates"""
            try:
                route_id = data.get("route_id")
                if not route_id:
                    return
                
                client_info = self.connected_clients.get(sid, {})
                
                # Remove from route subscribers
                if route_id in self.route_subscribers:
                    self.route_subscribers[route_id].discard(sid)
                    if not self.route_subscribers[route_id]:
                        del self.route_subscribers[route_id]
                
                # Update client info
                client_info["subscribed_routes"].discard(route_id)
                
                await self.sio.emit('subscription_cancelled', {
                    'type': 'route',
                    'id': route_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, to=sid)
                
                logger.info(f"Client {sid} unsubscribed from route {route_id}")
                
            except Exception as e:
                logger.error(f"Error unsubscribing from route: {e}")
        
        @self.sio.event
        async def subscribe_trip(sid, data):
            """Subscribe to trip updates"""
            try:
                trip_id = data.get("trip_id")
                if not trip_id:
                    await self.sio.emit('error', {
                        'message': 'Trip ID required'
                    }, to=sid)
                    return
                
                client_info = self.connected_clients.get(sid, {})
                
                # Add to trip subscribers
                if trip_id not in self.trip_subscribers:
                    self.trip_subscribers[trip_id] = set()
                self.trip_subscribers[trip_id].add(sid)
                
                # Update client info
                client_info["subscribed_trips"].add(trip_id)
                
                await self.sio.emit('subscription_confirmed', {
                    'type': 'trip',
                    'id': trip_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, to=sid)
                
                logger.info(f"Client {sid} subscribed to trip {trip_id}")
                
            except Exception as e:
                logger.error(f"Error subscribing to trip: {e}")
                await self.sio.emit('error', {
                    'message': 'Failed to subscribe to trip'
                }, to=sid)
        
        @self.sio.event
        async def unsubscribe_trip(sid, data):
            """Unsubscribe from trip updates"""
            try:
                trip_id = data.get("trip_id")
                if not trip_id:
                    return
                
                client_info = self.connected_clients.get(sid, {})
                
                # Remove from trip subscribers
                if trip_id in self.trip_subscribers:
                    self.trip_subscribers[trip_id].discard(sid)
                    if not self.trip_subscribers[trip_id]:
                        del self.trip_subscribers[trip_id]
                
                # Update client info
                client_info["subscribed_trips"].discard(trip_id)
                
                await self.sio.emit('subscription_cancelled', {
                    'type': 'trip',
                    'id': trip_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, to=sid)
                
                logger.info(f"Client {sid} unsubscribed from trip {trip_id}")
                
            except Exception as e:
                logger.error(f"Error unsubscribing from trip: {e}")
        
        @self.sio.event
        async def ping(sid):
            """Handle ping from client"""
            await self.sio.emit('pong', to=sid)
        
        @self.sio.event
        async def get_status(sid):
            """Get connection status"""
            client_info = self.connected_clients.get(sid, {})
            
            status = {
                'connected': True,
                'authenticated': client_info.get("authenticated", False),
                'user_id': client_info.get("user_id"),
                'connected_at': client_info.get("connected_at", datetime.utcnow()).isoformat(),
                'subscribed_routes': list(client_info.get("subscribed_routes", set())),
                'subscribed_trips': list(client_info.get("subscribed_trips", set())),
                'total_connections': len(self.connected_clients)
            }
            
            await self.sio.emit('status_response', status, to=sid)
    
    async def start(self):
        """Start the WebSocket manager"""
        if self.is_running:
            return
        
        self.is_running = True
        
        # Start background tasks
        heartbeat_task = asyncio.create_task(self._heartbeat_task())
        self.background_tasks.append(heartbeat_task)
        
        logger.info("WebSocket manager started")
    
    async def stop(self):
        """Stop the WebSocket manager"""
        self.is_running = False
        
        # Cancel background tasks
        for task in self.background_tasks:
            task.cancel()
        
        # Wait for tasks to complete
        if self.background_tasks:
            await asyncio.gather(*self.background_tasks, return_exceptions=True)
        
        self.background_tasks.clear()
        
        logger.info("WebSocket manager stopped")
    
    async def _heartbeat_task(self):
        """Background task for connection health monitoring"""
        while self.is_running:
            try:
                # Clean up dead connections
                current_time = datetime.utcnow()
                dead_connections = []
                
                for sid, client_info in self.connected_clients.items():
                    connected_at = client_info.get("connected_at", current_time)
                    if (current_time - connected_at).total_seconds() > 3600:  # 1 hour timeout
                        dead_connections.append(sid)
                
                for sid in dead_connections:
                    logger.info(f"Cleaning up dead connection {sid}")
                    await self.sio.disconnect(sid)
                
                # Log connection stats
                if len(self.connected_clients) > 0:
                    logger.info(f"Active WebSocket connections: {len(self.connected_clients)}")
                
                await asyncio.sleep(60)  # Check every minute
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in heartbeat task: {e}")
                await asyncio.sleep(5)
    
    async def emit_trip_update(self, trip_update: TripUpdate):
        """Emit trip update to subscribers"""
        try:
            message_data = {
                'type': 'trip_update',
                'data': trip_update.dict(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Emit to trip subscribers
            trip_id = trip_update.trip_id
            if trip_id in self.trip_subscribers:
                subscriber_sids = list(self.trip_subscribers[trip_id])
                for sid in subscriber_sids:
                    await self.sio.emit('trip_update', trip_update.dict(), to=sid)
            
            # Emit to route subscribers
            route_id = trip_update.route_id
            if route_id in self.route_subscribers:
                subscriber_sids = list(self.route_subscribers[route_id])
                for sid in subscriber_sids:
                    await self.sio.emit('trip_update', trip_update.dict(), to=sid)
            
            logger.debug(f"Emitted trip update for trip {trip_id}")
            
        except Exception as e:
            logger.error(f"Error emitting trip update: {e}")
    
    async def emit_notification(self, notification_alert: NotificationAlert):
        """Emit notification to specific user"""
        try:
            user_id = notification_alert.user_id
            
            if user_id in self.user_sessions:
                message_data = {
                    'type': 'notification',
                    'data': notification_alert.dict(),
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                # Send to all user sessions
                for sid in self.user_sessions[user_id]:
                    await self.sio.emit('notification', notification_alert.dict(), to=sid)
                
                logger.debug(f"Emitted notification to user {user_id}")
            
        except Exception as e:
            logger.error(f"Error emitting notification: {e}")
    
    async def emit_system_alert(self, message: str, alert_type: str = "info"):
        """Emit system-wide alert to all connected clients"""
        try:
            alert_data = {
                'type': 'system_alert',
                'alert_type': alert_type,
                'message': message,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Emit to all connected clients
            await self.sio.emit('system_alert', alert_data)
            
            logger.info(f"Emitted system alert: {message}")
            
        except Exception as e:
            logger.error(f"Error emitting system alert: {e}")
    
    async def emit_route_status(self, route_id: str, status_data: Dict[str, Any]):
        """Emit route status update to route subscribers"""
        try:
            if route_id in self.route_subscribers:
                message_data = {
                    'type': 'route_status',
                    'route_id': route_id,
                    'data': status_data,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                subscriber_sids = list(self.route_subscribers[route_id])
                for sid in subscriber_sids:
                    await self.sio.emit('route_status', message_data, to=sid)
                
                logger.debug(f"Emitted route status for route {route_id}")
            
        except Exception as e:
            logger.error(f"Error emitting route status: {e}")
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        authenticated_count = sum(
            1 for client in self.connected_clients.values()
            if client.get("authenticated", False)
        )
        
        return {
            "total_connections": len(self.connected_clients),
            "authenticated_connections": authenticated_count,
            "anonymous_connections": len(self.connected_clients) - authenticated_count,
            "unique_users": len(self.user_sessions),
            "route_subscriptions": len(self.route_subscribers),
            "trip_subscriptions": len(self.trip_subscribers),
            "uptime_seconds": (datetime.utcnow() - datetime.utcnow()).total_seconds() if self.is_running else 0
        }

# Global WebSocket manager instance
websocket_manager = WebSocketManager()