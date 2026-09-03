from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional, Dict, Any
from ..models.detection_cnn import cyclone_vision_model

router = APIRouter(prefix="/api/v1/detection", tags=["AI Cyclone Identification"])

@router.post("/cnn-inference")
async def run_cyclone_detection(
    file: UploadFile = File(...),
    basin: str = Form("Bay of Bengal")
):
    """
    Accepts an uploaded satellite imagery frame (.png, .jpg, .tiff),
    passes it through CycloneVision-CNN v2.1 (ResNet-50 + SPP),
    and returns center fix, bounding box regression, and radiometric analysis.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes or len(image_bytes) < 50:
            raise HTTPException(status_code=400, detail="Invalid satellite image payload")

        result = cyclone_vision_model.predict(image_bytes, basin=basin)
        return {
            "success": True,
            "filename": file.filename,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection inference error: {str(e)}")
