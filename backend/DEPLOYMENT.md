# VAYU FastAPI Production Deployment Guide

## Architecture Overview

```
                          ┌───────────────────────────┐
                          │   VAYU Android App        │
                          │   (live.vayusat.alerts)   │
                          └─────────────┬─────────────┘
                                        │ HTTPS
                                        ▼
    ┌───────────────────────────┐  https://api.vayusat.live
    │   VAYU Web Portal         │       │
    │   portal.vayusat.live     │       │
    │   (Vercel SPA)            │       │
    └─────────────┬─────────────┘       │
                  │ Fetch (CORS)        │
                  └─────────────────────┼────────────────────────┐
                                        │                        │
                                        ▼                        ▼
                          ┌───────────────────────────┐    ┌───────────┐
                          │   FastAPI Gateway         │    │ Cloud Run │
                          │   (Render / Docker PaaS)  │ or │ / VPS     │
                          └─────────────┬─────────────┘    └───────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │ PyTorch DL Models │      │ Hardened SQLite   │      │ Firebase FCM HTTP │
   │ (MobileNetV3,     │      │ (cyclone_intel.db │      │ v1 Dispatch       │
   │  ResNet18, GRU)   │      │  + Persistence)   │      │ (OAuth2 Service)  │
   └───────────────────┘      └───────────────────┘      └───────────────────┘
```

---

## 1. Prerequisites & Environment Variables

Configure these environment variables in your deployment platform (e.g. Render, Railway, Fly.io, Cloud Run):

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Yes (Auto) | `8000` | Port assigned dynamically by cloud host |
| `HOST` | No | `0.0.0.0` | Bound host interface |
| `RELOAD` | No | `false` | Must be `false` in production |
| `CORS_ORIGINS` | No | `https://portal.vayusat.live,...` | Allowed CORS origins for browser web portal |
| `FIREBASE_PROJECT_ID` | Yes | `vayusat-live` | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Yes | *None* | Full JSON content of Firebase Service Account key |
| `WINDY_API_KEY` | No | *None* | Optional API key for live ocean wind point telemetry |
| `CYCLONE_DB_PATH` | No | `backend/database/cyclone_intel.db` | Persistent volume path if mounted |

---

## 2. Docker Container Deployment

The backend contains a self-contained `backend/Dockerfile`.

### Build & Run Locally
```bash
# Build the Docker image
docker build -t vayu-fastapi:latest -f backend/Dockerfile backend

# Run the container
docker run -d \
  -p 8000:8000 \
  -e PORT=8000 \
  -e FIREBASE_PROJECT_ID=vayusat-live \
  -e FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}' \
  --name vayu-api \
  vayu-fastapi:latest

# Verify health
curl -s http://127.0.0.1:8000/api/health | jq .
```

---

## 3. Recommended Platform: Render

Render is the simplest, most direct deployment target for this repository:
1. Native Docker runtime support with automated HTTPS/SSL certificates.
2. Direct blueprint integration via [`render.yaml`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/render.yaml).
3. Free SSL certificate provisioning for custom domains (`api.vayusat.live`).
4. Native support for large environment variables (`FIREBASE_SERVICE_ACCOUNT_KEY`).

### Step-by-Step Render Deployment:
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect the GitHub repository `ai-cyclone`.
4. Configure service settings:
   - **Name**: `vayu-backend`
   - **Language / Environment**: `Docker`
   - **Region**: `Singapore` (or nearest to Indian Ocean / Bay of Bengal)
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Context**: `backend`
   - **Instance Type**: Starter (512 MB – 1 GB RAM recommended for PyTorch models)
5. Add Environment Variables:
   - `PORT`: `8000`
   - `FIREBASE_PROJECT_ID`: `vayusat-live`
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: paste the complete service account JSON string
6. Click **Create Web Service**.

---

## 4. Custom Domain & DNS Configuration for `api.vayusat.live`

Once deployed on Render (or alternative PaaS):

1. In the Render Dashboard under **Settings** → **Custom Domains**, add:
   ```
   api.vayusat.live
   ```
2. In your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.):
   Add a `CNAME` record:
   - **Type**: `CNAME`
   - **Name / Host**: `api`
   - **Target / Value**: `<your-render-service-name>.onrender.com`
   - **TTL**: Auto / 300 seconds
   - **Proxy status** (if using Cloudflare): DNS Only (Grey Cloud) during initial verification, or Proxied (Orange Cloud) with Full (Strict) SSL.

Render will automatically provision and renew a Let's Encrypt SSL certificate for `https://api.vayusat.live`.

---

## 5. Verification Checklist After Deployment

Run these curl commands to verify the live deployment:

```bash
# 1. Health check (must return JSON status: ONLINE)
curl -i https://api.vayusat.live/api/health

# 2. Alerts listing
curl -i https://api.vayusat.live/api/alerts

# 3. Notification device registration test
curl -X POST https://api.vayusat.live/api/notifications/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "fcm_token": "dry_run_device_probe",
    "platform": "ANDROID",
    "device_name": "Deployment Verification Probe",
    "app_version": "1.0.0"
  }'

# 4. CORS verification from web portal
curl -I -X OPTIONS https://api.vayusat.live/api/alerts \
  -H "Origin: https://portal.vayusat.live" \
  -H "Access-Control-Request-Method: GET"
```

---

## 6. Updating Android App Base URL (After Deployment)

Once `https://api.vayusat.live/api/health` returns `200 OK` with JSON:

In [`android/app/src/main/java/live/vayusat/alerts/data/remote/VayuApiService.kt`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/android/app/src/main/java/live/vayusat/alerts/data/remote/VayuApiService.kt):
```kotlin
// Change from:
const val DEFAULT_BASE_URL = "http://10.0.2.2:8000"

// To:
const val DEFAULT_BASE_URL = "https://api.vayusat.live"
```
Rebuild and install the debug APK onto the physical Android test device.
