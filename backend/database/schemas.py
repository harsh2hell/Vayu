from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import time

class CycloneEventBase(BaseModel):
    system_id: str
    name: str
    season: str
    basin: str
    category: str
    status: str = "ACTIVE" # ACTIVE, DISSIPATED, HISTORICAL
    peak_intensity_kmh: float
    peak_intensity_knots: float
    lowest_mslp_hpa: float
    landfall_location: Optional[str] = None
    landfall_time: Optional[str] = None
    landfall_lat: Optional[float] = None
    landfall_lon: Optional[float] = None
    surge_height_m: Optional[float] = None
    dvorak_ci: Optional[str] = "T3.5"
    description: Optional[str] = None

class CycloneEventCreate(CycloneEventBase):
    track_history: Optional[List[List[float]]] = []
    track_forecast: Optional[List[Dict[str, Any]]] = []
    cone_polygon: Optional[List[List[float]]] = []
    impact_districts: Optional[List[str]] = []

class CycloneEventResponse(CycloneEventBase):
    id: int
    created_at: str
    updated_at: str
    track_history: List[List[float]] = []
    track_forecast: List[Dict[str, Any]] = []
    cone_polygon: List[List[float]] = []
    impact_districts: List[str] = []

class InferenceLogCreate(BaseModel):
    model_name: str
    model_version: str
    inference_type: str # DETECTION, CLASSIFICATION, TRACK_PREDICTION, MULTI_SOURCE_FUSION
    basin: str = "Bay of Bengal"
    input_source: str # UPLOADED_IMAGE, LIVE_SATELLITE_STREAM, TELEMETRY_FEED
    detected_lat: Optional[float] = None
    detected_lon: Optional[float] = None
    confidence: float
    dvorak_t: Optional[str] = None
    dvorak_ci: Optional[float] = None
    estimated_wind_kmh: Optional[float] = None
    estimated_mslp_hpa: Optional[float] = None
    morphology_pattern: Optional[str] = None # Curved Band, Eye Pattern, CDO, Shear, Embedded Center
    execution_time_ms: float
    metadata_json: Optional[Dict[str, Any]] = {}

class InferenceLogResponse(InferenceLogCreate):
    id: int
    created_at: str

class DisasterAlertCreate(BaseModel):
    alert_level: str # RED_ALERT, ORANGE_ALERT, YELLOW_ALERT, WATCH
    basin: str
    cyclone_name: str
    affected_districts: List[str]
    affected_states: List[str]
    wind_gust_forecast_kmh: float
    surge_height_m: str
    rainfall_24h_mm: float
    evacuation_recommendation: str
    issued_by: str = "CycloneAI Early Warning Gateway (SIH 2026)"
    active: bool = True

class DisasterAlertResponse(DisasterAlertCreate):
    id: int
    issued_at: str
