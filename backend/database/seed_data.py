from .db_manager import db
from ..services.feed_ingestion import REAL_HISTORICAL_SYSTEMS

# Standard Multi-Agency Satellite Observation Sources
SATELLITE_CATALOG = [
    {
        "source_id": "insat-3dr",
        "agency": "ISRO / MOSDAC",
        "satellite_name": "INSAT-3DR Geostationary Imager & Sounder",
        "orbit_type": "GEOSTATIONARY (74°E Orbital Slot)",
        "spectral_channels": ["TIR1 (10.8µm)", "TIR2 (12.0µm)", "WV (6.8µm)", "VIS (0.65µm)", "SWIR (1.6µm)", "MIR (3.9µm)"],
        "spatial_resolution_km": 1.0,
        "temporal_cadence_min": 15,
        "status": "ONLINE",
        "data_format": "HDF5 / NetCDF-4",
        "coverage_basin": "Bay of Bengal, Arabian Sea & North Indian Ocean"
    },
    {
        "source_id": "insat-3d",
        "agency": "ISRO / MOSDAC",
        "satellite_name": "INSAT-3D Geostationary Meteorological Satellite",
        "orbit_type": "GEOSTATIONARY (82°E Orbital Slot)",
        "spectral_channels": ["TIR1 (10.8µm)", "TIR2 (12.0µm)", "WV (6.8µm)", "VIS (0.65µm)", "MIR (3.9µm)"],
        "spatial_resolution_km": 1.0,
        "temporal_cadence_min": 30,
        "status": "ONLINE",
        "data_format": "HDF5 / NetCDF-4",
        "coverage_basin": "North Indian Ocean Basin"
    },
    {
        "source_id": "noaa-20-viirs",
        "agency": "NOAA / NESDIS",
        "satellite_name": "NOAA-20 / VIIRS Polar Orbiting Radiometer",
        "orbit_type": "POLAR_ORBITING (Sun-Synchronous 824 km)",
        "spectral_channels": ["Day-Night Band (DNB)", "I-Band IR (375m)", "M-Band Multispectral"],
        "spatial_resolution_km": 0.375,
        "temporal_cadence_min": 100,
        "status": "ONLINE",
        "data_format": "GeoTIFF / NetCDF-4",
        "coverage_basin": "Global / Indian Ocean"
    },
    {
        "source_id": "oceansat-3-scat",
        "agency": "ISRO / SAC",
        "satellite_name": "EOS-06 / Oceansat-3 Scatterometer (OSCAT-3)",
        "orbit_type": "POLAR_ORBITING (Ku-Band Ocean Wind Vector)",
        "spectral_channels": ["Ku-Band Radar (13.515 GHz)", "Ocean Surface Vector Winds"],
        "spatial_resolution_km": 12.5,
        "temporal_cadence_min": 720,
        "status": "ONLINE",
        "data_format": "NetCDF-4 / BUFR",
        "coverage_basin": "Indian Ocean Marine Sectors"
    },
    {
        "source_id": "eumetsat-meteosat-9",
        "agency": "EUMETSAT / IMD",
        "satellite_name": "Meteosat-9 Indian Ocean Data Coverage (IODC)",
        "orbit_type": "GEOSTATIONARY (45.5°E Orbital Slot)",
        "spectral_channels": ["High Resolution Visible (HRV)", "SEVIRI IR 10.8µm", "WV 6.2µm", "WV 7.3µm"],
        "spatial_resolution_km": 3.0,
        "temporal_cadence_min": 15,
        "status": "ONLINE",
        "data_format": "HRIT / NetCDF",
        "coverage_basin": "West Arabian Sea & Indian Ocean"
    }
]

# Real INCOIS / NIOT Deep-Sea Moored Ocean Meteorological Buoys
OCEAN_BUOY_CATALOG = [
    {
        "buoy_id": "BD08",
        "agency": "INCOIS / NIOT (Moored Buoy Network)",
        "latitude": 18.2,
        "longitude": 89.7,
        "basin": "Bay of Bengal",
        "sea_surface_temp_c": 29.8,
        "sea_surface_pressure_hpa": 1007.2,
        "surface_wind_speed_kmh": 32.5,
        "surface_wind_direction_deg": 215.0,
        "significant_wave_height_m": 2.1,
        "ocean_heat_content_kj_cm2": 88.5,
        "salinity_psu": 33.8,
        "timestamp": "2026-09-02 12:00:00 IST"
    },
    {
        "buoy_id": "BD11",
        "agency": "INCOIS / NIOT (Central Bay Buoy)",
        "latitude": 13.5,
        "longitude": 84.0,
        "basin": "Bay of Bengal",
        "sea_surface_temp_c": 30.2,
        "sea_surface_pressure_hpa": 1008.5,
        "surface_wind_speed_kmh": 28.0,
        "surface_wind_direction_deg": 230.0,
        "significant_wave_height_m": 1.8,
        "ocean_heat_content_kj_cm2": 95.2,
        "salinity_psu": 34.2,
        "timestamp": "2026-09-02 12:00:00 IST"
    },
    {
        "buoy_id": "AD02",
        "agency": "INCOIS / NIOT (Arabian Sea Deep Buoy)",
        "latitude": 15.0,
        "longitude": 69.0,
        "basin": "Arabian Sea",
        "sea_surface_temp_c": 29.1,
        "sea_surface_pressure_hpa": 1009.4,
        "surface_wind_speed_kmh": 22.0,
        "surface_wind_direction_deg": 280.0,
        "significant_wave_height_m": 1.5,
        "ocean_heat_content_kj_cm2": 76.0,
        "salinity_psu": 35.8,
        "timestamp": "2026-09-02 12:00:00 IST"
    },
    {
        "buoy_id": "AD04",
        "agency": "INCOIS / NIOT (North Arabian Sea Buoy)",
        "latitude": 20.5,
        "longitude": 67.2,
        "basin": "Arabian Sea",
        "sea_surface_temp_c": 28.6,
        "sea_surface_pressure_hpa": 1008.8,
        "surface_wind_speed_kmh": 26.5,
        "surface_wind_direction_deg": 265.0,
        "significant_wave_height_m": 1.7,
        "ocean_heat_content_kj_cm2": 68.4,
        "salinity_psu": 36.2,
        "timestamp": "2026-09-02 12:00:00 IST"
    }
]

# Registered AI Model Artifacts
AI_MODELS_CATALOG = [
    {
        "model_key": "detection_cnn",
        "model_name": "MobileNetV3-Small-CenterFix (Phase 3B)",
        "version": "3.2.0",
        "backbone": "MobileNetV3-Small Feature Backbone + Dual Regression Head",
        "dataset_trained": "NASA EOSDIS GIBS Benchmark (22 Images, Storm-Disjoint Split)",
        "mae_track_km": 52.33,
        "accuracy_pct": 100.0,
        "parameters_count": "1,075,431 Parameters",
        "is_active": True
    },
    {
        "model_key": "pattern_vit",
        "model_name": "ResNet18-Dvorak-Morphology (Phase 3B Prototype)",
        "version": "3.2.0",
        "backbone": "ResNet18 Backbone + PyTorch Autograd Grad-CAM (4 Classes)",
        "dataset_trained": "Phase 3A Authenticated 4-Class Dataset (Eye, Curved Band, Shear, Calm - 22 Images)",
        "mae_track_km": None,
        "accuracy_pct": 50.0,
        "parameters_count": "11,246,436 Parameters",
        "is_active": True
    },
    {
        "model_key": "track_lstm",
        "model_name": "CycloneTrajectoryGRU-Seq2Seq (Phase 3B)",
        "version": "3.2.0",
        "backbone": "2-Layer GRU Seq2Seq + Monte Carlo Dropout Uncertainty",
        "dataset_trained": "NOAA NCEI IBTrACS v04r01 North Indian Ocean Archive (618 Landmark Points)",
        "mae_track_km": 96.9,
        "accuracy_pct": None,
        "parameters_count": "41,764 Parameters",
        "is_active": True
    },
    {
        "model_key": "fusion_engine",
        "model_name": "CycloneFusion-Engine v2.5",
        "version": "2.5.0",
        "backbone": "Multispectral Spatial Alignment + Thermodynamic Coupling",
        "dataset_trained": "ERA5 Reanalysis + MOSDAC HDF5 + INCOIS Marine Telemetry",
        "mae_track_km": None,
        "accuracy_pct": 97.1,
        "parameters_count": "Rule & Tensor Hybrid",
        "is_active": True
    }
]

def seed_database():
    """Seeds historical cyclone benchmarks, satellite sources, buoys, and AI model registries."""
    print("🛰️ [CycloneAI DB] Seeding enterprise meteorological data...")

    # 1. Seed Satellite Sources
    for src in SATELLITE_CATALOG:
        db.upsert_satellite_source(src)

    # 2. Seed Ocean Buoys
    for buoy in OCEAN_BUOY_CATALOG:
        db.insert_buoy_telemetry(buoy)

    # 3. Seed AI Model Registry
    for model in AI_MODELS_CATALOG:
        db.register_ai_model(model)

    # 4. Seed Historical Cyclones
    for system_id, data in REAL_HISTORICAL_SYSTEMS.items():
        event = {
            "system_id": data["id"],
            "name": data["name"],
            "season": data["season"],
            "basin": data["basin"],
            "category": data["category"],
            "status": "HISTORICAL_BENCHMARK",
            "peak_intensity_kmh": data["peak_intensity_kmh"],
            "peak_intensity_knots": data["peak_intensity_knots"],
            "lowest_mslp_hpa": data["lowest_mslp_hpa"],
            "landfall_location": data["landfall"]["location"],
            "landfall_time": data["landfall"]["timestamp"],
            "landfall_lat": data["landfall"]["lat"],
            "landfall_lon": data["landfall"]["lon"],
            "surge_height_m": data["landfall"]["surge_height_m"],
            "dvorak_ci": data["dvorak_ci"],
            "description": data["description"],
            "track_history": data["track_history"],
            "track_forecast": data["track_forecast"],
            "cone_polygon": data["cone_polygon"],
            "impact_districts": data["impact_districts"]
        }
        db.upsert_cyclone_event(event)

    # 5. Seed Default Active Disaster Alert
    existing_alerts = db.get_active_alerts()
    if not existing_alerts:
        db.create_alert({
            "alert_level": "RED_ALERT",
            "basin": "Bay of Bengal",
            "cyclone_name": "Severe Cyclonic Storm DANA",
            "affected_districts": ["Bhadrak", "Kendrapara", "Balasore", "Jagatsinghpur", "Purba Medinipur"],
            "affected_states": ["Odisha", "West Bengal"],
            "wind_gust_forecast_kmh": 120.0,
            "surge_height_m": "2.0 – 2.8m",
            "rainfall_24h_mm": 240.0,
            "evacuation_recommendation": "High priority evacuation in progress for 1.2M residents across coastal Odisha.",
            "cap_identifier": "IN-IMD-CAP-2026-DANA-01",
            "cap_urgency": "Immediate",
            "cap_severity": "Extreme",
            "cap_certainty": "Observed",
            "issued_by": "VAYU Early Warning Gateway (SIH 2026)"
        })

    print("✅ [VAYU DB] Database initialized with satellite sources, marine buoys, AI model registries, and benchmarks.")

if __name__ == "__main__":
    seed_database()
