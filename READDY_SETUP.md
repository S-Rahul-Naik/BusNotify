# 🤖 Readdy Agent - Complete Setup Guide

## Overview
Readdy is your intelligent voice and text bus assistant that provides real-time bus information, route planning, and notifications through both voice and text interactions. Built using n8n automation workflows.

## 🚀 Quick Start (Automated)

### Option 1: Run the Setup Script
```bash
# Windows
./start-agents.bat

# This script will:
# 1. Check and install n8n if needed
# 2. Start the BusNotify backend
# 3. Start n8n workflow engine
# 4. Start the frontend application
# 5. Open the required services in your browser
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- MongoDB (running locally or cloud)

#### Step 1: Install n8n
```bash
npm install -g n8n
```

#### Step 2: Start Backend
```bash
cd backend
python main_mongodb.py
```
Backend will run on: `http://localhost:8000`

#### Step 3: Start n8n
```bash
n8n start
```
n8n will run on: `http://localhost:5678`

#### Step 4: Start Frontend
```bash
npm run dev
```
Frontend will run on: `http://localhost:5173`

## 🔧 n8n Workflow Configuration

### 1. Import Workflow
1. Open n8n at `http://localhost:5678`
2. Click "+" to create new workflow
3. Click "..." menu → "Import from file"
4. Select `n8n-chatbot-workflow.json`

### 2. Configure API Credentials

#### OpenAI Setup
1. In n8n, go to "Credentials" tab
2. Add "OpenAI API" credential
3. Enter your OpenAI API key
4. Set default model to `gpt-4` or `gpt-3.5-turbo`

#### ElevenLabs Setup (Voice Synthesis)
1. Create account at https://elevenlabs.io
2. Get API key from dashboard
3. In n8n, add "HTTP Header Auth" credential
4. Set header name: `Xi-Api-Key`
5. Set header value: your ElevenLabs API key

#### Speech Recognition Options

**Option A: OpenAI Whisper (Recommended)**
- Already configured in the workflow
- Uses OpenAI API for speech-to-text
- High accuracy, supports multiple languages

**Option B: Web Speech API**
- Browser-based, no additional setup
- Works offline but less accurate
- Modify the frontend to use `webkitSpeechRecognition`

### 3. Test Workflow
1. Click "Execute Workflow" in n8n
2. Send test payload:
   ```json
   {
     "type": "text",
     "message": "When is the next bus to downtown?"
   }
   ```

## 🎤 Voice Configuration

### Frontend Voice Features
- **Speech Recognition**: Converts voice to text
- **Text-to-Speech**: Plays AI responses as audio
- **Voice Settings**: Speed, pitch, auto-play controls
- **Background Noise Cancellation**: Improved audio quality

### Voice Quality Settings
```javascript
// In ChatbotEnhanced.tsx, audio settings:
audio: {
  echoCancellation: true,
  noiseSuppression: true,
  sampleRate: 44100
}
```

### ElevenLabs Voice Models
- **Bella**: Female, clear and professional
- **Adam**: Male, warm and friendly
- **Antoni**: Male, deep and authoritative
- **Rachel**: Female, young and energetic

## 🚌 Bus Data Integration

### Backend API Endpoints
```
GET /api/v1/stops          # Get all bus stops
GET /api/v1/routes         # Get all routes  
GET /api/v1/trips          # Get real-time trips
GET /api/v1/predictions    # Get delay predictions
```

### Sample API Responses
```json
// Stops
{
  "stops": [
    {
      "id": "stop_001",
      "name": "Downtown Transit Center",
      "location": {"lat": 40.7128, "lng": -74.0060},
      "routes": ["1", "2", "42"]
    }
  ]
}

// Live Trips
{
  "trips": [
    {
      "id": "trip_123",
      "route": "42",
      "currentStop": "stop_001",
      "delay": 3,
      "nextStop": "stop_002",
      "eta": "2024-01-05T14:30:00Z"
    }
  ]
}
```

## 💬 Conversation Features

### Smart Intent Recognition
The agent can understand various types of requests:
- **Schedule Queries**: "When is the next bus?"
- **Route Information**: "How do I get to downtown?"
- **Delay Updates**: "Are there any delays on route 42?"
- **Location-based**: "Buses near me"

### Context Awareness
- Remembers previous conversation
- Uses current location for relevant responses
- Maintains session state across voice/text

### Response Types
1. **Text**: Plain text responses
2. **Voice**: Audio responses with text backup
3. **Rich Data**: Bus schedules with route information
4. **Proactive**: Delay notifications and alerts

## 🔧 Advanced Configuration

### Custom Prompts
Edit the system prompt in n8n "LLM Processing" node:
```
You are Readdy, an intelligent bus information assistant specializing in [YOUR_CITY] public transportation. 

You help users with:
1. Real-time bus schedules and delays
2. Route planning and navigation  
3. Nearby bus stops and routes
4. Trip notifications and alerts

Always provide accurate, helpful, and location-relevant information.
Be friendly, concise, and proactive in suggesting helpful information.
```

### Location Services
```javascript
// Enable location in frontend
const getCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Send coordinates with requests
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    }
  );
};
```

### Proactive Notifications
Add webhook triggers for:
- Route delays
- Service disruptions  
- Schedule changes
- Weather-related updates

## 🎨 Frontend Customization

### Styling Options
```css
/* Custom themes in index.css */
.readdy-dark-theme {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --accent: #3b82f6;
}

.readdy-transit-theme {
  --bg-primary: #0066cc;
  --text-primary: #ffffff; 
  --accent: #ffcc00;
}
```

### UI Components
- `Chatbot.tsx`: Basic text/voice chat
- `ChatbotEnhanced.tsx`: Full-featured with settings
- `ChatbotErrorBoundary.tsx`: Error handling wrapper

## 📱 Mobile Optimization

### Responsive Design
```css
@media (max-width: 768px) {
  .chatbot-container {
    height: 100vh;
    border-radius: 0;
  }
}
```

### PWA Features
- Service worker for offline functionality
- App manifest for installable experience
- Background sync for delayed messages

## 🔍 Troubleshooting

### Common Issues

**1. n8n Workflow Not Responding**
```bash
# Check if n8n is running
curl http://localhost:5678/webhook/readdy

# Restart n8n
n8n restart
```

**2. Voice Not Working**
- Check microphone permissions
- Verify HTTPS (required for microphone access)
- Test browser compatibility

**3. Backend Connection Failed**
```bash
# Check backend status
curl http://localhost:8000/health

# Verify MongoDB connection
python backend/test_api.py
```

**4. Audio Playback Issues**
- Check browser audio permissions
- Verify ElevenLabs API key
- Test with different audio formats

### Debug Mode
Enable debug logging in n8n:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

### Performance Optimization
- Use audio compression for voice messages
- Implement response caching
- Optimize API calls with batching

## 🚀 Deployment Options

### Local Development
- All services on localhost
- File-based storage
- Development credentials

### Production Deployment
```bash
# Docker Compose
docker-compose up -d

# Or individual services:
docker run -p 5678:5678 n8nio/n8n
docker run -p 8000:8000 busnotify-backend
docker run -p 3000:3000 busnotify-frontend
```

### Cloud Deployment
- n8n Cloud: https://n8n.cloud
- Backend: Railway, Render, or DigitalOcean
- Frontend: Vercel, Netlify, or Cloudflare Pages

## 📊 Monitoring & Analytics

### n8n Execution Logs
- View workflow execution history
- Monitor API call success rates
- Track response times

### User Analytics
```javascript
// Add to frontend
const trackUsage = (action, data) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ action, data, timestamp: new Date() })
  });
};
```

## 🔒 Security Considerations

### API Security
- Use environment variables for API keys
- Implement rate limiting
- Add CORS restrictions

### Data Privacy
- Don't log sensitive user data
- Implement session timeouts
- Use secure audio transmission

## 📈 Future Enhancements

### Planned Features
- [ ] Multi-language support
- [ ] Real-time trip tracking on map
- [ ] Smart notification scheduling  
- [ ] Integration with payment systems
- [ ] Accessibility improvements
- [ ] Voice command shortcuts

### Integration Possibilities
- Google Maps API for visual routes
- SMS/Email notifications
- Calendar integration for commute planning
- Weather API for service advisories

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review n8n execution logs
3. Verify all services are running
4. Test individual components
5. Check API credentials and permissions

Happy chatting with Readdy! 🚌🤖