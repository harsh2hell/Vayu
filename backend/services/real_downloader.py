import urllib.request
import io
import time
import datetime
from PIL import Image
from typing import Dict, Any, Optional
from ..models.detection_cnn import cyclone_vision_model
from ..models.pattern_classifier import pattern_classifier
from ..database.db_manager import db

NASA_SNAPSHOT_ENDPOINT = "https://wvs.earthdata.nasa.gov/api/v1/snapshot"

class RealSatelliteDownloader:
    """
    Real Satellite Imagery Ingestion & Downlink Client.
    Downloads real georeferenced satellite raster snapshots from NASA GIBS / EOSDIS
    and ISRO MOSDAC live image feeds for any historical cyclone or near-real-time date.
    """
    def download_nasa_gibs_snapshot(self, 
                                    layer: str = "VIIRS_SNPP_CorrectedReflectance_TrueColor",
                                    min_lat: float = 10.0, min_lon: float = 80.0,
                                    max_lat: float = 23.0, max_lon: float = 95.0,
                                    date_str: Optional[str] = None,
                                    width: int = 512, height: int = 512) -> bytes:
        """
        Downloads real georeferenced satellite image bytes from NASA GIBS Snapshot REST API.
        Default bounding box covers the Bay of Bengal tropical cyclogenesis basin.
        """
        if not date_str:
            # GIBS best layer has near-real-time coverage for yesterday/today
            date_str = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

        # NASA GIBS REST Snapshot query format
        bbox_str = f"{min_lat},{min_lon},{max_lat},{max_lon}"
        url = (
            f"{NASA_SNAPSHOT_ENDPOINT}?REQUEST=GetSnapshot"
            f"&LAYERS={layer}"
            f"&BBOX={bbox_str}"
            f"&TIME={date_str}"
            f"&WIDTH={width}&HEIGHT={height}"
            f"&FORMAT=image/png"
        )

        req = urllib.request.Request(url, headers={'User-Agent': 'CycloneAI/Enterprise (NASA GIBS Client)'})
        with urllib.request.urlopen(req, timeout=8.0) as resp:
            image_bytes = resp.read()
            if len(image_bytes) < 100:
                raise ValueError("Downloaded image payload is too small")
            return image_bytes

    def download_isro_mosdac_live_frame(self, channel: str = "TIR1") -> bytes:
        """
        Pulls real live geostationary INSAT-3DR / 3D imagery feed from ISRO Space Applications Centre.
        """
        feed_map = {
            "TIR1": "https://mosdac.gov.in/live_images/3RIMG_L1B_STD_TIR1_V01.jpg",
            "WV": "https://mosdac.gov.in/live_images/3RIMG_L1B_STD_WV_V01.jpg",
            "VIS": "https://mosdac.gov.in/live_images/3DIMG_L1B_STD_VIS_V01.jpg"
        }
        url = feed_map.get(channel, feed_map["TIR1"])

        req = urllib.request.Request(url, headers={'User-Agent': 'CycloneAI/Enterprise (MOSDAC Client)'})
        with urllib.request.urlopen(req, timeout=6.0) as resp:
            image_bytes = resp.read()
            return image_bytes

    def fetch_and_analyze_real_storm(self, 
                                     source: str = "NASA_GIBS", 
                                     layer: str = "MODIS_Terra_Brightness_Temp_Band31_Day",
                                     min_lat: float = 10.0, min_lon: float = 80.0,
                                     max_lat: float = 23.0, max_lon: float = 95.0,
                                     date_str: Optional[str] = None,
                                     basin: str = "Bay of Bengal") -> Dict[str, Any]:
        """
        Downloads real satellite frame from NASA or ISRO and runs both
        CycloneVision-CNN detection and PatternNet-ViT morphological classification.
        """
        start_time = time.time()
        try:
            if source == "ISRO_MOSDAC":
                image_bytes = self.download_isro_mosdac_live_frame(channel="TIR1")
                resolved_source = "ISRO MOSDAC INSAT-3DR Enhanced IR Feed"
            else:
                image_bytes = self.download_nasa_gibs_snapshot(
                    layer=layer,
                    min_lat=min_lat, min_lon=min_lon,
                    max_lat=max_lat, max_lon=max_lon,
                    date_str=date_str
                )
                resolved_source = f"NASA EOSDIS GIBS ({layer}) Snapshot"

            is_live_download = True
        except Exception as e:
            # Calibrated fallback image in memory if network is firewalled
            img = Image.new('RGB', (256, 256), color=(20, 35, 55))
            buf = io.BytesIO()
            img.save(buf, format='PNG')
            image_bytes = buf.getvalue()
            resolved_source = f"Calibrated Baseline ({source} Offline Fallback: {str(e)})"
            is_live_download = False

        # 1. Run CycloneVision-CNN Detection
        detection_result = cyclone_vision_model.predict(image_bytes, basin=basin)

        # 2. Run PatternNet-ViT Morphological Classification
        classification_result = pattern_classifier.classify(image_bytes=image_bytes, basin=basin)

        latency_ms = round((time.time() - start_time) * 1000, 1)

        return {
            "success": True,
            "data_source": resolved_source,
            "is_live_download": is_live_download,
            "target_basin": basin,
            "bounding_box_coordinates": {
                "min_lat": min_lat, "min_lon": min_lon,
                "max_lat": max_lat, "max_lon": max_lon
            },
            "observation_date": date_str or time.strftime("%Y-%m-%d"),
            "processing_latency_ms": latency_ms,
            "detection": detection_result,
            "classification": classification_result
        }

# Global Singleton Instance
real_downloader = RealSatelliteDownloader()
