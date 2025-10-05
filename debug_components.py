#!/usr/bin/env python3
"""
Test individual components to debug the issue
"""

import requests
import json

def test_backend_directly():
    """Test backend endpoints directly"""
    print("🔍 Testing Backend Endpoints Directly")
    print("=" * 40)
    
    endpoints = [
        "http://localhost:8001/",
        "http://localhost:8001/api/health", 
        "http://localhost:8001/api/routes",
        "http://localhost:8001/api/buses"
    ]
    
    for url in endpoints:
        try:
            response = requests.get(url, timeout=5)
            print(f"✅ {url}")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Data: {str(data)[:100]}...")
            print()
        except Exception as e:
            print(f"❌ {url} - Error: {e}")
            print()

def test_n8n_simple():
    """Test n8n with minimal payload"""
    print("🔍 Testing n8n with Simple Payload")
    print("=" * 40)
    
    payloads = [
        {"message": "hello"},
        {"text": "hello"},
        {"input": "hello"},
        {"data": "hello"}
    ]
    
    for payload in payloads:
        try:
            print(f"Testing payload: {payload}")
            response = requests.post(
                "http://localhost:5678/webhook/readdy",
                json=payload,
                timeout=10
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            print(f"Headers: {dict(response.headers)}")
            print("-" * 20)
            
        except Exception as e:
            print(f"Error: {e}")
            print("-" * 20)

if __name__ == "__main__":
    test_backend_directly()
    test_n8n_simple()