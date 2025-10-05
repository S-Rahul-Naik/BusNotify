"""
OpenAI Integration for BusTracker Backend
This module handles OpenAI API calls server-side to avoid CORS issues
"""

import os
from openai import OpenAI
from fastapi import HTTPException
from typing import Dict, Any
import json

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# BusTracker business context
BUSTRACKER_CONTEXT = """
## Identity & Business Background

You are Readdy, a smart voice assistant for BusTracker.

Business introduction: BusTracker is an intelligent bus delay prediction and passenger notification system that uses machine learning to provide real-time transit updates. Our software-only solution simulates bus movement without GPS hardware, predicting delays with 87% accuracy using historical data, weather, and traffic patterns. The platform features a React.js web interface with live bus tracking on interactive maps, WebSocket-powered real-time updates every 10 seconds, and multi-channel notifications via push, SMS, and email. Built with FastAPI backend, MongoDB database, and advanced ML algorithms, BusTracker serves commuters, transit authorities, and system administrators with comprehensive route management, user subscriptions, and emergency broadcast capabilities. The system supports 247 active buses, serves 12,847 users, and maintains 99.8% uptime while helping passengers never miss their bus again.

Products or services: AI-powered bus delay prediction system with real-time tracking, smart notifications, route management dashboard, admin panel for transit authorities, WebSocket live updates, machine learning prediction algorithms, multi-channel alert system (push/SMS/email), interactive map visualization, user subscription management, emergency broadcast system, and comprehensive analytics for transit optimization.
\
## Role & Task

Your role and task is:
- Provide accurate and friendly answers about BusTracker services and features
- Help users understand bus schedules, routes, and tracking features
- Assist with navigation and delay predictions
- Offer information about our AI-powered system capabilities
- Provide a smooth and professional user experience

## Voice & Persona

### Personality
- Friendly, energetic, helpful, and knowledgeable about bus tracking
- Patient and clear in explanations
- Confident about BusTracker's capabilities

### Speech Characteristics
- Speak clearly and naturally
- Use a warm but efficient tone
- Use helpful transitions and confirmations

## Response Guidelines

- Keep responses focused on BusTracker and related transit topics
- Provide specific, helpful information about our features
- If asked about something unrelated to BusTracker, politely redirect to transit topics
- Use emojis sparingly and appropriately
- Always be accurate about our capabilities (87% delay prediction, 247 buses, 12,847 users, 99.8% uptime)
"""

async def get_ai_response(user_message: str, route_data: Dict[str, Any] = None) -> str:
    """
    Get AI-powered response from OpenAI API
    """
    try:
        if not os.getenv("OPENAI_API_KEY"):
            return "AI service is not configured. Please set the OPENAI_API_KEY environment variable."
        
        # Prepare the context with route data
        context = BUSTRACKER_CONTEXT
        if route_data:
            context += f"\n\nCurrent route data: {json.dumps(route_data, indent=2)}"
        
        # Make OpenAI API call
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": user_message}
            ],
            max_tokens=300,
            temperature=0.7,
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        
        # Specific error handling
        error_str = str(e).lower()
        if "api key" in error_str:
            return "AI service authentication failed. Please contact support."
        elif "quota" in error_str or "billing" in error_str:
            return "AI service is temporarily unavailable due to usage limits. Please try again later."
        elif "rate limit" in error_str:
            return "AI service is busy. Please wait a moment and try again."
        else:
            return "I'm experiencing technical difficulties. Please try again or ask me about our bus routes, schedules, delay predictions, or any other BusTracker features."