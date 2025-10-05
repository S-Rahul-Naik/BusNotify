#!/usr/bin/env python3
"""
Test the simple Readdy workflow
"""

import requests
import json
from datetime import datetime

def test_simple_readdy():
    """Test the simple workflow"""
    try:
        payload = {
            "message": "Hello Readdy, when is the next bus?",
            "timestamp": datetime.now().isoformat()
        }
        
        print("🧪 Testing Simple Readdy Workflow")
        print("=" * 40)
        print(f"Webhook: http://localhost:5678/webhook/readdy-simple")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            "http://localhost:5678/webhook/readdy-simple",
            json=payload,
            timeout=30
        )
        
        print(f"\n📊 Response:")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS!")
            print(f"Message: {data.get('message', 'No message')}")
            print(f"Type: {data.get('type', 'unknown')}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("After importing the workflow in n8n, run this test!")
    print("Workflow file: simple-readdy-workflow.json")
    print("=" * 50)
    
    test_simple_readdy()