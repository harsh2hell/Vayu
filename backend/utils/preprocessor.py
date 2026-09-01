import io
import numpy as np
from PIL import Image

def load_and_preprocess_satellite_image(image_bytes: bytes, target_size=(224, 224)):
    """
    Decodes satellite image bytes, resizes to target grid, normalizes radiometric levels,
    and extracts brightness temperature arrays and spiral gradient centroids.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    orig_w, orig_h = image.size
    
    # Resize for CNN input
    resized_img = image.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(resized_img, dtype=np.float32) / 255.0
    
    # Calculate simulated brightness temperature map (°C)
    # IR channel mapping: dark pixels = warmer ocean, bright/white convective pixels = colder cloud tops (-90°C to +30°C)
    gray = np.mean(img_array, axis=2)
    brightness_temp_map = 30.0 - (gray * 120.0)
    
    # Find convective cloud cluster (coldest core region)
    min_temp = float(np.min(brightness_temp_map))
    avg_temp = float(np.mean(brightness_temp_map))
    
    # Otsu thresholding simulation to detect dense overcast (CDO)
    cdo_mask = brightness_temp_map < -40.0
    convective_pixel_count = int(np.sum(cdo_mask))
    total_pixels = target_size[0] * target_size[1]
    convective_ratio = convective_pixel_count / total_pixels
    
    # Find centroid of cold convective cloud
    if convective_pixel_count > 100:
        y_indices, x_indices = np.where(cdo_mask)
        center_y = int(np.mean(y_indices))
        center_x = int(np.mean(x_indices))
        
        # Bounding box in normalized coordinates (0.0 to 1.0)
        min_y = max(0.0, float(np.min(y_indices) / target_size[0]))
        max_y = min(1.0, float(np.max(y_indices) / target_size[0]))
        min_x = max(0.0, float(np.min(x_indices) / target_size[1]))
        max_x = min(1.0, float(np.max(x_indices) / target_size[1]))
        
        # Estimate radius in km (assuming 224px ~ 1200km field of view)
        radius_km = round(float(np.sqrt(convective_pixel_count / np.pi) * (1200.0 / target_size[0])), 1)
        radius_km = max(80.0, min(450.0, radius_km))
        
        # Estimate spiral curvature wrapping degrees
        spiral_curvature_deg = float(min(360.0, 120.0 + convective_ratio * 400.0))
        cyclone_detected = True
        confidence = float(min(98.5, max(75.0, 80.0 + convective_ratio * 35.0)))
    else:
        # Fallback centroid if clear sky / weak disturbance
        center_x = target_size[1] // 2
        center_y = target_size[0] // 2
        min_y, max_y, min_x, max_x = 0.25, 0.75, 0.25, 0.75
        radius_km = 120.0
        spiral_curvature_deg = 90.0
        cyclone_detected = False
        confidence = 45.0

    # Normalized bounding box [ymin, xmin, ymax, xmax]
    bounding_box = {
        "ymin": round(min_y, 3),
        "xmin": round(min_x, 3),
        "ymax": round(max_y, 3),
        "xmax": round(max_x, 3),
        "center_x_norm": round(center_x / target_size[1], 3),
        "center_y_norm": round(center_y / target_size[0], 3),
    }

    return {
        "img_tensor_array": img_array,
        "brightness_temp_map": brightness_temp_map,
        "min_temperature_c": round(min_temp, 1),
        "avg_temperature_c": round(avg_temp, 1),
        "convective_ratio": round(convective_ratio, 3),
        "cyclone_detected": cyclone_detected,
        "confidence": round(confidence, 1),
        "bounding_box": bounding_box,
        "radius_km": radius_km,
        "spiral_curvature_deg": round(spiral_curvature_deg, 1),
        "orig_dimensions": {"width": orig_w, "height": orig_h}
    }
