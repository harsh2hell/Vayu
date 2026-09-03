from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
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

@router.post("/forecast-72h")
def generate_track_forecast(req: TrackForecastPayload):
    """
    Executes CycloneForecast-LSTM spatiotemporal forecasting engine up to 72 hours,
    computes dynamic 70% error cones, nearest landfall sectors, and district strike probabilities.
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
        raise HTTPException(status_code=500, detail=f"Trajectory prediction error: {str(e)}")
