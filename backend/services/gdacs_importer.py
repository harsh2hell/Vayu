import urllib.request
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class GDACSImporter:
    def __init__(self):
        self.gdacs_url = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"

    def fetch_active_cyclones(self) -> List[Dict[str, Any]]:
        """
        Fetches active tropical cyclones from GDACS.
        """
        try:
            req = urllib.request.Request(self.gdacs_url, headers={'User-Agent': 'VAYU-Earth/4.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                
            active_cyclones = []
            
            # GDACS returns a GeoJSON FeatureCollection
            for feature in data.get("features", []):
                props = feature.get("properties", {})
                
                if props.get("eventtype") == "TC":
                    geom = feature.get("geometry", {})
                    coords = geom.get("coordinates", [0, 0])
                    
                    # Create data structure that matches DB schema
                    cyclone_data = {
                        "system_id": f"tc-{props.get('eventid')}",
                        "name": props.get("name", "Unknown System").replace("Tropical Cyclone ", ""),
                        "season": "Current Season",
                        "basin": "Global",
                        "category": "Active System",
                        "lowest_mslp_hpa": 1000, 
                        "peak_intensity_kmh": 0,
                        "peak_intensity_knots": 0,
                        "description": props.get("htmldescription", "Active Tropical Cyclone tracked by GDACS."),
                        "track_history": [],
                        "track_forecast": [
                            {
                                "time": props.get("todate", "Current"),
                                "lat": coords[1],
                                "lon": coords[0],
                                "wind": 0,
                                "pressure": 1000,
                                "stage": "Current Location"
                            }
                        ],
                        "cone_polygon": [],
                        "impact_districts": []
                    }
                    active_cyclones.append(cyclone_data)
                    
            return active_cyclones
            
        except Exception as e:
            logger.error(f"Error fetching GDACS cyclones: {e}")
            return []

gdacs_importer = GDACSImporter()
