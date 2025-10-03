"""
Stops API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any

from app.models.schemas import Stop
from app.core.security import get_current_user, require_admin
from app.database.mongodb import get_stops_collection

router = APIRouter()

@router.get("/", response_model=List[Stop])
async def get_stops(
    is_active: Optional[bool] = Query(default=None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all stops"""
    stops_collection = get_stops_collection()
    
    filter_query = {}
    if is_active is not None:
        filter_query["is_active"] = is_active
    
    stops = await stops_collection.find(filter_query).to_list(length=None)
    
    # Convert _id to id for response
    for stop in stops:
        stop["id"] = str(stop.pop("_id"))
    
    return stops

@router.get("/{stop_id}", response_model=Stop)
async def get_stop(
    stop_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific stop"""
    stops_collection = get_stops_collection()
    
    stop = await stops_collection.find_one({"_id": stop_id})
    if not stop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stop not found"
        )
    
    stop["id"] = str(stop.pop("_id"))
    return stop

@router.get("/nearby", response_model=List[Stop])
async def get_nearby_stops(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(default=1.0, ge=0.1, le=50),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get stops within a radius of a location"""
    stops_collection = get_stops_collection()
    
    # MongoDB geospatial query
    nearby_stops = await stops_collection.find({
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "$maxDistance": radius_km * 1000  # Convert km to meters
            }
        },
        "is_active": True
    }).to_list(length=None)
    
    # Convert _id to id for response
    for stop in nearby_stops:
        stop["id"] = str(stop.pop("_id"))
    
    return nearby_stops

@router.post("/", response_model=Stop, status_code=status.HTTP_201_CREATED)
async def create_stop(
    stop_data: Stop,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Create a new stop (Admin only)"""
    stops_collection = get_stops_collection()
    
    # Check if stop code already exists
    existing_stop = await stops_collection.find_one({"code": stop_data.code})
    if existing_stop:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stop code already exists"
        )
    
    # Insert stop
    stop_dict = stop_data.dict(by_alias=True)
    result = await stops_collection.insert_one(stop_dict)
    
    # Return created stop
    created_stop = await stops_collection.find_one({"_id": result.inserted_id})
    created_stop["id"] = str(created_stop.pop("_id"))
    
    return created_stop

@router.put("/{stop_id}", response_model=Stop)
async def update_stop(
    stop_id: str,
    stop_data: Stop,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Update a stop (Admin only)"""
    stops_collection = get_stops_collection()
    
    # Check if stop exists
    existing_stop = await stops_collection.find_one({"_id": stop_id})
    if not existing_stop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stop not found"
        )
    
    # Update stop
    stop_dict = stop_data.dict(by_alias=True, exclude={"id"})
    stop_dict["updated_at"] = stop_data.updated_at
    
    await stops_collection.update_one(
        {"_id": stop_id},
        {"$set": stop_dict}
    )
    
    # Return updated stop
    updated_stop = await stops_collection.find_one({"_id": stop_id})
    updated_stop["id"] = str(updated_stop.pop("_id"))
    
    return updated_stop

@router.delete("/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stop(
    stop_id: str,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Delete a stop (Admin only)"""
    stops_collection = get_stops_collection()
    
    result = await stops_collection.delete_one({"_id": stop_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stop not found"
        )