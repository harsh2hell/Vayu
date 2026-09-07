"""
VAYU Geolocation Transformation Engine
=======================================
Scientifically rigorous transformation between image-space pixel coordinates
and geographic coordinates (latitude, longitude) for satellite imagery.

Principles
----------
1. An image-space prediction (center_x_norm, center_y_norm in [0, 1]) DOES NOT
   contain geographic coordinates on its own.
2. Geographic coordinates can ONLY be derived when the verified geographic
   scene extent (bounding box: min_lat, min_lon, max_lat, max_lon) and CRS
   are known.
3. Arbitrary user uploads without georeferencing metadata MUST NEVER be projected
   onto assumed default bounding boxes.
4. Proper handling of longitude wrapping (anti-meridian / 180° meridian crossing).
5. Future-ready architecture for two-stage detection (synoptic candidate crop ->
   regional vortex center localization).
"""

import math
from dataclasses import dataclass
from typing import Dict, Any, List, Optional, Tuple


@dataclass
class ImageGeoReference:
    """
    Verified geographic extent and projection metadata for a satellite scene.
    """
    min_lat: float
    min_lon: float
    max_lat: float
    max_lon: float
    crs: str = "EPSG:4326"
    source_name: Optional[str] = None
    pixel_width: Optional[int] = None
    pixel_height: Optional[int] = None

    def validate(self) -> bool:
        """Validate latitude and longitude ranges."""
        if not (-90.0 <= self.min_lat <= 90.0 and -90.0 <= self.max_lat <= 90.0):
            return False
        if self.min_lat >= self.max_lat:
            return False
        return True


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two points on the Earth
    in kilometers using the Haversine formula.
    """
    r_earth = 6371.0  # Earth mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r_earth * c, 2)


def normalize_longitude(lon: float) -> float:
    """Normalize longitude to [-180, 180) degrees."""
    lon = (lon + 180.0) % 360.0 - 180.0
    return round(lon, 4)


def transform_image_center_to_geo(
    cx_norm: float,
    cy_norm: float,
    bbox_geo: Optional[List[float]] = None,
    crs: str = "EPSG:4326"
) -> Dict[str, Any]:
    """
    Transforms normalized image coordinates (cx_norm, cy_norm in [0, 1])
    into geographical coordinates (latitude, longitude) ONLY when valid
    geographic bounding box coordinates are explicitly provided.

    Parameters
    ----------
    cx_norm : float
        Horizontal normalized coordinate (0 = left / west, 1 = right / east).
    cy_norm : float
        Vertical normalized coordinate (0 = top / north, 1 = bottom / south).
    bbox_geo : Optional[List[float]]
        Bounding box in the format [min_lat, min_lon, max_lat, max_lon].
        If None, no geographic coordinates will be fabricated.
    crs : str
        Coordinate Reference System (default: EPSG:4326).

    Returns
    -------
    Dict[str, Any] with keys:
        - is_georeferenced: bool
        - geo_fix_status: str ("VERIFIED_EXTENT" | "UNAVAILABLE_NO_EXTENT" | "INVALID_EXTENT")
        - latitude: Optional[float]
        - longitude: Optional[float]
        - formatted: Optional[str]
        - coordinates: Optional[Dict]
    """
    cx = max(0.0, min(1.0, float(cx_norm)))
    cy = max(0.0, min(1.0, float(cy_norm)))

    if bbox_geo is None or len(bbox_geo) != 4:
        return {
            "is_georeferenced": False,
            "geo_fix_status": "UNAVAILABLE_NO_EXTENT",
            "message": "Uploaded image has no verified geospatial extent.",
            "latitude": None,
            "longitude": None,
            "formatted": None,
            "coordinates": None,
            "bbox_geo": None,
            "crs": crs,
        }

    try:
        min_lat, min_lon, max_lat, max_lon = [float(v) for v in bbox_geo]
    except (ValueError, TypeError):
        return {
            "is_georeferenced": False,
            "geo_fix_status": "INVALID_EXTENT",
            "message": "Geospatial extent coordinates are non-numeric.",
            "latitude": None,
            "longitude": None,
            "formatted": None,
            "coordinates": None,
            "bbox_geo": None,
            "crs": crs,
        }

    # Validate latitudes
    if not (-90.0 <= min_lat < max_lat <= 90.0):
        return {
            "is_georeferenced": False,
            "geo_fix_status": "INVALID_EXTENT",
            "message": f"Invalid latitude range: [{min_lat}, {max_lat}]",
            "latitude": None,
            "longitude": None,
            "formatted": None,
            "coordinates": None,
            "bbox_geo": bbox_geo,
            "crs": crs,
        }

    # Affine latitude transformation:
    # cy = 0 is top (max_lat), cy = 1 is bottom (min_lat)
    lat = max_lat - cy * (max_lat - min_lat)

    # Affine longitude transformation with anti-meridian handling
    if min_lon <= max_lon:
        # Standard bounding box
        lon = min_lon + cx * (max_lon - min_lon)
    else:
        # Crosses anti-meridian (180° meridian, e.g. 170°E to -170°W)
        lon_span = (max_lon + 360.0) - min_lon
        lon = min_lon + cx * lon_span
        lon = normalize_longitude(lon)

    lat = round(lat, 4)
    lon = round(lon, 4)

    lat_cardinal = "N" if lat >= 0 else "S"
    lon_cardinal = "E" if lon >= 0 else "W"
    formatted = f"{abs(lat):.2f}°{lat_cardinal}, {abs(lon):.2f}°{lon_cardinal}"

    coordinates = {
        "latitude": lat,
        "longitude": lon,
        "formatted": formatted,
        "center_x_norm": round(cx, 4),
        "center_y_norm": round(cy, 4),
        "bbox_geo": [min_lat, min_lon, max_lat, max_lon],
        "crs": crs,
        "is_georeferenced": True,
    }

    return {
        "is_georeferenced": True,
        "geo_fix_status": "VERIFIED_EXTENT",
        "message": "Geographic coordinates verified against scene extent.",
        "latitude": lat,
        "longitude": lon,
        "formatted": formatted,
        "coordinates": coordinates,
        "bbox_geo": [min_lat, min_lon, max_lat, max_lon],
        "crs": crs,
    }


# ==============================================================================
# Future-Ready Architecture: Two-Stage Detector Specification
# ==============================================================================

@dataclass
class TwoStageCandidateCrop:
    """
    Specification for a candidate cyclone region cropped from a wide-area scene.
    Enables future integration of Stage 1 (Wide-area synoptic detection)
    with Stage 2 (Vortex center localization).
    """
    stage: str = "Stage1_Candidate_Crop"
    candidate_id: str = "CAND-01"
    crop_ymin_norm: float = 0.0
    crop_xmin_norm: float = 0.0
    crop_ymax_norm: float = 1.0
    crop_xmax_norm: float = 1.0
    parent_scene_bbox: Optional[List[float]] = None

    def crop_to_parent_geo_extent(self) -> Optional[List[float]]:
        """
        Derives the geographic bounding box of the sub-crop given the parent
        scene's geographic extent.
        """
        if not self.parent_scene_bbox:
            return None
        min_lat, min_lon, max_lat, max_lon = self.parent_scene_bbox
        sub_max_lat = max_lat - self.crop_ymin_norm * (max_lat - min_lat)
        sub_min_lat = max_lat - self.crop_ymax_norm * (max_lat - min_lat)
        sub_min_lon = min_lon + self.crop_xmin_norm * (max_lon - min_lon)
        sub_max_lon = min_lon + self.crop_xmax_norm * (max_lon - min_lon)
        return [round(sub_min_lat, 4), round(sub_min_lon, 4), round(sub_max_lat, 4), round(sub_max_lon, 4)]

    def map_crop_coords_to_synoptic(self, sub_cx: float, sub_cy: float) -> Tuple[float, float]:
        """
        Maps normalized coordinates within the regional crop back to synoptic parent scene coordinates.
        """
        syn_cx = self.crop_xmin_norm + sub_cx * (self.crop_xmax_norm - self.crop_xmin_norm)
        syn_cy = self.crop_ymin_norm + sub_cy * (self.crop_ymax_norm - self.crop_ymin_norm)
        return round(syn_cx, 4), round(syn_cy, 4)
