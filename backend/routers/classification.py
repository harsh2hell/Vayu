import time
import logging
import traceback
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional, Dict, Any
from ..models.pattern_classifier import pattern_classifier, MORPHOLOGICAL_CLASSES
from ..ml_engine.models.dvorak_classifier import INSUFFICIENT_CLASSES

logger = logging.getLogger("vayu.classification")

router = APIRouter(prefix="/api/v1/classification", tags=["Morphological Pattern Classification"])

@router.get("/classes")
def get_morphological_classes():
    """Returns definitions and meteorological criteria for all 4 Phase 3B validated Dvorak morphological patterns."""
    return {
        "success": True,
        "count": len(MORPHOLOGICAL_CLASSES),
        "classes": MORPHOLOGICAL_CLASSES,
        "insufficient_data_classes": INSUFFICIENT_CLASSES
    }

@router.post("/vit-inference")
def run_pattern_classification(
    file: Optional[UploadFile] = File(None),
    basin: str = Form("Bay of Bengal"),
    shear_knots: float = Form(12.0)
):
    """
    Classifies satellite imagery into the 4 Phase 3B validated Dvorak morphological patterns using ResNet-18,
    providing full probability distributions and Grad-CAM attention hotspots.
    Executed synchronously within FastAPI's managed threadpool to prevent event-loop starvation.
    """
    req_start = time.perf_counter()
    filename = getattr(file, "filename", None) if file else None
    logger.info(f"[VAYU Classification] Stage 1: Request received (filename={filename}, basin={basin}, shear_knots={shear_knots})")

    # Reject missing or nameless uploads immediately with HTTP 400
    if file is None or not filename:
        raise HTTPException(
            status_code=400,
            detail="A valid satellite image file is required for morphological classification."
        )

    try:
        image_bytes = file.file.read()
        logger.info(f"[VAYU Classification] Stage 2: Image bytes read ({len(image_bytes)} bytes)")

        # Reject empty or truncated uploads immediately
        if not image_bytes or len(image_bytes) < 50:
            raise HTTPException(
                status_code=400,
                detail="A valid satellite image file is required for morphological classification."
            )

        result = pattern_classifier.classify(image_bytes=image_bytes, basin=basin, shear_knots=shear_knots)

        elapsed_ms = (time.perf_counter() - req_start) * 1000.0
        logger.info(f"[VAYU Classification] Stage 10: Response returned in {elapsed_ms:.2f}ms")
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[VAYU Classification Error]: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Pattern classification error: {str(e)}")
