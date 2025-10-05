# 🚀 Quick Setup - Your Readdy Agent is Almost Ready!

## ✅ Current Status:
- ✅ **n8n**: Running on http://localhost:5678
- ✅ **Frontend**: Running on http://localhost:3001  
- ❌ **Backend**: Needs to start properly
- ❌ **Workflow**: Needs to be imported and activated

## 🔧 Next Steps (Follow Exactly):

### Step 1: Import n8n Workflow
1. **Open n8n**: http://localhost:5678
2. **Create New Workflow**: Click "+" button
3. **Import Workflow**: 
   - Click the "..." menu (3 dots) in top right
   - Select "Import from file"
   - Choose: `n8n-chatbot-workflow.json`
   - Click "Import"

### Step 2: Configure API Keys
1. **Go to Credentials Tab** in n8n
2. **Add OpenAI Credential**:
   - Click "Create Credential"
   - Select "OpenAI API"
   - Enter your OpenAI API key
   - Save

3. **Add ElevenLabs Credential** (Optional for voice):
   - Click "Create Credential" 
   - Select "HTTP Header Auth"
   - Header Name: `Xi-Api-Key`
   - Header Value: Your ElevenLabs API key
   - Save

### Step 3: Activate Workflow
1. **In the workflow editor**
2. **Toggle the "Active" switch** in top right
3. **Should turn green** when active
4. **Webhook URL** should show: `http://localhost:5678/webhook/readdy`

### Step 4: Start Backend Properly
Run this command in a new PowerShell window:
```powershell
cd backend
python main_mongodb.py
```

### Step 5: Test Your Agent
1. **Open**: http://localhost:3001
2. **Find the chatbot component**
3. **Type**: "What is BusTracker?"
4. **Expected response**: Business information about BusTracker

## 🎤 Test Voice Features:
1. **Click microphone button** 
2. **Say**: "Tell me about your services"
3. **Should get voice response** (if ElevenLabs configured)

## 📋 If You Need API Keys:

### OpenAI API Key:
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into n8n

### ElevenLabs API Key (Optional):
1. Go to: https://elevenlabs.io
2. Sign up for free account
3. Go to Profile → API Keys
4. Copy and paste into n8n

## 🔍 Troubleshooting:

**If backend won't start:**
```powershell
cd backend
python -c "import main_mongodb; print('Import successful')"
```

**If workflow import fails:**
- Make sure the JSON file is valid
- Try copying the content and pasting it directly

**If voice doesn't work:**
- ElevenLabs API key is optional
- Text responses will still work without it

## 🎯 Success Indicators:

When everything is working:
- ✅ n8n shows workflow as "Active"
- ✅ Backend responds on http://localhost:8000
- ✅ Frontend shows Readdy chatbot
- ✅ Test conversation works
- ✅ Voice recording (if microphone enabled)

Your Readdy agent is 90% ready! Just import the workflow and activate it! 🚌🎤