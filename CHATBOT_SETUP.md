# 🤖 Readdy Agent - Chatbot Setup Guide

## Prerequisites
- n8n installed and running
- OpenAI API key
- ElevenLabs API key (for voice synthesis)
- BusNotify backend running on localhost:8000

## Step-by-Step Setup

### 1. n8n Installation
```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start
```
Access n8n at: `http://localhost:5678`

### 2. Required n8n Nodes
- **HTTP Request**: For API calls
- **Webhook**: For receiving user inputs
- **OpenAI**: For LLM processing
- **Code**: For custom logic
- **Switch**: For routing logic
- **Merge**: For combining data
- **Wait**: For delays if needed

### 3. External Services Setup

#### OpenAI Configuration
1. Get API key from OpenAI
2. Add to n8n credentials
3. Model: `gpt-4` or `gpt-3.5-turbo`

#### ElevenLabs (Voice Synthesis)
1. Sign up at ElevenLabs
2. Get API key
3. Choose voice model (recommended: Bella or Adam)

#### Speech Recognition Options
- **Option A**: Web Speech API (browser-based)
- **Option B**: AssemblyAI API
- **Option C**: Google Speech-to-Text

### 4. Workflow Structure

```
Webhook (Voice/Text Input)
    ↓
[Switch] Voice or Text?
    ↓
[Voice Branch]                [Text Branch]
    ↓                             ↓
Speech-to-Text                Direct Text
    ↓                             ↓
        [Merge] → NLP Processing (OpenAI)
                        ↓
                Bus Data Processing
                        ↓
                Response Generation
                        ↓
                [Switch] Output Format
                    ↓
            [Voice Output]     [Text Output]
                ↓                   ↓
            Text-to-Speech      Direct Response
```

### 5. Configuration Steps

#### Webhook Setup
- URL: `http://localhost:5678/webhook/readdy`
- Method: POST
- Authentication: Optional API key

#### OpenAI Node Configuration
```json
{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 500,
  "system_prompt": "You are Readdy, a helpful bus information assistant. Provide accurate, concise information about bus schedules, routes, and delays."
}
```

#### Bus API Integration
- Base URL: `http://localhost:8000/api/v1`
- Endpoints:
  - `/stops`: Get bus stops
  - `/routes`: Get routes
  - `/trips`: Get real-time trip data
  - `/predictions`: Get delay predictions

### 6. Testing
1. Start BusNotify backend
2. Activate n8n workflow
3. Test endpoints:
   ```bash
   # Text input
   curl -X POST http://localhost:5678/webhook/readdy \
     -H "Content-Type: application/json" \
     -d '{"type": "text", "message": "When is the next bus to downtown?"}'
   
   # Voice input (base64 encoded audio)
   curl -X POST http://localhost:5678/webhook/readdy \
     -H "Content-Type: application/json" \
     -d '{"type": "voice", "audio": "base64_audio_data"}'
   ```

### 7. Frontend Integration

#### HTML/JavaScript Example
```html
<div id="readdy-agent">
  <button id="voice-btn">🎤 Voice</button>
  <input id="text-input" placeholder="Type your message...">
  <button id="send-btn">Send</button>
  <div id="response"></div>
</div>

<script>
// Voice recording
const startVoiceRecording = () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      // Record audio and send to n8n webhook
    });
};

// Text input
document.getElementById('send-btn').onclick = () => {
  const message = document.getElementById('text-input').value;
  fetch('http://localhost:5678/webhook/readdy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'text', message })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('response').innerHTML = data.response;
  });
};
</script>
```

### 8. Advanced Features

#### Context Management
- Store conversation history
- Remember user preferences
- Location-based responses

#### Proactive Notifications
- Set up cron jobs for delay alerts
- SMS/Email integration
- Push notifications

### 9. Deployment Options
- **Local**: Run on localhost
- **Cloud**: Deploy to n8n cloud
- **Self-hosted**: Docker deployment

### 10. Monitoring & Logs
- n8n execution logs
- Performance monitoring
- Error handling and fallbacks

## Troubleshooting
- Check API keys and credentials
- Verify backend connectivity
- Test individual nodes
- Review execution logs
