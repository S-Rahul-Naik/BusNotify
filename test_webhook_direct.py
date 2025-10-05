#!/usr/bin/env python3
"""
Direct test of n8n webhook response
"""

import requests
import json
from datetime import datetime

def test_webhook_direct():
    """Test webhook with detailed response analysis"""
    try:
        payload = {
            "type": "text",
            "message": "Hello Readdy, when is the next bus?",
            "timestamp": datetime.now().isoformat()
        }
        
        print("📞 Sending request to n8n webhook...")
        print(f"   Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            "http://localhost:5678/webhook/readdy",
            json=payload,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📊 Response Details:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Content Type: {response.headers.get('content-type', 'Unknown')}")
        print(f"   Content Length: {len(response.content)} bytes")
        
        if response.content:
            print(f"\n📄 Raw Response:")
            print(f"   {response.content}")
            
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    json_data = response.json()
                    print(f"\n📋 JSON Response:")
                    print(f"   {json.dumps(json_data, indent=2)}")
                except json.JSONDecodeError as e:
                    print(f"   ❌ JSON decode error: {e}")
            else:
                print(f"\n📝 Text Response:")
                print(f"   {response.text}")
        else:
            print("\n📭 Empty response")
            
        return response.status_code == 200
        
    except requests.exceptions.Timeout:
        print("❌ Request timed out (30 seconds)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is n8n running?")
        return False
    except Exception as e:
        print(f"❌ Error testing webhook: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Direct n8n Webhook Test")
    print("=" * 50)
    
    success = test_webhook_direct()
    
    if success:
        print("\n✅ Webhook test completed")
    else:
        print("\n❌ Webhook test failed")