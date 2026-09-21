import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from unittest.mock import patch

from backend.main import app
from backend.ml_engine.models.dvorak_classifier import load_dvorak_classifier_model, DvorakResNetClassifier
from backend.models.pattern_classifier import pattern_classifier

client = TestClient(app)

def create_dummy_jpeg_bytes(width=224, height=224, color=(120, 160, 200)) -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=color)
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_missing_file_returns_400():
    """Test that requests without any file return HTTP 400 with clear message."""
    resp = client.post(
        "/api/v1/classification/vit-inference",
        data={"basin": "Bay of Bengal", "shear_knots": "12.0"}
    )
    assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body["detail"] == "A valid satellite image file is required for morphological classification."

def test_empty_file_returns_400():
    """Test that uploads with 0 bytes return HTTP 400."""
    resp = client.post(
        "/api/v1/classification/vit-inference",
        files={"file": ("empty.jpg", b"", "image/jpeg")},
        data={"basin": "Bay of Bengal", "shear_knots": "12.0"}
    )
    assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body["detail"] == "A valid satellite image file is required for morphological classification."

def test_tiny_file_returns_400():
    """Test that corrupt/truncated uploads (< 50 bytes) return HTTP 400."""
    resp = client.post(
        "/api/v1/classification/vit-inference",
        files={"file": ("tiny.jpg", b"corrupt_header_bytes", "image/jpeg")},
        data={"basin": "Bay of Bengal", "shear_knots": "12.0"}
    )
    assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body["detail"] == "A valid satellite image file is required for morphological classification."

def test_zero_tensor_fallback_eliminated():
    """Verify that classify_frame strictly rejects missing or invalid bytes instead of using zeros."""
    model = pattern_classifier.model
    with pytest.raises(ValueError, match="valid satellite image payload"):
        model.classify_frame(image_bytes=None)

    with pytest.raises(ValueError, match="valid satellite image payload"):
        model.classify_frame(image_bytes=b"short")

def test_valid_jpeg_inference_and_gradcam():
    """Verify that a valid JPEG executes inference and Grad-CAM safely with full schema."""
    jpeg_bytes = create_dummy_jpeg_bytes()
    resp = client.post(
        "/api/v1/classification/vit-inference",
        files={"file": ("satellite_cyclone.jpg", jpeg_bytes, "image/jpeg")},
        data={"basin": "Bay of Bengal", "shear_knots": "14.5"}
    )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert data["success"] is True
    res = data["data"]

    # Verify all expected scientific keys are present
    required_keys = [
        "model_version", "backbone", "predicted_pattern", "predicted_pattern_id",
        "pattern_description", "confidence_percentage", "dvorak_classification",
        "class_probability_distribution", "insufficient_data_classes",
        "gradcam_attention_foci", "radiometric_indicators", "inference_time_ms",
        "_model_meta"
    ]
    for key in required_keys:
        assert key in res, f"Missing key '{key}' in classification response"

    # Verify Dvorak classification sub-fields
    dvorak = res["dvorak_classification"]
    for d_key in ["t_number", "ci_number", "category", "estimated_wind_speed_kmh", "central_mslp_hpa"]:
        assert d_key in dvorak, f"Missing '{d_key}' in dvorak_classification"

    # Verify Grad-CAM foci
    foci = res["gradcam_attention_foci"]
    assert isinstance(foci, list)
    assert len(foci) > 0, "Grad-CAM foci list should not be empty"
    for focus in foci:
        assert "label" in focus
        assert "x_norm" in focus
        assert "y_norm" in focus
        assert "activation_intensity" in focus
        assert 0.0 <= focus["x_norm"] <= 1.0
        assert 0.0 <= focus["y_norm"] <= 1.0

def test_db_logging_failure_is_non_fatal():
    """Verify that if database persistence fails or times out, the classification response still succeeds."""
    jpeg_bytes = create_dummy_jpeg_bytes()
    with patch("backend.database.db_manager.db.log_inference_run", side_effect=TimeoutError("DB pool checkout timeout")):
        resp = client.post(
            "/api/v1/classification/vit-inference",
            files={"file": ("satellite_cyclone.jpg", jpeg_bytes, "image/jpeg")},
            data={"basin": "Arabian Sea", "shear_knots": "10.0"}
        )
        assert resp.status_code == 200, f"Expected 200 despite DB failure, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["predicted_pattern"] is not None

def test_classes_endpoint():
    """Verify GET /api/v1/classification/classes remains functional."""
    resp = client.get("/api/v1/classification/classes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["count"] == 4
    assert len(data["classes"]) == 4
    assert len(data["insufficient_data_classes"]) == 2
