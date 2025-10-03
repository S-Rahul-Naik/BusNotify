"""
WebSocket module init file

Exports the WebSocket manager for use across the application.
"""

from .manager import websocket_manager, WebSocketManager

__all__ = ["websocket_manager", "WebSocketManager"]