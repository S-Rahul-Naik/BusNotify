# 🤖 Readdy Agent - Quick Start Guide

## Overview
Readdy is an intelligent voice and text assistant for the BusNotify system, built using n8n automation workflows. It provides real-time bus information, route planning, and notifications through both voice and text interactions.

## Features
- 🎤 **Voice-to-Voice Communication**: Speech recognition and text-to-speech
- 💬 **Text-to-Text Chat**: Traditional chatbot interface
- 🚌 **Bus Information**: Real-time schedules, delays, and routes
- 📍 **Location Services**: Route planning and nearby stops
- 🔔 **Smart Notifications**: Proactive delay alerts

## Quick Setup Steps

### 1. Install n8n
```bash
npm install -g n8n
```

### 2. Start n8n
```bash
n8n start
```

### 3. Import Workflow
- Open n8n at `http://localhost:5678`
- Import the `n8n-chatbot-workflow.json` file
- Configure API credentials

### 4. Configure Services
- Set up OpenAI API key for LLM
- Configure ElevenLabs for voice synthesis
- Set up speech recognition service
- Connect to BusNotify backend API

### 5. Deploy and Test
- Activate the workflow
- Test voice and text interactions
- Verify bus data integration

## Architecture
```
User Input (Voice/Text) 
    ↓
n8n Workflow 
    ↓
[Speech Recognition] → [NLP Processing] → [Bus API] → [Response Generation] → [Voice/Text Output]
```

## API Endpoints
- Voice Input: `POST /webhook/voice`
- Text Input: `POST /webhook/text`
- Status: `GET /webhook/status`
