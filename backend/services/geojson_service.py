from typing import Dict, List, Any

class CycloneGeoJSONService:
    """
    Standard GIS GeoJSON Export Service.
    Produces RFC 7946 compliant GeoJSON FeatureCollections for cyclone past tracks,
    forecast waypoints, 70% confidence error cones, and coastal threat sectors.
    """
    def generate_track_geojson(self, cyclone_data: Dict[str, Any]) -> Dict[str, Any]:
        """Converts cyclone track history, forecast, and error cone into a GeoJSON FeatureCollection."""
        features = []
        name = cyclone_data.get("name", "Cyclone System")

        # 1. Past Observed Track LineString
        history_points = cyclone_data.get("track_history", [])
        if history_points:
            # Note GeoJSON uses [longitude, latitude]
            coords = [[pt[1], pt[0]] for pt in history_points]
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords
                },
                "properties": {
                    "layer": "observed_track",
                    "cyclone_name": name,
                    "stroke_color": "#1E293B",
                    "stroke_width": 3
                }
            })

            # Add Point features for history fixes
            for i, pt in enumerate(history_points):
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [pt[1], pt[0]]
                    },
                    "properties": {
                        "layer": "observed_fix",
                        "index": i,
                        "lat": pt[0],
                        "lon": pt[1]
                    }
                })

        # 2. AI Forecast Track LineString
        forecast_points = cyclone_data.get("track_forecast", [])
        if forecast_points:
            f_coords = [[pt["lon"], pt["lat"]] for pt in forecast_points]
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": f_coords
                },
                "properties": {
                    "layer": "forecast_track",
                    "cyclone_name": name,
                    "stroke_color": "#DC2626",
                    "stroke_width": 3.5,
                    "stroke_dash": "5,5"
                }
            })

            # Point features for forecast waypoints
            for pt in forecast_points:
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [pt["lon"], pt["lat"]]
                    },
                    "properties": {
                        "layer": "forecast_waypoint",
                        "time": pt.get("time"),
                        "wind_kmh": pt.get("wind"),
                        "pressure_hpa": pt.get("pressure"),
                        "stage": pt.get("stage")
                    }
                })

        # 3. 70% Confidence Cone of Uncertainty Polygon
        cone_pts = cyclone_data.get("cone_polygon", [])
        if cone_pts:
            cone_coords = [[pt[1], pt[0]] for pt in cone_pts]
            # Ensure closed polygon
            if cone_coords and cone_coords[0] != cone_coords[-1]:
                cone_coords.append(cone_coords[0])

            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [cone_coords]
                },
                "properties": {
                    "layer": "cone_of_uncertainty",
                    "confidence_level": "70%",
                    "fill_color": "rgba(220, 38, 38, 0.15)",
                    "stroke_color": "rgba(220, 38, 38, 0.6)"
                }
            })

        return {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" }
            },
            "features": features
        }

# Global Singleton Instance
geojson_service = CycloneGeoJSONService()
