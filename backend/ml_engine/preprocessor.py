import io
import math
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as T

# Standard ImageNet normalization parameters for pretrained backbones
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

def get_satellite_transform(target_size: Tuple[int, int] = (224, 224)):
    return T.Compose([
        T.Resize(target_size, interpolation=T.InterpolationMode.BILINEAR),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

def preprocess_satellite_image(
    image_bytes: bytes, 
    target_size: Tuple[int, int] = (224, 224)
) -> Dict[str, Any]:
    """
    Decodes raw satellite image bytes, performs bilinear resizing and ImageNet normalization.
    Returns PyTorch tensor [1, 3, H, W] and image metadata.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    orig_w, orig_h = image.size
    
    transform = get_satellite_transform(target_size)
    tensor = transform(image).unsqueeze(0) # [1, 3, 224, 224]
    
    # Also extract unnormalized float array [0, 1] for visualization and pixel statistics
    resized_img = image.resize(target_size, Image.Resampling.BILINEAR)
    raw_array = np.array(resized_img, dtype=np.float32) / 255.0
    
    return {
        "tensor": tensor,
        "raw_array": raw_array,
        "orig_size": (orig_w, orig_h),
        "target_size": target_size,
        "pil_image": resized_img
    }

def affine_pixel_to_geo(
    u_norm: float, 
    v_norm: float, 
    bbox: List[float]
) -> Tuple[float, float]:
    """
    Translates normalized pixel coordinates (u_norm in [0, 1], v_norm in [0, 1])
    to geographical (latitude, longitude) given bounding box [min_lat, min_lon, max_lat, max_lon].
    Note: v_norm = 0 is top (max_lat), v_norm = 1 is bottom (min_lat).
    u_norm = 0 is left (min_lon), u_norm = 1 is right (max_lon).
    """
    min_lat, min_lon, max_lat, max_lon = bbox
    lat = max_lat - float(v_norm) * (max_lat - min_lat)
    lon = min_lon + float(u_norm) * (max_lon - min_lon)
    return round(lat, 2), round(lon, 2)

def affine_geo_to_pixel(
    lat: float, 
    lon: float, 
    bbox: List[float]
) -> Tuple[float, float]:
    """
    Translates geographical (latitude, longitude) to normalized pixel coordinates (u_norm, v_norm).
    """
    min_lat, min_lon, max_lat, max_lon = bbox
    v_norm = (max_lat - lat) / (max_lat - min_lat) if max_lat != min_lat else 0.5
    u_norm = (lon - min_lon) / (max_lon - min_lon) if max_lon != min_lon else 0.5
    return float(np.clip(u_norm, 0.0, 1.0)), float(np.clip(v_norm, 0.0, 1.0))

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two points on Earth in kilometers.
    """
    R = 6371.0 # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def forward_bearing_deg(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes forward geodesic azimuth bearing in degrees [0, 360)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    bearing = math.degrees(math.atan2(y, x))
    return float((bearing + 360.0) % 360.0)

def coriolis_parameter(lat_deg: float) -> float:
    """Computes planetary Coriolis acceleration parameter f = 2*Omega*sin(lat)."""
    omega = 7.2921e-5 # rad/s
    return float(2.0 * omega * math.sin(math.radians(lat_deg)))

def build_canonical_trajectory_features(
    pt: Dict[str, Any], 
    prev_pt: Optional[Dict[str, Any]] = None
) -> List[float]:
    """
    Constructs the canonical 10-dimensional trajectory telemetry feature vector.
    Enforces identical feature ordering, normalization, and bounds across both
    offline evaluation and production inference.
    """
    lat = float(pt.get("lat") if pt.get("lat") is not None else pt.get("latitude", pt.get("current_lat", 15.0)))
    lon = float(pt.get("lon") if pt.get("lon") is not None else pt.get("longitude", pt.get("current_lon", 85.0)))
    wind_val = pt.get("wind_kts")
    if wind_val is None:
        if pt.get("wind_kmh") is not None:
            wind_val = float(pt["wind_kmh"]) / 1.852
        else:
            wind_val = pt.get("current_wind", pt.get("wind", 50.0))
    wind = float(wind_val or 50.0)
    pres = float(pt.get("pres_hpa", pt.get("pressure_hpa", pt.get("pressure", pt.get("current_mslp", pt.get("mslp", 990.0))))) or 990.0)
    dist2land = float(pt.get("dist2land_km", pt.get("dist2land", 500.0)) or 500.0)

    # 1. Delta lat and lon
    if prev_pt is not None:
        prev_lat = float(prev_pt.get("lat") if prev_pt.get("lat") is not None else prev_pt.get("latitude", prev_pt.get("current_lat", lat)))
        prev_lon = float(prev_pt.get("lon") if prev_pt.get("lon") is not None else prev_pt.get("longitude", prev_pt.get("current_lon", lon)))
        delta_lat = float(pt.get("delta_lat", lat - prev_lat))
        delta_lon = float(pt.get("delta_lon", lon - prev_lon))
        
        # Speed & Bearing
        if "translation_speed_kts" in pt and pt["translation_speed_kts"] is not None:
            speed_kts = float(pt["translation_speed_kts"])
        else:
            dist_km = haversine_distance_km(prev_lat, prev_lon, lat, lon)
            dt_h = float(pt.get("time_delta_h", 3.0) or 3.0)
            speed_kts = (dist_km / 1.852) / max(dt_h, 0.1)
            
        if "forward_bearing_deg" in pt and pt["forward_bearing_deg"] is not None:
            bearing_deg = float(pt["forward_bearing_deg"])
        else:
            bearing_deg = forward_bearing_deg(prev_lat, prev_lon, lat, lon)
    else:
        delta_lat = float(pt.get("delta_lat", 0.0))
        delta_lon = float(pt.get("delta_lon", 0.0))
        speed_kts = float(pt.get("translation_speed_kts", 0.0) or 0.0)
        bearing_deg = float(pt.get("forward_bearing_deg", 0.0) or 0.0)

    # Coriolis
    if "coriolis_f" in pt and pt["coriolis_f"] is not None:
        coriolis = float(pt["coriolis_f"])
    else:
        coriolis = coriolis_parameter(lat)

    # Normalization
    lat_norm = float(np.clip(lat / 90.0, 0.0, 1.0))
    lon_norm = float(np.clip(lon / 180.0, 0.0, 1.0))
    wind_norm = float(np.clip(wind / 150.0, 0.0, 1.5))
    mslp_norm = float(np.clip(pres / 1050.0, 0.5, 1.1))
    speed_norm = float(np.clip(speed_kts / 50.0, 0.0, 2.0))
    bearing_norm = float(np.clip(bearing_deg / 360.0, 0.0, 1.0))
    coriolis_norm = float(coriolis * 1e4)
    dist2land_norm = float(np.clip(dist2land / 2000.0, 0.0, 2.0))

    feats = [
        round(delta_lat, 4), round(delta_lon, 4),
        round(lat_norm, 4), round(lon_norm, 4),
        round(wind_norm, 4), round(mslp_norm, 4),
        round(speed_norm, 4), round(bearing_norm, 4),
        round(coriolis_norm, 4), round(dist2land_norm, 4)
    ]

    # Assertions
    assert len(feats) == 10, f"Expected 10 features, got {len(feats)}"
    for idx, val in enumerate(feats):
        assert not math.isnan(val) and not math.isinf(val), f"Feature {idx} is non-finite: {val}"

    return feats
