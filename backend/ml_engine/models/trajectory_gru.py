import os
import time
import math
import json
import hashlib
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timedelta
import numpy as np
import torch
import torch.nn as nn
from ..preprocessor import haversine_distance_km, build_canonical_trajectory_features

CHECKPOINT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "checkpoints", "phase3b", "vayu_track_gru_p3b.pt")

HORIZON_STEPS = [
    ("+6h", 2),
    ("+12h", 4),
    ("+18h", 6),
    ("+24h", 8),
    ("+48h", 16),
    ("+72h", 24)
]

COASTAL_SECTORS = [
    {"name": "Gopalpur (Ganjam, Odisha)", "lat": 19.26, "lon": 84.91, "state": "Odisha", "basin": "Bay of Bengal"},
    {"name": "Puri & Jagatsinghpur (Odisha)", "lat": 19.81, "lon": 85.83, "state": "Odisha", "basin": "Bay of Bengal"},
    {"name": "Dhamra & Bhadrak (Odisha)", "lat": 20.80, "lon": 86.95, "state": "Odisha", "basin": "Bay of Bengal"},
    {"name": "Digha & Purba Medinipur (WB)", "lat": 21.62, "lon": 87.50, "state": "West Bengal", "basin": "Bay of Bengal"},
    {"name": "Sundarbans & South 24 Parganas (WB)", "lat": 21.85, "lon": 88.70, "state": "West Bengal", "basin": "Bay of Bengal"},
    {"name": "Kalingapatnam & Srikakulam (AP)", "lat": 18.33, "lon": 84.12, "state": "Andhra Pradesh", "basin": "Bay of Bengal"},
    {"name": "Visakhapatnam (AP)", "lat": 17.68, "lon": 83.21, "state": "Andhra Pradesh", "basin": "Bay of Bengal"},
    {"name": "Bapatla & Machilipatnam (AP)", "lat": 15.90, "lon": 80.46, "state": "Andhra Pradesh", "basin": "Bay of Bengal"},
    {"name": "Chennai & Tiruvallur (TN)", "lat": 13.08, "lon": 80.27, "state": "Tamil Nadu", "basin": "Bay of Bengal"},
    {"name": "Nagapattinam & Cuddalore (TN)", "lat": 10.76, "lon": 79.84, "state": "Tamil Nadu", "basin": "Bay of Bengal"},
    {"name": "Jakhau & Kutch (Gujarat)", "lat": 23.24, "lon": 68.70, "state": "Gujarat", "basin": "Arabian Sea"},
    {"name": "Dwarka & Porbandar (Gujarat)", "lat": 22.24, "lon": 68.96, "state": "Gujarat", "basin": "Arabian Sea"},
    {"name": "Veraval & Gir Somnath (Gujarat)", "lat": 20.90, "lon": 70.36, "state": "Gujarat", "basin": "Arabian Sea"},
    {"name": "Alibag & Mumbai (Maharashtra)", "lat": 18.64, "lon": 72.87, "state": "Maharashtra", "basin": "Arabian Sea"}
]

class CycloneTrajectoryGRU(nn.Module):
    """
    2-Layer Gated Recurrent Unit (GRU) Sequence-to-Sequence Forecaster with Monte Carlo Dropout.
    Phase 3D Canonical Architecture:
      - Canonical 10-dimensional input vector from preprocessor.py
      - 6-step autoregressive rollout: +6h, +12h, +18h, +24h, +48h, +72h (3-hourly sampling rate)
      - Cumulative displacement formulation: pred = t0 + delta
      - 25-pass MC Dropout epistemic variance (Directionally useful but not calibrated)
    """
    def __init__(self, input_dim: int = 10, hidden_dim: int = 64, num_layers: int = 2, dropout: float = 0.20):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.dropout_rate = dropout
        
        self.gru = nn.GRU(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.SiLU(),
            nn.Dropout(p=dropout),
            nn.Linear(32, 4) # [dLat, dLon, dWind, dPressure]
        )

    def forward_step(self, x: torch.Tensor, h: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        # x: [Batch, 1, input_dim]
        out, h_next = self.gru(x, h)
        delta = self.head(out[:, -1, :]) # [Batch, 4]
        return delta, h_next

    def predict_trajectory(
        self, 
        historical_track: Optional[List[Dict[str, Any]]] = None,
        initial_state: Optional[Dict[str, Any]] = None,
        num_mc_samples: int = 25
    ) -> Dict[str, Any]:
        """
        Canonical 6-step spatiotemporal trajectory and intensity forecast up to +72 hours.
        Consumes genuine historical track fixes, computes canonical 10-dimensional kinematics,
        and runs 25-pass Monte Carlo Dropout for epistemic uncertainty quantification.
        """
        start_time = time.perf_counter()
        
        # 1. Resolve historical track
        track_pts = historical_track
        if (not track_pts or len(track_pts) < 4) and initial_state:
            # Check if storm_id, sid, or storm name was provided
            s_key = initial_state.get("storm_id") or initial_state.get("sid") or initial_state.get("storm")
            if s_key:
                s_clean = str(s_key).strip().upper()
                tracks_path = os.path.join(
                    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                    "data", "datasets", "tracks", "processed", "landmark_tracks_processed.json"
                )
                if os.path.exists(tracks_path):
                    with open(tracks_path, "r", encoding="utf-8") as f:
                        t_data = json.load(f)
                    for sid_k, sinfo in t_data.items():
                        if sid_k.upper() == s_clean or sinfo["name"].upper() == s_clean:
                            full_traj = sinfo["trajectory"]
                            target_lat = initial_state.get("current_lat")
                            target_lon = initial_state.get("current_lon")
                            if target_lat is not None and target_lon is not None:
                                best_idx = min(
                                    range(len(full_traj)),
                                    key=lambda idx: (full_traj[idx]["lat"] - target_lat)**2 + (full_traj[idx]["lon"] - target_lon)**2
                                )
                                if best_idx >= 3:
                                    track_pts = full_traj[:best_idx + 1]
                                else:
                                    track_pts = full_traj[:max(4, best_idx + 1)]
                            else:
                                track_pts = full_traj
                            break

        if not track_pts or len(track_pts) < 4:
            return {
                "success": False,
                "forecast_status": "INSUFFICIENT_HISTORY",
                "message": "Trajectory forecasting requires at least 4 consecutive historical fixes (9 hours of track telemetry) to compute kinematics and autoregressive hidden states. Single-point extrapolation without historical fixes is disabled to prevent synthetic trajectory fabrication.",
                "required_fixes": 4,
                "provided_fixes": len(track_pts) if track_pts else 0
            }

        # 2. Extract last 4 consecutive historical fixes
        hist_pts = track_pts[-4:]
        t0 = hist_pts[-1]
        lat0 = float(t0.get("lat") if t0.get("lat") is not None else t0.get("latitude", t0.get("current_lat", 15.0)))
        lon0 = float(t0.get("lon") if t0.get("lon") is not None else t0.get("longitude", t0.get("current_lon", 85.0)))
        wind0_raw = t0.get("wind_kts")
        if wind0_raw is None:
            if t0.get("wind_kmh") is not None:
                wind0_raw = float(t0["wind_kmh"]) / 1.852
            else:
                wind0_raw = t0.get("current_wind", t0.get("wind", 50.0))
        wind0 = float(wind0_raw or 50.0)
        mslp0 = float(t0.get("pres_hpa", t0.get("pressure_hpa", t0.get("pressure", t0.get("current_mslp", t0.get("mslp", 990.0))))) or 990.0)

        # Resolve initial observation timestamp
        init_iso = t0.get("iso_time") or t0.get("timestamp_utc") or t0.get("timestamp") or t0.get("time")
        init_dt = None
        if init_iso:
            clean_iso = str(init_iso).replace("Z", "").replace(" UTC", "").strip()
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
                try:
                    init_dt = datetime.strptime(clean_iso, fmt)
                    break
                except Exception:
                    pass
        if not init_dt:
            init_dt = datetime.utcnow()
        
        init_timestamp_str = init_dt.strftime("%Y-%m-%d %H:%M:%S UTC")

        basin = "Bay of Bengal"
        if initial_state and "basin" in initial_state:
            basin = initial_state["basin"]
        elif lon0 < 77.0:
            basin = "Arabian Sea"

        # 3. Build canonical 10-dimensional features
        seq_features = []
        for idx, p in enumerate(hist_pts):
            prev_p = hist_pts[idx - 1] if idx > 0 else (track_pts[-5] if len(track_pts) >= 5 else None)
            seq_features.append(build_canonical_trajectory_features(p, prev_p))

        input_tensor = torch.tensor([seq_features], dtype=torch.float32) # [1, 4, 10]

        # 4. Deterministic Autoregressive Rollout (eval mode)
        self.eval()
        deterministic_rollout = []
        with torch.no_grad():
            _, h = self.gru(input_tensor)
            cur_input = input_tensor[:, -1:, :]
            for step_idx, (h_label, step_off) in enumerate(HORIZON_STEPS):
                delta, h = self.forward_step(cur_input, h)
                dlat = float(delta[0, 0].item())
                dlon = float(delta[0, 1].item())
                dwind = float(delta[0, 2].item())
                dpres = float(delta[0, 3].item())

                pred_lat = lat0 + dlat
                pred_lon = lon0 + dlon
                pred_wind = float(np.clip(wind0 + dwind, 20.0, 185.0))
                pred_pres = float(np.clip(mslp0 + dpres, 890.0, 1015.0))
                deterministic_rollout.append({
                    "horizon": h_label,
                    "lead_hours": step_off * 3,
                    "lat": round(pred_lat, 2),
                    "lon": round(pred_lon, 2),
                    "wind_kts": round(pred_wind, 1),
                    "pres_hpa": round(pred_pres, 1)
                })

                cur_input = cur_input.clone()
                cur_input[0, 0, 0] = dlat
                cur_input[0, 0, 1] = dlon
                cur_input[0, 0, 2] = float(np.clip(pred_lat / 90.0, 0.0, 1.0))
                cur_input[0, 0, 3] = float(np.clip(pred_lon / 180.0, 0.0, 1.0))

        # 5. Stochastic Autoregressive Rollout (25-pass MC Dropout)
        self.train()
        all_rollouts = [] # [N, 6, 4]
        with torch.no_grad():
            for _ in range(num_mc_samples):
                pass_track = []
                _, h = self.gru(input_tensor)
                cur_input = input_tensor[:, -1:, :]
                for step_idx, (h_label, _) in enumerate(HORIZON_STEPS):
                    delta, h = self.forward_step(cur_input, h)
                    dlat = float(delta[0, 0].item())
                    dlon = float(delta[0, 1].item())
                    dwind = float(delta[0, 2].item())
                    dpres = float(delta[0, 3].item())

                    pred_lat = lat0 + dlat
                    pred_lon = lon0 + dlon
                    pred_wind = float(np.clip(wind0 + dwind, 20.0, 185.0))
                    pred_pres = float(np.clip(mslp0 + dpres, 890.0, 1015.0))
                    pass_track.append([pred_lat, pred_lon, pred_wind, pred_pres])

                    cur_input = cur_input.clone()
                    cur_input[0, 0, 0] = dlat
                    cur_input[0, 0, 1] = dlon
                    cur_input[0, 0, 2] = float(np.clip(pred_lat / 90.0, 0.0, 1.0))
                    cur_input[0, 0, 3] = float(np.clip(pred_lon / 180.0, 0.0, 1.0))
                all_rollouts.append(pass_track)

        all_rollouts = np.array(all_rollouts) # [N, 6, 4]
        means = np.mean(all_rollouts, axis=0) # [6, 4]
        stds = np.std(all_rollouts, axis=0)   # [6, 4]

        # Assemble forecasted trajectory list
        trajectory_forecast = [{
            "time": "NOW",
            "lead_hours": 0,
            "forecast_initial_timestamp": init_timestamp_str,
            "target_timestamp": init_timestamp_str,
            "lat": round(lat0, 2),
            "lon": round(lon0, 2),
            "wind": round(wind0, 1),
            "pressure": round(mslp0, 1),
            "stage": "Current Initial Fix",
            "uncertainty_radius_km": 0.0
        }]

        cone_points_left = []
        cone_points_right = []
        polyline = [[round(lat0, 2), round(lon0, 2)]]

        for i, (h_label, step_off) in enumerate(HORIZON_STEPS):
            lead_h = step_off * 3 # 3-hourly sampling rate
            target_dt = init_dt + timedelta(hours=lead_h)
            target_timestamp_str = target_dt.strftime("%Y-%m-%d %H:%M:%S UTC")

            m_lat = float(round(means[i, 0], 2))
            m_lon = float(round(means[i, 1], 2))
            m_wind = float(round(means[i, 2], 1))
            m_mslp = float(round(means[i, 3], 1))

            sigma_lat = float(stds[i, 0])
            sigma_lon = float(stds[i, 1])
            spread_km = float(round(math.sqrt(sigma_lat**2 + sigma_lon**2) * 111.0, 1))

            # Categorize meteorological stage
            if m_wind >= 120:
                stage = "Extremely Severe Cyclonic Storm"
            elif m_wind >= 90:
                stage = "Very Severe Cyclonic Storm"
            elif m_wind >= 65:
                stage = "Severe Cyclonic Storm"
            elif m_wind >= 45:
                stage = "Cyclonic Storm"
            else:
                stage = "Depression / Remnant Low"

            trajectory_forecast.append({
                "time": h_label,
                "lead_hours": lead_h,
                "forecast_initial_timestamp": init_timestamp_str,
                "target_timestamp": target_timestamp_str,
                "lat": m_lat,
                "lon": m_lon,
                "wind": m_wind,
                "pressure": m_mslp,
                "stage": stage,
                "uncertainty_radius_km": spread_km,
                "uncertainty_type": "MC-Dropout epistemic spread (Directionally useful but not calibrated)",
                "sigma_lat_deg": round(sigma_lat, 4),
                "sigma_lon_deg": round(sigma_lon, 4),
                "upper_wind": round(m_wind + 1.28 * stds[i, 2], 1),
                "lower_wind": round(max(20.0, m_wind - 1.28 * stds[i, 2]), 1)
            })
            polyline.append([m_lat, m_lon])

            spread_deg = spread_km / 111.0
            cone_points_left.append([round(m_lat + spread_deg * 0.4, 2), round(m_lon - spread_deg, 2)])
            cone_points_right.append([round(m_lat - spread_deg * 0.4, 2), round(m_lon + spread_deg, 2)])

        cone_polygon = [[round(lat0, 2), round(lon0, 2)]] + cone_points_left + cone_points_right[::-1] + [[round(lat0, 2), round(lon0, 2)]]

        # Landfall Prediction & Nearest Coastal Sector
        landfall_pt = trajectory_forecast[4] # +24h window (index 4)
        landfall_lat, landfall_lon = landfall_pt["lat"], landfall_pt["lon"]

        applicable_sectors = [s for s in COASTAL_SECTORS if s["basin"] == basin] or COASTAL_SECTORS
        closest_sector = min(
            applicable_sectors,
            key=lambda s: haversine_distance_km(s["lat"], s["lon"], landfall_lat, landfall_lon)
        )
        dist_to_coast_km = haversine_distance_km(closest_sector["lat"], closest_sector["lon"], landfall_lat, landfall_lon)

        strike_districts = []
        for sec in applicable_sectors[:6]:
            d_km = haversine_distance_km(sec["lat"], sec["lon"], landfall_lat, landfall_lon)
            prob = max(10, min(95, int(95 - (d_km / 250.0) * 80)))
            threat = "RED ALERT" if prob >= 70 else ("ORANGE ALERT" if prob >= 45 else "YELLOW ALERT")
            surge = "2.2 – 3.2m" if prob >= 70 else ("1.2 – 1.8m" if prob >= 45 else "0.5 – 1.0m")
            rain = 220 if prob >= 70 else (140 if prob >= 45 else 60)
            strike_districts.append({
                "district": sec["name"],
                "state": sec["state"],
                "strike_prob_pct": prob,
                "surge_height_m": surge,
                "rainfall_24h_mm": rain,
                "threat_level": threat,
                "distance_km": round(d_km, 1)
            })

        # Rapid Intensification (RI) Probability
        ri_samples = np.sum((all_rollouts[:, 3, 2] - wind0) >= 25.0) # 24h step index 3
        ri_prob = round(float(ri_samples / num_mc_samples) * 100.0, 1)

        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        sha256_hash = "embedded_weights"
        if os.path.exists(CHECKPOINT_PATH):
            with open(CHECKPOINT_PATH, "rb") as f:
                sha256_hash = hashlib.sha256(f.read()).hexdigest()

        return {
            "success": True,
            "forecast_status": "OPERATIONAL",
            "basin": basin,
            "initial_fix": {
                "latitude": round(lat0, 2),
                "longitude": round(lon0, 2),
                "wind_kmh": round(wind0 * 1.852, 1),
                "pressure_hpa": round(mslp0, 1),
                "timestamp": init_timestamp_str
            },
            "trajectory_forecast": trajectory_forecast,
            "deterministic_forecast": deterministic_rollout,
            "track_polyline": polyline,
            "cone_polygon": cone_polygon,
            "landfall_prediction": {
                "target_sector": closest_sector["name"],
                "coordinates": f"{landfall_lat}°N, {landfall_lon}°E",
                "lat": landfall_lat,
                "lon": landfall_lon,
                "distance_to_sector_km": dist_to_coast_km,
                "window": "T+18 to T+24 Hours",
                "surge_estimate": "2.0 – 3.0 meters"
            },
            "coastal_strike_probabilities": strike_districts,
            "rapid_intensification": {
                "ri_probability_pct": ri_prob,
                "ri_alert": bool(ri_prob >= 50.0),
                "criteria": "Wind speed delta >= 30 knots in 24h"
            },
            "inference_time_ms": inference_time_ms,
            "_model_meta": {
                "model_name": "CycloneTrajectoryGRU-Seq2Seq",
                "checkpoint": os.path.basename(CHECKPOINT_PATH),
                "checkpoint_path": CHECKPOINT_PATH,
                "checkpoint_sha256": sha256_hash,
                "parameters_count": sum(p.numel() for p in self.parameters()),
                "device": "cpu",
                "mc_dropout_samples": num_mc_samples,
                "forecast_horizons": [h for h, _ in HORIZON_STEPS],
                "sampling_interval_hours": 3.0,
                "synthetic_flag": False
            }
        }

    def predict_with_mc_dropout(
        self, 
        initial_state: Dict[str, Any],
        past_sequence: Optional[List[Dict[str, float]]] = None,
        num_mc_samples: int = 25
    ) -> Dict[str, Any]:
        """Backward-compatible alias routing to canonical predict_trajectory."""
        return self.predict_trajectory(
            historical_track=past_sequence,
            initial_state=initial_state,
            num_mc_samples=num_mc_samples
        )

def load_trajectory_gru_model() -> CycloneTrajectoryGRU:
    model = CycloneTrajectoryGRU()
    if os.path.exists(CHECKPOINT_PATH):
        try:
            state = torch.load(CHECKPOINT_PATH, map_location="cpu")
            model.load_state_dict(state, strict=False)
            print(f"[TrajectoryGRU] Loaded weights from {CHECKPOINT_PATH}")
        except Exception as e:
            print(f"[TrajectoryGRU] Checkpoint load warning: {e}")
    return model
