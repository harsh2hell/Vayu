from .db_manager import db
from ..services.feed_ingestion import REAL_HISTORICAL_SYSTEMS

def seed_database():
    """Seeds historical ground-truth cyclone records into the database."""
    print("🛰️ [CycloneAI DB] Seeding historical cyclone events...")
    for system_id, data in REAL_HISTORICAL_SYSTEMS.items():
        event = {
            "system_id": data["id"],
            "name": data["name"],
            "season": data["season"],
            "basin": data["basin"],
            "category": data["category"],
            "status": "HISTORICAL_BENCHMARK",
            "peak_intensity_kmh": data["peak_intensity_kmh"],
            "peak_intensity_knots": data["peak_intensity_knots"],
            "lowest_mslp_hpa": data["lowest_mslp_hpa"],
            "landfall_location": data["landfall"]["location"],
            "landfall_time": data["landfall"]["timestamp"],
            "landfall_lat": data["landfall"]["lat"],
            "landfall_lon": data["landfall"]["lon"],
            "surge_height_m": data["landfall"]["surge_height_m"],
            "dvorak_ci": data["dvorak_ci"],
            "description": data["description"],
            "track_history": data["track_history"],
            "track_forecast": data["track_forecast"],
            "cone_polygon": data["cone_polygon"],
            "impact_districts": data["impact_districts"]
        }
        db.upsert_cyclone_event(event)

    # Also seed a sample active alert for testing
    existing_alerts = db.get_active_alerts()
    if not existing_alerts:
        db.create_alert({
            "alert_level": "RED_ALERT",
            "basin": "Bay of Bengal",
            "cyclone_name": "Severe Cyclonic Storm DANA",
            "affected_districts": ["Bhadrak", "Kendrapara", "Balasore", "Jagatsinghpur", "Purba Medinipur"],
            "affected_states": ["Odisha", "West Bengal"],
            "wind_gust_forecast_kmh": 120.0,
            "surge_height_m": "2.0 – 2.8m",
            "rainfall_24h_mm": 240.0,
            "evacuation_recommendation": "High priority evacuation in progress for 1.2M residents across coastal Odisha.",
            "issued_by": "CycloneAI Early Warning Gateway (SIH 2026)"
        })

    print(f"✅ [CycloneAI DB] Database initialized and seeded with {len(REAL_HISTORICAL_SYSTEMS)} benchmark cyclones.")

if __name__ == "__main__":
    seed_database()
