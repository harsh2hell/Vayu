import io
import time
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models.detection_cnn import cyclone_vision_model
from .models.track_lstm import cyclone_forecast_engine
from .utils.bulletin_pdf import generate_official_cyclone_bulletin_pdf
from .services.feed_ingestion import REAL_HISTORICAL_SYSTEMS, fetch_live_ocean_telemetry
from .services.satellite_stream import satellite_stream_processor

app = FastAPI(
    title="CycloneAI REST API",
    description="Real-Time AI/ML Tropical Cyclone Intelligence & Prediction Gateway (SIH 2026)",
    version="2.1.0"
)

# Enable CORS for frontend Vite dev server (port 5173, 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Request & Response Data Models
# -------------------------------------------------------------
class TrackPredictionRequest(BaseModel):
    current_lat: float = 15.4
    current_lon: float = 87.8
    current_wind: float = 85.0
    current_mslp: float = 980.0
    sst: float = 29.5
    vertical_shear_knots: float = 12.0
    basin: str = "Bay of Bengal"

class BulletinGenerationRequest(BaseModel):
    cyclone_name: str = "Cyclone ALPHA (TC-2026-ALPHA)"
    basin: str = "Bay of Bengal"
    category: str = "Severe Cyclonic Storm"
    latitude: float = 15.4
    longitude: float = 87.8
    wind_speed_kmh: float = 85.0
    central_mslp_hpa: float = 980.0

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------
@app.get("/api/health")
def health_check():
    """Health check endpoint to verify backend operational status."""
    return {
        "status": "ONLINE",
        "service": "CycloneAI Deep Learning API",
        "version": "2.1.0",
        "engine": "PyTorch / CUDA-Ready",
        "timestamp": time.time()
    }

@app.post("/api/detect")
async def detect_cyclone(
    file: UploadFile = File(...),
    basin: str = Form("Bay of Bengal")
):
    """
    Accepts an uploaded satellite image (.png, .jpg, .tiff), passes it through
    CycloneVision-CNN v2.1, and returns radiometric features, bounding box eye localization,
    and Dvorak T-number classification.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes or len(image_bytes) < 100:
            raise HTTPException(status_code=400, detail="Invalid satellite image payload")

        start_time = time.time()
        result = cyclone_vision_model.predict(image_bytes, basin=basin)
        result["inference_time_ms"] = round((time.time() - start_time) * 1000, 1)
        
        return {
            "success": True,
            "filename": file.filename,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/api/predict-track")
def predict_track(req: TrackPredictionRequest):
    """
    Executes CycloneForecast-LSTM spatiotemporal prediction model for 24h, 48h, and 72h horizons.
    """
    try:
        prediction = cyclone_forecast_engine.predict_trajectory(
            current_lat=req.current_lat,
            current_lon=req.current_lon,
            current_wind=req.current_wind,
            current_mslp=req.current_mslp,
            sst=req.sst,
            vertical_shear_knots=req.vertical_shear_knots,
            basin=req.basin
        )
        return {
            "success": True,
            "data": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/generate-bulletin")
def generate_bulletin(req: BulletinGenerationRequest):
    """
    Generates and returns an official printable IMD / RSMC Advisory Bulletin PDF document.
    """
    try:
        pdf_bytes = generate_official_cyclone_bulletin_pdf(req.dict())
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=IMD_Advisory_{req.cyclone_name.replace(' ', '_')}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")

@app.get("/api/cyclones/real-systems")
def get_real_systems():
    """Returns list of real historical IMD cyclone ground-truth case studies."""
    return {
        "success": True,
        "count": len(REAL_HISTORICAL_SYSTEMS),
        "systems": list(REAL_HISTORICAL_SYSTEMS.values())
    }

@app.get("/api/cyclones/real-systems/{system_id}")
def get_real_system_detail(system_id: str):
    """Returns detailed real-world track, satellite analysis, and landfall metrics for a specific cyclone."""
    if system_id not in REAL_HISTORICAL_SYSTEMS:
        raise HTTPException(status_code=404, detail="Cyclone system not found")
    return {
        "success": True,
        "data": REAL_HISTORICAL_SYSTEMS[system_id]
    }

@app.get("/api/cyclones/live-ocean")
def get_live_ocean_telemetry(basin: str = "Bay of Bengal"):
    """Fetches real-time oceanic wind, pressure, and temperature data from Open-Meteo API."""
    data = fetch_live_ocean_telemetry(basin=basin)
    return {
        "success": True,
        "data": data
    }

@app.post("/api/satellite/live-sync")
def sync_live_satellite_stream(channel_id: str = "insat-3dr-ir", basin: str = "Bay of Bengal"):
    """
    Pulls live geostationary satellite telemetry, executes CNN vision detection,
    and runs LSTM trajectory prediction automatically.
    """
    try:
        result = satellite_stream_processor.fetch_and_process_live_stream(channel_id=channel_id, basin=basin)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite sync error: {str(e)}")

@app.post("/api/satellite/process-manual")
async def process_manual_satellite_data(
    file: Optional[UploadFile] = File(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    wind_speed: Optional[float] = Form(None),
    pressure: Optional[float] = Form(None),
    sst: float = Form(29.5),
    shear: float = Form(12.0),
    basin: str = Form("Bay of Bengal")
):
    """
    Accepts user-uploaded satellite image and/or manual data values,
    and runs the unified AI vision and trajectory prediction pipeline.
    """
    try:
        image_bytes = None
        if file:
            image_bytes = await file.read()

        result = satellite_stream_processor.process_manual_payload(
            image_bytes=image_bytes,
            override_lat=latitude,
            override_lon=longitude,
            override_wind=wind_speed,
            override_mslp=pressure,
            sst=sst,
            shear=shear,
            basin=basin
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual processing error: {str(e)}")
