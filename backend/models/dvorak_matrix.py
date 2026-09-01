"""
Empirical Meteorological Dvorak Technique Lookup & Conversion Tables
Complies with India Meteorological Department (IMD) & WMO standards.
"""

DVORAK_T_TABLE = [
    {"t_num": "T1.0", "ci_num": 1.0, "wind_knots": 25, "wind_kmh": 45, "mslp_drop": 2.0, "category": "Tropical Disturbance"},
    {"t_num": "T1.5", "ci_num": 1.5, "wind_knots": 28, "wind_kmh": 52, "mslp_drop": 3.5, "category": "Tropical Depression"},
    {"t_num": "T2.0", "ci_num": 2.0, "wind_knots": 30, "wind_kmh": 55, "mslp_drop": 5.0, "category": "Deep Depression"},
    {"t_num": "T2.5", "ci_num": 2.5, "wind_knots": 35, "wind_kmh": 65, "mslp_drop": 8.0, "category": "Cyclonic Storm"},
    {"t_num": "T3.0", "ci_num": 3.0, "wind_knots": 45, "wind_kmh": 85, "mslp_drop": 13.0, "category": "Cyclonic Storm"},
    {"t_num": "T3.5", "ci_num": 3.5, "wind_knots": 55, "wind_kmh": 100, "mslp_drop": 19.0, "category": "Severe Cyclonic Storm"},
    {"t_num": "T4.0", "ci_num": 4.0, "wind_knots": 65, "wind_kmh": 120, "mslp_drop": 27.0, "category": "Very Severe Cyclonic Storm"},
    {"t_num": "T4.5", "ci_num": 4.5, "wind_knots": 77, "wind_kmh": 140, "mslp_drop": 37.0, "category": "Very Severe Cyclonic Storm"},
    {"t_num": "T5.0", "ci_num": 5.0, "wind_knots": 90, "wind_kmh": 165, "mslp_drop": 50.0, "category": "Extremely Severe Cyclonic Storm"},
    {"t_num": "T5.5", "ci_num": 5.5, "wind_knots": 102, "wind_kmh": 190, "mslp_drop": 63.0, "category": "Extremely Severe Cyclonic Storm"},
    {"t_num": "T6.0", "ci_num": 6.0, "wind_knots": 115, "wind_kmh": 215, "mslp_drop": 78.0, "category": "Super Cyclonic Storm"},
    {"t_num": "T6.5", "ci_num": 6.5, "wind_knots": 127, "wind_kmh": 235, "mslp_drop": 94.0, "category": "Super Cyclonic Storm"},
    {"t_num": "T7.0", "ci_num": 7.0, "wind_knots": 140, "wind_kmh": 260, "mslp_drop": 112.0, "category": "Super Cyclonic Storm"},
]

def estimate_dvorak_parameters(spiral_curvature_deg: float, cdo_temperature_c: float, environmental_pressure: float = 1008.0):
    """
    Estimates Dvorak T-number, Central Pressure (MSLP), and Maximum Sustained Winds
    based on satellite-derived cloud curvature and cloud top temperature.
    """
    # Cloud top temperature coldness factor
    coldness_factor = max(0.0, min(1.0, (-cdo_temperature_c - 30.0) / 50.0))
    # Curvature factor (0 to 360 degrees of wrapping)
    curvature_factor = max(0.0, min(1.0, spiral_curvature_deg / 360.0))
    
    combined_score = 0.5 * coldness_factor + 0.5 * curvature_factor
    index = int(combined_score * (len(DVORAK_T_TABLE) - 1))
    index = max(0, min(len(DVORAK_T_TABLE) - 1, index))
    
    spec = DVORAK_T_TABLE[index]
    estimated_mslp = round(environmental_pressure - spec["mslp_drop"], 1)
    
    return {
        "t_number": spec["t_num"],
        "ci_number": spec["ci_num"],
        "category": spec["category"],
        "wind_speed_kmh": spec["wind_kmh"],
        "wind_speed_knots": spec["wind_knots"],
        "estimated_mslp_hpa": estimated_mslp,
        "mslp_deficit_hpa": spec["mslp_drop"]
    }
