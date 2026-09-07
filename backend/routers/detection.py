from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional, Dict, Any
from ..models.detection_cnn import cyclone_vision_model

router = APIRouter(prefix="/api/v1/detection", tags=["AI Cyclone Identification"])

@router.post("/cnn-inference")
async def run_cyclone_detection(
    file: UploadFile = File(...),
    basin: str = Form("Bay of Bengal"),
    bbox_geo: Optional[str] = Form(None)
):
    """
    Accepts an uploaded satellite imagery frame (.png, .jpg, .tiff),
    passes it through CycloneVision-MobileNetV3,
    and returns center localization, bounding box regression, and radiometric analysis.
    Geographic coordinates are strictly computed only when bbox_geo is provided.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes or len(image_bytes) < 50:
            raise HTTPException(status_code=400, detail="Invalid satellite image payload")

        parsed_bbox = None
        if bbox_geo:
            try:
                import json
                parsed_bbox = json.loads(bbox_geo) if "[" in bbox_geo else [float(x.strip()) for x in bbox_geo.split(",")]
            except Exception:
                parsed_bbox = None

        result = cyclone_vision_model.predict(image_bytes, bbox_geo=parsed_bbox, basin=basin)
        return {
            "success": True,
            "filename": file.filename,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection inference error: {str(e)}")
