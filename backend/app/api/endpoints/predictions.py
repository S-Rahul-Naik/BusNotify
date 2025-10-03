"""
Prediction API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.models.schemas import TripPrediction
from app.core.security import get_current_user
from app.ml.prediction_engine import ml_engine
from app.database.mongodb import get_trips_collection, get_routes_collection

router = APIRouter()

@router.get("/trip/{trip_id}", response_model=TripPrediction)
async def get_trip_prediction(
    trip_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get delay prediction for a specific trip"""
    trips_collection = get_trips_collection()
    
    # Get trip details
    trip = await trips_collection.find_one({"_id": trip_id})
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    # Get prediction
    prediction = await ml_engine.predict_delay(
        route_id=trip["route_id"],
        trip_start_time=trip["trip_start_time"]
    )
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate prediction"
        )
    
    # Update with actual trip ID
    prediction.trip_id = trip_id
    
    return prediction

@router.get("/route/{route_id}", response_model=List[TripPrediction])
async def get_route_predictions(
    route_id: str,
    hours_ahead: int = Query(default=2, ge=1, le=24),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get delay predictions for all upcoming trips on a route"""
    routes_collection = get_routes_collection()
    trips_collection = get_trips_collection()
    
    # Verify route exists
    route = await routes_collection.find_one({"_id": route_id})
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Get upcoming trips
    from datetime import timedelta
    end_time = datetime.utcnow() + timedelta(hours=hours_ahead)
    
    upcoming_trips = await trips_collection.find({
        "route_id": route_id,
        "trip_start_time": {
            "$gte": datetime.utcnow(),
            "$lte": end_time
        },
        "status": {"$in": ["scheduled", "in_progress"]}
    }).to_list(length=None)
    
    predictions = []
    
    for trip in upcoming_trips:
        prediction = await ml_engine.predict_delay(
            route_id=route_id,
            trip_start_time=trip["trip_start_time"]
        )
        
        if prediction:
            prediction.trip_id = trip["_id"]
            predictions.append(prediction)
    
    return predictions

@router.post("/predict", response_model=TripPrediction)
async def predict_custom_trip(
    route_id: str,
    trip_start_time: datetime,
    model_name: Optional[str] = "random_forest",
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate prediction for a custom trip scenario"""
    routes_collection = get_routes_collection()
    
    # Verify route exists
    route = await routes_collection.find_one({"_id": route_id})
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Generate prediction
    prediction = await ml_engine.predict_delay(
        route_id=route_id,
        trip_start_time=trip_start_time,
        model_name=model_name
    )
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate prediction"
        )
    
    return prediction

@router.get("/models/performance", response_model=Dict[str, Any])
async def get_model_performance(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get performance metrics for all trained models"""
    performance = await ml_engine.get_model_performance()
    return performance

@router.post("/models/retrain")
async def retrain_models(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Retrain all prediction models (Admin only)"""
    user_role = current_user.get("role", "passenger")
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        performance = await ml_engine.retrain_models()
        return {
            "message": "Models retrained successfully",
            "performance": performance
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrain models: {str(e)}"
        )

@router.get("/analytics/route/{route_id}")
async def get_route_analytics(
    route_id: str,
    days_back: int = Query(default=7, ge=1, le=30),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get analytics for route performance"""
    routes_collection = get_routes_collection()
    trips_collection = get_trips_collection()
    
    # Verify route exists
    route = await routes_collection.find_one({"_id": route_id})
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Get historical trips
    from datetime import timedelta
    start_date = datetime.utcnow() - timedelta(days=days_back)
    
    historical_trips = await trips_collection.find({
        "route_id": route_id,
        "trip_start_time": {"$gte": start_date},
        "status": "completed"
    }).to_list(length=None)
    
    if not historical_trips:
        return {
            "route_id": route_id,
            "route_name": route.get("name", "Unknown"),
            "analytics_period_days": days_back,
            "total_trips": 0,
            "average_delay_minutes": 0,
            "on_time_percentage": 100,
            "delay_distribution": {},
            "peak_delay_hours": []
        }
    
    # Calculate analytics
    delays = [trip.get("delay_minutes", 0) for trip in historical_trips]
    avg_delay = sum(delays) / len(delays) if delays else 0
    
    # On-time performance (delays <= 5 minutes)
    on_time_trips = sum(1 for delay in delays if delay <= 5)
    on_time_percentage = (on_time_trips / len(delays)) * 100 if delays else 100
    
    # Delay distribution
    delay_ranges = {
        "on_time": sum(1 for d in delays if d <= 5),
        "slightly_delayed": sum(1 for d in delays if 5 < d <= 10),
        "moderately_delayed": sum(1 for d in delays if 10 < d <= 20),
        "severely_delayed": sum(1 for d in delays if d > 20)
    }
    
    # Peak delay hours analysis
    hour_delays = {}
    for trip in historical_trips:
        hour = trip["trip_start_time"].hour
        delay = trip.get("delay_minutes", 0)
        
        if hour not in hour_delays:
            hour_delays[hour] = []
        hour_delays[hour].append(delay)
    
    # Calculate average delay per hour
    hour_avg_delays = {
        hour: sum(delays) / len(delays)
        for hour, delays in hour_delays.items()
        if delays
    }
    
    # Find peak delay hours (top 3)
    peak_hours = sorted(
        hour_avg_delays.items(),
        key=lambda x: x[1],
        reverse=True
    )[:3]
    
    return {
        "route_id": route_id,
        "route_name": route.get("name", "Unknown"),
        "analytics_period_days": days_back,
        "total_trips": len(historical_trips),
        "average_delay_minutes": round(avg_delay, 2),
        "on_time_percentage": round(on_time_percentage, 1),
        "delay_distribution": delay_ranges,
        "peak_delay_hours": [
            {"hour": hour, "avg_delay": round(delay, 2)}
            for hour, delay in peak_hours
        ],
        "hourly_performance": {
            str(hour): round(avg_delay, 2)
            for hour, avg_delay in hour_avg_delays.items()
        }
    }