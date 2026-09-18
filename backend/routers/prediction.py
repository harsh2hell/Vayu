from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from ..models.track_lstm import cyclone_forecast_engine
from .wind import fetch_live_cyclone_wind_telemetry

router = APIRouter(prefix="/api/v1/prediction", tags=["Trajectory & Intensity Prediction"])

class TrackForecastPayload(BaseModel):
    current_lat: float = 15.4
    current_lon: float = 87.8
    current_wind: float = 85.0
    current_mslp: float = 980.0
    sst: float = 29.5
    vertical_shear_knots: float = 12.0
    basin: str = "Bay of Bengal"
    past_track: Optional[List[Dict[str, Any]]] = None
    storm_id: Optional[str] = None
    use_live_telemetry: bool = False

@router.post("/forecast-72h")
def generate_track_forecast(req: TrackForecastPayload):
    """
    Executes CycloneForecast-GRU spatiotemporal forecasting engine up to 72 hours (+6h to +72h),
    computes dynamic epistemic uncertainty cones, nearest landfall sectors, and district strike probabilities.
    Requires genuine historical fixes (via past_track or storm_id).
    Supports live meteorological ingestion from Windy.com API & GFS engine.
    """
    try:
        wind = req.current_wind
        mslp = req.current_mslp
        sst = req.sst
        shear = req.vertical_shear_knots
        live_telemetry = None

        if req.use_live_telemetry:
            live = fetch_live_cyclone_wind_telemetry(req.current_lat, req.current_lon)
            if live.get("success"):
                wind = live.get("wind_speed_kmh", wind)
                mslp = live.get("mslp_hpa", mslp)
                sst = live.get("sst_celsius", sst)
                shear = live.get("vertical_shear_knots", shear)
                live_telemetry = live

        prediction = cyclone_forecast_engine.predict_trajectory(
            current_lat=req.current_lat,
            current_lon=req.current_lon,
            current_wind=wind,
            current_mslp=mslp,
            sst=sst,
            vertical_shear_knots=shear,
            basin=req.basin,
            past_track=req.past_track,
            storm_id=req.storm_id
        )
        if live_telemetry:
            prediction["live_telemetry"] = live_telemetry
        if not prediction.get("success", False) or prediction.get("forecast_status") == "INSUFFICIENT_HISTORY":
            return {
                "success": False,
                "forecast_status": "INSUFFICIENT_HISTORY",
                "message": prediction.get("message", "Trajectory forecasting requires at least 4 consecutive historical fixes (9 hours of track telemetry). Single-point extrapolation without historical fixes is disabled to prevent synthetic trajectory fabrication."),
                "required_fixes": prediction.get("required_fixes", 4),
                "provided_fixes": prediction.get("provided_fixes", 0),
                "available_storms": ["DANA", "BIPARJOY", "MOCHA", "OCKHI", "AMPHAN", "FANI", "BULBUL", "TITLI", "HUDHUD", "PHAILIN"]
            }

        return {
            "success": True,
            "data": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trajectory prediction error: {str(e)}")
