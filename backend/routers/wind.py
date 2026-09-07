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
import urllib.request
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/wind", tags=["Global Wind Field"])

# ─── Grid configuration ────────────────────────────────────────────────────────
# 5° global grid — coarse but sufficient for particle visualisation;
# leaflet-velocity bilinearly interpolates between grid points at render time.
GRID_RES_DEG: float = 5.0
LA1: float = 90.0     # Starting latitude  (top)
LO1: float = -180.0   # Starting longitude (left)
NX: int = 73          # Longitudes: -180, -175, ..., 180
NY: int = 37          # Latitudes: 90, 85, ..., -90
DX: float = 5.0       # Longitude step (east)
DY: float = 5.0       # Latitude step  (south)

# ─── In-memory cache ──────────────────────────────────────────────────────────
_WIND_CACHE: Optional[Dict[str, Any]] = None
_CACHE_TTL_SECONDS: int = 3600  # 1 GFS forecast step (runs 4×/day)

# ─── Open-Meteo constants ─────────────────────────────────────────────────────
_OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"
_BATCH_SIZE = 100   # conservative; Open-Meteo free tier supports multi-location
_USER_AGENT = "VAYU-Earth/4.0 (SIH2026 Wind Field; contact@vayusat.live)"


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
    lats: List[float], lons: List[float]
) -> List[Dict[str, Optional[float]]]:
    """
    Fetch wind_u_component_10m and wind_v_component_10m from Open-Meteo for a
    batch of (lat, lon) pairs.

    Open-Meteo multi-location format:
      GET /v1/forecast?latitude=l1,l2,...&longitude=o1,o2,...&hourly=...

    When multiple coordinates are passed, the response is a JSON array.
    When a single coordinate is passed, the response is a JSON object.
    Both cases are normalised to a list.

    Parameters
    ----------
    lats : List[float]
        Latitude values for this batch.
    lons : List[float]
        Longitude values for this batch.

    Returns
    -------
    List[Dict]
        One dict per input point: {"u": float|None, "v": float|None, "time": str|None}
    """
    lat_str = ",".join(f"{lat:.4f}" for lat in lats)
    lon_str = ",".join(f"{lon:.4f}" for lon in lons)

    url = (
        f"{_OPEN_METEO_BASE}"
        f"?latitude={lat_str}"
        f"&longitude={lon_str}"
        f"&hourly=wind_u_component_10m,wind_v_component_10m"
        f"&models=gfs_seamless"   # GFS global — full ocean + land coverage
        f"&forecast_days=1"
        f"&timezone=UTC"
    )

    req = urllib.request.Request(url, headers={"User-Agent": _USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = json.loads(resp.read().decode("utf-8"))

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
    Fetch U/V wind components at 10 m height for the full global 5° grid.

    Strategy
    --------
    1. Build the ordered grid (2,701 points).
    2. Batch into groups of _BATCH_SIZE (100).
    3. For each batch, call Open-Meteo and pick the nearest hour.
    4. Validate every U and V value; replace invalid values with 0.0 (calm).
    5. Assemble into leaflet-velocity JSON format (two arrays: U and V).
    6. Return payload dict with metadata.

    Returns
    -------
    dict with keys:
        'velocity_data'  — list of 2 dicts (U layer, V layer) in lv format
        'meta'           — dict with source, units, timestamp, validity info
    """
    grid = build_global_grid()
    total = len(grid)  # NX × NY = 73 × 37 = 2,701

    u_array: List[float] = [0.0] * total
    v_array: List[float] = [0.0] * total
    ref_time: Optional[str] = None
    valid_count = 0
    invalid_count = 0

    for batch_start in range(0, total, _BATCH_SIZE):
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
                    u_array[grid_idx] = round(u_val, 3)
                    v_array[grid_idx] = round(v_val, 3)
                    valid_count += 1

                    if ref_time is None and res.get("time"):
                        ref_time = res["time"]

                except ValueError:
                    # Invalid value — substitute calm wind (0, 0), flag it
                    u_array[grid_idx] = 0.0
                    v_array[grid_idx] = 0.0
                    invalid_count += 1

        except Exception:
            # Entire batch unavailable — fill with calm, continue
            for grid_idx in batch_idxs:
                u_array[grid_idx] = 0.0
                v_array[grid_idx] = 0.0
            invalid_count += len(batch_idxs)

    # Build the ref_time ISO-8601 string for the leaflet-velocity header
    if ref_time:
        # Open-Meteo returns "2026-09-07T12:00" — append Z for UTC
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
        # Custom metadata fields (leaflet-velocity ignores unknown keys)
        "source": "NOAA GFS via Open-Meteo",
        "model": "GFS",
        "units": "km/h",
        "level": "10m AGL",
    }

    velocity_data = [
        {"header": {**_base_header, "parameterNumber": 2}, "data": u_array},  # UGRD
        {"header": {**_base_header, "parameterNumber": 3}, "data": v_array},  # VGRD
    ]

    meta = {
        "source": "NOAA GFS via Open-Meteo",
        "model": "GFS",
        "resolution_deg": GRID_RES_DEG,
        "nx": NX,
        "ny": NY,
        "total_points": total,
        "valid_points": valid_count,
        "invalid_points": invalid_count,
        "ref_time_utc": ref_time_iso,
        "u_units": "km/h",
        "v_units": "km/h",
        "level": "10m AGL",
        "type": "Forecast",
        "attribution": "NOAA GFS model data provided by Open-Meteo (CC BY 4.0). "
                       "https://open-meteo.com/",
        "fetched_at_utc": datetime.now(timezone.utc).isoformat() + "Z",
        "wind_direction_convention": (
            "Meteorological FROM direction: "
            "met_dir = (atan2(-U, -V) * 180/pi + 360) % 360. "
            "Particle animation travels in the TO direction (opposite of met_dir)."
        ),
    }

    return {"velocity_data": velocity_data, "meta": meta}


# ==============================================================================
# Cache management
# ==============================================================================

def _get_cached_or_fetch() -> Dict[str, Any]:
    """
    Return cached wind payload if fresh; otherwise fetch a new one.
    Thread-safety note: this is a simple module-level dict — adequate for
    single-worker FastAPI deployments (Uvicorn default). For multi-worker
    deployments, replace with Redis or a shared file cache.
    """
    global _WIND_CACHE

    now = time.time()
    if (
        _WIND_CACHE is not None
        and (now - _WIND_CACHE["cached_at"]) < _CACHE_TTL_SECONDS
    ):
        return _WIND_CACHE

    payload = fetch_global_wind_field()
    _WIND_CACHE = {
        "payload": payload,
        "cached_at": now,
        "expires_at": now + _CACHE_TTL_SECONDS,
    }
    return _WIND_CACHE


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
