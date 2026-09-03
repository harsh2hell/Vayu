from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from ..services.incois_ocean import incois_service
from ..services.feed_ingestion import fetch_live_ocean_telemetry
from ..services.environmental_layers import environmental_layers_service

router = APIRouter(prefix="/api/v1/ocean", tags=["Ocean & Marine Telemetry"])

@router.get("/buoys")
def get_ocean_buoys(basin: Optional[str] = Query(None, description="Filter by basin (Bay of Bengal / Arabian Sea)")):
    """Returns real-time observations from INCOIS moored deep-sea buoy network (BD08, BD11, AD02, AD04)."""
    buoys = incois_service.fetch_or_sync_live_buoys(basin=basin)
    return {
        "success": True,
        "count": len(buoys),
        "buoys": buoys
    }

@router.get("/live-telemetry")
def get_live_marine_telemetry(basin: str = Query("Bay of Bengal")):
    """Fetches real-time oceanic wind, surface pressure, and temperature telemetry from Open-Meteo marine endpoints."""
    data = fetch_live_ocean_telemetry(basin=basin)
    return {
        "success": True,
        "data": data
    }

@router.get("/heat-content")
def get_ocean_heat_content(
    sst_celsius: float = Query(29.5, ge=20.0, le=35.0),
    mixed_layer_depth_m: float = Query(65.0, ge=10.0, le=150.0)
):
    """Calculates Ocean Heat Content (OHC in kJ/cm²) relative to the 26°C isotherm."""
    ohc = incois_service.calculate_ocean_heat_content(sst_c=sst_celsius, mixed_layer_depth_m=mixed_layer_depth_m)
    return {
        "success": True,
        "sst_celsius": sst_celsius,
        "mixed_layer_depth_m": mixed_layer_depth_m,
        "ocean_heat_content_kj_cm2": ohc,
        "favorability": "HIGH INTENSIFICATION FUEL" if ohc >= 80 else ("MODERATE" if ohc >= 50 else "LOW")
    }

@router.get("/live-sst-grid")
def get_live_sst_grid(basin: Optional[str] = Query(None, description="Filter by basin")):
    """
    Fetches real-time Sea Surface Temperature (SST in °C) and surface pressure
    across the North Indian Ocean anchor grid.
    """
    grid = environmental_layers_service.fetch_live_ocean_grid(basin=basin)
    return {
        "success": True,
        "count": len(grid),
        "grid_points": grid
    }

@router.get("/vertical-wind-shear")
def get_live_vertical_wind_shear(
    latitude: float = Query(15.5, ge=-10.0, le=35.0),
    longitude: float = Query(88.0, ge=50.0, le=105.0)
):
    """
    Calculates real-time 850–200 hPa Deep-Layer Vertical Wind Shear (knots and direction)
    using live synoptic & upper-air atmospheric pressure level data.
    """
    shear_result = environmental_layers_service.fetch_live_upper_air_shear(lat=latitude, lon=longitude)
    return {
        "success": True,
        "data": shear_result
    }
