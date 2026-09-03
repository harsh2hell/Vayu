import time
import datetime
from typing import Dict, List, Any
import xml.etree.ElementTree as ET

class CommonAlertingProtocolService:
    """
    OASIS Common Alerting Protocol (CAP v1.2) & CAP-India Disaster Emergency Protocol Service.
    Converts cyclone warnings into standardized XML and JSON formats for NDMA, SDMA, and NDRF.
    """
    def generate_cap_json(self, alert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates standard OASIS CAP v1.2 JSON payload."""
        identifier = alert_data.get("cap_identifier") or f"IN-IMD-CAP-{int(time.time())}"
        now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S+05:30")
        expires_iso = (datetime.datetime.utcnow() + datetime.timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%S+05:30")

        return {
            "identifier": identifier,
            "sender": "imd.cyclone.warning@nic.in",
            "sent": now_iso,
            "status": "Actual",
            "msgType": "Alert",
            "scope": "Public",
            "info": {
                "category": "Met",
                "event": f"Tropical Cyclone Warning ({alert_data.get('alert_level', 'RED ALERT')})",
                "urgency": alert_data.get("cap_urgency", "Immediate"),
                "severity": alert_data.get("cap_severity", "Extreme"),
                "certainty": alert_data.get("cap_certainty", "Observed"),
                "eventCode": "TC_WARNING",
                "expires": expires_iso,
                "headline": f"SEVERE CYCLONE ALERT: {alert_data.get('cyclone_name')} OVER {alert_data.get('basin')}",
                "description": (
                    f"{alert_data.get('cyclone_name')} is advancing with sustained peak wind speeds reaching "
                    f"{alert_data.get('wind_gust_forecast_kmh')} km/h. Expected storm surge height: "
                    f"{alert_data.get('surge_height_m')}. Expected 24h rainfall: {alert_data.get('rainfall_24h_mm')} mm."
                ),
                "instruction": alert_data.get("evacuation_recommendation", "Immediate evacuation of coastal villages within 5km of shoreline."),
                "area": {
                    "areaDesc": ", ".join(alert_data.get("affected_districts", [])),
                    "circle": "19.8,85.8,120.0" # Center lat, lon, radius km
                }
            }
        }

    def generate_cap_xml(self, alert_data: Dict[str, Any]) -> str:
        """Generates valid OASIS CAP v1.2 XML string."""
        cap_json = self.generate_cap_json(alert_data)
        
        alert = ET.Element("alert", xmlns="urn:oasis:names:tc:emergency:cap:1.2")
        ET.SubElement(alert, "identifier").text = cap_json["identifier"]
        ET.SubElement(alert, "sender").text = cap_json["sender"]
        ET.SubElement(alert, "sent").text = cap_json["sent"]
        ET.SubElement(alert, "status").text = cap_json["status"]
        ET.SubElement(alert, "msgType").text = cap_json["msgType"]
        ET.SubElement(alert, "scope").text = cap_json["scope"]

        info = ET.SubElement(alert, "info")
        ET.SubElement(info, "category").text = cap_json["info"]["category"]
        ET.SubElement(info, "event").text = cap_json["info"]["event"]
        ET.SubElement(info, "urgency").text = cap_json["info"]["urgency"]
        ET.SubElement(info, "severity").text = cap_json["info"]["severity"]
        ET.SubElement(info, "certainty").text = cap_json["info"]["certainty"]
        ET.SubElement(info, "headline").text = cap_json["info"]["headline"]
        ET.SubElement(info, "description").text = cap_json["info"]["description"]
        ET.SubElement(info, "instruction").text = cap_json["info"]["instruction"]

        area = ET.SubElement(info, "area")
        ET.SubElement(area, "areaDesc").text = cap_json["info"]["area"]["areaDesc"]
        ET.SubElement(area, "circle").text = cap_json["info"]["area"]["circle"]

        return ET.tostring(alert, encoding="utf-8", method="xml").decode("utf-8")

# Global Singleton Instance
cap_service = CommonAlertingProtocolService()
