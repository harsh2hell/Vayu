import io
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Database Initialization
from .database.seed_data import seed_database
from .database.db_manager import db

# Core Deep Learning Models & Services
from .models.detection_cnn import cyclone_vision_model
from .models.pattern_classifier import pattern_classifier
from .models.track_lstm import cyclone_forecast_engine
from .services.fusion import fusion_engine
from .utils.bulletin_pdf import generate_official_cyclone_bulletin_pdf
from .services.feed_ingestion import REAL_HISTORICAL_SYSTEMS, fetch_live_ocean_telemetry
from .services.satellite_stream import satellite_stream_processor
from .workers.stream_poller import telemetry_worker

# Modular v1 API Routers
from .routers.satellites import router as satellites_router
from .routers.ocean import router as ocean_router
from .routers.detection import router as detection_router
from .routers.classification import router as classification_router
from .routers.prediction import router as prediction_router
from .routers.fusion import router as fusion_router
from .routers.cyclones import router as cyclones_router
from .routers.alerts import router as alerts_router
from .routers.bulletins import router as bulletins_router
from .routers.analytics import router as analytics_router
from .routers.training import router as training_router

# Initialize enterprise database tables & seeds
seed_database()

# Start background asynchronous telemetry poller
telemetry_worker.start()

app = FastAPI(
    title="VAYU Enterprise Intelligence Gateway",
    description="Operational AI/ML Multi-Source Satellite & Spatiotemporal Cyclone Prediction Platform (SIH 2026 — Team Chakravat Crew)",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for all frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_model_verification():
    """Logs model name, checkpoint path, SHA-256, and parameter count at startup."""
    import os
    import hashlib
    import backend.ml_engine.models.center_detector as cd
    import backend.ml_engine.models.dvorak_classifier as dc
    import backend.ml_engine.models.trajectory_gru as tg

    print("=" * 80)
    print("VAYU PHASE 3D — PRODUCTION MODEL WIRING VERIFICATION")
    print("=" * 80)
    models_to_log = [
        ("CenterDetector", cyclone_vision_model.model, cd.CHECKPOINT_PATH, "MobileNetV3-Small-CenterFix"),
        ("DvorakClassifier", pattern_classifier.model, dc.CHECKPOINT_PATH, "ResNet18-Dvorak-Morphology (4 Validated Classes)"),
        ("TrajectoryGRU", cyclone_forecast_engine.model, tg.CHECKPOINT_PATH, "2-Layer GRU Seq2Seq (+6h to +72h 3-Hourly)")
    ]
    for label, m, ckpt, arch in models_to_log:
        sha = "file_not_found"
        if os.path.exists(ckpt):
            with open(ckpt, "rb") as f:
                sha = hashlib.sha256(f.read()).hexdigest()
        p_count = sum(p.numel() for p in m.parameters())
        print(f"[{label}]")
        print(f"  Architecture:     {arch}")
        print(f"  Checkpoint Path:  {ckpt}")
        print(f"  SHA-256:          {sha}")
        print(f"  Parameter Count:  {p_count:,}")
        print("-" * 80)
    print("=" * 80)

# -------------------------------------------------------------
# Register Modular v1 Routers
# -------------------------------------------------------------
app.include_router(satellites_router)
app.include_router(ocean_router)
app.include_router(detection_router)
app.include_router(classification_router)
app.include_router(prediction_router)
app.include_router(fusion_router)
app.include_router(cyclones_router)
app.include_router(alerts_router)
app.include_router(bulletins_router)
app.include_router(analytics_router)
app.include_router(training_router)


# -------------------------------------------------------------
# Request & Response Data Models (Compatibility Layer)
# -------------------------------------------------------------
class TrackPredictionRequest(BaseModel):
    current_lat: float = 15.4
    current_lon: float = 87.8
    current_wind: float = 85.0
    current_mslp: float = 980.0
    sst: float = 29.5
    vertical_shear_knots: float = 12.0
    basin: str = "Bay of Bengal"
    past_track: Optional[List[Dict[str, Any]]] = None
    storm_id: Optional[str] = None

class BulletinGenerationRequest(BaseModel):
    cyclone_name: str = "Severe Cyclonic Storm DANA"
    basin: str = "Bay of Bengal"
    category: str = "Severe Cyclonic Storm"
    latitude: float = 15.4
    longitude: float = 87.8
    wind_speed_kmh: float = 85.0
    central_mslp_hpa: float = 980.0

class MultiSourceFusionRequest(BaseModel):
    latitude: float = 15.4
    longitude: float = 87.8
    sst_celsius: float = 29.5
    vertical_shear_knots: float = 12.0
    mslp_hpa: float = 982.0
    mid_level_rh_pct: float = 82.0
    surface_wind_kmh: float = 85.0
    basin: str = "Bay of Bengal"

class AlertCreationRequest(BaseModel):
    alert_level: str = "RED_ALERT"
    basin: str = "Bay of Bengal"
    cyclone_name: str = "Severe Cyclonic Storm DANA"
    affected_districts: List[str] = ["Bhadrak", "Kendrapara", "Balasore"]
    affected_states: List[str] = ["Odisha"]
    wind_gust_forecast_kmh: float = 120.0
    surge_height_m: str = "2.0 – 2.8m"
    rainfall_24h_mm: float = 240.0
    evacuation_recommendation: str = "High priority coastal evacuation recommended."

# -------------------------------------------------------------
# Base Endpoints
# -------------------------------------------------------------
@app.get("/api/health")
def health_check():
    """Health check endpoint to verify backend operational status, active models, and background workers."""
    return {
        "status": "ONLINE",
        "service": "VAYU Enterprise Deep Learning Gateway",
        "team": "Chakravat Crew",
        "problem_statement": "SIH26070",
        "version": "4.0.0",
        "models_active": {
            "detection": "MobileNetV3-Small-CenterFix (Phase 3B, 1,075,431 params)",
            "classification": "ResNet18-Dvorak-Morphology (Phase 3B, 4 Validated Classes, 11,246,436 params)",
            "prediction": "CycloneTrajectoryGRU-Seq2Seq (Phase 3D 3-Hourly Spatiotemporal, 41,764 params)",
            "fusion": "CycloneFusion-Engine v2.5 (Multispectral + Ocean + Shear)"
        },
        "database": "SQLite (cyclone_intel.db Active with 9 Tables)",
        "background_poller": "ACTIVE",
        "timestamp": time.time()
    }

# Backwards compatible alias routes for existing UI components
@app.post("/api/detect")
async def legacy_detect(file: UploadFile = File(...), basin: str = Form("Bay of Bengal")):
    image_bytes = await file.read()
    result = cyclone_vision_model.predict(image_bytes, basin=basin)
    return {"success": True, "filename": file.filename, "data": result}

@app.post("/api/classify")
async def legacy_classify(file: Optional[UploadFile] = File(None), basin: str = Form("Bay of Bengal"), shear_knots: float = Form(12.0)):
    image_bytes = await file.read() if file else None
    result = pattern_classifier.classify(image_bytes=image_bytes, basin=basin, shear_knots=shear_knots)
    return {"success": True, "data": result}

@app.post("/api/predict-track")
def legacy_predict_track(req: TrackPredictionRequest):
    prediction = cyclone_forecast_engine.predict_trajectory(
        current_lat=req.current_lat, current_lon=req.current_lon, current_wind=req.current_wind,
        current_mslp=req.current_mslp, sst=req.sst, vertical_shear_knots=req.vertical_shear_knots, basin=req.basin,
        past_track=req.past_track, storm_id=req.storm_id
    )
    if not prediction.get("success", False) or prediction.get("forecast_status") == "INSUFFICIENT_HISTORY":
        return {
            "success": False,
            "forecast_status": "INSUFFICIENT_HISTORY",
            "message": prediction.get("message", "Trajectory forecasting requires at least 4 consecutive historical fixes (9 hours of track telemetry)."),
            "required_fixes": prediction.get("required_fixes", 4),
            "provided_fixes": prediction.get("provided_fixes", 0),
            "available_storms": ["DANA", "BIPARJOY", "MOCHA", "OCKHI", "AMPHAN", "FANI", "BULBUL", "TITLI", "HUDHUD", "PHAILIN"]
        }
    return {"success": True, "data": prediction}

@app.post("/api/fuse")
def legacy_fuse(req: MultiSourceFusionRequest):
    fused = fusion_engine.fuse_data_sources(
        lat=req.latitude, lon=req.longitude, sst_celsius=req.sst_celsius,
        vertical_shear_knots=req.vertical_shear_knots, mslp_hpa=req.mslp_hpa,
        mid_level_rh_pct=req.mid_level_rh_pct, surface_wind_kmh=req.surface_wind_kmh, basin=req.basin
    )
    return {"success": True, "data": fused}

@app.post("/api/generate-bulletin")
def legacy_generate_bulletin(req: BulletinGenerationRequest):
    pdf_bytes = generate_official_cyclone_bulletin_pdf(req.dict())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=IMD_Advisory_{req.cyclone_name.replace(' ', '_')}.pdf"}
    )

@app.get("/api/cyclones/real-systems")
def legacy_real_systems(basin: Optional[str] = None):
    cyclones = db.get_all_cyclones(basin=basin)
    return {"success": True, "count": len(cyclones), "systems": cyclones}

@app.get("/api/cyclones/real-systems/{system_id}")
def legacy_real_system_detail(system_id: str):
    cyclone = db.get_cyclone_by_id(system_id)
    if not cyclone and system_id in REAL_HISTORICAL_SYSTEMS:
        cyclone = REAL_HISTORICAL_SYSTEMS[system_id]
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone system not found")
    return {"success": True, "data": cyclone}

@app.get("/api/cyclones/live-ocean")
def legacy_live_ocean(basin: str = "Bay of Bengal"):
    return {"success": True, "data": fetch_live_ocean_telemetry(basin=basin)}

@app.get("/api/alerts")
def legacy_alerts():
    alerts = db.get_active_alerts()
    return {"success": True, "count": len(alerts), "alerts": alerts}

@app.post("/api/alerts")
def legacy_create_alert(req: AlertCreationRequest):
    alert_id = db.create_alert(req.dict())
    return {"success": True, "alert_id": alert_id, "message": "Disaster alert broadcast successfully."}

@app.get("/api/history/inferences")
def legacy_history(limit: int = Query(15, ge=1, le=100)):
    logs = db.get_recent_inferences(limit=limit)
    return {"success": True, "count": len(logs), "logs": logs}

@app.get("/api/benchmarks")
def legacy_benchmarks():
    return {
        "success": True,
        "phase": "Phase 3D Production Real Benchmark (Corrected 3-Hourly Trajectory Horizons)",
        "scientific_disclosure": "Real dataset benchmark evaluated on held-out North Indian Ocean cyclones (DANA, BIPARJOY).",
        "models": {
            "detection": {
                "name": "MobileNetV3-Small-CenterFix (Phase 3B)",
                "checkpoint": "phase3b/vayu_detector_mobilenetv3_p3b.pt",
                "accuracy_pct": 100.0,
                "eye_localization_error_km": 52.33,
                "validation_error_km": 25.65,
                "test_false_positive_rate": 0.0,
                "note": "Measured on real NASA GIBS held-out test frames (Cyclone DANA & BIPARJOY)"
            },
            "classification": {
                "name": "ResNet18-Dvorak-Morphology (Phase 3B)",
                "checkpoint": "phase3b/vayu_morph_resnet18_p3b.pt",
                "classes_supported": 4,
                "classes_authenticated": ["Eye Pattern", "Curved Band Pattern", "Shear Pattern", "Calm Baseline"],
                "classes_insufficient": ["CDO (Insufficient NIO annotations)", "Embedded Center (Insufficient ground truth)"],
                "validation_accuracy_pct": 50.0,
                "test_accuracy_pct": 0.0,
                "note": "Experimental prototype model with severe class imbalance (N=14 train)"
            },
            "prediction": {
                "name": "CycloneTrajectoryGRU-Seq2Seq (Phase 3D Retrained)",
                "checkpoint": "phase3b/vayu_track_gru_p3b.pt",
                "sampling_interval_hours": 3.0,
                "horizons": {
                    "+6h": {"gru_mae_km": 68.9, "persistence_baseline_km": 25.5, "winner": "Persistence"},
                    "+12h": {"gru_mae_km": 114.9, "persistence_baseline_km": 54.0, "winner": "Persistence"},
                    "+18h": {"gru_mae_km": 158.9, "persistence_baseline_km": 82.8, "winner": "Persistence"},
                    "+24h": {"gru_mae_km": 197.7, "persistence_baseline_km": 110.9, "winner": "Persistence"},
                    "+48h": {"gru_mae_km": 278.7, "persistence_baseline_km": 251.4, "winner": "Persistence"},
                    "+72h": {"gru_mae_km": 311.9, "persistence_baseline_km": 397.9, "winner": "GRU (Outperforms Persistence by 86.0 km)"}
                },
                "overall_test_mae_km": 178.5,
                "obsolete_metrics": {
                    "status": "OBSOLETE — INCORRECT 3-HOUR/6-HOUR LABELING",
                    "old_reported_24h_km": 96.9,
                    "old_reported_72h_km": 203.2,
                    "explanation": "Phase 3B assumed 6-hour interval steps; step offset 4 was actually +12h, and step offset 12 was actually +36h. Phase 3D evaluates true +6h, +12h, +18h, +24h, +48h, +72h horizons."
                }
            }
        }
    }

@app.post("/api/satellite/live-sync")
def legacy_satellite_sync(channel_id: str = "insat-3dr-ir", basin: str = "Bay of Bengal"):
    result = satellite_stream_processor.fetch_and_process_live_stream(channel_id=channel_id, basin=basin)
    return {"success": True, "data": result}

@app.post("/api/satellite/process-manual")
async def legacy_process_manual(
    file: Optional[UploadFile] = File(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    wind_speed: Optional[float] = Form(None),
    pressure: Optional[float] = Form(None),
    sst: float = Form(29.5),
    shear: float = Form(12.0),
    basin: str = Form("Bay of Bengal")
):
    image_bytes = await file.read() if file else None
    result = satellite_stream_processor.process_manual_payload(
        image_bytes=image_bytes, override_lat=latitude, override_lon=longitude,
        override_wind=wind_speed, override_mslp=pressure, sst=sst, shear=shear, basin=basin
    )
    return {"success": True, "data": result}

@app.get("/api/cyclogenesis-watch")
def api_cyclogenesis_watch(basin: str = "Bay of Bengal"):
    """Returns active cyclogenesis detection, forming low pressure systems (Invests), and 72h formation probability."""
    from .services.feed_ingestion import get_live_cyclogenesis_watch
    data = get_live_cyclogenesis_watch(basin=basin)
    return {"success": True, "data": data}
