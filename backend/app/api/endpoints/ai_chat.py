"""
AI Chat endpoints for OpenAI integration
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.openai_service import get_ai_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    route_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Send message to AI assistant and get response
    """
    try:
        ai_response = await get_ai_response(request.message, request.route_data)
        return ChatResponse(response=ai_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.get("/health")
async def ai_health_check():
    """
    Check if AI service is available
    """
    return {"status": "ok", "service": "AI Chat", "message": "AI chat service is running"}