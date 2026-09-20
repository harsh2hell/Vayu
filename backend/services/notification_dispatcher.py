"""
VAYU Alerts — Notification Dispatcher Service
Coordinates resolving target devices, evaluating user alert preferences,
dispatching through FcmService, and logging delivery telemetry in SQLite.
"""

import time
import uuid
import logging
from typing import List, Dict, Any, Optional

from backend.database.db_manager import db_manager
from backend.services.fcm_service import fcm_service, FcmService

logger = logging.getLogger("vayu.dispatcher")


class NotificationDispatcher:
    """
    Coordinates multi-device alert dispatch and delivery logging.
    """

    def __init__(self, fcm_client: Optional[FcmService] = None):
        self.fcm = fcm_client or fcm_service

    def dispatch_alert(
        self,
        alert_id: str,
        target_mode: str = "all",  # "all", "my_device", "selected"
        target_device_ids: Optional[List[str]] = None,
        operator_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dispatches an alert to target devices and records delivery state.
        """
        alert = db_manager.get_vayu_alert_by_id(alert_id)
        if not alert:
            return {
                "success": False,
                "error": f"Alert {alert_id} not found in database",
                "dispatched_count": 0,
                "deliveries": []
            }

        # Resolve target devices from SQLite
        all_devices = db_manager.get_active_devices()

        if target_mode == "selected" and target_device_ids:
            devices = [d for d in all_devices if d["device_id"] in target_device_ids]
        elif target_mode == "my_device":
            # Target the most recently active device
            devices = [all_devices[0]] if all_devices else []
        else:
            # All active devices
            devices = all_devices

        if not devices:
            return {
                "success": True,
                "status": "NO_TARGET_DEVICES",
                "message": "No active registered devices matched the target criteria",
                "alert_id": alert_id,
                "target_count": 0,
                "accepted_count": 0,
                "failed_count": 0,
                "deliveries": []
            }

        deliveries: List[Dict[str, Any]] = []
        accepted_count = 0
        failed_count = 0

        severity = alert.get("severity", "INFO")
        title = alert.get("title", "VAYU Alert")
        body = alert.get("message", "")
        storm_id = alert.get("storm_id")
        storm_name = alert.get("storm_name")
        source = alert.get("source", "VAYU_MODEL")
        created_at = alert.get("created_at")

        for dev in devices:
            device_id = dev["device_id"]
            fcm_token = dev["fcm_token"]
            device_model = dev.get("device_model") or "Android Device"

            delivery_id = f"DEL-{int(time.time())}-{uuid.uuid4().hex[:6]}"
            sent_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

            # Check user preferences
            prefs = db_manager.get_notification_preferences(device_id)
            if prefs and severity != "TEST":
                sev_lower = severity.lower()
                if sev_lower == "critical" and not prefs.get("critical_alerts", True):
                    continue
                if sev_lower == "warning" and not prefs.get("warning_alerts", True):
                    continue
                if sev_lower == "watch" and not prefs.get("watch_alerts", True):
                    continue
                if sev_lower == "info" and not prefs.get("info_alerts", False):
                    continue

            # Record initial PENDING delivery entry in DB
            delivery_db_id = db_manager.record_alert_delivery(
                delivery_id=delivery_id,
                alert_id=alert_id,
                device_id=device_id,
                status="PENDING",
                sent_at=sent_at
            )

            # Send via FCM HTTP v1
            fcm_resp = self.fcm.send_notification(
                fcm_token=fcm_token,
                alert_id=alert_id,
                title=title,
                body=body,
                severity=severity,
                storm_id=storm_id,
                storm_name=storm_name,
                source=source,
                created_at=created_at
            )

            status = fcm_resp.get("status", "FAILED")
            msg_id = fcm_resp.get("message_id")
            if fcm_resp.get("success"):
                accepted_count += 1
                db_manager.update_alert_delivery_status(delivery_db_id, status=status, fcm_message_id=msg_id)
            else:
                failed_count += 1
                db_manager.update_alert_delivery_status(delivery_db_id, status=status, fcm_message_id=msg_id)

                # Handle expired/unregistered token
                if status == "TOKEN_INVALID":
                    logger.warning(f"Device token {device_id} invalid/unregistered. Deactivating in DB.")
                    db_manager.deactivate_device(device_id)

            deliveries.append({
                "delivery_id": delivery_id,
                "device_id": device_id,
                "device_model": device_model,
                "status": status,
                "fcm_status": fcm_resp.get("fcm_status", status),
                "message_id": fcm_resp.get("message_id"),
                "sent_at": sent_at
            })

        return {
            "success": True,
            "alert_id": alert_id,
            "target_count": len(devices),
            "accepted_count": accepted_count,
            "failed_count": failed_count,
            "deliveries": deliveries
        }


notification_dispatcher = NotificationDispatcher()
