from fastapi import APIRouter, HTTPException
from ..database.schemas import MultiSourceFusionRequest
from ..services.fusion import fusion_engine

router = APIRouter(prefix="/api/v1/fusion", tags=["Multi-Source AI Data Fusion"])

@router.post("/align-and-fuse")
def execute_multisource_fusion(req: MultiSourceFusionRequest):
    """
    Fuses multi-spectral satellite channels, ocean SST, 850-200 hPa vertical wind shear,
    and mid-level humidity into a normalized feature tensor with Rapid Intensification probability analysis.
    """
    try:
        fused = fusion_engine.fuse_data_sources(
            lat=req.latitude,
            lon=req.longitude,
            sst_celsius=req.sst_celsius,
            vertical_shear_knots=req.vertical_shear_knots,
            mslp_hpa=req.mslp_hpa,
            mid_level_rh_pct=req.mid_level_rh_pct,
            surface_wind_kmh=req.surface_wind_kmh,
            basin=req.basin
        )
        return {
            "success": True,
            "data": fused
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-source fusion error: {str(e)}")
