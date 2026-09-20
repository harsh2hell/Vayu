from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, List, Dict, Any
from ..database.db_manager import db
from ..database.schemas import (
    DeviceRegisterRequest,
    DeviceUnregisterRequest,
    NotificationPreferencesUpdate,
    NotificationPreferencesResponse,
    VayuAlertCreate,
    VayuAlertModel
)

router = APIRouter(prefix="/api", tags=["Notifications & Mobile Alerts"])


# -------------------------------------------------------------
# 1. Device Registration Endpoints
# -------------------------------------------------------------
@router.post("/notifications/devices/register")
def register_mobile_device(req: DeviceRegisterRequest):
    """
    Registers or refreshes a client device FCM push token.
    Stores device telemetry (platform, OS version, locale, optional coordinates)
    and initializes default severity channel preferences.
    """
    if not req.device_id or not req.fcm_token:
        raise HTTPException(status_code=400, detail="device_id and fcm_token are required.")
    
    dump = req.model_dump() if hasattr(req, "model_dump") else req.dict()
    result = db.register_device(dump)
    return result


@router.post("/notifications/devices/unregister")
def unregister_mobile_device(req: DeviceUnregisterRequest):
    """
    Deactivates a device registration so push notifications are ceased upon app uninstall or opt-out.
    """
    if not req.device_id:
        raise HTTPException(status_code=400, detail="device_id is required.")
    
    success = db.unregister_device(req.device_id)
    return {
        "success": success,
        "device_id": req.device_id,
        "status": "DEACTIVATED" if success else "NOT_FOUND",
        "message": "Device unregistered from VAYU alerts stream." if success else "Device not found."
    }


# -------------------------------------------------------------
# 2. Notification Preferences Endpoints
# -------------------------------------------------------------
@router.get("/notifications/preferences", response_model=NotificationPreferencesResponse)
def get_device_preferences(device_id: str = Query(..., description="Unique device installation ID")):
    """
    Retrieves the active alert channel preferences, subscribed basins, and radius thresholds for a device.
    """
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id query parameter is required.")
    
    prefs = db.get_notification_preferences(device_id)
    return prefs


@router.put("/notifications/preferences", response_model=NotificationPreferencesResponse)
def update_device_preferences(req: NotificationPreferencesUpdate):
    """
    Updates the notification channels (Critical, Warning, Watch, Info, Test) and geographic filters for a device.
    """
    if not req.device_id:
        raise HTTPException(status_code=400, detail="device_id is required in request payload.")
    
    dump = req.model_dump(exclude_unset=True) if hasattr(req, "model_dump") else req.dict(exclude_unset=True)
    updated = db.update_notification_preferences(req.device_id, dump)
    return updated


# -------------------------------------------------------------
# 3. Standardized VAYU Alerts Endpoints
# -------------------------------------------------------------
@router.get("/alerts")
def list_vayu_alerts(
    limit: int = Query(50, ge=1, le=100),
    active_only: bool = Query(True, description="Filter for unexpired active alerts"),
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, WARNING, WATCH, INFO, TEST")
):
    """
    Returns active or historical cyclone risk alerts formatted for consumer and mobile applications.
    Supports filtering by active status and severity level.
    """
    alerts = db.get_vayu_alerts(limit=limit, active_only=active_only, severity=severity)
    return {
        "success": True,
        "count": len(alerts),
        "alerts": alerts
    }


@router.get("/alerts/{alert_id}")
def get_vayu_alert_detail(alert_id: str):
    """
    Returns detailed dossier for a specific alert (used by mobile deep-links vayu://alert/{alert_id}).
    Includes spatiotemporal coordinates, impact radius, and meteorological metadata.
    """
    alert = db.get_vayu_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    
    return {
        "success": True,
        "alert": alert
    }


@router.post("/alerts/create")
def create_vayu_alert_operator(req: VayuAlertCreate):
    """
    Operator or automated pipeline endpoint to inject a new VAYU alert into the distribution database.
    """
    alert_id = db.create_vayu_alert(req.dict())
    created = db.get_vayu_alert_by_id(alert_id)
    return {
        "success": True,
        "alert_id": alert_id,
        "alert": created,
        "message": "Alert injected into distribution mesh successfully."
    }
