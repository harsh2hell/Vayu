import urllib.request
import json
import time
from typing import Dict, List, Any, Optional

RAINVIEWER_INDEX_API = "https://api.rainviewer.com/public/weather-maps.json"

class RainViewerWeatherService:
    """
    RainViewer Live Doppler Weather Radar & Infrared Satellite Cloud Tile Service.
    Provides real-time animated tile layer URLs for live precipitation and cloud structures.
    """
    def fetch_live_animation_frames(self) -> Dict[str, Any]:
        """
        Fetches the latest radar and infrared satellite timestamps from RainViewer open API.
        """
        try:
            req = urllib.request.Request(RAINVIEWER_INDEX_API, headers={'User-Agent': 'CycloneAI/Enterprise (RainViewer Client)'})
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                
                host = data.get("host", "https://tilecache.rainviewer.com")
                satellite = data.get("satellite", {})
                radar = data.get("radar", {})
                
                sat_infrared = satellite.get("infrared", [])
                radar_past = radar.get("past", [])
                
                # Construct latest tile URL template
                latest_sat_time = sat_infrared[-1]["time"] if sat_infrared else int(time.time())
                latest_radar_time = radar_past[-1]["time"] if radar_past else int(time.time())

                sat_tile_url = f"{host}/v2/satellite/{latest_sat_time}/256/{{z}}/{{x}}/{{y}}/0/0_0.png"
                radar_tile_url = f"{host}/v2/radar/{latest_radar_time}/256/{{z}}/{{x}}/{{y}}/2/1_1.png"

                return {
                    "success": True,
                    "provider": "RainViewer Global Radar & Satellite API",
                    "host": host,
                    "satellite_infrared_frame_time": latest_sat_time,
                    "radar_frame_time": latest_radar_time,
                    "satellite_tile_template": sat_tile_url,
                    "radar_tile_template": radar_tile_url,
                    "infrared_frames_count": len(sat_infrared),
                    "radar_frames_count": len(radar_past),
                    "is_live": True
                }
        except Exception as e:
            # Calibrated fallback template
            return {
                "success": True,
                "provider": "RainViewer API (Cached Mode)",
                "satellite_tile_template": "https://tilecache.rainviewer.com/v2/satellite/latest/256/{z}/{x}/{y}/0/0_0.png",
                "radar_tile_template": "https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png",
                "is_live": False,
                "note": f"RainViewer live fetch error: {str(e)}"
            }

# Global Singleton Instance
rainviewer_service = RainViewerWeatherService()
