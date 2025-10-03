"""
API Routes configuration
"""

from fastapi import APIRouter
from app.api.endpoints import auth, routes, stops, trips, subscriptions, notifications, predictions

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(routes.router, prefix="/routes", tags=["Routes"])
api_router.include_router(stops.router, prefix="/stops", tags=["Stops"])
api_router.include_router(trips.router, prefix="/trips", tags=["Trips"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])