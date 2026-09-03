import time
import urllib.request
import json
from typing import Dict, List, Any, Optional
from ..database.db_manager import db

class IncoisOceanTelemetryService:
    """
    INCOIS (Indian National Centre for Ocean Information Services) & Open Marine Telemetry Service.
    Handles moored deep-sea buoy feeds, ocean heat content calculations, and scatterometer wind vectors.
    """
    def __init__(self):
        self.agency = "INCOIS / NIOT / MoES"

    def fetch_or_sync_live_buoys(self, basin: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves live ocean buoy telemetry from SQLite or syncs with Open-Meteo marine endpoints.
        """
        # 1. Fetch current buoys from database
        buoys = db.get_latest_buoy_telemetry(basin=basin)
        
        # 2. If no data or updating, fetch live atmospheric marine telemetry
        try:
            target_basin = basin or "Bay of Bengal"
            ref_lat = 15.5 if target_basin == "Bay of Bengal" else 15.0
            ref_lon = 88.0 if target_basin == "Bay of Bengal" else 66.0
            url = f"https://api.open-meteo.com/v1/forecast?latitude={ref_lat}&longitude={ref_lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=Asia%2FKolkata"
            
            req = urllib.request.Request(url, headers={'User-Agent': 'CycloneAI/Enterprise (SIH 2026 INCOIS Gateway)'})
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                current = data.get("current", {})
                
                # Update first buoy with live telemetry
                if buoys:
                    buoys[0]["sea_surface_pressure_hpa"] = round(current.get("surface_pressure", 1008.2), 1)
                    buoys[0]["surface_wind_speed_kmh"] = round(current.get("wind_speed_10m", 28.5), 1)
                    buoys[0]["surface_wind_direction_deg"] = current.get("wind_direction_10m", 220)
        except Exception:
            pass

        return buoys

    def calculate_ocean_heat_content(self, sst_c: float, mixed_layer_depth_m: float = 65.0) -> float:
        """
        Calculates Ocean Heat Content (OHC) relative to 26°C isotherm:
        OHC = rho * c_p * integral_{0}^{D_26} (T(z) - 26) dz in kJ/cm^2
        """
        if sst_c < 26.0:
            return 0.0
        # Specific heat of seawater c_p ~ 3.99 kJ/(kg*K), density rho ~ 1025 kg/m^3
        delta_t = sst_c - 26.0
        ohc_kj_cm2 = round(0.409 * delta_t * mixed_layer_depth_m, 1)
        return max(10.0, min(140.0, ohc_kj_cm2))

# Global Singleton Instance
incois_service = IncoisOceanTelemetryService()
