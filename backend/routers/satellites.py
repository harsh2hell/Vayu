from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ..database.db_manager import db
from ..services.mosdac_client import mosdac_client
from ..services.satellite_stream import satellite_stream_processor
from ..services.real_satellite_api import real_satellite_service
from ..services.real_downloader import real_downloader
from ..services.rainviewer_client import rainviewer_service

router = APIRouter(prefix="/api/v1/satellites", tags=["Satellites & Remote Sensing"])

class RealSnapshotRequest(BaseModel):
    source: str = "NASA_GIBS" # NASA_GIBS, ISRO_MOSDAC
    layer: str = "MODIS_Terra_Brightness_Temp_Band31_Day" # MODIS_Terra_Brightness_Temp_Band31_Day, VIIRS_SNPP_CorrectedReflectance_TrueColor
    min_lat: float = 10.0
    min_lon: float = 80.0
    max_lat: float = 23.0
    max_lon: float = 95.0
    date_str: Optional[str] = None
    basin: str = "Bay of Bengal"

@router.get("/sources")
def get_satellite_sources():
    """Returns list of active satellite missions (INSAT-3DR, INSAT-3D, NOAA-20, Oceansat-3, Meteosat-9)."""
    sources = db.get_all_satellite_sources()
    return {
        "success": True,
        "count": len(sources),
        "sources": sources
    }

@router.get("/nasa-gibs/tiles")
def get_nasa_gibs_tile_layers(date: Optional[str] = Query(None, description="UTC Date in YYYY-MM-DD format")):
    """Returns real NASA GIBS WMTS tile URL templates for VIIRS TrueColor, MODIS Thermal IR (11.0µm), and GPM Rain Rate."""
    return real_satellite_service.get_nasa_gibs_layers(date_str=date)

@router.get("/isro-mosdac/catalog")
def get_isro_mosdac_catalog():
    """Returns real INSAT-3D/3DR live image feeds and product metadata from ISRO MOSDAC."""
    return real_satellite_service.get_isro_mosdac_catalog()

@router.get("/rainviewer/tiles")
def get_rainviewer_live_tiles():
    """Returns real-time live Doppler weather radar & infrared satellite cloud tile URLs from RainViewer open API."""
    return rainviewer_service.fetch_live_animation_frames()

@router.post("/download-real-snapshot")
def download_and_analyze_real_snapshot(req: RealSnapshotRequest):
    """
    Downloads a real satellite frame from NASA GIBS or ISRO MOSDAC for any given date & bounding box,
    and runs full CycloneVision-CNN detection and PatternNet-ViT morphological classification.
    """
    try:
        res = real_downloader.fetch_and_analyze_real_storm(
            source=req.source,
            layer=req.layer,
            min_lat=req.min_lat, min_lon=req.min_lon,
            max_lat=req.max_lat, max_lon=req.max_lon,
            date_str=req.date_str,
            basin=req.basin
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite download error: {str(e)}")

@router.get("/frames/recent")
def get_recent_frames(
    source_id: Optional[str] = Query(None, description="Filter by satellite mission (e.g., insat-3dr)"),
    limit: int = Query(20, ge=1, le=100)
):
    """Retrieves recent multi-spectral satellite imagery frames logged in the database."""
    frames = db.get_recent_satellite_frames(source_id=source_id, limit=limit)
    return {
        "success": True,
        "count": len(frames),
        "frames": frames
    }

@router.post("/ingest/frame")
async def ingest_satellite_frame(
    file: Optional[UploadFile] = File(None),
    source_id: str = Form("insat-3dr"),
    channel: str = Form("TIR1"),
    basin: str = Form("Bay of Bengal")
):
    """
    Ingests a raw or L1B satellite imagery raster payload from ISRO MOSDAC / NOAA downlink,
    extracts radiometric brightness temperature fields, and logs the frame.
    """
    try:
        raw_bytes = None
        if file:
            raw_bytes = await file.read()

        parsed = mosdac_client.simulate_or_parse_satellite_payload(
            raw_bytes=raw_bytes,
            source_id=source_id,
            channel=channel,
            basin=basin
        )
        return {
            "success": True,
            "data": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite ingestion error: {str(e)}")

@router.post("/live-sync")
def sync_live_satellite_stream(
    channel_id: str = Query("insat-3dr-ir", description="Satellite channel"),
    basin: str = Query("Bay of Bengal", description="Ocean basin")
):
    """Pulls live geostationary satellite telemetry and executes automated AI vision + trajectory pipeline."""
    try:
        result = satellite_stream_processor.fetch_and_process_live_stream(channel_id=channel_id, basin=basin)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite stream sync error: {str(e)}")
