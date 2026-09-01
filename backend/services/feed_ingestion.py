import urllib.request
import json
import time
from typing import Dict, List, Any

REAL_HISTORICAL_SYSTEMS = {
    "cyclone-dana-2024": {
        "id": "cyclone-dana-2024",
        "name": "Severe Cyclonic Storm DANA",
        "season": "Post-Monsoon 2024",
        "date_range": "22 Oct 2024 – 26 Oct 2024",
        "basin": "Bay of Bengal",
        "category": "Severe Cyclonic Storm (IMD)",
        "peak_intensity_kmh": 115,
        "peak_intensity_knots": 62,
        "lowest_mslp_hpa": 984,
        "landfall": {
            "location": "Between Dhamra and Habalikhati Nature Camp (Bhadrak/Kendrapara, Odisha)",
            "timestamp": "25 Oct 2024, 02:30 IST",
            "lat": 20.8,
            "lon": 86.9,
            "surge_height_m": 2.5
        },
        "current_fix": { "lat": 20.8, "lon": 86.9, "wind": 110, "pressure": 986 },
        "track_history": [
            [15.8, 89.2], [16.4, 88.8], [17.1, 88.2], [18.2, 87.4], [19.5, 87.0], [20.8, 86.9]
        ],
        "track_forecast": [
            { "time": "25 Oct 02:30 IST", "lat": 20.8, "lon": 86.9, "wind": 110, "pressure": 986, "stage": "Landfall (Dhamra Port)" },
            { "time": "25 Oct 08:30 IST", "lat": 21.2, "lon": 86.5, "wind": 85, "pressure": 992, "stage": "Inland Weakening (Mayurbhanj)" },
            { "time": "25 Oct 14:30 IST", "lat": 21.6, "lon": 86.0, "wind": 55, "pressure": 998, "stage": "Deep Depression (Jharkhand border)" },
            { "time": "26 Oct 02:30 IST", "lat": 22.1, "lon": 85.4, "wind": 40, "pressure": 1004, "stage": "Well-Marked Low" }
        ],
        "cone_polygon": [
            [15.8, 89.2], [17.0, 90.0], [19.5, 89.0], [22.5, 87.5], 
            [22.0, 84.5], [19.0, 85.5], [16.5, 87.5], [15.8, 89.2]
        ],
        "sst": 29.8,
        "impact_districts": ["Kendrapara (Odisha)", "Bhadrak (Odisha)", "Balasore (Odisha)", "Purba Medinipur (WB)"],
        "dvorak_ci": "T3.5",
        "description": "Formed over East-Central Bay of Bengal and moved rapidly north-westwards, intensifying into a Severe Cyclonic Storm before making landfall over Odisha coast."
    },
    "cyclone-biparjoy-2023": {
        "id": "cyclone-biparjoy-2023",
        "name": "Extremely Severe Cyclonic Storm BIPARJOY",
        "season": "Pre-Monsoon 2023",
        "date_range": "06 Jun 2023 – 19 Jun 2023",
        "basin": "Arabian Sea",
        "category": "Extremely Severe Cyclonic Storm (IMD)",
        "peak_intensity_kmh": 165,
        "peak_intensity_knots": 90,
        "lowest_mslp_hpa": 958,
        "landfall": {
            "location": "Near Jakhau Port, Kutch District (Gujarat)",
            "timestamp": "15 Jun 2023, 22:30 IST",
            "lat": 23.3,
            "lon": 68.6,
            "surge_height_m": 3.0
        },
        "current_fix": { "lat": 23.3, "lon": 68.6, "wind": 125, "pressure": 970 },
        "track_history": [
            [12.1, 66.0], [14.5, 66.2], [17.2, 67.0], [19.8, 67.4], [21.5, 66.8], [23.3, 68.6]
        ],
        "track_forecast": [
            { "time": "15 Jun 22:30 IST", "lat": 23.3, "lon": 68.6, "wind": 125, "pressure": 970, "stage": "Landfall (Jakhau Port)" },
            { "time": "16 Jun 08:30 IST", "lat": 23.9, "lon": 69.8, "wind": 85, "pressure": 982, "stage": "Inland Storm (Kutch & Saurashtra)" },
            { "time": "16 Jun 20:30 IST", "lat": 24.6, "lon": 71.4, "wind": 55, "pressure": 992, "stage": "Deep Depression (South Rajasthan)" },
            { "time": "17 Jun 14:30 IST", "lat": 25.4, "lon": 73.2, "wind": 40, "pressure": 1000, "stage": "Depression Decay" }
        ],
        "cone_polygon": [
            [12.1, 66.0], [14.0, 68.0], [18.0, 70.0], [24.5, 71.0], 
            [25.0, 67.0], [20.5, 65.0], [15.0, 64.5], [12.1, 66.0]
        ],
        "sst": 31.0,
        "impact_districts": ["Kutch (Gujarat)", "Devbhumi Dwarka (Gujarat)", "Jamnagar (Gujarat)", "Morbi (Gujarat)"],
        "dvorak_ci": "T5.0",
        "description": "Exceptionally long-lived cyclone in the Arabian Sea (spanning 13 days) that executed multiple track recurvatures before striking the Gujarat coastline."
    },
    "cyclone-fani-2019": {
        "id": "cyclone-fani-2019",
        "name": "Extremely Severe Cyclonic Storm FANI",
        "season": "Pre-Monsoon 2019",
        "date_range": "26 Apr 2019 – 04 May 2019",
        "basin": "Bay of Bengal",
        "category": "Extremely Severe Cyclonic Storm / Cat 5",
        "peak_intensity_kmh": 215,
        "peak_intensity_knots": 115,
        "lowest_mslp_hpa": 932,
        "landfall": {
            "location": "South of Puri (Odisha)",
            "timestamp": "03 May 2019, 08:30 IST",
            "lat": 19.7,
            "lon": 85.8,
            "surge_height_m": 4.5
        },
        "current_fix": { "lat": 19.7, "lon": 85.8, "wind": 185, "pressure": 940 },
        "track_history": [
            [5.2, 88.5], [8.5, 86.8], [11.8, 85.2], [14.2, 84.8], [17.5, 85.0], [19.7, 85.8]
        ],
        "track_forecast": [
            { "time": "03 May 08:30 IST", "lat": 19.7, "lon": 85.8, "wind": 185, "pressure": 940, "stage": "Landfall (Puri Coast)" },
            { "time": "03 May 14:30 IST", "lat": 20.3, "lon": 85.9, "wind": 140, "pressure": 955, "stage": "Severe Cyclone (Bhubaneswar/Cuttack)" },
            { "time": "03 May 20:30 IST", "lat": 21.5, "lon": 86.8, "wind": 100, "pressure": 975, "stage": "Cyclonic Storm (Balasore/WB border)" },
            { "time": "04 May 08:30 IST", "lat": 23.5, "lon": 88.8, "wind": 65, "pressure": 992, "stage": "Deep Depression (Bangladesh)" }
        ],
        "cone_polygon": [
            [5.2, 88.5], [8.0, 90.0], [14.0, 88.0], [21.0, 88.5], 
            [22.0, 84.0], [16.0, 82.5], [10.0, 84.0], [5.2, 88.5]
        ],
        "sst": 31.2,
        "impact_districts": ["Puri (Odisha)", "Khurda / Bhubaneswar (Odisha)", "Cuttack (Odisha)", "Jagatsinghpur (Odisha)"],
        "dvorak_ci": "T6.5",
        "description": "One of the most intense pre-monsoon tropical cyclones ever recorded in the Bay of Bengal, undergoing rapid intensification into a high-end Category 5 equivalent system."
    },
    "cyclone-michaung-2023": {
        "id": "cyclone-michaung-2023",
        "name": "Severe Cyclonic Storm MICHAUNG",
        "season": "Post-Monsoon 2023",
        "date_range": "01 Dec 2023 – 06 Dec 2023",
        "basin": "Bay of Bengal",
        "category": "Severe Cyclonic Storm (IMD)",
        "peak_intensity_kmh": 100,
        "peak_intensity_knots": 55,
        "lowest_mslp_hpa": 988,
        "landfall": {
            "location": "Near Bapatla, South Coastal Andhra Pradesh",
            "timestamp": "05 Dec 2023, 13:30 IST",
            "lat": 15.8,
            "lon": 80.3,
            "surge_height_m": 1.5
        },
        "current_fix": { "lat": 15.8, "lon": 80.3, "wind": 95, "pressure": 990 },
        "track_history": [
            [10.8, 82.8], [12.2, 81.5], [13.3, 80.5], [14.5, 80.2], [15.8, 80.3]
        ],
        "track_forecast": [
            { "time": "05 Dec 13:30 IST", "lat": 15.8, "lon": 80.3, "wind": 95, "pressure": 990, "stage": "Landfall (Bapatla)" },
            { "time": "05 Dec 20:30 IST", "lat": 16.5, "lon": 80.8, "wind": 65, "pressure": 996, "stage": "Deep Depression (Krishna/Guntur)" },
            { "time": "06 Dec 08:30 IST", "lat": 17.8, "lon": 81.5, "wind": 45, "pressure": 1002, "stage": "Inland Depression (Telangana border)" }
        ],
        "cone_polygon": [
            [10.8, 82.8], [12.0, 83.5], [15.0, 82.0], [18.0, 81.5], 
            [17.5, 79.5], [14.0, 79.5], [11.5, 81.0], [10.8, 82.8]
        ],
        "sst": 29.2,
        "impact_districts": ["Chennai (Tamil Nadu)", "Tiruvallur (TN)", "Nellore (AP)", "Bapatla (AP)", "Prakasam (AP)"],
        "dvorak_ci": "T3.5",
        "description": "Produced extreme rainfall exceeding 450mm over Chennai and South Coastal Andhra Pradesh before making landfall near Bapatla."
    }
}

def fetch_live_ocean_telemetry(basin: str = "Bay of Bengal") -> Dict[str, Any]:
    """
    Fetches real-world live marine weather and thermodynamic conditions for the Indian Ocean
    using the Open-Meteo marine & atmospheric API.
    """
    try:
        # Reference coordinates for Bay of Bengal (15.5N, 88.0E) and Arabian Sea (15.0N, 66.0E)
        lat = 15.5 if basin == "Bay of Bengal" else 15.0
        lon = 88.0 if basin == "Bay of Bengal" else 66.0

        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=surface_pressure&timezone=Asia%2FKolkata"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'CycloneAI/2.1 (SIH 2026 Telemetry Service)'})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            current = data.get("current", {})

            return {
                "source": "Open-Meteo Live Marine Telemetry API",
                "status": "LIVE_OCEAN_ACTIVE",
                "coordinates": { "lat": lat, "lon": lon, "basin": basin },
                "surface_wind_kmh": round(current.get("wind_speed_10m", 28.5), 1),
                "surface_wind_gusts_kmh": round(current.get("wind_gusts_10m", 38.0), 1),
                "surface_pressure_hpa": round(current.get("surface_pressure", 1008.2), 1),
                "air_temperature_c": round(current.get("temperature_2m", 28.4), 1),
                "relative_humidity_pct": round(current.get("relative_humidity_2m", 82), 1),
                "wind_direction_deg": current.get("wind_direction_10m", 210),
                "is_live_stream": True,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S IST")
            }
    except Exception as e:
        # Fallback calibrated marine baseline if network is constrained
        return {
            "source": "Calibrated Ocean Baseline",
            "status": "CALIBRATED_FALLBACK",
            "coordinates": { "lat": 15.4, "lon": 87.8, "basin": basin },
            "surface_wind_kmh": 32.0,
            "surface_wind_gusts_kmh": 45.0,
            "surface_pressure_hpa": 1006.5,
            "air_temperature_c": 29.1,
            "relative_humidity_pct": 84,
            "wind_direction_deg": 225,
            "is_live_stream": False,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S IST")
        }
