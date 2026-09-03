from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional, Dict, Any
from ..models.pattern_classifier import pattern_classifier, MORPHOLOGICAL_CLASSES

router = APIRouter(prefix="/api/v1/classification", tags=["Morphological Pattern Classification"])

@router.get("/classes")
def get_morphological_classes():
    """Returns definitions and meteorological criteria for all 5 Dvorak morphological patterns."""
    return {
        "success": True,
        "count": len(MORPHOLOGICAL_CLASSES),
        "classes": MORPHOLOGICAL_CLASSES
    }

@router.post("/vit-inference")
async def run_pattern_classification(
    file: Optional[UploadFile] = File(None),
    basin: str = Form("Bay of Bengal"),
    shear_knots: float = Form(12.0)
):
    """
    Classifies satellite imagery into the 5 Dvorak morphological patterns using PatternNet-ViT v1.8,
    providing full probability distributions and Grad-CAM attention hotspots.
    """
    try:
        image_bytes = None
        if file:
            image_bytes = await file.read()

        result = pattern_classifier.classify(image_bytes=image_bytes, basin=basin, shear_knots=shear_knots)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern classification error: {str(e)}")
