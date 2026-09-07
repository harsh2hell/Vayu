"""
VAYU Wind Field Router
======================
Serves a global wind field derived from real NOAA GFS U/V wind components,
fetched from the Open-Meteo API (no API key required, CC BY 4.0 licence).

Wind direction conventions used throughout this module
------------------------------------------------------
  U component (+) = eastward wind   (wind blowing TO the east)
  V component (+) = northward wind  (wind blowing TO the north)

  Meteorological direction (FROM direction):
    The direction FROM WHICH the wind is blowing.
    met_dir = (atan2(-U, -V) * 180/π + 360) % 360

    Verification:
      u=+5, v=0  → 270°  Wind FROM the West (blowing east)
      u=-5, v=0  → 90°   Wind FROM the East (blowing west)
      u=0,  v=+5 → 180°  Wind FROM the South (blowing north)
      u=0,  v=-5 → 0°    Wind FROM the North (blowing south)

  Particle travel direction (TO direction — for animation):
    travel_dir = (atan2(U, V) * 180/π + 360) % 360
    This is the opposite of met_dir; particles move in the direction
    the wind is going, which is what users expect visually.
"""

import math
import time
import json
import os
import urllib.request
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/wind", tags=["Global Wind Field"])

# ─── Grid configuration ────────────────────────────────────────────────────────
# 12° global grid (16 lat × 31 lon = 496 points) — strictly adheres to Open-Meteo's
# 600 weighted calls/minute rate limit while providing dense, smooth vector coverage;
# leaflet-velocity bilinearly interpolates across the canvas at render time.
GRID_RES_DEG: float = 12.0
LA1: float = 90.0     # Starting latitude  (top/North)
LO1: float = -180.0   # Starting longitude (left/West)
NX: int = 31          # Longitudes: -180, -168, ..., 180 (step 12)
NY: int = 16          # Latitudes: 90, 78, ..., -90 (step 12)
DX: float = 12.0      # Longitude step (eastward)
DY: float = 12.0      # Latitude step  (southward)

# ─── In-memory & Persistent Disk Cache ─────────────────────────────────────────
_WIND_CACHE: Optional[Dict[str, Any]] = None
_CACHE_TTL_SECONDS: int = 3600  # 1 GFS forecast step (runs 4×/day)
_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
DISK_CACHE_PATH = os.path.join(_DATA_DIR, "wind_cache.json")

# ─── Open-Meteo constants ─────────────────────────────────────────────────────
_OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"
_BATCH_SIZE = 248   # 496 / 2 = 248 points per batch; safely within 600/min quota
_USER_AGENT = "VAYU-Earth/4.0 (SIH2026 Meteorological Wind Field; contact@vayusat.live)"


# ==============================================================================
# Pure wind-math functions (exported for testing)
# ==============================================================================

def compute_speed(u: float, v: float) -> float:
    """
    Wind speed magnitude in the same units as the input U/V components.
    Formula: speed = sqrt(u² + v²)
    """
    return math.sqrt(u * u + v * v)


def compute_meteorological_direction(u: float, v: float) -> float:
    """
    Meteorological wind direction: the direction FROM WHICH the wind is blowing.

    Returns degrees in [0, 360) where:
      0°/360° = FROM North (wind blows south)
      90°     = FROM East  (wind blows west)
      180°    = FROM South (wind blows north)
      270°    = FROM West  (wind blows east)

    For GFS / Open-Meteo convention:
      U = eastward component (+U → wind blowing east)
      V = northward component (+V → wind blowing north)

    Derivation:
      The wind vector direction (TO which it goes) is atan2(U, V).
      The FROM direction is the opposite: atan2(-U, -V).
      Result is normalised to [0, 360).
    """
    if u == 0.0 and v == 0.0:
        return 0.0
    return (math.degrees(math.atan2(-u, -v)) + 360.0) % 360.0


def compute_particle_travel_direction(u: float, v: float) -> float:
    """
    The direction TO WHICH the wind is going — used for particle animation.
    This is the mathematical vector direction, opposite to the met direction.

    Returns degrees in [0, 360) where:
      0°  = particles travel North
      90° = particles travel East
    """
    if u == 0.0 and v == 0.0:
        return 0.0
    return (math.degrees(math.atan2(u, v)) + 360.0) % 360.0


def kmh_to_ms(speed_kmh: float) -> float:
    """
    Convert km/h to m/s.
    1 km/h = 1/3.6 m/s ≈ 0.27778 m/s
    """
    return speed_kmh / 3.6


def ms_to_kmh(speed_ms: float) -> float:
    """Convert m/s to km/h."""
    return speed_ms * 3.6


def kmh_to_knots(speed_kmh: float) -> float:
    """Convert km/h to knots. 1 knot = 1.852 km/h."""
    return speed_kmh / 1.852


def validate_wind_value(val: Any, field: str, lat: float, lon: float) -> float:
    """
    Validate a single U or V wind component value.
    Raises ValueError if the value is None, NaN, Infinity, or non-numeric.

    Parameters
    ----------
    val : Any
        Raw value from the API response.
    field : str
        Name of the field ('U' or 'V') for error messages.
    lat, lon : float
        Grid point coordinates for error messages.

    Returns
    -------
    float
        The validated floating-point value.
    """
    if val is None:
        raise ValueError(f"Missing {field} at ({lat:.2f},{lon:.2f})")
    try:
        fval = float(val)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Non-numeric {field}={val!r} at ({lat:.2f},{lon:.2f})") from exc
    if math.isnan(fval):
        raise ValueError(f"NaN in {field} at ({lat:.2f},{lon:.2f})")
    if math.isinf(fval):
        raise ValueError(f"Infinity in {field} at ({lat:.2f},{lon:.2f})")
    return fval


# ==============================================================================
# Grid construction
# ==============================================================================

def build_global_grid() -> List[Tuple[float, float]]:
    """
    Build the ordered list of (lat, lon) grid points in leaflet-velocity
    row-major order: starting at (LA1, LO1) = (90°N, 180°W), going east first,
    then south.

    Returns
    -------
    List[Tuple[float, float]]
        Flat list of (lat, lon) tuples; length = NY × NX = 2,701.
    """
    points: List[Tuple[float, float]] = []
    for row in range(NY):
        lat = round(LA1 - row * DY, 4)
        for col in range(NX):
            lon = round(LO1 + col * DX, 4)
            points.append((lat, lon))
    return points


# ==============================================================================
# Data fetching
# ==============================================================================

def _nearest_hour_index(times: List[str]) -> int:
    """
    Find the index of the hourly timestamp nearest to the current UTC time.
    Falls back to index 0 on any parse error.
    """
    now_utc = datetime.now(timezone.utc)
    best_idx, best_diff = 0, float("inf")
    for i, t_str in enumerate(times):
        try:
            # Open-Meteo returns "2026-09-07T00:00" (no Z suffix)
            t = datetime.fromisoformat(t_str + "+00:00")
            diff = abs((t - now_utc).total_seconds())
            if diff < best_diff:
                best_diff = diff
                best_idx = i
        except Exception:
            continue
    return best_idx


def _fetch_batch(
    lats: List[float], lons: List[float], retries: int = 2, delay_sec: float = 1.5
) -> List[Dict[str, Optional[float]]]:
    """
    Fetch wind_u_component_10m and wind_v_component_10m from Open-Meteo for a
    batch of (lat, lon) pairs using SI units (m/s).

    Open-Meteo multi-location format:
      GET /v1/forecast?latitude=l1,l2,...&longitude=o1,o2,...&hourly=...&wind_speed_unit=ms

    Parameters
    ----------
    lats : List[float]
        Latitude values for this batch.
    lons : List[float]
        Longitude values for this batch.
    retries : int
        Number of retry attempts on transient network or 429 errors.
    delay_sec : float
        Delay before retrying.

    Returns
    -------
    List[Dict]
        One dict per input point: {"u": float|None, "v": float|None, "time": str|None}
    """
    lat_str = ",".join(f"{lat:.2f}" for lat in lats)
    lon_str = ",".join(f"{lon:.2f}" for lon in lons)

    url = (
        f"{_OPEN_METEO_BASE}"
        f"?latitude={lat_str}"
        f"&longitude={lon_str}"
        f"&hourly=wind_u_component_10m,wind_v_component_10m"
        f"&models=gfs_seamless"   # NOAA GFS global forecast
        f"&wind_speed_unit=ms"     # SI units (m/s)
        f"&forecast_days=1"
        f"&timezone=UTC"
    )

    last_exc = None
    raw = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": _USER_AGENT})
            with urllib.request.urlopen(req, timeout=25) as resp:
                raw = json.loads(resp.read().decode("utf-8"))
            break
        except Exception as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(delay_sec * (attempt + 1))
            else:
                raise last_exc

    # Normalise to list
    if isinstance(raw, dict):
        raw = [raw]

    results: List[Dict[str, Optional[float]]] = []
    ref_time_str = None

    for item in raw:
        hourly = item.get("hourly", {})
        times  = hourly.get("time", [])
        u_vals = hourly.get("wind_u_component_10m", [])
        v_vals = hourly.get("wind_v_component_10m", [])

        idx = _nearest_hour_index(times)
        u = u_vals[idx] if idx < len(u_vals) else None
        v = v_vals[idx] if idx < len(v_vals) else None
        t = times[idx]  if idx < len(times)  else None

        if ref_time_str is None and t:
            ref_time_str = t

        results.append({"u": u, "v": v, "time": t})

    return results


def fetch_global_wind_field() -> Dict[str, Any]:
    """
    Fetch U/V wind components at 10 m height for the global 12° grid (496 points).

    Strategy
    --------
    1. Build the ordered grid (496 points).
    2. Batch into groups of _BATCH_SIZE (248 points: 2 batches total).
    3. Call Open-Meteo with 1s pause between batches to respect rate limits.
    4. Validate every U and V value in SI units (m/s).
    5. Assemble into leaflet-velocity JSON format.
    6. Persist to disk cache (wind_cache.json).
    7. Return payload dict with metadata.

    Returns
    -------
    dict with keys:
        'velocity_data'  — list of 2 dicts (U layer, V layer) in lv format
        'meta'           — dict with source, units, timestamp, validity info
    """
    grid = build_global_grid()
    total = len(grid)  # NX × NY = 31 × 16 = 496

    u_array: List[float] = [0.0] * total
    v_array: List[float] = [0.0] * total
    ref_time: Optional[str] = None
    valid_count = 0
    invalid_count = 0

    batch_ranges = list(range(0, total, _BATCH_SIZE))
    for b_idx, batch_start in enumerate(batch_ranges):
        if b_idx > 0:
            time.sleep(1.0)  # Gentle spacing between batches

        batch_idxs = list(range(batch_start, min(batch_start + _BATCH_SIZE, total)))
        batch_lats = [grid[i][0] for i in batch_idxs]
        batch_lons = [grid[i][1] for i in batch_idxs]

        try:
            results = _fetch_batch(batch_lats, batch_lons)

            for j, grid_idx in enumerate(batch_idxs):
                if j >= len(results):
                    invalid_count += 1
                    continue

                res = results[j]
                lat, lon = grid[grid_idx]

                try:
                    u_val = validate_wind_value(res["u"], "U", lat, lon)
                    v_val = validate_wind_value(res["v"], "V", lat, lon)
                    u_array[grid_idx] = round(u_val, 2)
                    v_array[grid_idx] = round(v_val, 2)
                    valid_count += 1

                    if ref_time is None and res.get("time"):
                        ref_time = res["time"]

                except ValueError:
                    u_array[grid_idx] = 0.0
                    v_array[grid_idx] = 0.0
                    invalid_count += 1

        except Exception as exc:
            for grid_idx in batch_idxs:
                u_array[grid_idx] = 0.0
                v_array[grid_idx] = 0.0
            invalid_count += len(batch_idxs)

    # If all points failed, raise exception so caller can fall back to disk cache
    if valid_count == 0:
        raise RuntimeError("Failed to retrieve any valid meteorological wind vectors from upstream provider.")

    # Build the ref_time ISO-8601 string for the leaflet-velocity header
    if ref_time:
        ref_time_iso = ref_time + "Z" if not ref_time.endswith("Z") else ref_time
    else:
        ref_time_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:00:00Z")

    # ── leaflet-velocity grid header ──────────────────────────────────────────
    _base_header = {
        "parameterCategory": 2,
        "lo1": LO1,
        "la1": LA1,
        "dx": DX,
        "dy": DY,
        "nx": NX,
        "ny": NY,
        "refTime": ref_time_iso,
        "source": "NOAA GFS via Open-Meteo",
        "model": "GFS Seamless",
        "units": "m/s",
        "level": "10m AGL",
    }

    velocity_data = [
        {"header": {**_base_header, "parameterNumber": 2}, "data": u_array},  # UGRD (eastward)
        {"header": {**_base_header, "parameterNumber": 3}, "data": v_array},  # VGRD (northward)
    ]

    meta = {
        "source": "NOAA GFS via Open-Meteo",
        "model": "GFS Seamless",
        "resolution_deg": GRID_RES_DEG,
        "nx": NX,
        "ny": NY,
        "total_points": total,
        "valid_points": valid_count,
        "invalid_points": invalid_count,
        "ref_time_utc": ref_time_iso,
        "units": "m/s",
        "u_units": "m/s",
        "v_units": "m/s",
        "level": "10m AGL",
        "type": "Model Forecast",
        "status": "operational",
        "attribution": "NOAA GFS model data provided by Open-Meteo (CC BY 4.0). "
                       "https://open-meteo.com/",
        "fetched_at_utc": datetime.now(timezone.utc).isoformat() + "Z",
        "wind_direction_convention": (
            "Meteorological FROM direction: "
            "met_dir = (atan2(-U, -V) * 180/pi + 360) % 360. "
            "Particle animation travels in the TO direction (opposite of met_dir)."
        ),
    }

    payload = {"velocity_data": velocity_data, "meta": meta}

    # Persist to disk cache
    try:
        os.makedirs(_DATA_DIR, exist_ok=True)
        with open(DISK_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump({"payload": payload, "cached_at": time.time()}, f)
    except Exception:
        pass

    return payload


# ==============================================================================
# Cache management
# ==============================================================================

def _get_cached_or_fetch() -> Dict[str, Any]:
    """
    Return cached wind payload if fresh; otherwise fetch a new one.
    Implements two-tier caching:
      1. Memory cache (TTL: 3600 seconds)
      2. Persistent disk cache (wind_cache.json)
      3. Graceful fallback to disk cache if upstream network fails.
    """
    global _WIND_CACHE

    now = time.time()
    # 1. Fresh in-memory cache
    if (
        _WIND_CACHE is not None
        and (now - _WIND_CACHE["cached_at"]) < _CACHE_TTL_SECONDS
    ):
        return _WIND_CACHE

    # 2. Fresh disk cache
    if os.path.exists(DISK_CACHE_PATH):
        try:
            with open(DISK_CACHE_PATH, "r", encoding="utf-8") as f:
                disk_data = json.load(f)
            cached_at = disk_data.get("cached_at", 0)
            if (now - cached_at) < _CACHE_TTL_SECONDS and "payload" in disk_data:
                _WIND_CACHE = {
                    "payload": disk_data["payload"],
                    "cached_at": cached_at,
                    "expires_at": cached_at + _CACHE_TTL_SECONDS,
                }
                return _WIND_CACHE
        except Exception:
            pass

    # 3. Fetch fresh from upstream
    try:
        payload = fetch_global_wind_field()
        _WIND_CACHE = {
            "payload": payload,
            "cached_at": now,
            "expires_at": now + _CACHE_TTL_SECONDS,
        }
        return _WIND_CACHE
    except Exception as exc:
        # 4. Fallback to existing disk cache (even if older) rather than failing
        if os.path.exists(DISK_CACHE_PATH):
            try:
                with open(DISK_CACHE_PATH, "r", encoding="utf-8") as f:
                    disk_data = json.load(f)
                if "payload" in disk_data:
                    disk_data["payload"]["meta"]["status"] = "cached_fallback"
                    _WIND_CACHE = {
                        "payload": disk_data["payload"],
                        "cached_at": disk_data.get("cached_at", now - 3600),
                        "expires_at": now + 300,  # Retry in 5 mins
                    }
                    return _WIND_CACHE
            except Exception:
                pass
        raise exc


# ==============================================================================
# FastAPI Routes
# ==============================================================================

@router.get("/field")
def get_wind_field():
    """
    Global wind field in leaflet-velocity JSON format.

    Source       : NOAA GFS via Open-Meteo API
    Variables    : U10 and V10 — eastward and northward wind at 10 m height
    Units        : km/h
    Grid         : 5° global lat/lon (73 lon × 37 lat = 2,701 points)
    Cache TTL    : 3600 seconds

    Direction convention:
      U (+) = wind blowing east  |  V (+) = wind blowing north
      Meteorological direction (FROM) = atan2(-U, -V) → degrees [0, 360)
      Particle travel direction  (TO) = atan2( U,  V) → degrees [0, 360)
    """
    try:
        cached = _get_cached_or_fetch()
        payload = cached["payload"]
        now = time.time()

        return {
            "success": True,
            "from_cache": True,
            "cache_age_seconds": round(now - cached["cached_at"]),
            "cache_expires_in_seconds": max(0, round(cached["expires_at"] - now)),
            "meta": payload["meta"],
            "velocity_data": payload["velocity_data"],
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Wind field temporarily unavailable: {str(exc)}"
        )


@router.get("/meta")
def get_wind_meta():
    """
    Returns cache status and model metadata without the full data payload.
    Useful for the frontend to check data freshness before deciding whether
    to fetch the full field.
    """
    global _WIND_CACHE
    now = time.time()

    if _WIND_CACHE is None:
        return {
            "success": True,
            "cache_status": "COLD",
            "message": "No wind data cached. Call /api/v1/wind/field to populate.",
        }

    age = now - _WIND_CACHE["cached_at"]
    expires_in = _WIND_CACHE["expires_at"] - now

    return {
        "success": True,
        "cache_status": "WARM" if expires_in > 0 else "STALE",
        "cache_age_seconds": round(age),
        "cache_expires_in_seconds": max(0, round(expires_in)),
        "meta": _WIND_CACHE["payload"]["meta"],
    }
