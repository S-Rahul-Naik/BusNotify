"""
Trips API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.schemas import Trip, TripStatus
from app.core.security import get_current_user, require_admin
from app.database.mongodb import get_trips_collection

router = APIRouter()

@router.get("/", response_model=List[Trip])
async def get_trips(
    route_id: Optional[str] = Query(default=None),
    status_filter: Optional[TripStatus] = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get trips with optional filters"""
    trips_collection = get_trips_collection()
    
    filter_query = {}
    if route_id:
        filter_query["route_id"] = route_id
    if status_filter:
        filter_query["status"] = status_filter
    
    trips = await trips_collection.find(filter_query).limit(limit).to_list(length=None)
    
    # Convert _id to id for response
    for trip in trips:
        trip["id"] = str(trip.pop("_id"))
    
    return trips

@router.get("/active", response_model=List[Trip])
async def get_active_trips(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all currently active trips"""
    trips_collection = get_trips_collection()
    
    active_trips = await trips_collection.find({
        "status": {"$in": ["scheduled", "in_progress"]}
    }).to_list(length=None)
    
    # Convert _id to id for response
    for trip in active_trips:
        trip["id"] = str(trip.pop("_id"))
    
    return active_trips

@router.get("/{trip_id}", response_model=Trip)
async def get_trip(
    trip_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific trip"""
    trips_collection = get_trips_collection()
    
    trip = await trips_collection.find_one({"_id": trip_id})
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    trip["id"] = str(trip.pop("_id"))
    return trip

@router.post("/", response_model=Trip, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: Trip,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Create a new trip (Admin only)"""
    trips_collection = get_trips_collection()
    
    # Insert trip
    trip_dict = trip_data.dict(by_alias=True)
    result = await trips_collection.insert_one(trip_dict)
    
    # Return created trip
    created_trip = await trips_collection.find_one({"_id": result.inserted_id})
    created_trip["id"] = str(created_trip.pop("_id"))
    
    return created_trip

@router.put("/{trip_id}", response_model=Trip)
async def update_trip(
    trip_id: str,
    trip_data: Trip,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Update a trip (Admin only)"""
    trips_collection = get_trips_collection()
    
    # Check if trip exists
    existing_trip = await trips_collection.find_one({"_id": trip_id})
    if not existing_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    # Update trip
    trip_dict = trip_data.dict(by_alias=True, exclude={"id"})
    trip_dict["updated_at"] = trip_data.updated_at
    
    await trips_collection.update_one(
        {"_id": trip_id},
        {"$set": trip_dict}
    )
    
    # Return updated trip
    updated_trip = await trips_collection.find_one({"_id": trip_id})
    updated_trip["id"] = str(updated_trip.pop("_id"))
    
    return updated_trip

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: str,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Delete a trip (Admin only)"""
    trips_collection = get_trips_collection()
    
    result = await trips_collection.delete_one({"_id": trip_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )