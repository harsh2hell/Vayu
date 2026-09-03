from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from ..utils.bulletin_pdf import generate_official_cyclone_bulletin_pdf

router = APIRouter(prefix="/api/v1/bulletins", tags=["IMD / RSMC Advisory Bulletins"])

class BulletinPayload(BaseModel):
    cyclone_name: str = "Severe Cyclonic Storm DANA"
    basin: str = "Bay of Bengal"
    category: str = "Severe Cyclonic Storm"
    latitude: float = 15.4
    longitude: float = 87.8
    wind_speed_kmh: float = 85.0
    central_mslp_hpa: float = 980.0

@router.post("/generate-pdf")
def generate_bulletin_pdf(req: BulletinPayload):
    """
    Generates an official printable IMD / RSMC Advisory Bulletin PDF document
    with observed synoptic features, 72h spatiotemporal forecasts, and civil defence directives.
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
        raise HTTPException(status_code=500, detail=f"PDF Bulletin generation error: {str(e)}")
