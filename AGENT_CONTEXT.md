# PROJECT CONTEXT & AGENT HANDOFF: VAYU (AI CYCLONE INTELLIGENCE)

> **Document Purpose**: This file serves as a high-density operational brief and architectural state document for any AI coding assistant (or human developer) collaborating on this codebase. It documents what has been built, the multi-domain architecture, exact configurations, and prioritized next steps.

---

## 1. Project Overview

- **Project Name**: VAYU (National Cyclone Warning & AI Trajectory Prediction Platform)
- **Domain**: `autonex.studio`
- **Hosting**: Vercel (Frontend Single-Page App with multi-subdomain routing)
- **Authentication**: Clerk Pro Custom Domain (`auth.autonex.studio`)
- **Repository Type**: Monorepo with dedicated `frontend/` and `backend/`

---

## 2. Directory Structure

```
ai-cyclone/
├── frontend/                     # React 19 + Vite + Tailwind CSS Frontend
│   ├── public/                   # Static assets (vayu.png, earth textures)
│   ├── src/
│   │   ├── assets/               # CSS & asset bundles
│   │   ├── components/
│   │   │   ├── auth/             # ClerkAuth.jsx (Clerk Pro wrapper & ProtectedRoute guard)
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── data/                 # Coastal city and state risk databases
│   │   ├── pages/                # Public Portal & Command Dashboard page views
│   │   │   ├── Welcome.jsx       # Public Atlas / Landing Portal
│   │   │   ├── Login.jsx         # Officer Login Gateway (Credentials + Clerk SSO)
│   │   │   ├── Dashboard.jsx     # Main AI Operations Overview
│   │   │   ├── TrackMap.jsx      # 4D Spatiotemporal Cyclone Visualizer
│   │   │   ├── Satellite.jsx     # INSAT-3D/3DR Telemetry Ingestion
│   │   │   ├── Detection.jsx     # AI Eye Fixation & Vortex Center
│   │   │   ├── Classification.jsx# Advanced Dvorak Intensity Estimation
│   │   │   ├── Prediction.jsx    # 72-hour Trajectory Simulation Studio
│   │   │   ├── Alerts.jsx        # CAP Early Warning Directives
│   │   │   ├── Analytics.jsx     # Historical Storm Basin DB
│   │   │   ├── Performance.jsx   # AI Model Benchmarking
│   │   │   ├── Architecture.jsx  # Pipeline Technical Specifications
│   │   │   ├── CityTracker.jsx   # 100+ Coastal City Warning Directory
│   │   │   └── StateWeather.jsx  # State-level early warning advisories
│   │   ├── services/             # API connectors (api.js)
│   │   ├── utils/                # domain.js (subdomain routing logic)
│   │   ├── App.css
│   │   ├── App.jsx               # Smart Subdomain Router
│   │   ├── index.css             # Tailwind base & global styles
│   │   └── main.jsx              # ClerkProvider & Root Mounting
│   ├── index.html
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js
│   ├── vercel.json               # SPA client-side rewrite rules
│   ├── .oxlintrc.json
│   └── .env.example
│
├── backend/                      # Python FastAPI + ML Engine
│   ├── data/
│   ├── database/
│   ├── ml_engine/                # Cyclone trajectory and intensity models
│   ├── models/                   # Pydantic schemas
│   ├── routers/                  # API endpoints
│   ├── services/                 # Telemetry ingestion services
│   ├── utils/
│   ├── workers/                  # Background worker tasks
│   ├── main.py                   # FastAPI application entrypoint
│   └── run.py
│
├── package.json                  # Root monorepo scripts (delegates to frontend/)
├── vercel.json                   # Root Vercel deployment config
├── AGENT_CONTEXT.md              # This handoff file
├── .gitignore
└── README.md
```

---

## 3. Subdomain Architecture & Routing Logic

The application uses **one single Vercel deployment** to serve both the public website and the restricted command dashboard.

| Subdomain | Target / View | Auth Status | Managed By |
| :--- | :--- | :--- | :--- |
| `www.autonex.studio` | Public Cyclone Atlas & Warnings (`Welcome.jsx`, `CityTracker.jsx`, `StateWeather.jsx`) | Public | Vercel |
| `autonex.studio` (Apex) | Redirects to `www.autonex.studio` | Public | Vercel |
| `auth.autonex.studio` | Clerk Pro Custom SSO Domain (Sign In, Passkeys, Session Cookies) | Auth Gateway | Clerk Pro |
| `dept.autonex.studio`| Restricted MoES AI Command Platform (`Dashboard.jsx`, `TrackMap.jsx`, etc.) | Protected (Clerk) | Vercel (Same Project) |

### How Subdomain Routing Operates in Code:
- **`frontend/src/utils/domain.js`**:
  - Detects `window.location.hostname`.
  - Helper functions: `isDashboardSubdomain()`, `getWebsiteUrl()`, `getDashboardUrl()`, `getAuthUrl()`.
- **`frontend/src/App.jsx`**:
  - When accessed on **`dept.autonex.studio`**: The root `/` immediately maps to `<DashboardLayout><Dashboard /></DashboardLayout>`. Subroutes (`/track`, `/satellite`, `/alerts`, etc.) load the dashboard subpages wrapped in `<ProtectedRoute>`.
  - When accessed on **`www.autonex.studio`**: The root `/` maps to `<Welcome />`. Accessing `/dashboard` triggers an automatic redirect to `https://dept.autonex.studio`.
  - When running locally on **`localhost`**: Both `/` and `/dashboard/*` routes work seamlessly side-by-side.

---

## 4. What Has Already Been Done

1. **Repository Structure Overhaul**:
   - Organized root repository into clean `frontend/` and `backend/` directories.
   - Added root `package.json` with workspace delegation scripts (`npm run dev`, `npm run build`, `npm run preview`).
   - Added root `vercel.json` with build overrides (`cd frontend && npm install && npm run build` and `outputDirectory: "frontend/dist"`).

2. **Clerk Pro Integration**:
   - Installed `@clerk/clerk-react` in `frontend/`.
   - Created `frontend/src/components/auth/ClerkAuth.jsx`:
     - `<ProtectedRoute>`: Restricts dashboard access to authenticated Clerk users when `VITE_CLERK_PUBLISHABLE_KEY` is provided. If key is missing, provides an interactive local Demo Officer session banner.
     - `<OfficerAccountDisplay>`: Automatically displays real Clerk user name/email/avatar when authenticated, or officer identity in demo mode.
     - `<SafeSignOutButton>`: Logs user out via Clerk and returns them to `www.autonex.studio`.
   - Configured `frontend/src/main.jsx` with `<ClerkProvider>`.

3. **Login & Gateway Flow**:
   - Updated `frontend/src/pages/Welcome.jsx`: The topbar **"Officer Login"** button now opens the **Login Page** (`/login`).
   - Updated `frontend/src/pages/Login.jsx`: Officers can verify via the official Department Gateway or click **Sign In via Clerk Pro (`auth.autonex.studio`)**. Once authenticated, officers are redirected to `https://dept.autonex.studio`.

4. **Domain Connection (In Progress by User)**:
   - `www.autonex.studio` is already connected to the Vercel project and working.

---

## 5. What Needs to Be Done Next (Action Items for User / AI Agent)

### A. Vercel Project Setup (Department Subdomain)
- [ ] In Vercel Dashboard -> Go to the **current project** (where `www.autonex.studio` is connected).
- [ ] Navigate to **Settings** -> **Domains**.
- [ ] Click **Add Domain** and enter:
  ```
  dept.autonex.studio
  ```
  *(Important: Do NOT create a new project. Add it to the existing project).*
- [ ] In your DNS manager (GoDaddy, Cloudflare, etc.), add the CNAME record:
  - **Type**: `CNAME`
  - **Name**: `dept`
  - **Value**: `cname.vercel-dns.com`

### B. Clerk Pro Custom Domain Setup (`auth.autonex.studio`)
- [ ] In [Clerk Dashboard](https://dashboard.clerk.com/):
  - Go to **Configure** -> **Domains**.
  - Add Custom Domain: `auth.autonex.studio`.
  - Copy the CNAME records provided by Clerk (e.g. `auth` pointing to `frontend-api.clerk.services`).
  - Add these CNAME and verification records to your DNS manager.
- [ ] In Clerk Dashboard -> **Configure** -> **Paths & Redirects**:
  - **Sign-in Redirect URL**: `https://dept.autonex.studio`
  - **Sign-out Redirect URL**: `https://www.autonex.studio`
  - **Cookie Domain**: `.autonex.studio` *(Critical: This shares the session across `auth`, `dept`, and `www`)*.
  - **Allowed Origins**:
    - `https://www.autonex.studio`
    - `https://dept.autonex.studio`
    - `http://localhost:5173`

### C. Set Environment Variables
- [ ] In Vercel Project Settings -> **Environment Variables**:
  - Add `VITE_CLERK_PUBLISHABLE_KEY` with your live key (`pk_live_...`).
  - Trigger a redeployment.
- [ ] In local development:
  - Add `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...` in `frontend/.env`.

### D. Backend Deployment & API Integration
- [ ] Currently, the frontend has mock and dynamic telemetry in `frontend/src/services/api.js`.
- [ ] Next step: Deploy the Python backend (`backend/main.py`) to a hosting platform (e.g., Render, Railway, Fly.io, or AWS).
- [ ] Set `VITE_API_URL` in `frontend/.env` to point to the live backend URL.

---

## 6. How to Run Locally

```bash
# Clone and enter repo
cd ai-cyclone

# Install frontend dependencies
npm run install:frontend

# Start frontend development server
npm run dev

# Build frontend production bundle
npm run build

# Start Python backend (in separate terminal)
python backend/main.py
```

---

## 7. Key Files Quick Reference

- **Subdomain Routing Engine**: [`frontend/src/App.jsx`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/frontend/src/App.jsx)
- **Domain Utilities**: [`frontend/src/utils/domain.js`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/frontend/src/utils/domain.js)
- **Clerk Pro Auth Guard**: [`frontend/src/components/auth/ClerkAuth.jsx`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/frontend/src/components/auth/ClerkAuth.jsx)
- **Officer Login Gateway**: [`frontend/src/pages/Login.jsx`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/frontend/src/pages/Login.jsx)
- **Public Portal / Landing**: [`frontend/src/pages/Welcome.jsx`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/frontend/src/pages/Welcome.jsx)
- **Monorepo Build Config**: [`vercel.json`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/vercel.json) & [`package.json`](file:///Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My%20Drive/Tahoe/Documents/ai-cyclone/package.json)
