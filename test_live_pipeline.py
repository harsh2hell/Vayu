import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_pipeline_storm(storm_name, config):
    print(f"\n{'='*70}\nTESTING LIVE AI PIPELINE: {storm_name}\n{'='*70}")
    results = {}
    
    # 1. Satellite + Detection + Classification + Grad-CAM
    t0 = time.time()
    try:
        req_data = json.dumps(config["satellite"]).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/v1/satellites/download-real-snapshot",
            data=req_data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            sat_ms = round((time.time() - t0) * 1000, 1)
            results["satellite"] = "PASS" if data.get("success") else "FAILED"
            
            # Detection
            det = data.get("detection", {})
            det_ok = det.get("cyclone_detected") is not None and "coordinates" in det
            results["detection"] = "PASS" if det_ok else "FAILED"
            results["detection_details"] = f"fix={det.get('coordinates', {}).get('formatted')}, conf={det.get('confidence_percentage')}%, lat_ms={det.get('inference_time_ms')}"
            
            # Morphology
            cls = data.get("classification", {})
            cls_ok = "predicted_pattern" in cls and "class_probability_distribution" in cls
            results["morphology"] = "PASS" if cls_ok else "FAILED"
            results["morphology_details"] = f"pattern={cls.get('predicted_pattern')}, conf={cls.get('confidence_percentage')}%, lat_ms={cls.get('inference_time_ms')}"
            
            # Grad-CAM
            foci = cls.get("gradcam_attention_foci", [])
            results["grad_cam"] = "PASS" if len(foci) > 0 else "FAILED"
            results["grad_cam_details"] = f"{len(foci)} attention regions"
            
            print(f"[Stage 1: SATELLITE]      {results['satellite']} ({sat_ms} ms total)")
            print(f"[Stage 2: DETECTION]      {results['detection']} -> {results['detection_details']}")
            print(f"[Stage 3: MORPHOLOGY]     {results['morphology']} -> {results['morphology_details']}")
            print(f"[Stage 4: GRAD-CAM]       {results['grad_cam']} -> {results['grad_cam_details']}")
    except Exception as e:
        print(f"[Satellite/Vision ERROR]: {e}")
        results["satellite"] = "FAILED"
        results["detection"] = "FAILED"
        results["morphology"] = "FAILED"
        results["grad_cam"] = "FAILED"

    # 2. Trajectory + Uncertainty + Impact
    t1 = time.time()
    try:
        req_data = json.dumps(config["trajectory"]).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/predict-track",
            data=req_data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            traj_data = json.loads(resp.read().decode("utf-8"))
            traj_ms = round((time.time() - t1) * 1000, 1)
            t_res = traj_data.get("data", {})
            
            forecast = t_res.get("trajectory_forecast", [])
            horizons = [f.get("time") for f in forecast]
            results["trajectory"] = "PASS" if len(forecast) >= 6 else "FAILED"
            results["trajectory_details"] = f"{len(forecast)} waypoints ({', '.join(horizons)})"
            
            cone = t_res.get("cone_polygon", [])
            outer = t_res.get("outer_cone_polygon", [])
            results["uncertainty"] = "PASS" if len(cone) > 0 else "FAILED"
            results["uncertainty_details"] = f"25 MC passes, cone={len(cone)} pts, outer={len(outer)} pts"
            
            districts = t_res.get("coastal_strike_probabilities", []) or t_res.get("impact_assessment", {}).get("critical_districts", [])
            landfall = t_res.get("landfall_prediction", {})
            results["impact"] = "PASS" if len(districts) > 0 and "target_sector" in landfall else "FAILED"
            results["impact_details"] = f"sector={landfall.get('target_sector')}, {len(districts)} critical districts ({', '.join([d.get('district') or d.get('name') for d in districts[:3]])})"
            
            print(f"[Stage 5: TRAJECTORY]     {results['trajectory']} ({traj_ms} ms) -> {results['trajectory_details']}")
            print(f"[Stage 6: UNCERTAINTY]    {results['uncertainty']} -> {results['uncertainty_details']}")
            print(f"[Stage 7: IMPACT]         {results['impact']} -> {results['impact_details']}")
    except Exception as e:
        print(f"[Trajectory ERROR]: {e}")
        results["trajectory"] = "FAILED"
        results["uncertainty"] = "FAILED"
        results["impact"] = "FAILED"

    # 3. Bulletin PDF Generation
    t2 = time.time()
    try:
        req_data = json.dumps(config["bulletin"]).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/generate-bulletin",
            data=req_data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            pdf_bytes = resp.read()
            pdf_ms = round((time.time() - t2) * 1000, 1)
            is_valid_pdf = pdf_bytes.startswith(b"%PDF")
            results["bulletin"] = "PASS" if is_valid_pdf else "FAILED"
            results["bulletin_details"] = f"{len(pdf_bytes)} bytes PDF generated in {pdf_ms} ms"
            print(f"[Stage 8: BULLETIN]       {results['bulletin']} -> {results['bulletin_details']}")
    except Exception as e:
        print(f"[Bulletin ERROR]: {e}")
        results["bulletin"] = "FAILED"
        
    return results

if __name__ == "__main__":
    dana_config = {
        "satellite": {
            "source": "NASA_GIBS",
            "layer": "VIIRS_SNPP_CorrectedReflectance_TrueColor",
            "min_lat": 8.0, "min_lon": 75.0, "max_lat": 23.0, "max_lon": 95.0,
            "date_str": "2024-10-24", "basin": "Bay of Bengal"
        },
        "trajectory": {
            "current_lat": 18.2, "current_lon": 88.5, "current_wind": 110.0,
            "current_mslp": 970.0, "sst": 29.8, "vertical_shear_knots": 11.5,
            "basin": "Bay of Bengal", "storm_id": "DANA"
        },
        "bulletin": {
            "cyclone_name": "Severe Cyclonic Storm DANA",
            "basin": "Bay of Bengal",
            "category": "Severe Cyclonic Storm",
            "latitude": 18.2, "longitude": 88.5,
            "wind_speed_kmh": 110.0, "central_mslp_hpa": 970.0
        }
    }

    biparjoy_config = {
        "satellite": {
            "source": "NASA_GIBS",
            "layer": "MODIS_Aqua_CorrectedReflectance_TrueColor",
            "min_lat": 15.0, "min_lon": 62.0, "max_lat": 26.0, "max_lon": 75.0,
            "date_str": "2023-06-14", "basin": "Arabian Sea"
        },
        "trajectory": {
            "current_lat": 19.5, "current_lon": 67.2, "current_wind": 125.0,
            "current_mslp": 960.0, "sst": 31.0, "vertical_shear_knots": 10.0,
            "basin": "Arabian Sea", "storm_id": "BIPARJOY"
        },
        "bulletin": {
            "cyclone_name": "Extremely Severe Cyclonic Storm BIPARJOY",
            "basin": "Arabian Sea",
            "category": "Extremely Severe Cyclonic Storm",
            "latitude": 19.5, "longitude": 67.2,
            "wind_speed_kmh": 125.0, "central_mslp_hpa": 960.0
        }
    }

    res_dana = test_pipeline_storm("CYCLONE DANA (2024, Bay of Bengal)", dana_config)
    res_biparjoy = test_pipeline_storm("CYCLONE BIPARJOY (2023, Arabian Sea)", biparjoy_config)

    print("\n" + "="*70)
    print("FINAL SUMMARY REPORT FOR SIH PIPELINE")
    print("="*70)
    stages = ["satellite", "detection", "morphology", "grad_cam", "trajectory", "uncertainty", "impact", "bulletin"]
    print(f"{'Stage':<16} | {'DANA Status':<12} | {'BIPARJOY Status':<15}")
    print("-" * 50)
    for s in stages:
        print(f"{s:<16} | {res_dana.get(s, 'N/A'):<12} | {res_biparjoy.get(s, 'N/A'):<15}")
