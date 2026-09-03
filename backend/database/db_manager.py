import sqlite3
import json
import os
import time
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "cyclone_intel.db")

class DatabaseManager:
    """
    Enterprise SQLite / Embedded Persistence Layer for CycloneAI (SIH 2026).
    Handles thread-safe transactions, schema migrations, and high-performance querying
    for satellite feeds, ocean buoys, deep learning inference logs, and CAP alerts.
    """
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
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
                alert_data.get("issued_by", "CycloneAI Early Warning Gateway (SIH 2026)")
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

# Singleton Database Instance
db = DatabaseManager()
