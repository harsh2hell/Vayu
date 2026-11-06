from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional, List, Dict, Any
from ..database.db_manager import db
from ..services.feed_ingestion import REAL_HISTORICAL_SYSTEMS, get_live_cyclogenesis_watch
from ..services.geojson_service import geojson_service
from ..services.ibtracs_importer import ibtracs_importer
from ..services.gdacs_importer import gdacs_importer

from ..services.live_cyclone_feed import get_live_cyclone_catalog, fetch_live_national_news

router = APIRouter(prefix="/api/v1/cyclones", tags=["Cyclone Systems & Best-Tracks"])

@router.get("/live-feed")
def get_live_cyclones_feed():
    """
    Automated real-time cyclone ingestion feed.
    Fetches contemporary and newly detected live cyclones from GDACS, JTWC, and IMD,
    along with real-time national meteorological news.
    """
    try:
        data = get_live_cyclone_catalog()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live feed error: {str(e)}")

@router.get("/live-news")
def get_live_news_feed():
    """
    Returns real-time cyclone and disaster news feeds from national agencies and media.
    """
    try:
        news = fetch_live_national_news()
        return {"success": True, "count": len(news), "news": news}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News feed error: {str(e)}")

@router.get("/genesis-watch")
def get_cyclogenesis_watch_feed(basin: str = Query("Bay of Bengal", description="Basin name")):
    """Returns active cyclogenesis detection, forming low pressure systems (Invests), and 72h formation probability."""
    data = get_live_cyclogenesis_watch(basin=basin)
    return {"success": True, "data": data}

@router.get("/all")
def get_all_cyclone_systems(basin: Optional[str] = Query(None, description="Filter by basin")):
    """Returns all active cyclones from GDACS combined with historical systems."""
    live_cyclones = gdacs_importer.fetch_active_cyclones()
    historical_cyclones = db.get_all_cyclones(basin=basin)
    
    # Merge live and historical
    all_cyclones = live_cyclones + historical_cyclones
    return {
        "success": True,
        "count": len(all_cyclones),
        "cyclones": all_cyclones
    }

@router.post("/sync-ibtracs")
def sync_noaa_ibtracs_archive():
    """Syncs real NOAA / NCEI IBTrACS North Indian Ocean tropical cyclone best-tracks into database."""
    try:
        res = ibtracs_importer.sync_historical_cyclone_database()
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IBTrACS sync error: {str(e)}")

@router.get("/{system_id}")
def get_cyclone_system_detail(system_id: str):
    """Returns comprehensive track, satellite analysis, and landfall metrics for a specific cyclone."""
    cyclone = db.get_cyclone_by_id(system_id)
    if not cyclone:
        if system_id in REAL_HISTORICAL_SYSTEMS:
            return {"success": True, "data": REAL_HISTORICAL_SYSTEMS[system_id]}
        raise HTTPException(status_code=404, detail="Cyclone record not found")
    return {
        "success": True,
        "data": cyclone
    }

@router.get("/{system_id}/geojson")
def export_cyclone_geojson(system_id: str):
    """Exports RFC 7946 compliant GeoJSON FeatureCollection for mapping in GIS / Leaflet / MapLibre."""
    cyclone = db.get_cyclone_by_id(system_id)
    if not cyclone and system_id in REAL_HISTORICAL_SYSTEMS:
        cyclone = REAL_HISTORICAL_SYSTEMS[system_id]
    
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone record not found for GIS export")

    geojson_data = geojson_service.generate_track_geojson(cyclone)
    return geojson_data
