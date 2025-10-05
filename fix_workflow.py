#!/usr/bin/env python3
"""
Fix n8n workflow by creating a new one with correct endpoints
"""

import requests
import json
from datetime import datetime

def create_workflow():
    """Create a new workflow with correct configuration"""
    
    # Simple workflow that works with the current backend
    workflow = {
        "name": "Readdy Agent Fixed",
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "readdy-fixed",
                    "responseMode": "responseNode",
                    "options": {}
                },
                "id": "webhook",
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [300, 300],
                "webhookId": "readdy-fixed"
            },
            {
                "parameters": {
                    "model": "gpt-3.5-turbo",
                    "messages": {
                        "messageValues": [
                            {
                                "role": "system",
                                "message": "You are Readdy, the BusTracker assistant. Help users with bus schedules and appointment booking. Be friendly and helpful. Keep responses concise."
                            },
                            {
                                "role": "user", 
                                "message": "={{ $json.message }}"
                            }
                        ]
                    },
                    "options": {
                        "temperature": 0.7,
                        "maxTokens": 150
                    }
                },
                "id": "openai",
                "name": "OpenAI Chat",
                "type": "@n8n/n8n-nodes-langchain.chatOpenAi",
                "typeVersion": 1,
                "position": [500, 300],
                "credentials": {
                    "openAiApi": {
                        "id": "openai-key",
                        "name": "OpenAI"
                    }
                }
            },
            {
                "parameters": {
                    "respondWith": "json",
                    "responseBody": {
                        "message": "={{ $json.response }}",
                        "type": "text",
                        "timestamp": "={{ new Date().toISOString() }}"
                    }
                },
                "id": "response",
                "name": "Response",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [700, 300]
            }
        ],
        "connections": {
            "Webhook": {
                "main": [
                    [
                        {
                            "node": "OpenAI Chat",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "OpenAI Chat": {
                "main": [
                    [
                        {
                            "node": "Response",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        "active": True,
        "settings": {
            "saveDataErrorExecution": "all",
            "saveDataSuccessExecution": "all",
            "saveManualExecutions": True
        }
    }
    
    try:
        print("🔄 Creating new Readdy workflow...")
        response = requests.post(
            "http://localhost:5678/api/v1/workflows",
            json=workflow,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            print("✅ Workflow created successfully!")
            print(f"   ID: {result.get('id', 'Unknown')}")
            print(f"   Name: {result.get('name', 'Unknown')}")
            print(f"   Webhook: http://localhost:5678/webhook/readdy-fixed")
            return True
        else:
            print(f"❌ Failed to create workflow: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating workflow: {e}")
        return False

def test_new_webhook():
    """Test the new webhook"""
    try:
        payload = {
            "message": "Hello, when is the next bus to downtown?",
            "timestamp": datetime.now().isoformat()
        }
        
        print("\n🧪 Testing new webhook...")
        response = requests.post(
            "http://localhost:5678/webhook/readdy-fixed",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Webhook test successful!")
            print(f"   Response: {data.get('message', 'No message')}")
            return True
        else:
            print(f"❌ Webhook test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Webhook test error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Creating Fixed Readdy Workflow")
    print("=" * 50)
    
    success = create_workflow()
    
    if success:
        print("\n⏳ Waiting for workflow to activate...")
        import time
        time.sleep(3)
        
        test_success = test_new_webhook()
        
        if test_success:
            print("\n🎉 SUCCESS! Readdy agent is now working!")
            print("🎯 New webhook URL: http://localhost:5678/webhook/readdy-fixed")
        else:
            print("\n⚠️  Workflow created but test failed")
            print("   Check OpenAI API key configuration")
    else:
        print("\n❌ Failed to create workflow")