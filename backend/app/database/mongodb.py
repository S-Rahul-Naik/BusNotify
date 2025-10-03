"""
MongoDB database connection and initialization
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING, GEO2D
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    """MongoDB connection manager"""
    
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.database: AsyncIOMotorDatabase = None
    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.database = self.client[settings.DATABASE_NAME]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
            
            # Create indexes
            await self._create_indexes()
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("✅ Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create database indexes for optimal performance"""
        try:
            # Users collection indexes
            await self.database.users.create_indexes([
                IndexModel([("email", ASCENDING)], unique=True),
                IndexModel([("role", ASCENDING)]),
                IndexModel([("is_active", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)])
            ])
            
            # Routes collection indexes
            await self.database.routes.create_indexes([
                IndexModel([("code", ASCENDING)], unique=True),
                IndexModel([("is_active", ASCENDING)]),
                IndexModel([("name", ASCENDING)])
            ])
            
            # Stops collection indexes
            await self.database.stops.create_indexes([
                IndexModel([("code", ASCENDING)], unique=True),
                IndexModel([("location", GEO2D)]),
                IndexModel([("is_active", ASCENDING)]),
                IndexModel([("name", ASCENDING)])
            ])
            
            # Trips collection indexes
            await self.database.trips.create_indexes([
                IndexModel([("route_id", ASCENDING)]),
                IndexModel([("status", ASCENDING)]),
                IndexModel([("trip_start_time", DESCENDING)]),
                IndexModel([("next_stop_id", ASCENDING)]),
                IndexModel([("route_id", ASCENDING), ("trip_start_time", DESCENDING)]),
                IndexModel([("current_position.last_updated", DESCENDING)])
            ])
            
            # Schedules collection indexes
            await self.database.schedules.create_indexes([
                IndexModel([("route_id", ASCENDING)]),
                IndexModel([("service_type", ASCENDING)]),
                IndexModel([("direction", ASCENDING)]),
                IndexModel([("valid_from", ASCENDING), ("valid_until", ASCENDING)])
            ])
            
            # Subscriptions collection indexes
            await self.database.subscriptions.create_indexes([
                IndexModel([("user_id", ASCENDING)]),
                IndexModel([("route_id", ASCENDING)]),
                IndexModel([("is_active", ASCENDING)]),
                IndexModel([("user_id", ASCENDING), ("route_id", ASCENDING)], unique=True)
            ])
            
            # Notifications collection indexes
            await self.database.notifications.create_indexes([
                IndexModel([("user_id", ASCENDING)]),
                IndexModel([("type", ASCENDING)]),
                IndexModel([("is_read", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)]),
                IndexModel([("trip_id", ASCENDING)]),
                IndexModel([("route_id", ASCENDING)]),
                IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)])
            ])
            
            # Trip states collection (for simulation)
            await self.database.trip_states.create_indexes([
                IndexModel([("trip_id", ASCENDING)]),
                IndexModel([("timestamp", DESCENDING)]),
                IndexModel([("trip_id", ASCENDING), ("timestamp", DESCENDING)])
            ])
            
            logger.info("✅ Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to create indexes: {e}")
            raise

# Global MongoDB instance
mongodb = MongoDB()

# Database connection functions
async def init_database():
    """Initialize database connection"""
    await mongodb.connect()

async def close_database():
    """Close database connection"""
    await mongodb.disconnect()

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return mongodb.database

# Collection getters
def get_users_collection():
    """Get users collection"""
    return mongodb.database.users

def get_routes_collection():
    """Get routes collection"""
    return mongodb.database.routes

def get_stops_collection():
    """Get stops collection"""
    return mongodb.database.stops

def get_trips_collection():
    """Get trips collection"""
    return mongodb.database.trips

def get_schedules_collection():
    """Get schedules collection"""
    return mongodb.database.schedules

def get_subscriptions_collection():
    """Get subscriptions collection"""
    return mongodb.database.subscriptions

def get_notifications_collection():
    """Get notifications collection"""
    return mongodb.database.notifications

def get_trip_states_collection():
    """Get trip states collection"""
    return mongodb.database.trip_states