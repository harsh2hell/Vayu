"""
NOAA NCEI IBTrACS Data Ingestion & Trajectory Dataset Pipeline for North Indian Ocean (NIO).
Downloads official best-track CSV, extracts landmark cyclones (1990-2024), computes derived
kinematic features, and saves structured JSON tracks with strict storm-disjoint splits.
"""
import os
import csv
import json
import math
import shutil
import urllib.request
import datetime
from typing import Dict, List, Any, Tuple

IBTRACS_URL = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.NI.list.v04r01.csv"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRACKS_DIR = os.path.join(BASE_DIR, "data", "datasets", "tracks")
RAW_DIR = os.path.join(TRACKS_DIR, "raw")
PROCESSED_DIR = os.path.join(TRACKS_DIR, "processed")
MANIFESTS_DIR = os.path.join(TRACKS_DIR, "manifests")

RAW_CSV_PATH = os.path.join(RAW_DIR, "ibtracs_nio_1990_2024_raw.csv")
PROCESSED_JSON_PATH = os.path.join(PROCESSED_DIR, "landmark_tracks_processed.json")
MANIFEST_JSON_PATH = os.path.join(MANIFESTS_DIR, "tracks_manifest.json")

# Target landmark storms with known official SIDs
TARGET_STORMS = {
    "2024295N15092": {"name": "DANA", "season": 2024, "split": "test"},
    "2023156N10067": {"name": "BIPARJOY", "season": 2023, "split": "test"},
    "2023129N08091": {"name": "MOCHA", "season": 2023, "split": "validation"},
    "2017333N06082": {"name": "OCKHI", "season": 2017, "split": "validation"},
    "2020136N10088": {"name": "AMPHAN", "season": 2020, "split": "train"},
    "2019116N02090": {"name": "FANI", "season": 2019, "split": "train"},
    "2019302N11118": {"name": "BULBUL", "season": 2019, "split": "train"},
    "2018281N14088": {"name": "TITLI", "season": 2018, "split": "train"},
    "2014279N11096": {"name": "HUDHUD", "season": 2014, "split": "train"},
    "2013281N12098": {"name": "PHAILIN", "season": 2013, "split": "train"},
}

def haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance in nautical miles (1 nm = 1.852 km)."""
    r_nm = 3440.065
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r_nm * c

def forward_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes forward azimuth (bearing) from point 1 to point 2 in degrees [0, 360)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlambda = math.radians(lon2 - lon1)
    y = math.sin(dlambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlambda)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360.0) % 360.0

def coriolis_parameter(lat_deg: float) -> float:
    """Computes Coriolis parameter f = 2 * Omega * sin(lat) in s^-1."""
    omega = 7.2921159e-5
    return 2.0 * omega * math.sin(math.radians(lat_deg))

def acquire_raw_csv() -> str:
    """Ensures raw IBTrACS CSV is cached locally in RAW_CSV_PATH."""
    os.makedirs(RAW_DIR, exist_ok=True)
    if os.path.exists(RAW_CSV_PATH) and os.path.getsize(RAW_CSV_PATH) > 10_000_000:
        print(f"[IBTrACS Ingestion] Found cached raw dataset: {RAW_CSV_PATH} ({os.path.getsize(RAW_CSV_PATH)/1024/1024:.2f} MB)")
        return RAW_CSV_PATH

    # Check /tmp cache first
    tmp_path = "/tmp/ibtracs_ni.csv"
    if os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 10_000_000:
        print(f"[IBTrACS Ingestion] Copying from /tmp cache to: {RAW_CSV_PATH}")
        shutil.copyfile(tmp_path, RAW_CSV_PATH)
        return RAW_CSV_PATH

    print(f"[IBTrACS Ingestion] Downloading from NOAA NCEI archive: {IBTRACS_URL}...")
    req = urllib.request.Request(IBTRACS_URL, headers={"User-Agent": "VAYU-DataAcquisition/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp, open(RAW_CSV_PATH, "wb") as out_f:
        shutil.copyfileobj(resp, out_f)

    print(f"[IBTrACS Ingestion] Successfully downloaded: {RAW_CSV_PATH} ({os.path.getsize(RAW_CSV_PATH)/1024/1024:.2f} MB)")
    return RAW_CSV_PATH

def process_ibtracs_data() -> Dict[str, Any]:
    """Processes IBTrACS CSV into clean trajectory points with kinematics and splits."""
    csv_file = acquire_raw_csv()
    
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(MANIFESTS_DIR, exist_ok=True)

    storm_records: Dict[str, List[Dict[str, Any]]] = {sid: [] for sid in TARGET_STORMS}
    all_nio_storms_count = set()
    total_post_1990_rows = 0

    with open(csv_file, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        header = next(reader)
        units = next(reader)

        # Build column index map
        col_idx = {col.strip(): i for i, col in enumerate(header)}

        for row in reader:
            if len(row) < 15:
                continue
            sid = row[col_idx["SID"]].strip()
            season_str = row[col_idx["SEASON"]].strip()
            try:
                season = int(season_str)
                if season >= 1990:
                    all_nio_storms_count.add(sid)
                    total_post_1990_rows += 1
            except ValueError:
                continue

            if sid in TARGET_STORMS:
                iso_time = row[col_idx["ISO_TIME"]].strip()
                lat_str = row[col_idx["LAT"]].strip()
                lon_str = row[col_idx["LON"]].strip()
                if not lat_str or not lon_str:
                    continue
                try:
                    lat = float(lat_str)
                    lon = float(lon_str)
                except ValueError:
                    continue

                # Ensure trajectory points are geographically within the North Indian Ocean basin (50E-100E, 0N-35N)
                # This filters out pre-genesis Western Pacific / South China Sea tracks (e.g. Matmo before entering Bay of Bengal)
                if not (0.0 <= lat <= 35.0 and 50.0 <= lon <= 100.0):
                    continue

                wmo_wind = float(row[col_idx["WMO_WIND"]].strip()) if row[col_idx["WMO_WIND"]].strip() else None
                usa_wind = float(row[col_idx["USA_WIND"]].strip()) if row[col_idx["USA_WIND"]].strip() else None
                nd_wind = float(row[col_idx["NEWDELHI_WIND"]].strip()) if "NEWDELHI_WIND" in col_idx and row[col_idx["NEWDELHI_WIND"]].strip() else None

                # Primary wind in knots: IMD (RSMC New Delhi) > WMO > JTWC
                primary_wind = nd_wind if nd_wind is not None else (wmo_wind if wmo_wind is not None else usa_wind)

                wmo_pres = float(row[col_idx["WMO_PRES"]].strip()) if row[col_idx["WMO_PRES"]].strip() else None
                usa_pres = float(row[col_idx["USA_PRES"]].strip()) if row[col_idx["USA_PRES"]].strip() else None
                nd_pres = float(row[col_idx["NEWDELHI_PRES"]].strip()) if "NEWDELHI_PRES" in col_idx and row[col_idx["NEWDELHI_PRES"]].strip() else None
                primary_pres = nd_pres if nd_pres is not None else (wmo_pres if wmo_pres is not None else usa_pres)

                nd_ci = row[col_idx["NEWDELHI_CI"]].strip() if "NEWDELHI_CI" in col_idx else ""
                usa_status = row[col_idx["USA_STATUS"]].strip() if "USA_STATUS" in col_idx else ""
                dist2land = float(row[col_idx["DIST2LAND"]].strip()) if row[col_idx["DIST2LAND"]].strip() else None
                landfall = float(row[col_idx["LANDFALL"]].strip()) if row[col_idx["LANDFALL"]].strip() else None

                storm_records[sid].append({
                    "iso_time": iso_time,
                    "lat": lat,
                    "lon": lon,
                    "wind_kts": primary_wind,
                    "pres_hpa": primary_pres,
                    "wmo_wind_kts": wmo_wind,
                    "usa_wind_kts": usa_wind,
                    "newdelhi_wind_kts": nd_wind,
                    "wmo_pres_hpa": wmo_pres,
                    "usa_pres_hpa": usa_pres,
                    "newdelhi_pres_hpa": nd_pres,
                    "dvorak_ci": nd_ci,
                    "status": usa_status,
                    "dist2land_km": dist2land,
                    "landfall_km": landfall
                })

    # Sort each storm by timestamp and compute kinematic features
    processed_storms = {}
    total_landmark_points = 0

    for sid, info in TARGET_STORMS.items():
        points = storm_records[sid]
        points.sort(key=lambda p: p["iso_time"])
        
        enriched_points = []
        for i, pt in enumerate(points):
            t_curr = datetime.datetime.fromisoformat(pt["iso_time"])
            if i == 0:
                dt_h = 0.0
                dlat = 0.0
                dlon = 0.0
                speed_kts = 0.0
                bearing_deg = 0.0
            else:
                prev = points[i - 1]
                t_prev = datetime.datetime.fromisoformat(prev["iso_time"])
                dt_h = (t_curr - t_prev).total_seconds() / 3600.0
                dlat = round(pt["lat"] - prev["lat"], 4)
                dlon = round(pt["lon"] - prev["lon"], 4)
                dist_nm = haversine_nm(prev["lat"], prev["lon"], pt["lat"], pt["lon"])
                speed_kts = round(dist_nm / dt_h, 2) if dt_h > 0 else 0.0
                bearing_deg = round(forward_bearing(prev["lat"], prev["lon"], pt["lat"], pt["lon"]), 1)

            coriolis_val = round(coriolis_parameter(pt["lat"]), 8)

            enriched = {
                "iso_time": pt["iso_time"],
                "lat": pt["lat"],
                "lon": pt["lon"],
                "wind_kts": pt["wind_kts"],
                "pres_hpa": pt["pres_hpa"],
                "dvorak_ci": pt["dvorak_ci"],
                "status": pt["status"],
                "dist2land_km": pt["dist2land_km"],
                "delta_lat": dlat,
                "delta_lon": dlon,
                "time_delta_h": dt_h,
                "translation_speed_kts": speed_kts,
                "forward_bearing_deg": bearing_deg,
                "coriolis_f": coriolis_val,
                "data_provenance": "NOAA NCEI IBTrACS v04r01 (RSMC New Delhi / JTWC)"
            }
            enriched_points.append(enriched)

        total_landmark_points += len(enriched_points)
        processed_storms[sid] = {
            "sid": sid,
            "name": info["name"],
            "season": info["season"],
            "split": info["split"],
            "point_count": len(enriched_points),
            "start_time": enriched_points[0]["iso_time"] if enriched_points else None,
            "end_time": enriched_points[-1]["iso_time"] if enriched_points else None,
            "min_lat": min(p["lat"] for p in enriched_points) if enriched_points else None,
            "max_lat": max(p["lat"] for p in enriched_points) if enriched_points else None,
            "min_lon": min(p["lon"] for p in enriched_points) if enriched_points else None,
            "max_lon": max(p["lon"] for p in enriched_points) if enriched_points else None,
            "peak_wind_kts": max((p["wind_kts"] for p in enriched_points if p["wind_kts"] is not None), default=None),
            "min_pres_hpa": min((p["pres_hpa"] for p in enriched_points if p["pres_hpa"] is not None), default=None),
            "trajectory": enriched_points
        }

    # Save processed tracks
    with open(PROCESSED_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(processed_storms, f, indent=2)

    # Build manifest
    manifest = {
        "dataset_name": "VAYU North Indian Ocean Trajectory Benchmark",
        "version": "1.0-real",
        "source": "NOAA NCEI IBTrACS v04r01",
        "raw_archive": os.path.relpath(RAW_CSV_PATH, BASE_DIR),
        "total_nio_storms_post_1990": len(all_nio_storms_count),
        "total_nio_track_rows_post_1990": total_post_1990_rows,
        "landmark_storms_count": len(processed_storms),
        "landmark_total_points": total_landmark_points,
        "splits": {
            "train": [s["name"] for s in processed_storms.values() if s["split"] == "train"],
            "validation": [s["name"] for s in processed_storms.values() if s["split"] == "validation"],
            "test": [s["name"] for s in processed_storms.values() if s["split"] == "test"]
        },
        "storms": {
            sid: {
                "name": s["name"],
                "season": s["season"],
                "split": s["split"],
                "point_count": s["point_count"],
                "peak_wind_kts": s["peak_wind_kts"],
                "min_pres_hpa": s["min_pres_hpa"],
                "period": f"{s['start_time'][:10]} to {s['end_time'][:10]}"
            }
            for sid, s in processed_storms.items()
        }
    }

    with open(MANIFEST_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n[IBTrACS Processing Summary]")
    print(f"  All NIO Storms (1990-2024): {len(all_nio_storms_count)} storms, {total_post_1990_rows} track points.")
    print(f"  Landmark Storms Extracted:  {len(processed_storms)} storms, {total_landmark_points} track points.")
    print(f"  Splits (Storm-Disjoint):")
    print(f"    Train ({len(manifest['splits']['train'])}):      {manifest['splits']['train']}")
    print(f"    Validation ({len(manifest['splits']['validation'])}): {manifest['splits']['validation']}")
    print(f"    Test ({len(manifest['splits']['test'])}):       {manifest['splits']['test']}")
    print(f"  Manifest written to: {MANIFEST_JSON_PATH}")
    print(f"  Processed data to:   {PROCESSED_JSON_PATH}")

    return manifest

if __name__ == "__main__":
    process_ibtracs_data()
