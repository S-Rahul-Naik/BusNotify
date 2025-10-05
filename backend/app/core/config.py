"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings configuration"""
    
    # Application
    APP_NAME: str = "Bus Delay Prediction System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "bus_notification_system"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # WebSocket
    WEBSOCKET_UPDATE_INTERVAL: int = 10  # seconds
    WEBSOCKET_HIGH_FREQUENCY_INTERVAL: int = 5  # seconds
    WEBSOCKET_LOW_BANDWIDTH_INTERVAL: int = 30  # seconds
    
    # Simulation
    SIMULATION_STEP_INTERVAL: int = 1  # seconds
    DEFAULT_BUS_SPEED: float = 30.0  # km/h
    DELAY_THRESHOLD_MINUTES: int = 5
    
    # Notifications
    # FCM
    FCM_SERVER_KEY: Optional[str] = None
    FCM_CREDENTIALS_PATH: Optional[str] = None
    
    # Email (SendGrid)
    SENDGRID_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@busnotify.com"
    
    # SMS (Twilio)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # External APIs
    WEATHER_API_KEY: Optional[str] = None
    TRAFFIC_API_KEY: Optional[str] = None
    
    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = None
    
    # Machine Learning
    MODEL_UPDATE_INTERVAL_HOURS: int = 24
    PREDICTION_CONFIDENCE_THRESHOLD: float = 0.7
    
    # File paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    MODELS_DIR: Path = BASE_DIR / "models"
    DATA_DIR: Path = BASE_DIR / "data"
    LOGS_DIR: Path = BASE_DIR / "logs"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Ensure required directories exist
settings.MODELS_DIR.mkdir(exist_ok=True)
settings.DATA_DIR.mkdir(exist_ok=True)
settings.LOGS_DIR.mkdir(exist_ok=True)