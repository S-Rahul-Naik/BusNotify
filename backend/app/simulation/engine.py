"""
Bus Movement Simulation Engine

This module simulates bus movement without GPS hardware using time-step approach.
It calculates position based on schedule data and simulates realistic delays.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import math
import random
from dataclasses import dataclass

from app.core.config import settings
from app.models.schemas import Trip, TripStatus, TripPosition, Coordinate
from app.database.mongodb import get_trips_collection, get_routes_collection, get_stops_collection

logger = logging.getLogger(__name__)

@dataclass
class RouteSegment:
    """Represents a segment between two stops"""
    start_stop_id: str
    end_stop_id: str
    distance_km: float
    expected_duration_minutes: float
    start_location: Coordinate
    end_location: Coordinate

class BusSimulator:
    """Simulates individual bus movement"""
    
    def __init__(self, trip_id: str):
        self.trip_id = trip_id
        self.current_segment: Optional[RouteSegment] = None
        self.segment_progress: float = 0.0  # 0.0 to 1.0
        self.base_speed_kmh: float = settings.DEFAULT_BUS_SPEED
        self.current_speed_kmh: float = self.base_speed_kmh
        self.accumulated_delay_minutes: float = 0.0
        
    def calculate_distance_km(self, coord1: Coordinate, coord2: Coordinate) -> float:
        """Calculate distance between two coordinates using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1 = math.radians(coord1.latitude), math.radians(coord1.longitude)
        lat2, lon2 = math.radians(coord2.latitude), math.radians(coord2.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def interpolate_position(self, start: Coordinate, end: Coordinate, progress: float) -> Coordinate:
        """Interpolate position between two coordinates"""
        lat = start.latitude + (end.latitude - start.latitude) * progress
        lon = start.longitude + (end.longitude - start.longitude) * progress
        return Coordinate(latitude=lat, longitude=lon)
    
    def simulate_traffic_delay(self) -> float:
        """Simulate traffic-induced delays (in minutes)"""
        # Random traffic delays based on time of day
        current_hour = datetime.now().hour
        
        # Rush hour delays (7-9 AM, 5-7 PM)
        if (7 <= current_hour <= 9) or (17 <= current_hour <= 19):
            base_delay = random.uniform(0, 5)  # 0-5 minutes
        # Regular hours
        elif 6 <= current_hour <= 22:
            base_delay = random.uniform(0, 2)  # 0-2 minutes
        # Late night (minimal traffic)
        else:
            base_delay = random.uniform(0, 0.5)  # 0-30 seconds
        
        # Add random factors
        random_factor = random.uniform(0.8, 1.2)
        return base_delay * random_factor
    
    def simulate_operational_delay(self) -> float:
        """Simulate operational delays (boarding, mechanical, etc.)"""
        # Random operational factors
        factors = [
            ("normal_boarding", 0.5, 0.8),      # Normal passenger boarding
            ("heavy_boarding", 0.1, 2.0),       # Heavy passenger load
            ("wheelchair_access", 0.05, 3.0),    # Wheelchair accessibility
            ("minor_mechanical", 0.02, 5.0),     # Minor mechanical issues
            ("driver_break", 0.01, 10.0),        # Scheduled driver break
        ]
        
        total_delay = 0.0
        for factor_name, probability, delay_minutes in factors:
            if random.random() < probability:
                total_delay += random.uniform(0, delay_minutes)
                
        return total_delay
    
    async def update_position(self, time_step_seconds: int = 1) -> Optional[TripPosition]:
        """Update bus position based on time step simulation"""
        if not self.current_segment:
            return None
        
        # Calculate movement in this time step
        time_step_hours = time_step_seconds / 3600.0
        distance_moved_km = self.current_speed_kmh * time_step_hours
        
        # Update segment progress
        if self.current_segment.distance_km > 0:
            progress_delta = distance_moved_km / self.current_segment.distance_km
            self.segment_progress = min(1.0, self.segment_progress + progress_delta)
        
        # Calculate current position
        current_location = self.interpolate_position(
            self.current_segment.start_location,
            self.current_segment.end_location,
            self.segment_progress
        )
        
        # Calculate distance to next stop
        distance_to_next_stop = (1.0 - self.segment_progress) * self.current_segment.distance_km
        
        # Estimate arrival time (considering current speed and potential delays)
        if self.current_speed_kmh > 0:
            time_to_arrival_hours = distance_to_next_stop / self.current_speed_kmh
            estimated_arrival = datetime.utcnow() + timedelta(hours=time_to_arrival_hours)
        else:
            estimated_arrival = datetime.utcnow() + timedelta(minutes=30)  # Default estimate
        
        # Create position update
        position = TripPosition(
            location=current_location,
            next_stop_id=self.current_segment.end_stop_id,
            distance_to_next_stop_km=distance_to_next_stop,
            estimated_arrival=estimated_arrival,
            last_updated=datetime.utcnow()
        )
        
        return position
    
    async def advance_to_next_segment(self, route_segments: List[RouteSegment]) -> bool:
        """Advance to the next segment in the route"""
        if not self.current_segment:
            return False
        
        # Find current segment index
        current_index = -1
        for i, segment in enumerate(route_segments):
            if (segment.start_stop_id == self.current_segment.start_stop_id and 
                segment.end_stop_id == self.current_segment.end_stop_id):
                current_index = i
                break
        
        # Move to next segment
        if current_index >= 0 and current_index + 1 < len(route_segments):
            self.current_segment = route_segments[current_index + 1]
            self.segment_progress = 0.0
            
            # Apply delays for this segment
            traffic_delay = self.simulate_traffic_delay()
            operational_delay = self.simulate_operational_delay()
            total_delay = traffic_delay + operational_delay
            
            self.accumulated_delay_minutes += total_delay
            
            # Adjust speed based on delays
            if total_delay > 0:
                # Reduce speed slightly when delays occur
                self.current_speed_kmh = self.base_speed_kmh * random.uniform(0.8, 0.95)
            else:
                # Try to recover time when no delays
                self.current_speed_kmh = self.base_speed_kmh * random.uniform(1.0, 1.1)
            
            return True
        
        return False  # End of route

class SimulationEngine:
    """Main simulation engine that manages all active trips"""
    
    def __init__(self):
        self.active_simulators: Dict[str, BusSimulator] = {}
        self.route_segments_cache: Dict[str, List[RouteSegment]] = {}
        self.is_running = False
        self.simulation_task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start the simulation engine"""
        if self.is_running:
            return
        
        self.is_running = True
        self.simulation_task = asyncio.create_task(self._simulation_loop())
        logger.info("🚌 Simulation engine started")
    
    async def stop(self):
        """Stop the simulation engine"""
        self.is_running = False
        if self.simulation_task:
            self.simulation_task.cancel()
            try:
                await self.simulation_task
            except asyncio.CancelledError:
                pass
        logger.info("🛑 Simulation engine stopped")
    
    async def _simulation_loop(self):
        """Main simulation loop"""
        while self.is_running:
            try:
                await self._update_all_trips()
                await asyncio.sleep(settings.SIMULATION_STEP_INTERVAL)
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    async def _update_all_trips(self):
        """Update all active trips"""
        trips_collection = get_trips_collection()
        
        # Get all active trips
        active_trips = await trips_collection.find({
            "status": {"$in": [TripStatus.SCHEDULED, TripStatus.IN_PROGRESS]}
        }).to_list(length=None)
        
        for trip_data in active_trips:
            trip_id = trip_data["_id"]
            
            # Create simulator if not exists
            if trip_id not in self.active_simulators:
                await self._create_simulator(trip_id, trip_data)
            
            simulator = self.active_simulators.get(trip_id)
            if simulator:
                await self._update_trip_simulation(trip_id, simulator, trip_data)
    
    async def _create_simulator(self, trip_id: str, trip_data: dict):
        """Create a new bus simulator for a trip"""
        try:
            simulator = BusSimulator(trip_id)
            route_id = trip_data["route_id"]
            
            # Get route segments
            route_segments = await self._get_route_segments(route_id)
            if route_segments:
                simulator.current_segment = route_segments[0]
                self.active_simulators[trip_id] = simulator
                
                # Update trip status to in_progress
                trips_collection = get_trips_collection()
                await trips_collection.update_one(
                    {"_id": trip_id},
                    {
                        "$set": {
                            "status": TripStatus.IN_PROGRESS,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
                logger.info(f"Created simulator for trip {trip_id}")
            
        except Exception as e:
            logger.error(f"Failed to create simulator for trip {trip_id}: {e}")
    
    async def _update_trip_simulation(self, trip_id: str, simulator: BusSimulator, trip_data: dict):
        """Update individual trip simulation"""
        try:
            # Update position
            new_position = await simulator.update_position(settings.SIMULATION_STEP_INTERVAL)
            
            if new_position:
                # Check if reached next stop
                if new_position.distance_to_next_stop_km < 0.1:  # Within 100 meters
                    # Add to completed stops
                    completed_stops = trip_data.get("completed_stops", [])
                    next_stop_id = new_position.next_stop_id
                    
                    if next_stop_id not in completed_stops:
                        completed_stops.append(next_stop_id)
                    
                    # Advance to next segment
                    route_segments = await self._get_route_segments(trip_data["route_id"])
                    has_next_segment = await simulator.advance_to_next_segment(route_segments)
                    
                    if not has_next_segment:
                        # Trip completed
                        await self._complete_trip(trip_id)
                        return
                    
                    # Update next stop
                    if simulator.current_segment:
                        new_position.next_stop_id = simulator.current_segment.end_stop_id
                
                # Update trip in database
                trips_collection = get_trips_collection()
                await trips_collection.update_one(
                    {"_id": trip_id},
                    {
                        "$set": {
                            "current_position": new_position.dict(),
                            "delay_minutes": simulator.accumulated_delay_minutes,
                            "next_stop_id": new_position.next_stop_id,
                            "completed_stops": trip_data.get("completed_stops", []),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
                # Emit WebSocket update (will be implemented in websocket module)
                # await websocket_manager.emit_trip_update(trip_id, new_position)
                
        except Exception as e:
            logger.error(f"Failed to update trip simulation {trip_id}: {e}")
    
    async def _complete_trip(self, trip_id: str):
        """Mark trip as completed"""
        try:
            trips_collection = get_trips_collection()
            await trips_collection.update_one(
                {"_id": trip_id},
                {
                    "$set": {
                        "status": TripStatus.COMPLETED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Remove simulator
            if trip_id in self.active_simulators:
                del self.active_simulators[trip_id]
            
            logger.info(f"Trip {trip_id} completed")
            
        except Exception as e:
            logger.error(f"Failed to complete trip {trip_id}: {e}")
    
    async def _get_route_segments(self, route_id: str) -> List[RouteSegment]:
        """Get route segments with caching"""
        if route_id in self.route_segments_cache:
            return self.route_segments_cache[route_id]
        
        try:
            routes_collection = get_routes_collection()
            stops_collection = get_stops_collection()
            
            # Get route
            route = await routes_collection.find_one({"_id": route_id})
            if not route:
                return []
            
            stop_ids = route["stops"]
            segments = []
            
            # Get stop details
            stops_data = {}
            async for stop in stops_collection.find({"_id": {"$in": stop_ids}}):
                stops_data[stop["_id"]] = stop
            
            # Create segments between consecutive stops
            for i in range(len(stop_ids) - 1):
                start_stop_id = stop_ids[i]
                end_stop_id = stop_ids[i + 1]
                
                start_stop = stops_data.get(start_stop_id)
                end_stop = stops_data.get(end_stop_id)
                
                if start_stop and end_stop:
                    start_location = Coordinate(**start_stop["location"])
                    end_location = Coordinate(**end_stop["location"])
                    
                    # Calculate distance
                    distance_km = BusSimulator("dummy").calculate_distance_km(start_location, end_location)
                    
                    # Estimate duration (assuming average speed)
                    expected_duration_minutes = (distance_km / settings.DEFAULT_BUS_SPEED) * 60
                    
                    segment = RouteSegment(
                        start_stop_id=start_stop_id,
                        end_stop_id=end_stop_id,
                        distance_km=distance_km,
                        expected_duration_minutes=expected_duration_minutes,
                        start_location=start_location,
                        end_location=end_location
                    )
                    
                    segments.append(segment)
            
            # Cache segments
            self.route_segments_cache[route_id] = segments
            return segments
            
        except Exception as e:
            logger.error(f"Failed to get route segments for {route_id}: {e}")
            return []

# Global simulation engine instance
simulation_engine = SimulationEngine()