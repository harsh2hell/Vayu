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
    │   https://portal.vayusat.live     │
    │   (Vercel SPA + Clerk)    │       │
    └─────────────┬─────────────┘       │
                  │ Fetch (CORS)        │
                  └─────────────────────┼────────────────────────┐
                                        │                        │
                                        ▼                        ▼
                          ┌───────────────────────────┐    ┌───────────┐
                          │   FastAPI Gateway         │    │ Cloud Run │
                          │   (Render Standard 2GB    │ or │ / Koyeb   │
                          │    or Koyeb Micro 1GB)    │    │ 1GB+      │
                          └─────────────┬─────────────┘    └───────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │ PyTorch DL Models │      │ Supabase Postgre- │      │ Firebase FCM HTTP │
   │ (MobileNetV3,     │      │ SQL (13 Tables,   │      │ v1 Dispatch       │
   │  ResNet18, GRU)   │      │ Transaction Pool) │      │ (OAuth2 Service)  │
   │ [CPU-Only Wheels] │      │                   │      │                   │
   └───────────────────┘      └───────────────────┘      └───────────────────┘
```

| Component | Production Architecture |
| :--- | :--- |
| **Frontend** | [https://portal.vayusat.live](https://portal.vayusat.live) (React 19 + Vite SPA on Vercel) |
| **Backend API** | [https://api.vayusat.live](https://api.vayusat.live) (FastAPI + Uvicorn) |
| **Database** | Supabase PostgreSQL (`hrnhvhaxhhtikcatsaoe`) via Transaction Pooler |
| **Runtime** | Python 3.9 + Uvicorn + CPU-only PyTorch (`--index-url https://download.pytorch.org/whl/cpu`) |
| **Authentication** | Clerk (`https://login.vayusat.live` / `@clerk/clerk-react`) |
| **Push Notifications** | Firebase Cloud Messaging (FCM HTTP v1 via Google OAuth2 service account) |
| **AI Synthesis** | Puter.js / Google Gemma for conversational cyclone intelligence |
| **Scientific Inference** | Genuine PyTorch checkpoints: MobileNetV3 (Center), ResNet18 (Morphology), GRU (Trajectory) |

---

## 1. Hardware & Memory Requirements

> [!CRITICAL]
> **512 MB Instances Are UNSAFE**:
> Empirical Phase 6B memory profiling established that while idle startup consumes ~342 MB, authentic ResNet18 forward evaluation and Grad-CAM backpropagation peak at **540.42 MB RSS**. Deploying on a 512 MB free tier will result in deterministic `SIGKILL 137` (Out of Memory) crashes during classification requests.
>
> **Recommended Minimum Hardware**:
> - **RAM**: **1 GB (1024 MB)** minimum recommended (e.g., Render Standard 2GB, Koyeb Micro 1GB, Fly.io 1GB, or Railway 1GB).
> - **CPU**: 1 vCPU (single-threaded PyTorch execution configured via `torch.set_num_threads(1)`).

---

## 2. Environment Variables Checklist

Configure these environment variables in your cloud deployment dashboard (e.g. Render Dashboard, Koyeb Secrets, or Cloud Run):

### Required Production Secrets (Dashboard Only — Never Commit Plaintext)
| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Supabase PostgreSQL transaction connection pooler URI (`postgresql://postgres.[project]:[pwd]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`). |
| `FIREBASE_PROJECT_ID` | `vayusat-live` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full JSON content string of the Firebase service account credential file. |

### Recommended Production Settings
| Variable | Default / Value | Description |
| :--- | :--- | :--- |
| `VAYU_ENV` | `production` | Enables strict production CORS whitelist and disables development-only endpoints. |
| `CORS_ORIGINS` | `https://portal.vayusat.live,https://www.vayusat.live,https://vayusat.live` | Permitted browser origins. |
| `DB_POOL_MIN_SIZE` | `1` | Minimum persistent PostgreSQL connections in connection pool. |
| `DB_POOL_MAX_SIZE` | `3` | Maximum connections allowed to prevent exceeding Supabase connection limits. |
| `HOST` | `0.0.0.0` | Bound network interface. |
| `PORT` | `8000` | Cloud dynamic container port (injected automatically by Render/Koyeb). |
| `RELOAD` | `false` | Must remain `false` in production. |

### Optional
| Variable | Description |
| :--- | :--- |
| `WINDY_API_KEY` | Optional point-telemetry key for marine wind observation overlays. |
| `USE_SQLITE` | Emergency rollback switch only (`true`). When omitted, backend uses PostgreSQL. |

---

## 3. Docker Container Deployment

The backend uses a self-contained multi-stage `backend/Dockerfile` with official CPU-only PyTorch wheels.

### Build & Run Locally (for container validation)
```bash
# Build the CPU-only container image (~450 MB)
docker build -t vayu-fastapi:latest -f backend/Dockerfile backend

# Run with PostgreSQL connection
docker run -d \
  -p 8000:8000 \
  -e PORT=8000 \
  -e VAYU_ENV=production \
  -e DATABASE_URL='postgresql://postgres.[id]:[pwd]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' \
  -e FIREBASE_PROJECT_ID=vayusat-live \
  -e FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}' \
  --name vayu-api \
  vayu-fastapi:latest

# Verify orchestrator liveness probe
curl -s http://127.0.0.1:8000/health

# Verify deep readiness probe
curl -s http://127.0.0.1:8000/api/health
```

---

## 4. Render Blueprint Deployment

Render provides automated SSL, Docker builds, and custom domain management:

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints** → **New Blueprint Instance** and connect the `ai-cyclone` repository (or create a Web Service using `render.yaml`).
3. Under **Secret Environment Variables**, add:
   - `DATABASE_URL` = *(Your Supabase connection pooler URI)*
   - `FIREBASE_SERVICE_ACCOUNT_KEY` = *(Firebase Service Account JSON string)*
   - `WINDY_API_KEY` = *(Optional)*
4. Ensure the plan is set to **Standard** (2 GB RAM) to safely host the PyTorch inference models without memory exhaustion.
5. Deploy the service.

---

## 5. Custom Domain & DNS Setup (`api.vayusat.live`)

1. In Render Dashboard under **Settings** → **Custom Domains**, add:
   ```
   api.vayusat.live
   ```
2. In your DNS provider (Cloudflare, Namecheap, etc.):
   Add a `CNAME` record:
   - **Type**: `CNAME`
   - **Name / Host**: `api`
   - **Target / Value**: `<your-render-service>.onrender.com`
   - **TTL**: Auto (or 300 seconds)
   - **Proxy**: DNS Only during domain verification.
3. Render automatically provisions a Let's Encrypt SSL certificate for `https://api.vayusat.live`.

---

## 6. Pre-Flight Verification Commands

Run these verification probes against the deployed API:

```bash
# 1. Lightweight Orchestrator Liveness (instant, 0 DB queries, 0 ML loads)
curl -i https://api.vayusat.live/health

# 2. Deep Application & PostgreSQL Pool Readiness
curl -i https://api.vayusat.live/api/health

# 3. Active Cyclone Alerts
curl -i https://api.vayusat.live/api/alerts

# 4. Production CORS Headers Probe
curl -I -X OPTIONS https://api.vayusat.live/api/alerts \
  -H "Origin: https://portal.vayusat.live" \
  -H "Access-Control-Request-Method: GET"

# 5. Push Notification Device Probe (Dry Run)
curl -X POST https://api.vayusat.live/api/notifications/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "probe-test-device",
    "fcm_token": "probe-dry-run-token",
    "platform": "android",
    "device_name": "Cloud Deployment Health Probe",
    "app_version": "1.0.0"
  }'
```

---

## 7. Android Client Configuration

Once `https://api.vayusat.live/health` is live, update the Android app configuration in:
[`android/app/src/main/java/live/vayusat/alerts/data/remote/VayuApiService.kt`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/android/app/src/main/java/live/vayusat/alerts/data/remote/VayuApiService.kt):
```kotlin
// Switch from local emulator to production API:
const val DEFAULT_BASE_URL = "https://api.vayusat.live"
```
Rebuild and install the debug APK.
