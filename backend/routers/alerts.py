from fastapi import APIRouter, HTTPException, Response
from typing import List, Dict, Any
from ..database.db_manager import db
from ..database.schemas import DisasterAlertCreate
from ..services.cap_alert_service import cap_service

router = APIRouter(prefix="/api/v1/alerts", tags=["Disaster Management & CAP Alerts"])

@router.get("/active")
def get_active_alerts():
    """Returns currently active coastal disaster alerts and evacuation directives."""
    alerts = db.get_active_alerts()
    return {
        "success": True,
        "count": len(alerts),
        "alerts": alerts
    }

@router.post("/broadcast")
def broadcast_new_alert(req: DisasterAlertCreate):
    """Broadcasts a new early warning alert across civil defence and disaster response gateways."""
    alert_id = db.create_alert(req.dict())
    return {
        "success": True,
        "alert_id": alert_id,
        "message": "Disaster alert broadcast to SDMA / NDRF gateways successfully."
    }

@router.get("/{alert_id}/cap.xml")
def get_cap_alert_xml(alert_id: int):
    """Returns official OASIS Common Alerting Protocol (CAP v1.2) XML document for national emergency systems."""
    alerts = db.get_active_alerts()
    matching = next((a for a in alerts if a["id"] == alert_id), None)
    if not matching:
        raise HTTPException(status_code=404, detail="Alert not found")

    xml_content = cap_service.generate_cap_xml(matching)
    return Response(content=xml_content, media_type="application/xml")

@router.get("/{alert_id}/cap.json")
def get_cap_alert_json(alert_id: int):
    """Returns official OASIS Common Alerting Protocol (CAP v1.2) JSON object."""
    alerts = db.get_active_alerts()
    matching = next((a for a in alerts if a["id"] == alert_id), None)
    if not matching:
        raise HTTPException(status_code=404, detail="Alert not found")

    return cap_service.generate_cap_json(matching)
