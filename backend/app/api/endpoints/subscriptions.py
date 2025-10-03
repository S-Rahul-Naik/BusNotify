"""
Subscriptions API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any

from app.models.schemas import Subscription, SubscriptionCreate
from app.core.security import get_current_user
from app.database.mongodb import get_subscriptions_collection, get_routes_collection

router = APIRouter()

@router.get("/", response_model=List[Subscription])
async def get_subscriptions(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's subscriptions"""
    subscriptions_collection = get_subscriptions_collection()
    user_id = current_user["sub"]
    
    subscriptions = await subscriptions_collection.find({
        "user_id": user_id,
        "is_active": True
    }).to_list(length=None)
    
    # Convert _id to id for response
    for subscription in subscriptions:
        subscription["id"] = str(subscription.pop("_id"))
    
    return subscriptions

@router.post("/", response_model=Subscription, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new subscription"""
    subscriptions_collection = get_subscriptions_collection()
    routes_collection = get_routes_collection()
    user_id = current_user["sub"]
    
    # Verify route exists
    route = await routes_collection.find_one({"_id": subscription_data.route_id})
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Check if subscription already exists
    existing_subscription = await subscriptions_collection.find_one({
        "user_id": user_id,
        "route_id": subscription_data.route_id,
        "is_active": True
    })
    
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already subscribed to this route"
        )
    
    # Create subscription
    subscription = Subscription(
        user_id=user_id,
        route_id=subscription_data.route_id,
        stop_ids=subscription_data.stop_ids,
        is_active=True
    )
    
    subscription_dict = subscription.dict(by_alias=True)
    result = await subscriptions_collection.insert_one(subscription_dict)
    
    # Return created subscription
    created_subscription = await subscriptions_collection.find_one({"_id": result.inserted_id})
    created_subscription["id"] = str(created_subscription.pop("_id"))
    
    return created_subscription

@router.get("/{subscription_id}", response_model=Subscription)
async def get_subscription(
    subscription_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific subscription"""
    subscriptions_collection = get_subscriptions_collection()
    user_id = current_user["sub"]
    
    subscription = await subscriptions_collection.find_one({
        "_id": subscription_id,
        "user_id": user_id
    })
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    subscription["id"] = str(subscription.pop("_id"))
    return subscription

@router.put("/{subscription_id}", response_model=Subscription)
async def update_subscription(
    subscription_id: str,
    subscription_data: SubscriptionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update a subscription"""
    subscriptions_collection = get_subscriptions_collection()
    user_id = current_user["sub"]
    
    # Check if subscription exists and belongs to user
    existing_subscription = await subscriptions_collection.find_one({
        "_id": subscription_id,
        "user_id": user_id
    })
    
    if not existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    # Update subscription
    await subscriptions_collection.update_one(
        {"_id": subscription_id},
        {
            "$set": {
                "stop_ids": subscription_data.stop_ids,
                "updated_at": subscription_data.updated_at
            }
        }
    )
    
    # Return updated subscription
    updated_subscription = await subscriptions_collection.find_one({"_id": subscription_id})
    updated_subscription["id"] = str(updated_subscription.pop("_id"))
    
    return updated_subscription

@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(
    subscription_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a subscription"""
    subscriptions_collection = get_subscriptions_collection()
    user_id = current_user["sub"]
    
    result = await subscriptions_collection.update_one(
        {
            "_id": subscription_id,
            "user_id": user_id
        },
        {
            "$set": {
                "is_active": False,
                "updated_at": subscription_data.updated_at
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )