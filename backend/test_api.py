"""
Test script for MongoDB backend
"""

import asyncio
import aiohttp
import json

async def test_api():
    """Test the MongoDB API endpoints"""
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        print("🧪 Testing BusNotify MongoDB API...")
        
        # Test endpoints
        endpoints = [
            "/",
            "/api/health",
            "/api/routes",
            "/api/buses",
            "/api/stops",
            "/api/stats"
        ]
        
        for endpoint in endpoints:
            try:
                url = f"{base_url}{endpoint}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ {endpoint}: {response.status}")
                        if endpoint == "/api/routes":
                            print(f"   Routes count: {data.get('count', 0)}")
                        elif endpoint == "/api/buses":
                            print(f"   Buses count: {data.get('count', 0)}")
                        elif endpoint == "/api/stops":
                            print(f"   Stops count: {data.get('count', 0)}")
                    else:
                        print(f"❌ {endpoint}: {response.status}")
            except Exception as e:
                print(f"❌ {endpoint}: Error - {e}")
        
        # Test specific route
        try:
            async with session.get(f"{base_url}/api/routes/route-42") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ /api/routes/route-42: {response.status}")
                    print(f"   Route: {data.get('route', {}).get('name', 'Unknown')}")
                else:
                    print(f"❌ /api/routes/route-42: {response.status}")
        except Exception as e:
            print(f"❌ /api/routes/route-42: Error - {e}")

if __name__ == "__main__":
    asyncio.run(test_api())