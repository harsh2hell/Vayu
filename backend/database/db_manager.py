import sqlite3
import json
import os
import time
from pathlib import Path
from typing import List, Dict, Any, Optional, Union

# Canonical backend and database directories anchored to this file's physical location
DB_DIR = Path(__file__).resolve().parent
BACKEND_DIR = DB_DIR.parent

DEFAULT_DB_FILENAME = "cyclone_intel.db"
FALLBACK_DB_FILENAME = "cyclone_data.db"


def resolve_database_path(override: Optional[Union[str, Path]] = None) -> Path:
    """
    Deterministically resolves the canonical SQLite database path for VAYU.
    Guarantees path independence regardless of process working directory (os.getcwd()).

    Resolution precedence:
    1. Explicit function argument `override`
    2. Environment variable `DATABASE_URL` (e.g. sqlite:////path/to/db or sqlite:///./rel)
    3. Environment variable `CYCLONE_DB_PATH` or `VAYU_DB_PATH`
    4. Existing `cyclone_intel.db` in `backend/database/`
    5. Existing `cyclone_data.db` in `backend/database/` or `backend/data/`
    6. Canonical default: `backend/database/cyclone_intel.db`
    """
    raw_path = override
    if raw_path is None:
        raw_path = os.environ.get("CYCLONE_DB_PATH") or os.environ.get("VAYU_DB_PATH") or os.environ.get("DATABASE_URL")

    if raw_path:
        path_str = str(raw_path).strip()
        # Strip sqlite URI prefixes if supplied via DATABASE_URL
        if path_str.startswith("sqlite:///"):
            path_str = path_str[len("sqlite:///"): ]
        elif path_str.startswith("sqlite://"):
            path_str = path_str[len("sqlite://"): ]

        p = Path(path_str)
        if p.is_absolute():
            return p.resolve()

        # If relative, anchor to DB_DIR rather than process cwd
        candidate = (DB_DIR / p).resolve()
        if candidate.exists():
            return candidate
        candidate_backend = (BACKEND_DIR / p).resolve()
        if candidate_backend.exists():
            return candidate_backend
        return candidate

    # Default canonical lookup: prefer existing database file to preserve seeded data
    primary = DB_DIR / DEFAULT_DB_FILENAME
    if primary.exists():
        return primary.resolve()

    secondary = DB_DIR / FALLBACK_DB_FILENAME
    if secondary.exists():
        return secondary.resolve()

    backend_data_cand = BACKEND_DIR / "data" / FALLBACK_DB_FILENAME
    if backend_data_cand.exists():
        return backend_data_cand.resolve()

    return primary.resolve()


DB_PATH = str(resolve_database_path())

class DatabaseManager:
    """
    Enterprise SQLite / Embedded Persistence Layer for VAYU (SIH 2026).
    Handles thread-safe transactions, schema migrations, and high-performance querying
    for satellite feeds, ocean buoys, deep learning inference logs, and CAP alerts.
    """
    def __init__(self, db_path: Optional[Union[str, Path]] = None):
        self.db_path_obj = resolve_database_path(db_path)
        self.db_path = str(self.db_path_obj)
        # Ensure database parent directory exists
        self.db_path_obj.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initializes full enterprise database schema."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Satellite Sources Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS satellite_data_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id TEXT UNIQUE NOT NULL,
                agency TEXT NOT NULL,
                satellite_name TEXT NOT NULL,
                orbit_type TEXT NOT NULL,
                spectral_channels_json TEXT NOT NULL,
                spatial_resolution_km REAL NOT NULL,
                temporal_cadence_min INTEGER NOT NULL,
                status TEXT DEFAULT 'ONLINE',
                data_format TEXT DEFAULT 'HDF5 / NetCDF-4',
                coverage_basin TEXT DEFAULT 'North Indian Ocean',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 2. Ingested Satellite Multi-Spectral Frames
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS satellite_frames (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id TEXT NOT NULL,
                channel TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                basin TEXT NOT NULL,
                center_lat REAL NOT NULL,
                center_lon REAL NOT NULL,
                min_brightness_temp_c REAL NOT NULL,
                avg_brightness_temp_c REAL NOT NULL,
                convective_cloud_fraction REAL NOT NULL,
                storage_path TEXT,
                metadata_json TEXT,
                ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 3. Ocean Buoy & Marine Scatterometer Telemetry
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocean_buoy_telemetry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                buoy_id TEXT NOT NULL,
                agency TEXT DEFAULT 'INCOIS / NIOT',
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                basin TEXT NOT NULL,
                sea_surface_temp_c REAL NOT NULL,
                sea_surface_pressure_hpa REAL NOT NULL,
                surface_wind_speed_kmh REAL NOT NULL,
                surface_wind_direction_deg REAL NOT NULL,
                significant_wave_height_m REAL NOT NULL,
                ocean_heat_content_kj_cm2 REAL NOT NULL,
                salinity_psu REAL DEFAULT 34.5,
                timestamp TEXT NOT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 4. Cyclone Systems Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS cyclone_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                system_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                season TEXT NOT NULL,
                basin TEXT NOT NULL,
                category TEXT NOT NULL,
                status TEXT DEFAULT 'ACTIVE',
                peak_intensity_kmh REAL NOT NULL,
                peak_intensity_knots REAL NOT NULL,
                lowest_mslp_hpa REAL NOT NULL,
                landfall_location TEXT,
                landfall_time TEXT,
                landfall_lat REAL,
                landfall_lon REAL,
                surge_height_m REAL,
                dvorak_ci TEXT,
                description TEXT,
                track_history_json TEXT,
                track_forecast_json TEXT,
                cone_polygon_json TEXT,
                impact_districts_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 5. AI Inference Runs Log Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS inference_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT NOT NULL,
                model_version TEXT NOT NULL,
                inference_type TEXT NOT NULL,
                basin TEXT NOT NULL,
                input_source TEXT NOT NULL,
                detected_lat REAL,
                detected_lon REAL,
                confidence REAL NOT NULL,
                dvorak_t TEXT,
                dvorak_ci REAL,
                estimated_wind_kmh REAL,
                estimated_mslp_hpa REAL,
                morphology_pattern TEXT,
                execution_time_ms REAL NOT NULL,
                metadata_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 6. Early Warning & OASIS CAP Disaster Alerts
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS disaster_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_level TEXT NOT NULL,
                basin TEXT NOT NULL,
                cyclone_name TEXT NOT NULL,
                affected_districts_json TEXT,
                affected_states_json TEXT,
                wind_gust_forecast_kmh REAL,
                surge_height_m TEXT,
                rainfall_24h_mm REAL,
                evacuation_recommendation TEXT,
                cap_identifier TEXT,
                cap_urgency TEXT DEFAULT 'Immediate',
                cap_severity TEXT DEFAULT 'Extreme',
                cap_certainty TEXT DEFAULT 'Observed',
                issued_by TEXT,
                active INTEGER DEFAULT 1,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 7. Multi-Source Telemetry Snapshots Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS telemetry_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                satellite_source TEXT NOT NULL,
                basin TEXT NOT NULL,
                center_lat REAL,
                center_lon REAL,
                sst_celsius REAL,
                vertical_wind_shear_knots REAL,
                mslp_hpa REAL,
                surface_wind_kmh REAL,
                raw_payload_json TEXT,
                captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 8. Advisory Bulletins Archive
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS advisory_bulletins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bulletin_no TEXT UNIQUE NOT NULL,
                cyclone_name TEXT NOT NULL,
                basin TEXT NOT NULL,
                category TEXT NOT NULL,
                issued_by TEXT NOT NULL,
                pdf_size_bytes INTEGER NOT NULL,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 9. AI Models Registry
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_models_registry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_key TEXT UNIQUE NOT NULL,
                model_name TEXT NOT NULL,
                version TEXT NOT NULL,
                backbone TEXT NOT NULL,
                dataset_trained TEXT NOT NULL,
                mae_track_km REAL,
                accuracy_pct REAL,
                parameters_count TEXT,
                is_active INTEGER DEFAULT 1,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 10. Mobile & Client Devices (Phase 10A)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT UNIQUE NOT NULL,
                fcm_token TEXT NOT NULL,
                platform TEXT DEFAULT 'android',
                app_version TEXT,
                os_version TEXT,
                device_model TEXT,
                locale TEXT DEFAULT 'en_IN',
                last_known_lat REAL,
                last_known_lon REAL,
                last_known_district TEXT,
                last_known_state TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 11. Notification Preferences (Phase 10A)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS notification_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT UNIQUE NOT NULL,
                enable_critical INTEGER DEFAULT 1,
                enable_warning INTEGER DEFAULT 1,
                enable_watch INTEGER DEFAULT 1,
                enable_info INTEGER DEFAULT 0,
                enable_test INTEGER DEFAULT 0,
                enable_sound INTEGER DEFAULT 1,
                enable_vibration INTEGER DEFAULT 1,
                subscribed_basins_json TEXT DEFAULT '["Bay of Bengal","Arabian Sea"]',
                subscribed_states_json TEXT DEFAULT '[]',
                max_alert_radius_km REAL DEFAULT 300.0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(device_id) REFERENCES devices(device_id) ON DELETE CASCADE
            );
            """)

            # 12. Standardized VAYU Alerts (Phase 10A)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS vayu_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id TEXT UNIQUE NOT NULL,
                storm_id TEXT,
                storm_name TEXT NOT NULL,
                severity TEXT NOT NULL, -- INFO, WATCH, WARNING, CRITICAL, TEST
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                source TEXT NOT NULL, -- VAYU_MODEL, VAYU_OPERATOR, OFFICIAL_ADVISORY, TEST
                source_module TEXT, -- Trajectory-GRU, LandfallCorridor, DvorakResNet, Manual
                location_region TEXT,
                latitude REAL,
                longitude REAL,
                radius_km REAL DEFAULT 150.0,
                metadata_json TEXT DEFAULT '{}',
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            );
            """)

            # 13. Alert Delivery Audit Trail (Phase 10A)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS alert_deliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id TEXT NOT NULL,
                device_id TEXT NOT NULL,
                delivery_status TEXT DEFAULT 'QUEUED', -- QUEUED, SENT, DELIVERED, FAILED, ACKNOWLEDGED
                fcm_message_id TEXT,
                error_message TEXT,
                attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                acknowledged_at TIMESTAMP,
                FOREIGN KEY(alert_id) REFERENCES vayu_alerts(alert_id),
                FOREIGN KEY(device_id) REFERENCES devices(device_id)
            );
            """)

            conn.commit()

    # =========================================================
    # SATELLITE SOURCES & FRAMES CRUD
    # =========================================================
    def upsert_satellite_source(self, source: Dict[str, Any]) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO satellite_data_sources (
                source_id, agency, satellite_name, orbit_type, spectral_channels_json,
                spatial_resolution_km, temporal_cadence_min, status, data_format, coverage_basin
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source_id) DO UPDATE SET
                status=excluded.status,
                spatial_resolution_km=excluded.spatial_resolution_km,
                temporal_cadence_min=excluded.temporal_cadence_min
            """, (
                source["source_id"],
                source["agency"],
                source["satellite_name"],
                source["orbit_type"],
                json.dumps(source.get("spectral_channels", [])),
                source["spatial_resolution_km"],
                source["temporal_cadence_min"],
                source.get("status", "ONLINE"),
                source.get("data_format", "HDF5 / NetCDF-4"),
                source.get("coverage_basin", "North Indian Ocean")
            ))
            conn.commit()
            return cursor.lastrowid

    def get_all_satellite_sources(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM satellite_data_sources ORDER BY agency, satellite_name")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["spectral_channels"] = json.loads(item["spectral_channels_json"] or "[]")
                results.append(item)
            return results

    def log_satellite_frame(self, frame: Dict[str, Any]) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO satellite_frames (
                source_id, channel, timestamp, basin, center_lat, center_lon,
                min_brightness_temp_c, avg_brightness_temp_c, convective_cloud_fraction,
                storage_path, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                frame["source_id"],
                frame["channel"],
                frame["timestamp"],
                frame.get("basin", "Bay of Bengal"),
                frame["center_lat"],
                frame["center_lon"],
                frame["min_brightness_temp_c"],
                frame["avg_brightness_temp_c"],
                frame["convective_cloud_fraction"],
                frame.get("storage_path"),
                json.dumps(frame.get("metadata", {}))
            ))
            conn.commit()
            return cursor.lastrowid

    def get_recent_satellite_frames(self, source_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if source_id:
                cursor.execute("SELECT * FROM satellite_frames WHERE source_id = ? ORDER BY ingested_at DESC LIMIT ?", (source_id, limit))
            else:
                cursor.execute("SELECT * FROM satellite_frames ORDER BY ingested_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["metadata"] = json.loads(item["metadata_json"] or "{}")
                results.append(item)
            return results

    # =========================================================
    # OCEAN BUOY TELEMETRY CRUD
    # =========================================================
    def insert_buoy_telemetry(self, buoy: Dict[str, Any]) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO ocean_buoy_telemetry (
                buoy_id, agency, latitude, longitude, basin, sea_surface_temp_c,
                sea_surface_pressure_hpa, surface_wind_speed_kmh, surface_wind_direction_deg,
                significant_wave_height_m, ocean_heat_content_kj_cm2, salinity_psu, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                buoy["buoy_id"],
                buoy.get("agency", "INCOIS / NIOT"),
                buoy["latitude"],
                buoy["longitude"],
                buoy["basin"],
                buoy["sea_surface_temp_c"],
                buoy["sea_surface_pressure_hpa"],
                buoy["surface_wind_speed_kmh"],
                buoy["surface_wind_direction_deg"],
                buoy["significant_wave_height_m"],
                buoy["ocean_heat_content_kj_cm2"],
                buoy.get("salinity_psu", 34.5),
                buoy["timestamp"]
            ))
            conn.commit()
            return cursor.lastrowid

    def get_latest_buoy_telemetry(self, basin: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if basin:
                cursor.execute("""
                SELECT * FROM ocean_buoy_telemetry WHERE id IN (
                    SELECT MAX(id) FROM ocean_buoy_telemetry WHERE basin = ? GROUP BY buoy_id
                ) ORDER BY buoy_id
                """, (basin,))
            else:
                cursor.execute("""
                SELECT * FROM ocean_buoy_telemetry WHERE id IN (
                    SELECT MAX(id) FROM ocean_buoy_telemetry GROUP BY buoy_id
                ) ORDER BY basin, buoy_id
                """)
            return [dict(r) for r in cursor.fetchall()]

    # =========================================================
    # CYCLONE EVENTS CRUD
    # =========================================================
    def upsert_cyclone_event(self, event_data: Dict[str, Any]) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO cyclone_events (
                system_id, name, season, basin, category, status,
                peak_intensity_kmh, peak_intensity_knots, lowest_mslp_hpa,
                landfall_location, landfall_time, landfall_lat, landfall_lon, surge_height_m,
                dvorak_ci, description, track_history_json, track_forecast_json,
                cone_polygon_json, impact_districts_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(system_id) DO UPDATE SET
                name=excluded.name,
                category=excluded.category,
                status=excluded.status,
                peak_intensity_kmh=excluded.peak_intensity_kmh,
                peak_intensity_knots=excluded.peak_intensity_knots,
                lowest_mslp_hpa=excluded.lowest_mslp_hpa,
                landfall_location=excluded.landfall_location,
                landfall_time=excluded.landfall_time,
                landfall_lat=excluded.landfall_lat,
                landfall_lon=excluded.landfall_lon,
                surge_height_m=excluded.surge_height_m,
                dvorak_ci=excluded.dvorak_ci,
                description=excluded.description,
                track_history_json=excluded.track_history_json,
                track_forecast_json=excluded.track_forecast_json,
                cone_polygon_json=excluded.cone_polygon_json,
                impact_districts_json=excluded.impact_districts_json,
                updated_at=CURRENT_TIMESTAMP
            """, (
                event_data["system_id"],
                event_data["name"],
                event_data["season"],
                event_data["basin"],
                event_data["category"],
                event_data.get("status", "ACTIVE"),
                event_data["peak_intensity_kmh"],
                event_data["peak_intensity_knots"],
                event_data["lowest_mslp_hpa"],
                event_data.get("landfall_location"),
                event_data.get("landfall_time"),
                event_data.get("landfall_lat"),
                event_data.get("landfall_lon"),
                event_data.get("surge_height_m"),
                event_data.get("dvorak_ci", "T3.5"),
                event_data.get("description", ""),
                json.dumps(event_data.get("track_history", [])),
                json.dumps(event_data.get("track_forecast", [])),
                json.dumps(event_data.get("cone_polygon", [])),
                json.dumps(event_data.get("impact_districts", []))
            ))
            conn.commit()
            return cursor.lastrowid

    def get_all_cyclones(self, basin: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if basin:
                cursor.execute("SELECT * FROM cyclone_events WHERE basin = ? ORDER BY created_at DESC", (basin,))
            else:
                cursor.execute("SELECT * FROM cyclone_events ORDER BY created_at DESC")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["track_history"] = json.loads(item["track_history_json"] or "[]")
                item["track_forecast"] = json.loads(item["track_forecast_json"] or "[]")
                item["cone_polygon"] = json.loads(item["cone_polygon_json"] or "[]")
                item["impact_districts"] = json.loads(item["impact_districts_json"] or "[]")
                results.append(item)
            return results

    def get_cyclone_by_id(self, system_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM cyclone_events WHERE system_id = ?", (system_id,))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            item["track_history"] = json.loads(item["track_history_json"] or "[]")
            item["track_forecast"] = json.loads(item["track_forecast_json"] or "[]")
            item["cone_polygon"] = json.loads(item["cone_polygon_json"] or "[]")
            item["impact_districts"] = json.loads(item["impact_districts_json"] or "[]")
            return item

    # =========================================================
    # AI INFERENCE LOGS CRUD
    # =========================================================
    def log_inference_run(self, log_data: Dict[str, Any]) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO inference_logs (
                model_name, model_version, inference_type, basin, input_source,
                detected_lat, detected_lon, confidence, dvorak_t, dvorak_ci,
                estimated_wind_kmh, estimated_mslp_hpa, morphology_pattern,
                execution_time_ms, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                log_data["model_name"],
                log_data["model_version"],
                log_data["inference_type"],
                log_data.get("basin", "Bay of Bengal"),
                log_data.get("input_source", "MANUAL"),
                log_data.get("detected_lat"),
                log_data.get("detected_lon"),
                log_data["confidence"],
                log_data.get("dvorak_t"),
                log_data.get("dvorak_ci"),
                log_data.get("estimated_wind_kmh"),
                log_data.get("estimated_mslp_hpa"),
                log_data.get("morphology_pattern"),
                log_data["execution_time_ms"],
                json.dumps(log_data.get("metadata", {}))
            ))
            conn.commit()
            return cursor.lastrowid

    def get_recent_inferences(self, limit: int = 15) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM inference_logs ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["metadata"] = json.loads(item["metadata_json"] or "{}")
                results.append(item)
            return results

    # =========================================================
    # DISASTER ALERTS (CAP v1.2) CRUD
    # =========================================================
    def create_alert(self, alert_data: Dict[str, Any]) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cap_id = alert_data.get("cap_identifier") or f"IN-IMD-CAP-{int(time.time())}"
            cursor.execute("""
            INSERT INTO disaster_alerts (
                alert_level, basin, cyclone_name, affected_districts_json, affected_states_json,
                wind_gust_forecast_kmh, surge_height_m, rainfall_24h_mm, evacuation_recommendation,
                cap_identifier, cap_urgency, cap_severity, cap_certainty, issued_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alert_data["alert_level"],
                alert_data["basin"],
                alert_data["cyclone_name"],
                json.dumps(alert_data.get("affected_districts", [])),
                json.dumps(alert_data.get("affected_states", [])),
                alert_data.get("wind_gust_forecast_kmh", 120.0),
                alert_data.get("surge_height_m", "2.0m"),
                alert_data.get("rainfall_24h_mm", 150.0),
                alert_data.get("evacuation_recommendation", "Immediate evacuation of coastal habitations."),
                cap_id,
                alert_data.get("cap_urgency", "Immediate"),
                alert_data.get("cap_severity", "Extreme"),
                alert_data.get("cap_certainty", "Observed"),
                alert_data.get("issued_by", "VAYU Early Warning Gateway (SIH 2026)")
            ))
            conn.commit()
            return cursor.lastrowid

    def get_active_alerts(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM disaster_alerts WHERE active = 1 ORDER BY issued_at DESC")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["affected_districts"] = json.loads(item["affected_districts_json"] or "[]")
                item["affected_states"] = json.loads(item["affected_states_json"] or "[]")
                results.append(item)
            return results

    # =========================================================
    # AI MODELS REGISTRY CRUD
    # =========================================================
    def register_ai_model(self, model_info: Dict[str, Any]) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO ai_models_registry (
                model_key, model_name, version, backbone, dataset_trained,
                mae_track_km, accuracy_pct, parameters_count, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(model_key) DO UPDATE SET
                version=excluded.version,
                mae_track_km=excluded.mae_track_km,
                accuracy_pct=excluded.accuracy_pct,
                is_active=excluded.is_active
            """, (
                model_info["model_key"],
                model_info["model_name"],
                model_info["version"],
                model_info["backbone"],
                model_info["dataset_trained"],
                model_info.get("mae_track_km"),
                model_info.get("accuracy_pct"),
                model_info.get("parameters_count", "24.5M"),
                1 if model_info.get("is_active", True) else 0
            ))
            conn.commit()
            return cursor.lastrowid

    def get_registered_models(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ai_models_registry ORDER BY id")
            return [dict(r) for r in cursor.fetchall()]

    # =========================================================
    # MOBILE DEVICES & NOTIFICATION PREFERENCES (PHASE 10A)
    # =========================================================
    def register_device(self, device_data: Dict[str, Any]) -> Dict[str, Any]:
        """Registers or updates a mobile device and ensures default notification preferences."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO devices (
                device_id, fcm_token, platform, app_version, os_version,
                device_model, locale, last_known_lat, last_known_lon,
                last_known_district, last_known_state, is_active, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(device_id) DO UPDATE SET
                fcm_token=excluded.fcm_token,
                platform=excluded.platform,
                app_version=excluded.app_version,
                os_version=excluded.os_version,
                device_model=excluded.device_model,
                locale=excluded.locale,
                last_known_lat=COALESCE(excluded.last_known_lat, devices.last_known_lat),
                last_known_lon=COALESCE(excluded.last_known_lon, devices.last_known_lon),
                last_known_district=COALESCE(excluded.last_known_district, devices.last_known_district),
                last_known_state=COALESCE(excluded.last_known_state, devices.last_known_state),
                is_active=1,
                updated_at=CURRENT_TIMESTAMP
            """, (
                device_data["device_id"],
                device_data["fcm_token"],
                device_data.get("platform", "android"),
                device_data.get("app_version", "1.0.0"),
                device_data.get("os_version"),
                device_data.get("device_model"),
                device_data.get("locale", "en_IN"),
                device_data.get("latitude"),
                device_data.get("longitude"),
                device_data.get("district"),
                device_data.get("state")
            ))

            # Ensure default preferences exist
            cursor.execute("""
            INSERT OR IGNORE INTO notification_preferences (device_id)
            VALUES (?)
            """, (device_data["device_id"],))

            conn.commit()
            return {
                "success": True,
                "device_id": device_data["device_id"],
                "status": "REGISTERED",
                "message": "Device registered for real-time VAYU cyclone alerts."
            }

    def unregister_device(self, device_id: str) -> bool:
        """Deactivates a device registration so alerts are no longer dispatched to it."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE devices SET is_active = 0, updated_at = CURRENT_TIMESTAMP
            WHERE device_id = ?
            """, (device_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_notification_preferences(self, device_id: str) -> Dict[str, Any]:
        """Retrieves notification preferences for a device, falling back to sensible defaults."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notification_preferences WHERE device_id = ?", (device_id,))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                return {
                    "device_id": d["device_id"],
                    "enable_critical": bool(d["enable_critical"]),
                    "enable_warning": bool(d["enable_warning"]),
                    "enable_watch": bool(d["enable_watch"]),
                    "enable_info": bool(d["enable_info"]),
                    "enable_test": bool(d["enable_test"]),
                    "enable_sound": bool(d["enable_sound"]),
                    "enable_vibration": bool(d["enable_vibration"]),
                    "subscribed_basins": json.loads(d.get("subscribed_basins_json") or '["Bay of Bengal","Arabian Sea"]'),
                    "subscribed_states": json.loads(d.get("subscribed_states_json") or '[]'),
                    "max_alert_radius_km": float(d.get("max_alert_radius_km") or 300.0),
                    "updated_at": d.get("updated_at")
                }

            # Return defaults if not configured
            return {
                "device_id": device_id,
                "enable_critical": True,
                "enable_warning": True,
                "enable_watch": True,
                "enable_info": False,
                "enable_test": False,
                "enable_sound": True,
                "enable_vibration": True,
                "subscribed_basins": ["Bay of Bengal", "Arabian Sea"],
                "subscribed_states": [],
                "max_alert_radius_km": 300.0,
                "updated_at": None
            }

    def update_notification_preferences(self, device_id: str, prefs: Dict[str, Any]) -> Dict[str, Any]:
        """Updates notification channels and filters for a registered device."""
        current = self.get_notification_preferences(device_id)
        
        # Merge updates
        enable_crit = prefs.get("enable_critical", current["enable_critical"])
        enable_warn = prefs.get("enable_warning", current["enable_warning"])
        enable_watch = prefs.get("enable_watch", current["enable_watch"])
        enable_info = prefs.get("enable_info", current["enable_info"])
        enable_test = prefs.get("enable_test", current["enable_test"])
        enable_snd = prefs.get("enable_sound", current["enable_sound"])
        enable_vib = prefs.get("enable_vibration", current["enable_vibration"])
        basins = prefs.get("subscribed_basins", current["subscribed_basins"])
        states = prefs.get("subscribed_states", current["subscribed_states"])
        radius = prefs.get("max_alert_radius_km", current["max_alert_radius_km"])

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO notification_preferences (
                device_id, enable_critical, enable_warning, enable_watch,
                enable_info, enable_test, enable_sound, enable_vibration,
                subscribed_basins_json, subscribed_states_json, max_alert_radius_km,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(device_id) DO UPDATE SET
                enable_critical=excluded.enable_critical,
                enable_warning=excluded.enable_warning,
                enable_watch=excluded.enable_watch,
                enable_info=excluded.enable_info,
                enable_test=excluded.enable_test,
                enable_sound=excluded.enable_sound,
                enable_vibration=excluded.enable_vibration,
                subscribed_basins_json=excluded.subscribed_basins_json,
                subscribed_states_json=excluded.subscribed_states_json,
                max_alert_radius_km=excluded.max_alert_radius_km,
                updated_at=CURRENT_TIMESTAMP
            """, (
                device_id,
                1 if enable_crit else 0,
                1 if enable_warn else 0,
                1 if enable_watch else 0,
                1 if enable_info else 0,
                1 if enable_test else 0,
                1 if enable_snd else 0,
                1 if enable_vib else 0,
                json.dumps(basins),
                json.dumps(states),
                radius
            ))
            conn.commit()

        return self.get_notification_preferences(device_id)

    # =========================================================
    # STANDARDIZED VAYU ALERTS (PHASE 10A)
    # =========================================================
    def create_vayu_alert(self, alert_data: Dict[str, Any]) -> str:
        """Creates a standardized VAYU alert record."""
        import datetime
        alert_id = alert_data.get("alert_id") or f"ALR-2026-{int(time.time() * 1000) % 1000000:06d}"
        
        # Calculate expiration: default 24h from now
        expires_at = alert_data.get("expires_at")
        if not expires_at:
            expires_at = (datetime.datetime.utcnow() + datetime.timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S")

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO vayu_alerts (
                alert_id, storm_id, storm_name, severity, title, message,
                source, source_module, location_region, latitude, longitude,
                radius_km, metadata_json, is_active, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT(alert_id) DO UPDATE SET
                severity=excluded.severity,
                title=excluded.title,
                message=excluded.message,
                location_region=excluded.location_region,
                latitude=excluded.latitude,
                longitude=excluded.longitude,
                radius_km=excluded.radius_km,
                metadata_json=excluded.metadata_json,
                is_active=excluded.is_active,
                expires_at=excluded.expires_at
            """, (
                alert_id,
                alert_data.get("storm_id"),
                alert_data["storm_name"],
                alert_data.get("severity", "WARNING").upper(),
                alert_data["title"],
                alert_data["message"],
                alert_data.get("source", "VAYU_MODEL"),
                alert_data.get("source_module", "Trajectory-GRU"),
                alert_data.get("location_region"),
                alert_data.get("latitude"),
                alert_data.get("longitude"),
                alert_data.get("radius_km", 150.0),
                json.dumps(alert_data.get("metadata_json") or alert_data.get("metadata") or {}),
                expires_at
            ))
            conn.commit()
            return alert_id

    def get_vayu_alerts(
        self,
        limit: int = 50,
        active_only: bool = True,
        severity: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves alerts, optionally filtering by active state and severity."""
        self._ensure_seed_vayu_alerts()
        query = "SELECT * FROM vayu_alerts WHERE 1=1"
        params: List[Any] = []

        if active_only:
            query += " AND is_active = 1 AND datetime(expires_at) >= datetime('now')"
        if severity:
            query += " AND severity = ?"
            params.append(severity.upper())

        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["metadata"] = json.loads(d.get("metadata_json") or "{}")
                d["is_active"] = bool(d.get("is_active", 1))
                results.append(d)
            return results

    def get_vayu_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single VAYU alert by its canonical identifier."""
        self._ensure_seed_vayu_alerts()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vayu_alerts WHERE alert_id = ?", (alert_id,))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["metadata"] = json.loads(d.get("metadata_json") or "{}")
            d["is_active"] = bool(d.get("is_active", 1))
            return d

    def _ensure_seed_vayu_alerts(self):
        """Seeds initial verified alerts if the table is currently empty."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM vayu_alerts")
            count = cursor.fetchone()[0]
            if count > 0:
                return

        # Pre-seed realistic alerts
        initial_alerts = [
            {
                "alert_id": "ALR-2026-00001",
                "storm_id": "DANA",
                "storm_name": "Cyclone DANA (2024)",
                "severity": "CRITICAL",
                "title": "Severe Coastal Strike & Evacuation Alert",
                "message": "Cyclone DANA landfall corridor locked: Northern Odisha / West Bengal coast between Dhamra and Bhitarkanika. Peak winds 120 km/h with 2.5m storm surge. Immediate relocation to concrete cyclone shelters advised.",
                "source": "VAYU_MODEL",
                "source_module": "LandfallCorridor-GRU",
                "location_region": "Odisha & West Bengal Coastal Corridor",
                "latitude": 20.8,
                "longitude": 86.9,
                "radius_km": 120.0,
                "metadata_json": {
                    "estimated_landfall_eta": "18h",
                    "wind_speed_kmh": 120,
                    "central_pressure_hpa": 984,
                    "affected_districts": ["Bhadrak", "Kendrapara", "Balasore", "Purba Medinipur"],
                    "shelters_active": 142
                }
            },
            {
                "alert_id": "ALR-2026-00002",
                "storm_id": "BIPARJOY",
                "storm_name": "Cyclone BIPARJOY (2023)",
                "severity": "WARNING",
                "title": "Trajectory Recurvature Warning: Saurashtra & Kutch",
                "message": "Cyclone BIPARJOY spatiotemporal trajectory confirms northeast recurvature heading towards Saurashtra & Kutch near Jakhau Port. Gale force winds reaching 115 km/h. Sea conditions phenomenal.",
                "source": "VAYU_MODEL",
                "source_module": "Trajectory-GRU",
                "location_region": "Gujarat Coastal Seaboard",
                "latitude": 22.8,
                "longitude": 68.6,
                "radius_km": 180.0,
                "metadata_json": {
                    "wind_speed_kmh": 115,
                    "central_pressure_hpa": 972,
                    "affected_districts": ["Kutch", "Devbhumi Dwarka", "Jamnagar", "Porbandar"]
                }
            },
            {
                "alert_id": "ALR-2026-00003",
                "storm_id": "DRILL-01",
                "storm_name": "Pre-Cyclone Siren Test (Drill)",
                "severity": "TEST",
                "title": "Civil Defense Early Warning Channel Verification",
                "message": "Routine notification channel and acoustic siren readiness verification. No action required by residents.",
                "source": "TEST",
                "source_module": "SystemDiagnostics",
                "location_region": "National Coastal Mesh",
                "latitude": 19.8,
                "longitude": 85.8,
                "radius_km": 500.0,
                "metadata_json": {
                    "drill_code": "VAYU-VERIFY-001",
                    "is_test": True
                }
            }
        ]
        for a in initial_alerts:
            self.create_vayu_alert(a)

# Singleton Database Instance
db = DatabaseManager()

