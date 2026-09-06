from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from ..models.track_lstm import cyclone_forecast_engine

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

@router.post("/forecast-72h")
def generate_track_forecast(req: TrackForecastPayload):
    """
    Executes CycloneForecast-GRU spatiotemporal forecasting engine up to 72 hours (+6h to +72h),
    computes dynamic epistemic uncertainty cones, nearest landfall sectors, and district strike probabilities.
    Requires genuine historical fixes (via past_track or storm_id).
    """
    try:
        prediction = cyclone_forecast_engine.predict_trajectory(
            current_lat=req.current_lat,
            current_lon=req.current_lon,
            current_wind=req.current_wind,
            current_mslp=req.current_mslp,
            sst=req.sst,
            vertical_shear_knots=req.vertical_shear_knots,
            basin=req.basin,
            past_track=req.past_track,
            storm_id=req.storm_id
        )
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
