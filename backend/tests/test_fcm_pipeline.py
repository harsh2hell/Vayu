import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.fcm_service import FcmService
from backend.database.db_manager import db

client = TestClient(app)


def test_fcm_message_payload_structure():
    """Verifies that FcmService formats correct FCM HTTP v1 notification and data payloads."""
    fcm = FcmService()
    message = fcm.build_fcm_message(
        fcm_token="fake-fcm-token-12345",
        alert_id="ALR-2026-TEST-99",
        title="Cyclone Advisory",
        body="Track shift detected.",
        severity="CRITICAL",
        storm_id="STM-01",
        storm_name="Cyclone VAYU",
        source="VAYU_MODEL"
    )

    assert "message" in message
    msg = message["message"]
    assert msg["token"] == "fake-fcm-token-12345"
    assert msg["notification"]["title"] == "Cyclone Advisory"
    assert msg["notification"]["body"] == "Track shift detected."

    # Canonical alert_id in data payload
    data = msg["data"]
    assert data["alert_id"] == "ALR-2026-TEST-99"
    assert data["severity"] == "CRITICAL"
    assert data["deep_link"] == "vayu://alert/ALR-2026-TEST-99"
    assert data["source"] == "VAYU_MODEL"

    # Android channel mapping
    android = msg["android"]
    assert android["priority"] == "HIGH"
    assert android["notification"]["channel_id"] == "vayu_channel_critical"


def test_fcm_channel_mapping_all_severities():
    """Verifies that all 5 severity levels map to their respective notification channels."""
    fcm = FcmService()
    assert fcm.get_channel_for_severity("CRITICAL") == "vayu_channel_critical"
    assert fcm.get_channel_for_severity("WARNING") == "vayu_channel_warning"
    assert fcm.get_channel_for_severity("WATCH") == "vayu_channel_watch"
    assert fcm.get_channel_for_severity("INFO") == "vayu_channel_information"
    assert fcm.get_channel_for_severity("TEST") == "vayu_channel_test"


def test_test_notification_endpoint_with_device_targeting():
    """Verifies POST /api/notifications/test registers alert and dispatches to test devices."""
    # 1. Register a test device
    reg_resp = client.post(
        "/api/notifications/devices/register",
        json={
            "device_id": "test-device-pipeline-001",
            "fcm_token": "fcm-dummy-token-abc-123",
            "device_model": "Pixel 9 Pro Test",
            "platform": "android"
        }
    )
    assert reg_resp.status_code == 200

    # 2. Trigger test notification targeting this device
    test_resp = client.post(
        "/api/notifications/test",
        json={
            "title": "Pipeline Acoustic Drill",
            "message": "Testing notification audio chime and haptic feedback.",
            "target_mode": "selected",
            "target_device_ids": ["test-device-pipeline-001"]
        }
    )
    assert test_resp.status_code == 200
    data = test_resp.json()
    assert data["success"] is True
    assert "🧪 VAYU TEST ALERT" in data["title"]
    assert data["target_count"] == 1
    assert data["alert_id"].startswith("ALR-TEST-")

    # 3. Verify delivery entry recorded
    deliveries_resp = client.get("/api/notifications/deliveries")
    assert deliveries_resp.status_code == 200
    deliv_data = deliveries_resp.json()
    assert deliv_data["count"] > 0
    recent = deliv_data["deliveries"][0]
    assert "delivery_id" in recent
    assert recent["alert_id"] == data["alert_id"]


def test_alert_opened_telemetry():
    """Verifies POST /api/alerts/{alert_id}/opened records OPENED status in delivery telemetry."""
    # Register and trigger test
    client.post(
        "/api/notifications/devices/register",
        json={
            "device_id": "test-device-telemetry-002",
            "fcm_token": "fcm-telemetry-token-xyz",
            "platform": "android"
        }
    )
    test_resp = client.post(
        "/api/notifications/test",
        json={
            "title": "Tap Verification",
            "message": "User tapped notification.",
            "target_mode": "selected",
            "target_device_ids": ["test-device-telemetry-002"]
        }
    )
    alert_id = test_resp.json()["alert_id"]

    # Record notification tap
    opened_resp = client.post(f"/api/alerts/{alert_id}/opened?device_id=test-device-telemetry-002")
    assert opened_resp.status_code == 200
    opened_data = opened_resp.json()
    assert opened_data["status"] == "OPENED"
    assert opened_data["alert_id"] == alert_id


def test_registered_devices_listing():
    """Verifies GET /api/notifications/devices returns registered test devices."""
    resp = client.get("/api/notifications/devices")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "devices" in data
    assert any(d["device_id"] == "test-device-pipeline-001" for d in data["devices"])
