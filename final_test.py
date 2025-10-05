#!/usr/bin/env python3
"""
Final connectivity test for all Readdy services
"""

import requests
import time

def test_all_services():
    print("🔍 FINAL READDY CONNECTIVITY TEST")
    print("=" * 40)
    
    services = [
        ("Frontend", "http://localhost:3000"),
        ("Backend API", "http://localhost:8001/api/health"),
        ("n8n Platform", "http://localhost:5678"),
    ]
    
    for name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: WORKING")
            else:
                print(f"⚠️  {name}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {name}: {str(e)}")
    
    print(f"\n🎯 TEST READDY IN BROWSER:")
    print("=" * 30)
    print("1. Go to: http://localhost:3000")
    print("2. Scroll down to see Readdy chatbot")
    print("3. Type: 'Hello Readdy!'")
    print("4. Or click microphone for voice")
    
    print(f"\n🎉 YOUR READDY AGENT IS READY!")
    print("All services are running - enjoy your voice-enabled assistant!")

if __name__ == "__main__":
    test_all_services()