"""
Notifications API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.models.schemas import Notification, NotificationType
from app.core.security import get_current_user
from app.database.mongodb import get_notifications_collection

router = APIRouter()

@router.get("/", response_model=List[Notification])
async def get_notifications(
    is_read: Optional[bool] = Query(default=None),
    notification_type: Optional[NotificationType] = Query(default=None, alias="type"),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's notifications"""
    notifications_collection = get_notifications_collection()
    user_id = current_user["sub"]
    
    filter_query = {"user_id": user_id}
    if is_read is not None:
        filter_query["is_read"] = is_read
    if notification_type:
        filter_query["type"] = notification_type
    
    notifications = await notifications_collection.find(filter_query) \
        .sort("created_at", -1) \
        .limit(limit) \
        .to_list(length=None)
    
    # Convert _id to id for response
    for notification in notifications:
        notification["id"] = str(notification.pop("_id"))
    
    return notifications

@router.get("/unread/count")
async def get_unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get count of unread notifications"""
    notifications_collection = get_notifications_collection()
    user_id = current_user["sub"]
    
    count = await notifications_collection.count_documents({
        "user_id": user_id,
        "is_read": False
    })
    
    return {"unread_count": count}

@router.get("/{notification_id}", response_model=Notification)
async def get_notification(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific notification"""
    notifications_collection = get_notifications_collection()
    user_id = current_user["sub"]
    
    notification = await notifications_collection.find_one({
        "_id": notification_id,
        "user_id": user_id
    })
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification["id"] = str(notification.pop("_id"))
    return notification

@router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark a notification as read"""
    notifications_collection = get_notifications_collection()
    user_id = current_user["sub"]
    
    result = await notifications_collection.update_one(
        {
            "_id": notification_id,
            "user_id": user_id
        },
        {
            "$set": {
                "is_read": True,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark all notifications as read"""
    notifications_collection = get_notifications_collection()
    user_id = current_user["sub"]
    
    await notifications_collection.update_many(
        {
            "user_id": user_id,
            "is_read": False
        },
        {
            "$set": {
                "is_read": True,
                "updated_at": datetime.utcnow()
            }
        }
    )

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a notification"""
    notifications_collection = get_notifications_collection()
    user_id = current_user["sub"]
    
    result = await notifications_collection.delete_one({
        "_id": notification_id,
        "user_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_old_notifications(
    days_old: int = Query(default=30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete notifications older than specified days"""
    notifications_collection = get_notifications_collection()
    user_id = current_user["sub"]
    
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    
    result = await notifications_collection.delete_many({
        "user_id": user_id,
        "created_at": {"$lt": cutoff_date}
    })
    
    return {"deleted_count": result.deleted_count}