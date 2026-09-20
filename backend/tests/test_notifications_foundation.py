import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.db_manager import db

client = TestClient(app)


def test_device_registration_lifecycle():
    device_id = "test-device-android-001"
    fcm_token = "fcm_sample_token_xyz_12345"

    # 1. Register device
    reg_payload = {
        "device_id": device_id,
        "fcm_token": fcm_token,
        "platform": "android",
        "app_version": "1.0.0",
        "os_version": "14",
        "device_model": "Pixel 8 Pro",
        "locale": "en_IN",
        "latitude": 18.2,
        "longitude": 88.4,
        "district": "Balasore",
        "state": "Odisha"
    }
    response = client.post("/api/notifications/devices/register", json=reg_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["device_id"] == device_id
    assert data["status"] == "REGISTERED"

    # 2. Token refresh / update
    reg_payload["fcm_token"] = "fcm_refreshed_token_abc_67890"
    update_resp = client.post("/api/notifications/devices/register", json=reg_payload)
    assert update_resp.status_code == 200

    # 3. Verify preferences initialized
    pref_resp = client.get(f"/api/notifications/preferences?device_id={device_id}")
    assert pref_resp.status_code == 200
    prefs = pref_resp.json()
    assert prefs["device_id"] == device_id
    assert prefs["enable_critical"] is True
    assert prefs["enable_warning"] is True
    assert "Bay of Bengal" in prefs["subscribed_basins"]

    # 4. Update preferences
    pref_update = {
        "device_id": device_id,
        "enable_info": True,
        "enable_test": True,
        "max_alert_radius_km": 150.0,
        "subscribed_states": ["Odisha", "West Bengal"]
    }
    put_resp = client.put("/api/notifications/preferences", json=pref_update)
    assert put_resp.status_code == 200
    updated = put_resp.json()
    assert updated["enable_info"] is True
    assert updated["enable_test"] is True
    assert updated["max_alert_radius_km"] == 150.0
    assert "Odisha" in updated["subscribed_states"]

    # 5. Unregister device
    unreg_resp = client.post("/api/notifications/devices/unregister", json={"device_id": device_id})
    assert unreg_resp.status_code == 200
    assert unreg_resp.json()["success"] is True


def test_invalid_device_registration_payload():
    # Missing required fcm_token
    resp = client.post("/api/notifications/devices/register", json={"device_id": "bad-device"})
    assert resp.status_code == 422


def test_alerts_listing_and_filtering():
    # Fetch all active alerts
    resp = client.get("/api/alerts")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "alerts" in data
    assert len(data["alerts"]) >= 2

    # Verify alert model fields
    first_alert = data["alerts"][0]
    assert "alert_id" in first_alert
    assert "storm_name" in first_alert
    assert "severity" in first_alert
    assert "title" in first_alert
    assert "message" in first_alert
    assert "source" in first_alert
    assert first_alert["source"] in ["VAYU_MODEL", "VAYU_OPERATOR", "OFFICIAL_ADVISORY", "TEST"]

    # Filter by severity: CRITICAL
    crit_resp = client.get("/api/alerts?severity=CRITICAL")
    assert crit_resp.status_code == 200
    crit_data = crit_resp.json()
    for a in crit_data["alerts"]:
        assert a["severity"] == "CRITICAL"


def test_alert_detail_and_deep_linking():
    # Fetch existing seeded alert ALR-2026-00001
    resp = client.get("/api/alerts/ALR-2026-00001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    alert = data["alert"]
    assert alert["alert_id"] == "ALR-2026-00001"
    assert alert["storm_name"] == "Cyclone DANA (2024)"
    assert alert["severity"] == "CRITICAL"
    assert alert["latitude"] is not None
    assert alert["longitude"] is not None
    assert "metadata" in alert
    assert alert["metadata"]["estimated_landfall_eta"] == "18h"

    # Non-existent alert returns 404
    missing_resp = client.get("/api/alerts/ALR-NONEXISTENT-999")
    assert missing_resp.status_code == 404
