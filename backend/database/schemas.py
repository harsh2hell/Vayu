from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# 1. SATELLITE DATA SOURCES & FRAMES
# -------------------------------------------------------------
class SatelliteSourceBase(BaseModel):
    source_id: str
    agency: str # ISRO, NOAA, EUMETSAT, NASA
    satellite_name: str # INSAT-3DR, INSAT-3D, NOAA-20, METEOSAT-9, GPM
    orbit_type: str # GEOSTATIONARY, POLAR_ORBITING
    spectral_channels: List[str]
    spatial_resolution_km: float
    temporal_cadence_min: int
    status: str = "ONLINE"
    data_format: str = "HDF5 / NetCDF-4"
    coverage_basin: str = "North Indian Ocean"

class SatelliteFrameCreate(BaseModel):
    source_id: str
    channel: str # TIR1, TIR2, WV, VIS, SWIR, MIR
    timestamp: str
    basin: str = "Bay of Bengal"
    center_lat: float
    center_lon: float
    min_brightness_temp_c: float
    avg_brightness_temp_c: float
    convective_cloud_fraction: float
    storage_path: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = {}

# -------------------------------------------------------------
# 2. OCEAN BUOY & SCATTEROMETER TELEMETRY
# -------------------------------------------------------------
class OceanBuoyTelemetryCreate(BaseModel):
    buoy_id: str # e.g. BD08 (Bay of Bengal Deep Sea Buoy), AD02 (Arabian Sea Buoy)
    agency: str = "INCOIS / NIOT"
    latitude: float
    longitude: float
    basin: str
    sea_surface_temp_c: float
    sea_surface_pressure_hpa: float
    surface_wind_speed_kmh: float
    surface_wind_direction_deg: float
    significant_wave_height_m: float
    ocean_heat_content_kj_cm2: float
    salinity_psu: Optional[float] = 34.5
    timestamp: str

# -------------------------------------------------------------
# 3. CYCLONE EVENTS & TRACKS
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# 4. AI INFERENCE & MODEL REGISTRY
# -------------------------------------------------------------
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
    morphology_pattern: Optional[str] = None
    execution_time_ms: float
    metadata_json: Optional[Dict[str, Any]] = {}

class AIModelRegistryEntry(BaseModel):
    model_key: str # detection_cnn, pattern_vit, track_lstm, fusion_engine
    model_name: str
    version: str
    backbone: str
    dataset_trained: str
    mae_track_km: Optional[float] = None
    accuracy_pct: Optional[float] = None
    parameters_count: str
    is_active: bool = True

# -------------------------------------------------------------
# 5. DISASTER ALERTS (OASIS CAP v1.2)
# -------------------------------------------------------------
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
    cap_identifier: Optional[str] = None
    cap_urgency: str = "Immediate"
    cap_severity: str = "Extreme"
    cap_certainty: str = "Observed"
    issued_by: str = "VAYU Early Warning Gateway (SIH 2026)"
    active: bool = True

# -------------------------------------------------------------
# 6. MULTI-SOURCE FUSION REQUEST
# -------------------------------------------------------------
class MultiSourceFusionRequest(BaseModel):
    latitude: float = 15.4
    longitude: float = 87.8
    sst_celsius: float = 29.5
    vertical_shear_knots: float = 12.0
    mslp_hpa: float = 982.0
    mid_level_rh_pct: float = 82.0
    surface_wind_kmh: float = 85.0
    basin: str = "Bay of Bengal"


# -------------------------------------------------------------
# 7. VAYU ALERTS & MOBILE DEVICE FOUNDATION (PHASE 10A)
# -------------------------------------------------------------
class DeviceRegisterRequest(BaseModel):
    device_id: str
    fcm_token: str
    platform: str = "android"
    app_version: Optional[str] = "1.0.0"
    os_version: Optional[str] = None
    device_model: Optional[str] = None
    locale: Optional[str] = "en_IN"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None
    state: Optional[str] = None


class DeviceUnregisterRequest(BaseModel):
    device_id: str


class NotificationPreferencesUpdate(BaseModel):
    device_id: str
    enable_critical: Optional[bool] = None
    enable_warning: Optional[bool] = None
    enable_watch: Optional[bool] = None
    enable_info: Optional[bool] = None
    enable_test: Optional[bool] = None
    enable_sound: Optional[bool] = None
    enable_vibration: Optional[bool] = None
    subscribed_basins: Optional[List[str]] = None
    subscribed_states: Optional[List[str]] = None
    max_alert_radius_km: Optional[float] = None


class NotificationPreferencesResponse(BaseModel):
    device_id: str
    enable_critical: bool = True
    enable_warning: bool = True
    enable_watch: bool = True
    enable_info: bool = False
    enable_test: bool = False
    enable_sound: bool = True
    enable_vibration: bool = True
    subscribed_basins: List[str] = ["Bay of Bengal", "Arabian Sea"]
    subscribed_states: List[str] = []
    max_alert_radius_km: float = 300.0
    updated_at: Optional[str] = None


class VayuAlertCreate(BaseModel):
    alert_id: Optional[str] = None
    storm_id: Optional[str] = None
    storm_name: str
    severity: str = "WARNING"  # INFO, WATCH, WARNING, CRITICAL, TEST
    title: str
    message: str
    source: str = "VAYU_MODEL"  # VAYU_MODEL, VAYU_OPERATOR, OFFICIAL_ADVISORY, TEST
    source_module: Optional[str] = "Trajectory-GRU"
    location_region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = 150.0
    metadata_json: Optional[Dict[str, Any]] = {}
    expires_at: Optional[str] = None


class VayuAlertModel(BaseModel):
    alert_id: str
    storm_id: Optional[str] = None
    storm_name: str
    severity: str
    title: str
    message: str
    source: str
    source_module: Optional[str] = None
    location_region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = {}
    is_active: bool = True
    created_at: str
    expires_at: str


class TestNotificationRequest(BaseModel):
    title: Optional[str] = "VAYU Test Alert"
    message: Optional[str] = "Notification pipeline is operational."
    severity: Optional[str] = "TEST"
    target_mode: Optional[str] = "all"  # "my_device", "selected", "all"
    target_device_ids: Optional[List[str]] = None
    alert_id: Optional[str] = None


