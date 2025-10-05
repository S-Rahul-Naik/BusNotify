"""
Test script for Readdy Agent integration
Tests the complete pipeline: Frontend → n8n → Backend
"""

import requests
import json
import time
from datetime import datetime

def test_backend():
    """Test if backend is running and responsive"""
    try:
        response = requests.get("http://localhost:8001/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running")
        return False
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False

def test_n8n():
    """Test if n8n webhook is accessible"""
    try:
        # Test with a simple GET request first
        response = requests.get("http://localhost:5678/webhook/readdy", timeout=5)
        print("✅ n8n is running (webhook accessible)")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ n8n is not running")
        return False
    except Exception as e:
        print(f"❌ n8n test failed: {e}")
        return False

def test_readdy_text():
    """Test Readdy with text input"""
    try:
        payload = {
            "type": "text",
            "message": "When is the next bus to downtown?",
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(
            "http://localhost:5678/webhook/readdy",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Readdy text test successful")
            print(f"   Response: {data.get('message', 'No message')}")
            return True
        else:
            print(f"❌ Readdy text test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Readdy text test failed: {e}")
        return False

def test_backend_endpoints():
    """Test individual backend endpoints"""
    endpoints = [
        "/api/routes",
        "/api/buses", 
        "/api/health"
    ]
    
    all_passed = True
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:8001{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} - {len(data.get(endpoint.split('/')[-1], []))} items")
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
            all_passed = False
    
    return all_passed

def run_all_tests():
    """Run complete test suite"""
    print("🧪 Testing Readdy Agent Integration")
    print("=" * 50)
    
    tests = [
        ("Backend Health", test_backend),
        ("n8n Webhook", test_n8n),
        ("Backend Endpoints", test_backend_endpoints),
        ("Readdy Text Response", test_readdy_text)
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n📋 Testing {test_name}...")
        results[test_name] = test_func()
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:<25} {status}")
    
    all_passed = all(results.values())
    print(f"\nOverall Status: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    if not all_passed:
        print("\n🔧 Troubleshooting Tips:")
        if not results.get("Backend Health", False):
            print("   • Start backend: cd backend && python main_mongodb.py")
        if not results.get("n8n Webhook", False):
            print("   • Start n8n: n8n start")
            print("   • Import workflow: n8n-chatbot-workflow.json")
        if not results.get("Readdy Text Response", False):
            print("   • Configure OpenAI API key in n8n")
            print("   • Activate the Readdy workflow")
    
    return all_passed

if __name__ == "__main__":
    run_all_tests()