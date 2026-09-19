"""
test_database_path_hardening.py
=============================================
PHASE 7 — STEP 7.6: SQLITE DATABASE PATH HARDENING REGRESSION SUITE

Tests:
1. Deterministic database path resolution across varied process working directories (cwd).
2. Environment variable overrides (DATABASE_URL, CYCLONE_DB_PATH).
3. Database integrity verification (tables, rows, connectivity).
4. No rogue database creation in non-backend working directories.
"""

import os
import sqlite3
import tempfile
from pathlib import Path
import pytest

from backend.database.db_manager import (
    resolve_database_path,
    DB_PATH,
    DatabaseManager,
    db,
    DB_DIR
)

REQUIRED_TABLES = [
    "satellite_data_sources",
    "satellite_frames",
    "ocean_buoy_telemetry",
    "cyclone_events",
    "inference_logs",
    "disaster_alerts",
    "telemetry_snapshots",
    "advisory_bulletins",
    "ai_models_registry"
]


def test_canonical_database_path_resolution():
    """Verify that canonical resolution points to the existing database in backend/database/."""
    canonical_path = resolve_database_path()
    assert isinstance(canonical_path, Path)
    assert canonical_path.is_absolute()
    assert canonical_path.exists()
    assert canonical_path.name in ("cyclone_intel.db", "cyclone_data.db")
    assert canonical_path.parent == DB_DIR


def test_working_directory_independence():
    """
    Verify path resolution returns the exact same canonical path regardless of
    the process current working directory (os.getcwd()).
    """
    initial_cwd = os.getcwd()
    canonical_expected = resolve_database_path()

    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # 1. From temporary directory
            os.chdir(temp_dir)
            resolved_from_temp = resolve_database_path()
            assert resolved_from_temp == canonical_expected

            # 2. From backend directory
            backend_dir = str(DB_DIR.parent)
            os.chdir(backend_dir)
            resolved_from_backend = resolve_database_path()
            assert resolved_from_backend == canonical_expected

            # 3. Instantiate DatabaseManager in temp_dir and ensure no rogue db is created in temp_dir
            os.chdir(temp_dir)
            mgr = DatabaseManager()
            assert Path(mgr.db_path) == canonical_expected
            # Verify temp_dir contains zero .db files
            temp_db_files = list(Path(temp_dir).glob("*.db"))
            assert len(temp_db_files) == 0, f"Rogue db created in temp directory: {temp_db_files}"

        finally:
            os.chdir(initial_cwd)


def test_environment_variable_override(monkeypatch):
    """Verify DATABASE_URL and CYCLONE_DB_PATH overrides."""
    # 1. Absolute custom path
    with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
        monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp.name}")
        resolved = resolve_database_path()
        assert resolved == Path(tmp.name).resolve()

    # 2. CYCLONE_DB_PATH override
    with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("CYCLONE_DB_PATH", tmp.name)
        resolved = resolve_database_path()
        assert resolved == Path(tmp.name).resolve()


def test_database_integrity_and_tables():
    """Verify that all 9 schema tables exist and can be queried."""
    canonical_path = resolve_database_path()
    conn = sqlite3.connect(str(canonical_path))
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing_tables = {r[0] for r in cursor.fetchall()}

    for table in REQUIRED_TABLES:
        assert table in existing_tables, f"Missing required table: {table}"

    # Verify queryability of seeded data
    cursor.execute("SELECT COUNT(*) FROM cyclone_events")
    cyclone_count = cursor.fetchone()[0]
    assert cyclone_count > 0, "Expected existing cyclone events in database"

    cursor.execute("SELECT COUNT(*) FROM ai_models_registry")
    model_count = cursor.fetchone()[0]
    assert model_count > 0, "Expected registered models in ai_models_registry"

    conn.close()


def test_singleton_db_instance():
    """Verify that singleton `db` instance connects cleanly to canonical database."""
    sources = db.get_all_satellite_sources()
    assert isinstance(sources, list)
    assert len(sources) > 0

    cyclones = db.get_all_cyclones()
    assert isinstance(cyclones, list)
    assert len(cyclones) > 0
