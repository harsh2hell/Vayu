"""
VAYU Alerts — Server-Side FCM HTTP v1 Dispatch Service
Handles Google OAuth2 authentication and message dispatch to Firebase Cloud Messaging.
Uses server-side credentials only. Credentials must never be transmitted to client apps.
"""

import json
import os
import time
import logging
from typing import Dict, Any, Optional, Tuple

import httpx

logger = logging.getLogger("vayu.fcm")

FCM_SEND_URL_TEMPLATE = "https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"


class FcmService:
    """
    FCM HTTP v1 Client for dispatching cyclone alerts to registered Android devices.
    """

    def __init__(
        self,
        project_id: Optional[str] = None,
        service_account_info: Optional[Dict[str, Any]] = None,
        service_account_path: Optional[str] = None
    ):
        self.project_id = project_id or os.environ.get("FIREBASE_PROJECT_ID")
        self._service_account_info = service_account_info
        
        # 1. Resolve key / path from environment variables
        key_env = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
        if key_env and not self._service_account_info:
            if os.path.exists(key_env):
                self._service_account_path = key_env
            else:
                try:
                    self._service_account_info = json.loads(key_env)
                except Exception:
                    pass

        self._service_account_path = getattr(self, "_service_account_path", None) or service_account_path or os.environ.get(
            "FIREBASE_SERVICE_ACCOUNT_PATH",
            os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        )

        # Fallback to standard secure location outside workspace
        if not self._service_account_path and not self._service_account_info:
            default_secure_path = os.path.expanduser("~/.config/vayu/vayusat-live-firebase-adminsdk.json")
            if os.path.exists(default_secure_path):
                self._service_account_path = default_secure_path

        self._cached_token: Optional[str] = None
        self._token_expiry: float = 0.0

        # Attempt to load credentials if provided in env as raw JSON
        if not self._service_account_info:
            raw_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
            if raw_json:
                try:
                    self._service_account_info = json.loads(raw_json)
                except Exception as e:
                    logger.warning(f"Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

        # Attempt to load credentials from file path
        if not self._service_account_info and self._service_account_path:
            if os.path.exists(self._service_account_path):
                try:
                    with open(self._service_account_path, "r", encoding="utf-8") as f:
                        self._service_account_info = json.load(f)
                except Exception as e:
                    logger.warning(f"Failed to load service account file at {self._service_account_path}: {e}")

        # If project_id not set directly, infer from service account
        if not self.project_id and self._service_account_info:
            self.project_id = self._service_account_info.get("project_id")

    @property
    def is_configured(self) -> bool:
        """Returns True if valid Firebase server credentials are present."""
        return bool(self.project_id and self._service_account_info)

    def get_channel_for_severity(self, severity: str) -> str:
        """Maps VAYU severity code to the exact Android notification channel ID."""
        s = severity.upper()
        if s == "CRITICAL":
            return "vayu_channel_critical"
        elif s == "WARNING":
            return "vayu_channel_warning"
        elif s == "WATCH":
            return "vayu_channel_watch"
        elif s == "INFO" or s == "INFORMATION":
            return "vayu_channel_information"
        elif s == "TEST":
            return "vayu_channel_test"
        return "vayu_channel_watch"

    def build_fcm_message(
        self,
        fcm_token: str,
        alert_id: str,
        title: str,
        body: str,
        severity: str,
        storm_id: Optional[str] = None,
        storm_name: Optional[str] = None,
        source: str = "VAYU_MODEL",
        deep_link: Optional[str] = None,
        created_at: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Constructs a standard, schema-compliant FCM HTTP v1 message structure.
        """
        channel_id = self.get_channel_for_severity(severity)
        resolved_deep_link = deep_link or f"vayu://alert/{alert_id}"

        android_priority = "HIGH" if severity.upper() in ["CRITICAL", "WARNING"] else "NORMAL"

        data_payload: Dict[str, str] = {
            "alert_id": str(alert_id),
            "severity": str(severity).upper(),
            "title": str(title),
            "message": str(body),
            "source": str(source),
            "deep_link": resolved_deep_link,
            "created_at": str(created_at or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        }

        if storm_id:
            data_payload["storm_id"] = str(storm_id)
        if storm_name:
            data_payload["storm_name"] = str(storm_name)

        if extra_data:
            for k, v in extra_data.items():
                data_payload[str(k)] = json.dumps(v) if isinstance(v, (dict, list)) else str(v)

        return {
            "message": {
                "token": fcm_token,
                "notification": {
                    "title": title,
                    "body": body
                },
                "data": data_payload,
                "android": {
                    "priority": android_priority,
                    "notification": {
                        "channel_id": channel_id,
                        "notification_priority": "PRIORITY_MAX" if android_priority == "HIGH" else "PRIORITY_DEFAULT",
                        "default_sound": True,
                        "default_vibrate_timings": True,
                        "click_action": resolved_deep_link
                    }
                }
            }
        }

    def _get_access_token(self) -> Tuple[Optional[str], Optional[str]]:
        """
        Exchanges service account private key for a Google OAuth2 access token.
        Uses pure python JWT signing if google-auth is not installed, with fallback.
        """
        if self._cached_token and time.time() < self._token_expiry - 60:
            return self._cached_token, None

        if not self._service_account_info:
            return None, "NO_CREDENTIALS"

        try:
            # Try official google.auth if available
            from google.oauth2 import service_account
            import google.auth.transport.requests

            credentials = service_account.Credentials.from_service_account_info(
                self._service_account_info,
                scopes=[FCM_SCOPE]
            )
            request = google.auth.transport.requests.Request()
            credentials.refresh(request)
            self._cached_token = credentials.token
            self._token_expiry = time.time() + 3500
            return self._cached_token, None
        except (ImportError, Exception):
            pass

        # Fallback: self-contained JWT generation with cryptography / jwt if available
        try:
            import jwt
            import requests

            now = int(time.time())
            payload = {
                "iss": self._service_account_info["client_email"],
                "sub": self._service_account_info["client_email"],
                "aud": OAUTH_TOKEN_URL,
                "iat": now,
                "exp": now + 3600,
                "scope": FCM_SCOPE
            }
            assertion = jwt.encode(
                payload,
                self._service_account_info["private_key"],
                algorithm="RS256"
            )
            resp = requests.post(
                OAUTH_TOKEN_URL,
                data={
                    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                    "assertion": assertion
                },
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                self._cached_token = data.get("access_token")
                self._token_expiry = time.time() + int(data.get("expires_in", 3600))
                return self._cached_token, None
            else:
                return None, f"OAUTH_HTTP_{resp.status_code}"
        except Exception as e:
            return None, f"TOKEN_EXCHANGE_ERROR: {str(e)}"

    def send_notification(
        self,
        fcm_token: str,
        alert_id: str,
        title: str,
        body: str,
        severity: str,
        storm_id: Optional[str] = None,
        storm_name: Optional[str] = None,
        source: str = "VAYU_MODEL",
        deep_link: Optional[str] = None,
        created_at: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Sends an FCM HTTP v1 notification to a target device token.
        Returns a structured result with status (ACCEPTED, FAILED, TOKEN_INVALID, etc.)
        """
        payload = self.build_fcm_message(
            fcm_token=fcm_token,
            alert_id=alert_id,
            title=title,
            body=body,
            severity=severity,
            storm_id=storm_id,
            storm_name=storm_name,
            source=source,
            deep_link=deep_link,
            created_at=created_at,
            extra_data=extra_data
        )

        if not self.is_configured:
            logger.info("FCM Service not configured with server credentials. Running in simulated mode.")
            return {
                "success": True,
                "status": "ACCEPTED_SIMULATED",
                "fcm_status": "Simulated (FCM credentials pending)",
                "message_id": f"simulated-{int(time.time() * 1000)}",
                "alert_id": alert_id,
                "fcm_token_prefix": fcm_token[:12] + "..." if len(fcm_token) > 12 else fcm_token
            }

        if dry_run:
            payload["validate_only"] = True

        token, token_err = self._get_access_token()
        if not token:
            return {
                "success": False,
                "status": "FAILED",
                "error": f"Authentication failed: {token_err}",
                "alert_id": alert_id
            }

        url = FCM_SEND_URL_TEMPLATE.format(project_id=self.project_id)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; UTF-8"
        }

        try:
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, headers=headers, json=payload)
                status_code = response.status_code

                if status_code == 200:
                    resp_data = response.json()
                    message_name = resp_data.get("name", "")
                    return {
                        "success": True,
                        "status": "ACCEPTED_DRY_RUN" if dry_run else "ACCEPTED",
                        "fcm_status": "Validated by FCM (dry-run)" if dry_run else "Accepted by FCM HTTP v1",
                        "message_id": message_name or f"validated-{int(time.time() * 1000)}",
                        "alert_id": alert_id,
                        "fcm_token_prefix": fcm_token[:12] + "..."
                    }
                elif status_code in (404, 410):
                    return {
                        "success": False,
                        "status": "TOKEN_INVALID",
                        "error": "Device token is expired or unregistered on FCM",
                        "fcm_status": "Token Unregistered",
                        "alert_id": alert_id
                    }
                elif status_code == 400:
                    try:
                        resp_json = response.json()
                        err_msg = resp_json.get("error", {}).get("message", "Bad request")
                    except Exception:
                        err_msg = response.text
                    
                    if "registration token" in err_msg.lower() or "invalid_argument" in err_msg.lower():
                        return {
                            "success": False,
                            "status": "TOKEN_INVALID",
                            "error": f"FCM token invalid: {err_msg}",
                            "fcm_status": "Token Invalid Format",
                            "alert_id": alert_id
                        }
                    return {
                        "success": False,
                        "status": "FAILED",
                        "error": f"FCM Bad Request (400): {err_msg}",
                        "fcm_status": "FCM 400 Error",
                        "alert_id": alert_id
                    }
                elif status_code in (401, 403):
                    return {
                        "success": False,
                        "status": "FAILED",
                        "error": "FCM server authorization error (check service account roles)",
                        "fcm_status": "FCM Auth Error",
                        "alert_id": alert_id
                    }
                else:
                    return {
                        "success": False,
                        "status": "FAILED",
                        "error": f"FCM HTTP error {status_code}: {response.text}",
                        "fcm_status": f"HTTP {status_code}",
                        "alert_id": alert_id
                    }
        except Exception as e:
            logger.error(f"FCM request exception: {e}")
            return {
                "success": False,
                "status": "FAILED",
                "error": str(e),
                "fcm_status": "Network Exception",
                "alert_id": alert_id
            }


# Singleton instance initialized with environment configuration
fcm_service = FcmService()
