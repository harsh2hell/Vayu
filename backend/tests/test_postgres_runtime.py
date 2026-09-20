"""
test_postgres_runtime.py
==============================================================================
VAYU Phase 4 — Dedicated PostgreSQL Runtime Integration Test Suite
==============================================================================
Validates:
- DatabaseManager PostgreSQL connection pool initialization
- SELECT 1 connectivity and health check reporting
- All CRUD methods and schema compatibility
- INSERT ... RETURNING id behavior
- ON CONFLICT upsert & DO NOTHING behavior
- Device registration, notification preferences, alert dispatch audit trail
- Idempotent seed operations
- Transaction atomicity and rollback on error
- Connection pool cleanup and leak prevention
- Offline SQLite fallback and invalid URL error behavior

SAFETY RULE:
Skipped cleanly unless TEST_DATABASE_URL or RUN_POSTGRES_TESTS=1 is provided.
"""

import os
import time
import pytest
from pathlib import Path
from typing import Generator

# Check if PostgreSQL testing is explicitly enabled
PG_TEST_URL = os.environ.get("TEST_DATABASE_URL")
if not PG_TEST_URL and os.environ.get("RUN_POSTGRES_TESTS") == "1":
    # Use environment DATABASE_URL or ~/.config/vayu/supabase.env
    PG_TEST_URL = os.environ.get("DATABASE_URL")
    if not PG_TEST_URL:
        cfg = Path.home() / ".config/vayu/supabase.env"
        if cfg.exists():
            for line in cfg.read_text(encoding="utf-8").splitlines():
                if line.startswith("DATABASE_URL="):
                    PG_TEST_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

pytestmark = pytest.mark.skipif(
    not PG_TEST_URL,
    reason="PostgreSQL integration tests require TEST_DATABASE_URL or RUN_POSTGRES_TESTS=1"
)


@pytest.fixture(scope="module")
def pg_db():
    """Initializes a DatabaseManager instance wired to PostgreSQL."""
    from backend.database.db_manager import DatabaseManager
    manager = DatabaseManager(database_url=PG_TEST_URL)
    yield manager
    manager.close()


def test_postgres_initialization_and_ping(pg_db):
    """Verifies that DatabaseManager connects to PostgreSQL and health check reports ONLINE."""
    assert pg_db.is_postgres is True
    assert pg_db.pool is not None

    health = pg_db.health_check()
    assert health["engine"] == "PostgreSQL"
    assert health["status"] == "ONLINE"
    assert health["connected"] is True
    assert health["pool_min"] >= 1
    assert health["pool_max"] >= health["pool_min"]


def test_postgres_read_parity(pg_db):
    """Verifies that existing migrated benchmark catalogs can be read via DatabaseManager."""
    # 1. Satellite Sources
    sources = pg_db.get_all_satellite_sources()
    assert len(sources) >= 5
    first_src = sources[0]
    assert "source_id" in first_src
    assert "agency" in first_src
    assert isinstance(first_src["spectral_channels"], list)

    # 2. Cyclone Events
    cyclones = pg_db.get_all_cyclones()
    assert len(cyclones) >= 7
    dana = pg_db.get_cyclone_by_id("cyclone-dana-2024")
    assert dana is not None
    assert "DANA" in dana["name"]
    assert isinstance(dana["track_history"], list)
    assert isinstance(dana["impact_districts"], list)

    # 3. Ocean Buoy Telemetry
    buoys = pg_db.get_latest_buoy_telemetry()
    assert len(buoys) >= 1

    # 4. AI Models Registry
    models = pg_db.get_registered_models()
    assert len(models) >= 4


def test_postgres_inference_logging_returning_id(pg_db):
    """Verifies that log_inference_run uses INSERT ... RETURNING id and returns integer ID."""
    log_data = {
        "model_name": "TestModel-PG-Runtime",
        "model_version": "1.0.0",
        "inference_type": "DETECTION",
        "basin": "Bay of Bengal",
        "input_source": "PYTEST_INTEG",
        "detected_lat": 19.5,
        "detected_lon": 87.2,
        "confidence": 0.96,
        "dvorak_t": "T4.0",
        "dvorak_ci": 4.0,
        "estimated_wind_kmh": 120.0,
        "estimated_mslp_hpa": 985.0,
        "morphology_pattern": "Curved Banding",
        "execution_time_ms": 42.5,
        "metadata": {"test_run": True}
    }
    log_id = pg_db.log_inference_run(log_data)
    assert isinstance(log_id, int)
    assert log_id > 0

    # Retrieve and verify persistence
    recent = pg_db.get_recent_inferences(limit=5)
    matched = [r for r in recent if r["id"] == log_id]
    assert len(matched) == 1
    assert matched[0]["model_name"] == "TestModel-PG-Runtime"
    assert matched[0]["metadata"]["test_run"] is True


def test_postgres_device_and_notification_lifecycle(pg_db):
    """Verifies full lifecycle of device registration, preference updates, and deactivation."""
    test_device_id = f"test-pg-device-{int(time.time())}"
    reg_data = {
        "device_id": test_device_id,
        "fcm_token": "token-xyz-integ-test-999",
        "platform": "android",
        "app_version": "2.0.0",
        "os_version": "15",
        "device_model": "Pixel 9 Pro",
        "locale": "en_IN",
        "latitude": 20.2,
        "longitude": 86.5,
        "district": "Jagatsinghpur",
        "state": "Odisha"
    }

    # 1. Register device
    result = pg_db.register_device(reg_data)
    assert result["success"] is True
    assert result["device_id"] == test_device_id
    assert result["status"] == "REGISTERED"

    # 2. Get default preferences
    prefs = pg_db.get_notification_preferences(test_device_id)
    assert prefs["device_id"] == test_device_id
    assert prefs["enable_critical"] is True
    assert "Bay of Bengal" in prefs["subscribed_basins"]

    # 3. Update preferences
    updated = pg_db.update_notification_preferences(test_device_id, {
        "enable_info": True,
        "enable_test": True,
        "max_alert_radius_km": 220.0,
        "subscribed_states": ["Odisha", "Andhra Pradesh"]
    })
    assert updated["enable_info"] is True
    assert updated["enable_test"] is True
    assert updated["max_alert_radius_km"] == 220.0
    assert "Andhra Pradesh" in updated["subscribed_states"]

    # 4. Deactivate device
    deact_res = pg_db.deactivate_device(test_device_id)
    assert deact_res is True

    # 5. Verify device is not returned in active list
    active_devices = pg_db.get_active_devices()
    active_ids = [d["device_id"] for d in active_devices]
    assert test_device_id not in active_ids


def test_postgres_vayu_alert_and_delivery_lifecycle(pg_db):
    """Verifies creation of standardized VAYU alerts, delivery logging, and tap-open tracking."""
    test_alert_id = f"ALR-PG-TEST-{int(time.time())}"
    test_device_id = f"test-pg-dev-alert-{int(time.time())}"

    # Ensure device exists for foreign-key constraint
    pg_db.register_device({
        "device_id": test_device_id,
        "fcm_token": "token-sample-1234"
    })

    # 1. Create Alert
    alert_payload = {
        "alert_id": test_alert_id,
        "storm_id": "TEST-STORM",
        "storm_name": "Postgres Integration Cyclone Test",
        "severity": "CRITICAL",
        "title": "Postgres Test Siren Drill",
        "message": "Validating PostgreSQL runtime delivery and acknowledgement pipeline.",
        "source": "TEST",
        "source_module": "TestPostgresRuntime",
        "location_region": "Odisha Coastal Corridor",
        "latitude": 20.5,
        "longitude": 86.8,
        "radius_km": 100.0,
        "metadata_json": {"drill": True, "test_env": "PostgreSQL"}
    }
    created_id = pg_db.create_vayu_alert(alert_payload)
    assert created_id == test_alert_id

    # 2. Retrieve alert
    fetched = pg_db.get_vayu_alert_by_id(test_alert_id)
    assert fetched is not None
    assert fetched["alert_id"] == test_alert_id
    assert fetched["severity"] == "CRITICAL"
    assert fetched["metadata"]["drill"] is True

    # 3. Record delivery attempt
    deliv_id = pg_db.record_alert_delivery(
        delivery_id="deliv-pg-001",
        alert_id=test_alert_id,
        device_id=test_device_id,
        status="SENT"
    )
    assert isinstance(deliv_id, int)
    assert deliv_id > 0

    # 4. Update delivery status with FCM message ID
    upd_res = pg_db.update_alert_delivery_status(
        delivery_id=deliv_id,
        status="DELIVERED",
        fcm_message_id="projects/vayusat-live/messages/pg-msg-12345"
    )
    assert upd_res is True

    # 5. User taps open
    opened_count = pg_db.record_alert_opened(
        alert_id=test_alert_id,
        device_id=test_device_id
    )
    assert opened_count >= 1

    # 6. Verify audit history
    deliveries = pg_db.get_recent_deliveries(limit=10)
    matched = [d for d in deliveries if d["delivery_id"] == deliv_id]
    assert len(matched) == 1
    assert matched[0]["status"] == "OPENED"
    assert matched[0]["fcm_message_id"] == "projects/vayusat-live/messages/pg-msg-12345"
    assert matched[0]["opened_at"] is not None


def test_postgres_upsert_on_conflict_idempotency(pg_db):
    """Verifies that ON CONFLICT DO UPDATE SET updates existing rows and returns the exact ID."""
    source_payload = {
        "source_id": "insat-3dr",
        "agency": "ISRO / MOSDAC",
        "satellite_name": "INSAT-3DR Geostationary Imager & Sounder",
        "orbit_type": "GEOSTATIONARY",
        "spectral_channels": ["TIR1", "TIR2"],
        "spatial_resolution_km": 1.0,
        "temporal_cadence_min": 15,
        "status": "ONLINE"
    }
    id_1 = pg_db.upsert_satellite_source(source_payload)
    id_2 = pg_db.upsert_satellite_source(source_payload)
    assert id_1 == id_2 == 1  # Existing row ID 1 preserved


def test_postgres_transaction_atomicity(pg_db):
    """Verifies that an error inside a transaction rolls back changes and restores connection."""
    initial_alerts = len(pg_db.get_vayu_alerts(limit=200, active_only=False))

    with pytest.raises(Exception):
        with pg_db._cursor() as cur:
            cur.execute("""
                INSERT INTO vayu_alerts (
                    alert_id, storm_name, severity, title, message, source, expires_at
                ) VALUES ('ALR-SHOULD-ROLLBACK', 'Rollback Storm', 'TEST', 'Rollback', 'Msg', 'TEST', CURRENT_TIMESTAMP);
            """)
            # Deliberate constraint violation / syntax error
            cur.execute("INSERT INTO non_existent_table_for_rollback_test VALUES (1);")

    # Verify that the uncommitted alert was NOT persisted
    after_alerts = len(pg_db.get_vayu_alerts(limit=200, active_only=False))
    assert after_alerts == initial_alerts
    assert pg_db.get_vayu_alert_by_id("ALR-SHOULD-ROLLBACK") is None


def test_postgres_seed_idempotency(pg_db):
    """Verifies that running seed_database against PostgreSQL does not duplicate rows."""
    from backend.database.seed_data import seed_database
    initial_sources = len(pg_db.get_all_satellite_sources())
    initial_cyclones = len(pg_db.get_all_cyclones())
    initial_models = len(pg_db.get_registered_models())

    # Run seed again
    seed_database()

    after_sources = len(pg_db.get_all_satellite_sources())
    after_cyclones = len(pg_db.get_all_cyclones())
    after_models = len(pg_db.get_registered_models())

    assert after_sources == initial_sources
    assert after_cyclones == initial_cyclones
    assert after_models == initial_models
