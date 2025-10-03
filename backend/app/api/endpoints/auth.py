"""
Authentication endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from datetime import timedelta
from typing import Dict, Any

from app.models.schemas import UserCreate, UserLogin, TokenResponse, UserResponse, User
from app.core.security import security_manager, get_current_user
from app.database.mongodb import get_users_collection
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    users_collection = get_users_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = security_manager.get_password_hash(user_data.password)
    
    # Create user document
    user_dict = user_data.dict(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    user_dict["role"] = "passenger"  # Default role
    user_dict["is_active"] = True
    
    user = User(**user_dict)
    
    # Insert user
    result = await users_collection.insert_one(user.dict(by_alias=True))
    user_dict["id"] = str(result.inserted_id)
    
    # Create access token
    access_token = security_manager.create_access_token(
        data={"sub": user_dict["id"], "email": user_data.email, "role": "passenger"}
    )
    
    # Create response
    user_response = UserResponse(**user_dict)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return token"""
    users_collection = get_users_collection()
    
    # Find user
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not security_manager.verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive"
        )
    
    # Create access token
    access_token = security_manager.create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"], "role": user["role"]}
    )
    
    # Create user response
    user_data = dict(user)
    user_data["id"] = str(user_data.pop("_id"))
    user_response = UserResponse(**user_data)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information"""
    users_collection = get_users_collection()
    
    user = await users_collection.find_one({"_id": current_user["sub"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_data = dict(user)
    user_data["id"] = str(user_data.pop("_id"))
    return UserResponse(**user_data)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Refresh access token"""
    # Create new access token
    access_token = security_manager.create_access_token(
        data={"sub": current_user["sub"], "email": current_user["email"], "role": current_user["role"]}
    )
    
    # Get user info
    users_collection = get_users_collection()
    user = await users_collection.find_one({"_id": current_user["sub"]})
    
    user_data = dict(user)
    user_data["id"] = str(user_data.pop("_id"))
    user_response = UserResponse(**user_data)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )