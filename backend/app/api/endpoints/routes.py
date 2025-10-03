"""
Routes API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any

from app.models.schemas import Route, Stop
from app.core.security import get_current_user, require_admin
from app.database.mongodb import get_routes_collection, get_stops_collection

router = APIRouter()

@router.get("/", response_model=List[Route])
async def get_routes(
    is_active: Optional[bool] = Query(default=None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all routes"""
    routes_collection = get_routes_collection()
    
    filter_query = {}
    if is_active is not None:
        filter_query["is_active"] = is_active
    
    routes = await routes_collection.find(filter_query).to_list(length=None)
    
    # Convert _id to id for response
    for route in routes:
        route["id"] = str(route.pop("_id"))
    
    return routes

@router.get("/{route_id}", response_model=Route)
async def get_route(
    route_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific route"""
    routes_collection = get_routes_collection()
    
    route = await routes_collection.find_one({"_id": route_id})
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    route["id"] = str(route.pop("_id"))
    return route

@router.get("/{route_id}/stops", response_model=List[Stop])
async def get_route_stops(
    route_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all stops for a route"""
    routes_collection = get_routes_collection()
    stops_collection = get_stops_collection()
    
    # Get route
    route = await routes_collection.find_one({"_id": route_id})
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Get stops in order
    stop_ids = route.get("stops", [])
    stops = []
    
    for stop_id in stop_ids:
        stop = await stops_collection.find_one({"_id": stop_id})
        if stop:
            stop["id"] = str(stop.pop("_id"))
            stops.append(stop)
    
    return stops

@router.post("/", response_model=Route, status_code=status.HTTP_201_CREATED)
async def create_route(
    route_data: Route,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Create a new route (Admin only)"""
    routes_collection = get_routes_collection()
    
    # Check if route code already exists
    existing_route = await routes_collection.find_one({"code": route_data.code})
    if existing_route:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Route code already exists"
        )
    
    # Insert route
    route_dict = route_data.dict(by_alias=True)
    result = await routes_collection.insert_one(route_dict)
    
    # Return created route
    created_route = await routes_collection.find_one({"_id": result.inserted_id})
    created_route["id"] = str(created_route.pop("_id"))
    
    return created_route

@router.put("/{route_id}", response_model=Route)
async def update_route(
    route_id: str,
    route_data: Route,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Update a route (Admin only)"""
    routes_collection = get_routes_collection()
    
    # Check if route exists
    existing_route = await routes_collection.find_one({"_id": route_id})
    if not existing_route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Update route
    route_dict = route_data.dict(by_alias=True, exclude={"id"})
    route_dict["updated_at"] = route_data.updated_at
    
    await routes_collection.update_one(
        {"_id": route_id},
        {"$set": route_dict}
    )
    
    # Return updated route
    updated_route = await routes_collection.find_one({"_id": route_id})
    updated_route["id"] = str(updated_route.pop("_id"))
    
    return updated_route

@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(
    route_id: str,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Delete a route (Admin only)"""
    routes_collection = get_routes_collection()
    
    result = await routes_collection.delete_one({"_id": route_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )