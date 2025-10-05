"""
Database initialization and seed data for BusNotify system
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseSeeder:
    def __init__(self, mongodb_url: str, database_name: str):
        self.client = AsyncIOMotorClient(mongodb_url)
        self.db = self.client[database_name]
        
    async def clear_collections(self):
        """Clear all collections for fresh start"""
        collections = ["routes", "buses", "stops", "schedules", "users", "notifications", "delays"]
        for collection in collections:
            await self.db[collection].delete_many({})
            logger.info(f"Cleared collection: {collection}")
    
    async def create_indexes(self):
        """Create database indexes for performance"""
        # Routes indexes
        await self.db.routes.create_index("route_id", unique=True)
        await self.db.routes.create_index("active")
        
        # Buses indexes
        await self.db.buses.create_index("bus_id", unique=True)
        await self.db.buses.create_index("route_id")
        await self.db.buses.create_index([("location.coordinates", "2dsphere")])
        
        # Stops indexes
        await self.db.stops.create_index("stop_id", unique=True)
        await self.db.stops.create_index("route_id")
        await self.db.stops.create_index([("location.coordinates", "2dsphere")])
        
        # Users indexes
        await self.db.users.create_index("email", unique=True)
        await self.db.users.create_index("phone")
        
        # Notifications indexes
        await self.db.notifications.create_index("user_id")
        await self.db.notifications.create_index("created_at")
        
        logger.info("Created database indexes")
    
    async def seed_routes(self):
        """Seed campus bus routes"""
        routes = [
            {
                "route_id": "route-42",
                "name": "Route 42",
                "description": "Main Campus ↔ Engineering Building",
                "color": "#3B82F6",
                "active": True,
                "frequency_minutes": 15,
                "operating_hours": {
                    "start": "07:00",
                    "end": "22:00"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "route_id": "route-15",
                "name": "Route 15", 
                "description": "Dormitories ↔ Library Complex",
                "color": "#10B981",
                "active": True,
                "frequency_minutes": 20,
                "operating_hours": {
                    "start": "06:30",
                    "end": "23:30"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "route_id": "route-88",
                "name": "Route 88",
                "description": "Medical Center ↔ Sports Complex",
                "color": "#8B5CF6",
                "active": True,
                "frequency_minutes": 25,
                "operating_hours": {
                    "start": "08:00",
                    "end": "21:00"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "route_id": "route-23",
                "name": "Route 23",
                "description": "Student Housing ↔ Academic Center",
                "color": "#F59E0B",
                "active": True,
                "frequency_minutes": 12,
                "operating_hours": {
                    "start": "07:30",
                    "end": "22:30"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await self.db.routes.insert_many(routes)
        logger.info(f"Seeded {len(routes)} routes")
    
    async def seed_stops(self):
        """Seed bus stops for each route"""
        stops = [
            # Route 42 stops
            {
                "stop_id": "stop-42-001",
                "route_id": "route-42",
                "name": "Main Campus",
                "description": "Main Campus Central Hub",
                "location": {
                    "type": "Point",
                    "coordinates": [-74.0060, 40.7128]  # [longitude, latitude]
                },
                "order": 1,
                "estimated_time_minutes": 0
            },
            {
                "stop_id": "stop-42-002",
                "route_id": "route-42",
                "name": "Science Building",
                "description": "Science and Research Complex",
                "location": {
                    "type": "Point",
                    "coordinates": [-74.0040, 40.7140]
                },
                "order": 2,
                "estimated_time_minutes": 5
            },
            {
                "stop_id": "stop-42-003",
                "route_id": "route-42",
                "name": "Engineering Building",
                "description": "Engineering and Technology Center",
                "location": {
                    "type": "Point",
                    "coordinates": [-74.0023, 40.7411]
                },
                "order": 3,
                "estimated_time_minutes": 8
            },
            
            # Route 15 stops
            {
                "stop_id": "stop-15-001",
                "route_id": "route-15",
                "name": "North Dormitories",
                "description": "North Campus Residence Halls",
                "location": {
                    "type": "Point",
                    "coordinates": [-73.9851, 40.7589]
                },
                "order": 1,
                "estimated_time_minutes": 0
            },
            {
                "stop_id": "stop-15-002",
                "route_id": "route-15",
                "name": "Student Center",
                "description": "Student Activities and Services",
                "location": {
                    "type": "Point",
                    "coordinates": [-73.9870, 40.7600]
                },
                "order": 2,
                "estimated_time_minutes": 7
            },
            {
                "stop_id": "stop-15-003",
                "route_id": "route-15",
                "name": "Library Complex",
                "description": "Main Library and Study Areas",
                "location": {
                    "type": "Point",
                    "coordinates": [-73.9890, 40.7620]
                },
                "order": 3,
                "estimated_time_minutes": 12
            }
        ]
        
        await self.db.stops.insert_many(stops)
        logger.info(f"Seeded {len(stops)} bus stops")
    
    async def seed_buses(self):
        """Seed active buses"""
        buses = [
            {
                "bus_id": "bus-001",
                "route_id": "route-42",
                "license_plate": "BUS-001",
                "capacity": 45,
                "current_occupancy": random.randint(10, 40),
                "status": "active",
                "location": {
                    "type": "Point",
                    "coordinates": [-74.0060, 40.7128]
                },
                "current_stop_id": "stop-42-001",
                "next_stop_id": "stop-42-002",
                "speed_kmh": random.uniform(25.0, 35.0),
                "last_updated": datetime.utcnow(),
                "created_at": datetime.utcnow()
            },
            {
                "bus_id": "bus-002",
                "route_id": "route-15",
                "license_plate": "BUS-002",
                "capacity": 40,
                "current_occupancy": random.randint(5, 35),
                "status": "active",
                "location": {
                    "type": "Point",
                    "coordinates": [-73.9851, 40.7589]
                },
                "current_stop_id": "stop-15-001",
                "next_stop_id": "stop-15-002",
                "speed_kmh": random.uniform(20.0, 30.0),
                "last_updated": datetime.utcnow(),
                "created_at": datetime.utcnow()
            },
            {
                "bus_id": "bus-003",
                "route_id": "route-88",
                "license_plate": "BUS-003",
                "capacity": 35,
                "current_occupancy": random.randint(8, 30),
                "status": "active",
                "location": {
                    "type": "Point",
                    "coordinates": [-73.9934, 40.7505]
                },
                "current_stop_id": None,
                "next_stop_id": None,
                "speed_kmh": random.uniform(28.0, 38.0),
                "last_updated": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
        ]
        
        await self.db.buses.insert_many(buses)
        logger.info(f"Seeded {len(buses)} buses")
    
    async def seed_users(self):
        """Seed test users"""
        users = [
            {
                "user_id": "user-001",
                "email": "student@university.edu",
                "phone": "+1234567890",
                "name": "Test Student",
                "preferences": {
                    "notifications_enabled": True,
                    "favorite_routes": ["route-42", "route-15"],
                    "notification_types": ["delay", "arrival", "route_change"]
                },
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            },
            {
                "user_id": "user-002",
                "email": "faculty@university.edu", 
                "phone": "+1234567891",
                "name": "Test Faculty",
                "preferences": {
                    "notifications_enabled": True,
                    "favorite_routes": ["route-88"],
                    "notification_types": ["delay", "emergency"]
                },
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
        ]
        
        await self.db.users.insert_many(users)
        logger.info(f"Seeded {len(users)} users")
    
    async def close(self):
        """Close database connection"""
        self.client.close()

async def initialize_database():
    """Initialize database with seed data"""
    try:
        # Database configuration
        MONGODB_URL = "mongodb://localhost:27017"
        DATABASE_NAME = "bus_notification_system"
        
        # Create seeder instance
        seeder = DatabaseSeeder(MONGODB_URL, DATABASE_NAME)
        
        logger.info("🚀 Starting database initialization...")
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        await seeder.clear_collections()
        
        # Create indexes
        await seeder.create_indexes()
        
        # Seed data
        await seeder.seed_routes()
        await seeder.seed_stops()
        await seeder.seed_buses()
        await seeder.seed_users()
        
        # Close connection
        await seeder.close()
        
        logger.info("✅ Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(initialize_database())