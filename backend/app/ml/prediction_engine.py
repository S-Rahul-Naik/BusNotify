"""
Machine Learning Engine for Bus Delay Prediction

This module implements delay prediction models using historical data and real-time factors.
It starts with simple statistical models and evolves into more sophisticated ML approaches.
"""

import asyncio
import logging
import pickle
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib

from app.core.config import settings
from app.database.mongodb import get_trips_collection, get_routes_collection
from app.models.schemas import TripPrediction

logger = logging.getLogger(__name__)

class DelayPredictionEngine:
    """Machine Learning engine for predicting bus delays"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.encoders: Dict[str, LabelEncoder] = {}
        self.model_metadata: Dict[str, Dict] = {}
        self.is_trained = False
        
        # Model types to train
        self.model_types = {
            'linear_regression': LinearRegression(),
            'random_forest': RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        }
        
        # Feature columns
        self.feature_columns = [
            'hour_of_day',
            'day_of_week',
            'month',
            'route_distance_km',
            'estimated_duration_minutes',
            'stops_count',
            'weather_factor',
            'traffic_factor',
            'historical_avg_delay',
            'route_complexity_score'
        ]
        
        self.models_dir = settings.MODELS_DIR
        self.models_dir.mkdir(exist_ok=True)
    
    def extract_time_features(self, timestamp: datetime) -> Dict[str, float]:
        """Extract time-based features from timestamp"""
        return {
            'hour_of_day': timestamp.hour,
            'day_of_week': timestamp.weekday(),
            'month': timestamp.month,
            'is_weekend': float(timestamp.weekday() >= 5),
            'is_rush_hour': float(7 <= timestamp.hour <= 9 or 17 <= timestamp.hour <= 19),
            'is_peak_traffic': float(6 <= timestamp.hour <= 22)
        }
    
    def calculate_weather_factor(self, timestamp: datetime) -> float:
        """Calculate weather impact factor (mock implementation)"""
        # In production, this would integrate with weather APIs
        # For now, simulate weather patterns
        
        # Simulate seasonal effects
        month = timestamp.month
        if month in [12, 1, 2]:  # Winter
            base_factor = 1.3  # Higher delays in winter
        elif month in [6, 7, 8]:  # Summer
            base_factor = 1.1  # Slightly higher delays due to tourism
        else:
            base_factor = 1.0
        
        # Add random weather variations
        import random
        weather_variation = random.uniform(0.8, 1.4)
        
        return base_factor * weather_variation
    
    def calculate_traffic_factor(self, timestamp: datetime) -> float:
        """Calculate traffic impact factor based on time"""
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        
        # Weekend traffic patterns
        if day_of_week >= 5:  # Weekend
            if 10 <= hour <= 16:
                return 1.2  # Moderate weekend traffic
            else:
                return 0.9  # Light traffic
        
        # Weekday traffic patterns
        if 7 <= hour <= 9:  # Morning rush
            return 1.8
        elif 17 <= hour <= 19:  # Evening rush
            return 1.9
        elif 10 <= hour <= 16:  # Midday
            return 1.3
        elif 19 <= hour <= 22:  # Evening
            return 1.2
        else:  # Night/early morning
            return 0.7
    
    def calculate_route_complexity_score(self, route_data: Dict) -> float:
        """Calculate route complexity based on stops, distance, and patterns"""
        stops_count = len(route_data.get('stops', []))
        distance_km = route_data.get('distance_km', 0)
        
        # Base complexity
        complexity = stops_count * 0.1 + distance_km * 0.05
        
        # Adjust for urban vs suburban routes
        if distance_km > 20:  # Suburban route
            complexity *= 0.8
        elif distance_km < 5:  # Urban route
            complexity *= 1.3
        
        return min(complexity, 5.0)  # Cap at 5.0
    
    async def generate_historical_data(self, days_back: int = 30) -> pd.DataFrame:
        """Generate synthetic historical data for training"""
        logger.info(f"Generating historical data for {days_back} days")
        
        # Get routes
        routes_collection = get_routes_collection()
        routes = await routes_collection.find({"is_active": True}).to_list(length=None)
        
        if not routes:
            logger.warning("No routes found for training data generation")
            return pd.DataFrame()
        
        historical_data = []
        start_date = datetime.now() - timedelta(days=days_back)
        
        for route in routes:
            route_id = route['_id']
            
            # Generate trips for each day
            for day in range(days_back):
                current_date = start_date + timedelta(days=day)
                
                # Generate multiple trips per day (every 30-60 minutes during service hours)
                service_hours = range(6, 23)  # 6 AM to 11 PM
                
                for hour in service_hours:
                    # Skip some hours randomly to simulate realistic schedules
                    if np.random.random() < 0.3:
                        continue
                    
                    trip_time = current_date.replace(
                        hour=hour,
                        minute=np.random.randint(0, 60),
                        second=0,
                        microsecond=0
                    )
                    
                    # Extract features
                    time_features = self.extract_time_features(trip_time)
                    weather_factor = self.calculate_weather_factor(trip_time)
                    traffic_factor = self.calculate_traffic_factor(trip_time)
                    route_complexity = self.calculate_route_complexity_score(route)
                    
                    # Historical average delay (mock)
                    base_delay = np.random.normal(2.0, 1.5)  # Average 2 minutes with variation
                    
                    # Calculate actual delay based on factors
                    delay_multiplier = (
                        weather_factor * 0.3 +
                        traffic_factor * 0.4 +
                        route_complexity * 0.2 +
                        (1.0 if time_features['is_rush_hour'] else 0.8) * 0.1
                    )
                    
                    actual_delay = max(0, base_delay * delay_multiplier + np.random.normal(0, 0.5))
                    
                    historical_data.append({
                        'trip_id': f"trip_{route_id}_{trip_time.isoformat()}",
                        'route_id': route_id,
                        'timestamp': trip_time,
                        'hour_of_day': time_features['hour_of_day'],
                        'day_of_week': time_features['day_of_week'],
                        'month': time_features['month'],
                        'is_weekend': time_features['is_weekend'],
                        'is_rush_hour': time_features['is_rush_hour'],
                        'route_distance_km': route.get('distance_km', 10.0),
                        'estimated_duration_minutes': route.get('estimated_duration_minutes', 30),
                        'stops_count': len(route.get('stops', [])),
                        'weather_factor': weather_factor,
                        'traffic_factor': traffic_factor,
                        'historical_avg_delay': base_delay,
                        'route_complexity_score': route_complexity,
                        'actual_delay_minutes': actual_delay
                    })
        
        df = pd.DataFrame(historical_data)
        logger.info(f"Generated {len(df)} historical data points")
        
        # Save historical data for reference
        data_file = self.models_dir / "historical_data.csv"
        df.to_csv(data_file, index=False)
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features and target variables for training"""
        # Ensure all feature columns exist
        for col in self.feature_columns:
            if col not in df.columns:
                logger.warning(f"Feature column {col} not found, setting to 0")
                df[col] = 0
        
        X = df[self.feature_columns].values
        y = df['actual_delay_minutes'].values
        
        return X, y
    
    async def train_models(self, retrain: bool = False) -> Dict[str, float]:
        """Train all prediction models"""
        if self.is_trained and not retrain:
            logger.info("Models already trained, skipping...")
            return self.model_metadata
        
        logger.info("Starting model training...")
        
        # Generate or load historical data
        df = await self.generate_historical_data(days_back=90)
        
        if df.empty:
            logger.error("No training data available")
            return {}
        
        # Prepare features
        X, y = self.prepare_features(df)
        
        if len(X) == 0:
            logger.error("No features available for training")
            return {}
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.scalers['main'] = scaler
        
        # Train models
        model_performance = {}
        
        for model_name, model in self.model_types.items():
            logger.info(f"Training {model_name}...")
            
            try:
                # Train model
                if model_name == 'linear_regression':
                    model.fit(X_train_scaled, y_train)
                    y_pred = model.predict(X_test_scaled)
                else:
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                
                # Calculate metrics
                mae = mean_absolute_error(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                r2 = r2_score(y_test, y_pred)
                
                # Store model and metadata
                self.models[model_name] = model
                self.model_metadata[model_name] = {
                    'mae': mae,
                    'mse': mse,
                    'rmse': rmse,
                    'r2_score': r2,
                    'training_samples': len(X_train),
                    'test_samples': len(X_test),
                    'trained_at': datetime.utcnow().isoformat()
                }
                
                model_performance[model_name] = mae
                
                logger.info(f"{model_name} - MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.3f}")
                
                # Save model
                model_file = self.models_dir / f"{model_name}_model.joblib"
                joblib.dump(model, model_file)
                
            except Exception as e:
                logger.error(f"Failed to train {model_name}: {e}")
                continue
        
        # Save scaler and metadata
        scaler_file = self.models_dir / "feature_scaler.joblib"
        joblib.dump(scaler, scaler_file)
        
        metadata_file = self.models_dir / "model_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(self.model_metadata, f, indent=2)
        
        self.is_trained = True
        logger.info("Model training completed successfully")
        
        return model_performance
    
    def load_models(self) -> bool:
        """Load trained models from disk"""
        try:
            # Load metadata
            metadata_file = self.models_dir / "model_metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    self.model_metadata = json.load(f)
            
            # Load scaler
            scaler_file = self.models_dir / "feature_scaler.joblib"
            if scaler_file.exists():
                self.scalers['main'] = joblib.load(scaler_file)
            
            # Load models
            for model_name in self.model_types.keys():
                model_file = self.models_dir / f"{model_name}_model.joblib"
                if model_file.exists():
                    self.models[model_name] = joblib.load(model_file)
                    logger.info(f"Loaded {model_name} model")
            
            if self.models:
                self.is_trained = True
                logger.info("All models loaded successfully")
                return True
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
        
        return False
    
    async def predict_delay(
        self,
        route_id: str,
        trip_start_time: datetime,
        model_name: str = 'random_forest'
    ) -> Optional[TripPrediction]:
        """Predict delay for a specific trip"""
        
        if not self.is_trained:
            # Try to load models
            if not self.load_models():
                # Train models if not available
                await self.train_models()
        
        if model_name not in self.models:
            logger.warning(f"Model {model_name} not available, using random_forest")
            model_name = 'random_forest'
            
            if model_name not in self.models:
                logger.error("No trained models available")
                return None
        
        try:
            # Get route information
            routes_collection = get_routes_collection()
            route = await routes_collection.find_one({"_id": route_id})
            
            if not route:
                logger.error(f"Route {route_id} not found")
                return None
            
            # Extract features
            time_features = self.extract_time_features(trip_start_time)
            weather_factor = self.calculate_weather_factor(trip_start_time)
            traffic_factor = self.calculate_traffic_factor(trip_start_time)
            route_complexity = self.calculate_route_complexity_score(route)
            
            # Historical average (mock - in production, calculate from actual data)
            historical_avg_delay = 2.0
            
            # Prepare feature vector
            features = [
                time_features['hour_of_day'],
                time_features['day_of_week'],
                time_features['month'],
                route.get('distance_km', 10.0),
                route.get('estimated_duration_minutes', 30),
                len(route.get('stops', [])),
                weather_factor,
                traffic_factor,
                historical_avg_delay,
                route_complexity
            ]
            
            feature_array = np.array(features).reshape(1, -1)
            
            # Scale features if using linear regression
            if model_name == 'linear_regression' and 'main' in self.scalers:
                feature_array = self.scalers['main'].transform(feature_array)
            
            # Make prediction
            model = self.models[model_name]
            predicted_delay = model.predict(feature_array)[0]
            
            # Calculate confidence based on model performance
            model_meta = self.model_metadata.get(model_name, {})
            mae = model_meta.get('mae', 2.0)
            
            # Confidence decreases with higher MAE
            confidence = max(0.1, min(0.95, 1.0 - (mae / 10.0)))
            
            # Estimate arrival time
            base_duration = route.get('estimated_duration_minutes', 30)
            total_duration = base_duration + predicted_delay
            estimated_arrival = trip_start_time + timedelta(minutes=total_duration)
            
            # Create prediction object
            prediction = TripPrediction(
                trip_id=f"predicted_{route_id}_{trip_start_time.isoformat()}",
                route_id=route_id,
                predicted_delay_minutes=max(0, predicted_delay),
                confidence=confidence,
                next_stop_id=route['stops'][0] if route.get('stops') else '',
                estimated_arrival=estimated_arrival,
                factors={
                    'weather_factor': weather_factor,
                    'traffic_factor': traffic_factor,
                    'route_complexity': route_complexity,
                    'time_features': time_features,
                    'model_used': model_name,
                    'historical_avg_delay': historical_avg_delay
                }
            )
            
            return prediction
            
        except Exception as e:
            logger.error(f"Failed to predict delay: {e}")
            return None
    
    async def get_model_performance(self) -> Dict[str, Any]:
        """Get performance metrics for all trained models"""
        if not self.is_trained and not self.load_models():
            return {"error": "No trained models available"}
        
        return {
            "models": self.model_metadata,
            "feature_columns": self.feature_columns,
            "training_status": "trained" if self.is_trained else "not_trained",
            "available_models": list(self.models.keys())
        }
    
    async def retrain_models(self) -> Dict[str, float]:
        """Retrain all models with fresh data"""
        logger.info("Retraining models...")
        return await self.train_models(retrain=True)

# Global ML engine instance
ml_engine = DelayPredictionEngine()