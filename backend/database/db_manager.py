import sqlite3
import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional, Union
from contextlib import contextmanager

# Try importing psycopg3 and connection pool
try:
    import psycopg
    from psycopg.rows import dict_row
    from psycopg_pool import ConnectionPool
except ImportError:
    psycopg = None
    dict_row = None
    ConnectionPool = None

# Canonical backend and database directories anchored to this file's physical location
DB_DIR = Path(__file__).resolve().parent
BACKEND_DIR = DB_DIR.parent

DEFAULT_DB_FILENAME = "cyclone_intel.db"
FALLBACK_DB_FILENAME = "cyclone_data.db"


def normalize_postgres_url(raw_url: str) -> str:
    """Safely normalizes PostgreSQL connection URI, encoding special characters in password if needed."""
    if not raw_url:
        return ""
    url = raw_url.strip()
    if url.startswith("postgresql+psycopg://"):
        url = url.replace("postgresql+psycopg://", "postgresql://", 1)

    # Check if password has unencoded '@' (e.g. postgresql://user:p@ss@host:port/db)
    if url.count("@") > 1 and "://" in url:
        prefix, rest = url.split("://", 1)
        userinfo, hostinfo = rest.rsplit("@", 1)
        if ":" in userinfo:
            user, password = userinfo.split(":", 1)
            import urllib.parse
            encoded_password = urllib.parse.quote(password, safe="")
            url = f"{prefix}://{user}:{encoded_password}@{hostinfo}"
    return url


def resolve_database_path(override: Optional[Union[str, Path]] = None) -> Path:
    """
    Deterministically resolves the canonical SQLite database path for VAYU.
    Guarantees path independence regardless of process working directory (os.getcwd()).

    Resolution precedence:
    1. Explicit function argument `override`
    2. Environment variable `CYCLONE_DB_PATH` or `VAYU_DB_PATH`
    3. SQLite URI in `DATABASE_URL` (e.g. sqlite:////path/to/db)
    4. Existing `cyclone_intel.db` in `backend/database/`
    5. Existing `cyclone_data.db` in `backend/database/` or `backend/data/`
    6. Canonical default: `backend/database/cyclone_intel.db`
    """
    raw_path = override
    if raw_path is None:
        raw_path = os.environ.get("CYCLONE_DB_PATH") or os.environ.get("VAYU_DB_PATH")
        if not raw_path:
            db_url_env = os.environ.get("DATABASE_URL", "")
            if db_url_env.startswith("sqlite://"):
                raw_path = db_url_env

    if raw_path:
        path_str = str(raw_path).strip()
        if path_str.startswith("sqlite:///"):
            path_str = path_str[len("sqlite:///"): ]
        elif path_str.startswith("sqlite://"):
            path_str = path_str[len("sqlite://"): ]

        p = Path(path_str)
        if p.is_absolute():
            return p.resolve()

        candidate = (DB_DIR / p).resolve()
        if candidate.exists():
            return candidate
        candidate_backend = (BACKEND_DIR / p).resolve()
        if candidate_backend.exists():
            return candidate_backend
        return candidate

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
    Enterprise Persistence Layer for VAYU (SIH 2026).
    Supports:
    1. Production: Supabase PostgreSQL via psycopg3 and ConnectionPool
    2. Offline/Fallback: Canonical SQLite (cyclone_intel.db)
    Preserves thread safety, transaction boundaries, and exact dictionary row semantics.
    """
    def __init__(
        self,
        db_path: Optional[Union[str, Path]] = None,
        database_url: Optional[str] = None
    ):
        self.is_postgres = False
        self.pool: Optional[Any] = None
        self.postgres_error: Optional[str] = None
        self.postgres_configured = False
        self.db_url: Optional[str] = None

        # 1. Check if SQLite is explicitly requested and check production mode
        force_sqlite = os.environ.get("USE_SQLITE", "").lower() in ("true", "1", "yes")
        is_prod = (os.environ.get("VAYU_ENV") == "production")

        # 2. Resolve PostgreSQL URL if not forcing SQLite
        target_pg_url = database_url or os.environ.get("DATABASE_URL")
        if not target_pg_url and not force_sqlite and not is_prod:
            # Fallback to local secure config if available in dev ONLY
            conf_file = Path.home() / ".config/vayu/supabase.env"
            if conf_file.exists():
                try:
                    for line in conf_file.read_text(encoding="utf-8").splitlines():
                        if line.startswith("DATABASE_URL="):
                            target_pg_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                            break
                except Exception:
                    pass

        # Validate whether it is indeed a postgres URI
        if target_pg_url and any(target_pg_url.startswith(p) for p in ("postgresql://", "postgres://", "postgresql+psycopg://")):
            self.postgres_configured = True
            if not force_sqlite:
                self.db_url = normalize_postgres_url(target_pg_url)

        # 3. Initialize PostgreSQL Connection Pool if configured
        if self.postgres_configured and not force_sqlite:
            if not psycopg or not ConnectionPool:
                self.postgres_error = "psycopg or psycopg_pool not installed"
                print(f"⚠️ [VAYU DB] PostgreSQL configured but dependencies missing: {self.postgres_error}")
            else:
                try:
                    min_size = int(os.environ.get("DB_POOL_MIN_SIZE", "1"))
                    max_size = int(os.environ.get("DB_POOL_MAX_SIZE", "10"))
                    timeout = float(os.environ.get("DB_CONNECT_TIMEOUT", "10.0"))

                    self.pool = ConnectionPool(
                        conninfo=self.db_url,
                        min_size=min_size,
                        max_size=max_size,
                        timeout=timeout,
                        open=True,
                        kwargs={"row_factory": dict_row, "autocommit": False}
                    )
                    # Verify immediate connectivity with ping
                    with self.pool.connection(timeout=timeout) as conn:
                        with conn.cursor() as cur:
                            cur.execute("SELECT 1 AS ping;")
                            row = cur.fetchone()
                            if row and row.get("ping") == 1:
                                self.is_postgres = True
                                print("✓ [VAYU DB] Connected to Supabase PostgreSQL Connection Pool.")
                except Exception as e:
                    self.postgres_error = str(e)
                    self.is_postgres = False
                    print(f"✗ [VAYU DB] Failed to connect to PostgreSQL: {e}")
                    # Note: We do NOT silently switch to SQLite if DATABASE_URL was explicitly provided in production.

        # 4. Strict Production Enforcement: Prohibit silent fallback to SQLite
        is_prod = (os.environ.get("VAYU_ENV") == "production")
        if is_prod and not force_sqlite:
            if not self.postgres_configured or not self.is_postgres:
                err = self.postgres_error or "DATABASE_URL environment variable is not configured."
                raise RuntimeError(
                    f"Production startup failed: VAYU_ENV=production is set, but Supabase PostgreSQL "
                    f"is unavailable ({err}). Silent fallback to SQLite is strictly forbidden in production. "
                    f"Configure DATABASE_URL in cloud secrets, or set USE_SQLITE=true for explicit fallback."
                )

        # 5. If not using PostgreSQL, initialize SQLite fallback for local development or explicit fallback
        self.db_path_obj = resolve_database_path(db_path)
        self.db_path = str(self.db_path_obj)
        if not self.is_postgres:
            self.db_path_obj.parent.mkdir(parents=True, exist_ok=True)
            self._init_sqlite_db()
            if not self.postgres_configured:
                print(f"ℹ️ [VAYU DB] Operating on local SQLite database: {self.db_path}")

    def close(self):
        """Closes the connection pool on shutdown."""
        if self.pool:
            try:
                self.pool.close()
            except Exception:
                pass
            self.pool = None

    def _get_sqlite_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    @contextmanager
    def _cursor(self):
        """
        Unified transaction context manager:
        - In PostgreSQL: checks out connection from pool, runs within transaction, commits on exit,
          rolls back on exception, returns connection to pool.
        - In SQLite: opens connection, yields cursor, commits on exit, rolls back on exception.
        """
        if self.is_postgres:
            if not self.pool:
                raise RuntimeError(f"PostgreSQL connection pool unavailable: {self.postgres_error}")
            with self.pool.connection() as conn:
                with conn.transaction():
                    with conn.cursor() as cur:
                        yield cur
        else:
            force_sqlite = os.environ.get("USE_SQLITE", "").lower() in ("true", "1", "yes")
            if self.postgres_configured and not force_sqlite:
                raise RuntimeError(
                    f"PostgreSQL was configured via DATABASE_URL but connection failed: {self.postgres_error}. "
                    "Refusing silent fallback to SQLite. Set USE_SQLITE=true to explicitly force fallback."
                )
            with sqlite3.connect(self.db_path, check_same_thread=False) as conn:
                conn.row_factory = sqlite3.Row
                cur = conn.cursor()
                try:
                    yield cur
                    conn.commit()
                except Exception:
                    conn.rollback()
                    raise

    def _format_sql(self, sql: str) -> str:
        """Adapts query parameter placeholders (%s for Postgres, ? for SQLite)."""
        if self.is_postgres:
            return sql
        return sql.replace("%s", "?")

    def _extract_id(self, row: Any) -> int:
        """Extracts inserted ID from RETURNING id result for both dict_row and sqlite3.Row."""
        if row is None:
            return 0
        if isinstance(row, dict) and "id" in row:
            return int(row["id"])
        try:
            return int(row[0])
        except Exception:
            return 0

    def health_check(self) -> Dict[str, Any]:
        """Pings the database to verify operational connectivity without leaking secrets."""
        if self.is_postgres:
            if not self.pool:
                return {
                    "engine": "PostgreSQL",
                    "status": "UNHEALTHY",
                    "connected": False,
                    "error": (self.postgres_error or "Connection pool uninitialized").split("\n")[0][:120]
                }
            try:
                with self.pool.connection(timeout=3.0) as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1 AS ping;")
                        row = cur.fetchone()
                        ok = (row is not None and row.get("ping") == 1)
                return {
                    "engine": "PostgreSQL",
                    "status": "ONLINE" if ok else "DEGRADED",
                    "connected": ok,
                    "pool_min": self.pool.min_size,
                    "pool_max": self.pool.max_size
                }
            except Exception as e:
                return {
                    "engine": "PostgreSQL",
                    "status": "UNHEALTHY",
                    "connected": False,
                    "error": str(e).split("\n")[0][:120]
                }
        else:
            # If PostgreSQL was configured but failed, report unhealthy
            if self.postgres_configured:
                return {
                    "engine": "PostgreSQL",
                    "status": "UNHEALTHY",
                    "connected": False,
                    "error": (self.postgres_error or "PostgreSQL connection failed").split("\n")[0][:120]
                }
            try:
                with self._get_sqlite_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT 1 AS ping;")
                    row = cur.fetchone()
                    ok = (row is not None and row[0] == 1)
                return {
                    "engine": "SQLite",
                    "status": "ONLINE" if ok else "DEGRADED",
                    "connected": ok,
                    "database_file": Path(self.db_path).name
                }
            except Exception as e:
                return {
                    "engine": "SQLite",
                    "status": "UNHEALTHY",
                    "connected": False,
                    "error": str(e).split("\n")[0][:120]
                }

    def _init_sqlite_db(self):
        """Initializes full enterprise database schema for SQLite fallback mode."""
        with self._get_sqlite_connection() as conn:
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

            # 2. Satellite Frames Archive
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

            # 3. Ocean Buoy & Scatterometer Telemetry
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

            # 4. Cyclone Events & Spatiotemporal Tracks
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

            # 5. Deep Learning Inference Logs
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

            # 6. Disaster Alerts
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

            # 7. Telemetry Ingestion Snapshots
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

            # 8. Advisory Bulletins
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

            # 10. Client Devices
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

            # 11. Notification Preferences
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

            # 12. Standardized VAYU Alerts
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS vayu_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id TEXT UNIQUE NOT NULL,
                storm_id TEXT,
                storm_name TEXT NOT NULL,
                severity TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                source TEXT NOT NULL,
                source_module TEXT,
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

            # 13. Alert Delivery Audit Trail
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS alert_deliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id TEXT NOT NULL,
                device_id TEXT NOT NULL,
                delivery_status TEXT DEFAULT 'QUEUED',
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
        sql = """
        INSERT INTO satellite_data_sources (
            source_id, agency, satellite_name, orbit_type, spectral_channels_json,
            spatial_resolution_km, temporal_cadence_min, status, data_format, coverage_basin
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT(source_id) DO UPDATE SET
            status=EXCLUDED.status,
            spatial_resolution_km=EXCLUDED.spatial_resolution_km,
            temporal_cadence_min=EXCLUDED.temporal_cadence_min
        RETURNING id;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)
            row = cursor.fetchone()
            return self._extract_id(row)

    def get_all_satellite_sources(self) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM satellite_data_sources ORDER BY agency, satellite_name"
        with self._cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["spectral_channels"] = json.loads(item.get("spectral_channels_json") or "[]")
                results.append(item)
            return results

    def log_satellite_frame(self, frame: Dict[str, Any]) -> int:
        sql = """
        INSERT INTO satellite_frames (
            source_id, channel, timestamp, basin, center_lat, center_lon,
            min_brightness_temp_c, avg_brightness_temp_c, convective_cloud_fraction,
            storage_path, metadata_json
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)
            row = cursor.fetchone()
            return self._extract_id(row)

    def get_recent_satellite_frames(self, source_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        with self._cursor() as cursor:
            if source_id:
                sql = "SELECT * FROM satellite_frames WHERE source_id = %s ORDER BY ingested_at DESC LIMIT %s"
                cursor.execute(self._format_sql(sql), (source_id, limit))
            else:
                sql = "SELECT * FROM satellite_frames ORDER BY ingested_at DESC LIMIT %s"
                cursor.execute(self._format_sql(sql), (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["metadata"] = json.loads(item.get("metadata_json") or "{}")
                results.append(item)
            return results

    # =========================================================
    # OCEAN BUOY TELEMETRY CRUD
    # =========================================================
    def insert_buoy_telemetry(self, buoy: Dict[str, Any]) -> int:
        sql = """
        INSERT INTO ocean_buoy_telemetry (
            buoy_id, agency, latitude, longitude, basin, sea_surface_temp_c,
            sea_surface_pressure_hpa, surface_wind_speed_kmh, surface_wind_direction_deg,
            significant_wave_height_m, ocean_heat_content_kj_cm2, salinity_psu, timestamp
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)
            row = cursor.fetchone()
            return self._extract_id(row)

    def get_latest_buoy_telemetry(self, basin: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._cursor() as cursor:
            if basin:
                sql = """
                SELECT * FROM ocean_buoy_telemetry WHERE id IN (
                    SELECT MAX(id) FROM ocean_buoy_telemetry WHERE basin = %s GROUP BY buoy_id
                ) ORDER BY buoy_id
                """
                cursor.execute(self._format_sql(sql), (basin,))
            else:
                sql = """
                SELECT * FROM ocean_buoy_telemetry WHERE id IN (
                    SELECT MAX(id) FROM ocean_buoy_telemetry GROUP BY buoy_id
                ) ORDER BY basin, buoy_id
                """
                cursor.execute(sql)
            return [dict(r) for r in cursor.fetchall()]

    # =========================================================
    # CYCLONE EVENTS CRUD
    # =========================================================
    def upsert_cyclone_event(self, event_data: Dict[str, Any]) -> int:
        sql = """
        INSERT INTO cyclone_events (
            system_id, name, season, basin, category, status,
            peak_intensity_kmh, peak_intensity_knots, lowest_mslp_hpa,
            landfall_location, landfall_time, landfall_lat, landfall_lon, surge_height_m,
            dvorak_ci, description, track_history_json, track_forecast_json,
            cone_polygon_json, impact_districts_json, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT(system_id) DO UPDATE SET
            name=EXCLUDED.name,
            category=EXCLUDED.category,
            status=EXCLUDED.status,
            peak_intensity_kmh=EXCLUDED.peak_intensity_kmh,
            peak_intensity_knots=EXCLUDED.peak_intensity_knots,
            lowest_mslp_hpa=EXCLUDED.lowest_mslp_hpa,
            landfall_location=EXCLUDED.landfall_location,
            landfall_time=EXCLUDED.landfall_time,
            landfall_lat=EXCLUDED.landfall_lat,
            landfall_lon=EXCLUDED.landfall_lon,
            surge_height_m=EXCLUDED.surge_height_m,
            dvorak_ci=EXCLUDED.dvorak_ci,
            description=EXCLUDED.description,
            track_history_json=EXCLUDED.track_history_json,
            track_forecast_json=EXCLUDED.track_forecast_json,
            cone_polygon_json=EXCLUDED.cone_polygon_json,
            impact_districts_json=EXCLUDED.impact_districts_json,
            updated_at=CURRENT_TIMESTAMP
        RETURNING id;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)
            row = cursor.fetchone()
            return self._extract_id(row)

    def get_all_cyclones(self, basin: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._cursor() as cursor:
            if basin:
                sql = "SELECT * FROM cyclone_events WHERE basin = %s ORDER BY created_at DESC"
                cursor.execute(self._format_sql(sql), (basin,))
            else:
                sql = "SELECT * FROM cyclone_events ORDER BY created_at DESC"
                cursor.execute(sql)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["track_history"] = json.loads(item.get("track_history_json") or "[]")
                item["track_forecast"] = json.loads(item.get("track_forecast_json") or "[]")
                item["cone_polygon"] = json.loads(item.get("cone_polygon_json") or "[]")
                item["impact_districts"] = json.loads(item.get("impact_districts_json") or "[]")
                results.append(item)
            return results

    def get_cyclone_by_id(self, system_id: str) -> Optional[Dict[str, Any]]:
        sql = "SELECT * FROM cyclone_events WHERE system_id = %s"
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (system_id,))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            item["track_history"] = json.loads(item.get("track_history_json") or "[]")
            item["track_forecast"] = json.loads(item.get("track_forecast_json") or "[]")
            item["cone_polygon"] = json.loads(item.get("cone_polygon_json") or "[]")
            item["impact_districts"] = json.loads(item.get("impact_districts_json") or "[]")
            return item

    # =========================================================
    # AI INFERENCE LOGS CRUD
    # =========================================================
    def log_inference_run(self, log_data: Dict[str, Any]) -> int:
        sql = """
        INSERT INTO inference_logs (
            model_name, model_version, inference_type, basin, input_source,
            detected_lat, detected_lon, confidence, dvorak_t, dvorak_ci,
            estimated_wind_kmh, estimated_mslp_hpa, morphology_pattern,
            execution_time_ms, metadata_json
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)
            row = cursor.fetchone()
            return self._extract_id(row)

    def get_recent_inferences(self, limit: int = 15) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM inference_logs ORDER BY created_at DESC LIMIT %s"
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["metadata"] = json.loads(item.get("metadata_json") or "{}")
                results.append(item)
            return results

    # =========================================================
    # DISASTER ALERTS (CAP v1.2) CRUD
    # =========================================================
    def create_alert(self, alert_data: Dict[str, Any]) -> int:
        cap_id = alert_data.get("cap_identifier") or f"IN-IMD-CAP-{int(time.time())}"
        sql = """
        INSERT INTO disaster_alerts (
            alert_level, basin, cyclone_name, affected_districts_json, affected_states_json,
            wind_gust_forecast_kmh, surge_height_m, rainfall_24h_mm, evacuation_recommendation,
            cap_identifier, cap_urgency, cap_severity, cap_certainty, issued_by
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)
            row = cursor.fetchone()
            return self._extract_id(row)

    def get_active_alerts(self) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM disaster_alerts WHERE active = 1 ORDER BY issued_at DESC"
        with self._cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["affected_districts"] = json.loads(item.get("affected_districts_json") or "[]")
                item["affected_states"] = json.loads(item.get("affected_states_json") or "[]")
                results.append(item)
            return results

    # =========================================================
    # AI MODELS REGISTRY CRUD
    # =========================================================
    def register_ai_model(self, model_info: Dict[str, Any]) -> int:
        sql = """
        INSERT INTO ai_models_registry (
            model_key, model_name, version, backbone, dataset_trained,
            mae_track_km, accuracy_pct, parameters_count, is_active
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT(model_key) DO UPDATE SET
            version=EXCLUDED.version,
            mae_track_km=EXCLUDED.mae_track_km,
            accuracy_pct=EXCLUDED.accuracy_pct,
            is_active=EXCLUDED.is_active
        RETURNING id;
        """
        params = (
            model_info["model_key"],
            model_info["model_name"],
            model_info["version"],
            model_info["backbone"],
            model_info["dataset_trained"],
            model_info.get("mae_track_km"),
            model_info.get("accuracy_pct"),
            model_info.get("parameters_count", "24.5M"),
            1 if model_info.get("is_active", True) else 0
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)
            row = cursor.fetchone()
            return self._extract_id(row)

    def get_registered_models(self) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM ai_models_registry ORDER BY id"
        with self._cursor() as cursor:
            cursor.execute(sql)
            return [dict(r) for r in cursor.fetchall()]

    # =========================================================
    # MOBILE DEVICES & NOTIFICATION PREFERENCES (PHASE 10A)
    # =========================================================
    def register_device(self, device_data: Dict[str, Any]) -> Dict[str, Any]:
        """Registers or updates a mobile device and ensures default notification preferences."""
        sql_device = """
        INSERT INTO devices (
            device_id, fcm_token, platform, app_version, os_version,
            device_model, locale, last_known_lat, last_known_lon,
            last_known_district, last_known_state, is_active, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(device_id) DO UPDATE SET
            fcm_token=EXCLUDED.fcm_token,
            platform=EXCLUDED.platform,
            app_version=EXCLUDED.app_version,
            os_version=EXCLUDED.os_version,
            device_model=EXCLUDED.device_model,
            locale=EXCLUDED.locale,
            last_known_lat=COALESCE(EXCLUDED.last_known_lat, devices.last_known_lat),
            last_known_lon=COALESCE(EXCLUDED.last_known_lon, devices.last_known_lon),
            last_known_district=COALESCE(EXCLUDED.last_known_district, devices.last_known_district),
            last_known_state=COALESCE(EXCLUDED.last_known_state, devices.last_known_state),
            is_active=1,
            updated_at=CURRENT_TIMESTAMP;
        """
        params_device = (
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
        )

        sql_prefs = """
        INSERT INTO notification_preferences (device_id)
        VALUES (%s)
        ON CONFLICT(device_id) DO NOTHING;
        """

        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql_device), params_device)
            cursor.execute(self._format_sql(sql_prefs), (device_data["device_id"],))

        return {
            "success": True,
            "device_id": device_data["device_id"],
            "status": "REGISTERED",
            "message": "Device registered for real-time VAYU cyclone alerts."
        }

    def unregister_device(self, device_id: str) -> bool:
        """Deactivates a device registration so alerts are no longer dispatched to it."""
        sql = "UPDATE devices SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE device_id = %s"
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (device_id,))
            return cursor.rowcount > 0

    def get_notification_preferences(self, device_id: str) -> Dict[str, Any]:
        """Retrieves notification preferences for a device, falling back to sensible defaults."""
        sql = "SELECT * FROM notification_preferences WHERE device_id = %s"
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (device_id,))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                return {
                    "device_id": d["device_id"],
                    "enable_critical": bool(d.get("enable_critical", 1)),
                    "enable_warning": bool(d.get("enable_warning", 1)),
                    "enable_watch": bool(d.get("enable_watch", 1)),
                    "enable_info": bool(d.get("enable_info", 0)),
                    "enable_test": bool(d.get("enable_test", 0)),
                    "enable_sound": bool(d.get("enable_sound", 1)),
                    "enable_vibration": bool(d.get("enable_vibration", 1)),
                    "subscribed_basins": json.loads(d.get("subscribed_basins_json") or '["Bay of Bengal","Arabian Sea"]'),
                    "subscribed_states": json.loads(d.get("subscribed_states_json") or '[]'),
                    "max_alert_radius_km": float(d.get("max_alert_radius_km") or 300.0),
                    "updated_at": str(d.get("updated_at")) if d.get("updated_at") else None
                }

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

        sql = """
        INSERT INTO notification_preferences (
            device_id, enable_critical, enable_warning, enable_watch,
            enable_info, enable_test, enable_sound, enable_vibration,
            subscribed_basins_json, subscribed_states_json, max_alert_radius_km,
            updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT(device_id) DO UPDATE SET
            enable_critical=EXCLUDED.enable_critical,
            enable_warning=EXCLUDED.enable_warning,
            enable_watch=EXCLUDED.enable_watch,
            enable_info=EXCLUDED.enable_info,
            enable_test=EXCLUDED.enable_test,
            enable_sound=EXCLUDED.enable_sound,
            enable_vibration=EXCLUDED.enable_vibration,
            subscribed_basins_json=EXCLUDED.subscribed_basins_json,
            subscribed_states_json=EXCLUDED.subscribed_states_json,
            max_alert_radius_km=EXCLUDED.max_alert_radius_km,
            updated_at=CURRENT_TIMESTAMP;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)

        return self.get_notification_preferences(device_id)

    # =========================================================
    # STANDARDIZED VAYU ALERTS (PHASE 10A)
    # =========================================================
    def create_vayu_alert(self, alert_data: Dict[str, Any]) -> str:
        """Creates a standardized VAYU alert record."""
        alert_id = alert_data.get("alert_id") or f"ALR-2026-{int(time.time() * 1000) % 1000000:06d}"
        
        expires_at = alert_data.get("expires_at")
        if not expires_at:
            expires_at = (datetime.utcnow() + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S")

        sql = """
        INSERT INTO vayu_alerts (
            alert_id, storm_id, storm_name, severity, title, message,
            source, source_module, location_region, latitude, longitude,
            radius_km, metadata_json, is_active, expires_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, %s)
        ON CONFLICT(alert_id) DO UPDATE SET
            severity=EXCLUDED.severity,
            title=EXCLUDED.title,
            message=EXCLUDED.message,
            location_region=EXCLUDED.location_region,
            latitude=EXCLUDED.latitude,
            longitude=EXCLUDED.longitude,
            radius_km=EXCLUDED.radius_km,
            metadata_json=EXCLUDED.metadata_json,
            is_active=EXCLUDED.is_active,
            expires_at=EXCLUDED.expires_at;
        """
        params = (
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
        )
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), params)

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
            if self.is_postgres:
                query += " AND is_active = 1 AND expires_at >= CURRENT_TIMESTAMP"
            else:
                query += " AND is_active = 1 AND datetime(expires_at) >= datetime('now')"
        if severity:
            query += " AND severity = %s"
            params.append(severity.upper())

        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)

        with self._cursor() as cursor:
            cursor.execute(self._format_sql(query), params)
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
        sql = "SELECT * FROM vayu_alerts WHERE alert_id = %s"
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (alert_id,))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["metadata"] = json.loads(d.get("metadata_json") or "{}")
            d["is_active"] = bool(d.get("is_active", 1))
            return d

    # =========================================================
    # MOBILE DEVICE & NOTIFICATION DISPATCH CRUD
    # =========================================================
    def get_active_devices(self) -> List[Dict[str, Any]]:
        """Retrieves all active devices registered for notifications."""
        sql = "SELECT * FROM devices WHERE is_active = 1 ORDER BY updated_at DESC"
        with self._cursor() as cursor:
            cursor.execute(sql)
            return [dict(r) for r in cursor.fetchall()]

    def get_all_registered_devices(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieves all registered devices with their notification preference summary."""
        sql = """
        SELECT d.*, 
               COALESCE(p.enable_critical, 1) as critical_alerts, 
               COALESCE(p.enable_warning, 1) as warning_alerts, 
               COALESCE(p.enable_watch, 1) as watch_alerts, 
               COALESCE(p.enable_info, 0) as info_alerts,
               COALESCE(p.enable_sound, 1) as sound_enabled, 
               COALESCE(p.enable_vibration, 1) as vibration_enabled, 
               COALESCE(p.max_alert_radius_km, 250.0) as distance_radius_km
        FROM devices d
        LEFT JOIN notification_preferences p ON d.device_id = p.device_id
        ORDER BY d.updated_at DESC LIMIT %s
        """
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (limit,))
            return [dict(r) for r in cursor.fetchall()]

    def deactivate_device(self, device_id: str) -> bool:
        """Marks a device token as inactive (e.g. on token invalidation or explicit unregister)."""
        sql = "UPDATE devices SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE device_id = %s"
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (device_id,))
            return cursor.rowcount > 0

    def record_alert_delivery(
        self,
        delivery_id: str,
        alert_id: str,
        device_id: str,
        status: str = "PENDING",
        sent_at: Optional[str] = None
    ) -> int:
        """Records an initial dispatch attempt into alert_deliveries."""
        if not sent_at:
            sent_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        sql = """
        INSERT INTO alert_deliveries (alert_id, device_id, delivery_status, attempted_at)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
        """
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (alert_id, device_id, status, sent_at))
            row = cursor.fetchone()
            return self._extract_id(row)

    def update_alert_delivery_status(
        self,
        delivery_id: Any,
        status: str,
        fcm_message_id: Optional[str] = None
    ) -> bool:
        """Updates delivery status (e.g., ACCEPTED, FAILED, TOKEN_INVALID)."""
        sql = """
        UPDATE alert_deliveries 
        SET delivery_status = %s, fcm_message_id = COALESCE(%s, fcm_message_id) 
        WHERE id = %s
        """
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (status, fcm_message_id, delivery_id))
            return cursor.rowcount > 0

    def record_alert_opened(
        self,
        alert_id: str,
        device_id: Optional[str] = None
    ) -> int:
        """Records that a user tapped and opened an alert on their device."""
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        with self._cursor() as cursor:
            if device_id:
                sql = """
                UPDATE alert_deliveries
                SET delivery_status = 'OPENED', acknowledged_at = %s
                WHERE alert_id = %s AND device_id = %s
                """
                cursor.execute(self._format_sql(sql), (now, alert_id, device_id))
            else:
                sql = """
                UPDATE alert_deliveries
                SET delivery_status = 'OPENED', acknowledged_at = %s
                WHERE alert_id = %s
                """
                cursor.execute(self._format_sql(sql), (now, alert_id))
            return cursor.rowcount

    def get_recent_deliveries(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves recent notification deliveries with alert and device context."""
        sql = """
        SELECT del.id as delivery_id, del.alert_id, del.device_id, del.delivery_status as status,
               del.attempted_at as sent_at, del.acknowledged_at as opened_at, del.fcm_message_id,
               a.title as alert_title, a.severity, a.storm_name, d.device_model, d.platform
        FROM alert_deliveries del
        LEFT JOIN vayu_alerts a ON del.alert_id = a.alert_id
        LEFT JOIN devices d ON del.device_id = d.device_id
        ORDER BY del.attempted_at DESC LIMIT %s
        """
        with self._cursor() as cursor:
            cursor.execute(self._format_sql(sql), (limit,))
            return [dict(r) for r in cursor.fetchall()]

    def _ensure_seed_vayu_alerts(self):
        """Seeds initial verified alerts if the table is currently empty."""
        try:
            with self._cursor() as cursor:
                cursor.execute(self._format_sql("SELECT COUNT(*) AS cnt FROM vayu_alerts"))
                row = cursor.fetchone()
                count = row["cnt"] if isinstance(row, dict) else row[0]
                if count > 0:
                    return
        except Exception:
            return

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
db_manager = db
