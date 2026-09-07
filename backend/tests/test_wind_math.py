"""
VAYU Wind Math Tests
====================
Verifies all wind vector mathematics in backend/routers/wind.py:
  - Speed formula
  - Meteorological FROM-direction convention
  - Particle travel direction convention
  - Unit conversions
  - NaN / Infinity rejection
  - Known cardinal and diagonal vectors

Run with:
    cd /path/to/ai-cyclone
    python -m pytest backend/tests/test_wind_math.py -v

No external dependencies required beyond stdlib + pytest.
"""

import math
import sys
import os
import pytest

# Allow discovery from project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.routers.wind import (
    compute_speed,
    compute_meteorological_direction,
    compute_particle_travel_direction,
    kmh_to_ms,
    ms_to_kmh,
    kmh_to_knots,
    validate_wind_value,
)

TOL = 1e-5  # floating-point comparison tolerance


# ─── Speed ────────────────────────────────────────────────────────────────────

class TestComputeSpeed:
    """Test 1: Wind speed magnitude = sqrt(u² + v²)"""

    def test_pure_eastward(self):
        assert abs(compute_speed(5.0, 0.0) - 5.0) < TOL

    def test_pure_westward(self):
        assert abs(compute_speed(-5.0, 0.0) - 5.0) < TOL

    def test_pure_northward(self):
        assert abs(compute_speed(0.0, 5.0) - 5.0) < TOL

    def test_pure_southward(self):
        assert abs(compute_speed(0.0, -5.0) - 5.0) < TOL

    def test_diagonal_ne(self):
        # u=3, v=4  → speed = 5 (3-4-5 right triangle)
        assert abs(compute_speed(3.0, 4.0) - 5.0) < TOL

    def test_diagonal_sw(self):
        assert abs(compute_speed(-3.0, -4.0) - 5.0) < TOL

    def test_zero_wind(self):
        assert compute_speed(0.0, 0.0) == 0.0

    def test_large_values(self):
        assert abs(compute_speed(100.0, 0.0) - 100.0) < TOL

    def test_speed_always_positive(self):
        assert compute_speed(-10.0, -10.0) > 0


# ─── Meteorological direction ─────────────────────────────────────────────────

class TestMeteorologicalDirection:
    """
    Test 2: met_dir = (atan2(-U, -V) * 180/pi + 360) % 360

    Direction FROM which wind blows:
      u>0, v=0  → wind blowing east  → FROM west  → 270°
      u<0, v=0  → wind blowing west  → FROM east  → 90°
      u=0, v>0  → wind blowing north → FROM south → 180°
      u=0, v<0  → wind blowing south → FROM north → 0°
    """

    def test_pure_eastward_from_west(self):
        """u=+5, v=0 → wind FROM West → 270°"""
        result = compute_meteorological_direction(5.0, 0.0)
        assert abs(result - 270.0) < TOL, f"Expected 270, got {result}"

    def test_pure_westward_from_east(self):
        """u=-5, v=0 → wind FROM East → 90°"""
        result = compute_meteorological_direction(-5.0, 0.0)
        assert abs(result - 90.0) < TOL, f"Expected 90, got {result}"

    def test_pure_northward_from_south(self):
        """u=0, v=+5 → wind FROM South → 180°"""
        result = compute_meteorological_direction(0.0, 5.0)
        assert abs(result - 180.0) < TOL, f"Expected 180, got {result}"

    def test_pure_southward_from_north(self):
        """u=0, v=-5 → wind FROM North → 0° (or 360°)"""
        result = compute_meteorological_direction(0.0, -5.0)
        # Should be exactly 0° (normalised)
        assert result < TOL or abs(result - 360.0) < TOL, f"Expected 0 or 360, got {result}"

    def test_diagonal_sw_from_ne(self):
        """u=+5, v=+5 → wind blowing NE → FROM SW → 225°"""
        result = compute_meteorological_direction(5.0, 5.0)
        assert abs(result - 225.0) < TOL, f"Expected 225, got {result}"

    def test_diagonal_ne_from_sw(self):
        """u=-5, v=-5 → wind blowing SW → FROM NE → 45°"""
        result = compute_meteorological_direction(-5.0, -5.0)
        assert abs(result - 45.0) < TOL, f"Expected 45, got {result}"

    def test_zero_wind_returns_0(self):
        result = compute_meteorological_direction(0.0, 0.0)
        assert result == 0.0

    def test_result_in_range(self):
        for u in [-10, -5, 0, 5, 10]:
            for v in [-10, -5, 0, 5, 10]:
                r = compute_meteorological_direction(float(u), float(v))
                assert 0.0 <= r < 360.0, f"Out of range [{r}] for u={u}, v={v}"


# ─── Particle travel direction ────────────────────────────────────────────────

class TestParticleTravelDirection:
    """
    Test 3: Particle travel direction = (atan2(U, V) * 180/pi + 360) % 360
    This is the TO direction — opposite of the meteorological FROM direction.
    """

    def test_eastward_travels_east(self):
        """u=+5, v=0 → particle travels east → 90°"""
        result = compute_particle_travel_direction(5.0, 0.0)
        assert abs(result - 90.0) < TOL, f"Expected 90, got {result}"

    def test_northward_travels_north(self):
        """u=0, v=+5 → particle travels north → 0°"""
        result = compute_particle_travel_direction(0.0, 5.0)
        assert result < TOL or abs(result - 360.0) < TOL, f"Expected 0 or 360, got {result}"

    def test_opposite_of_met_direction(self):
        """Travel direction should be 180° opposite of meteorological direction."""
        for u, v in [(5, 0), (-5, 0), (0, 5), (0, -5), (3, 4), (-7, 3)]:
            met = compute_meteorological_direction(float(u), float(v))
            travel = compute_particle_travel_direction(float(u), float(v))
            diff = abs(((travel - met) + 360) % 360 - 180.0)
            assert diff < TOL, (
                f"u={u}, v={v}: met={met:.1f}°, travel={travel:.1f}°, "
                f"expected difference of 180°, got {diff:.4f}°"
            )


# ─── Unit conversions ─────────────────────────────────────────────────────────

class TestUnitConversions:
    """Test 4: Verify km/h ↔ m/s ↔ knots conversions."""

    def test_kmh_to_ms(self):
        """1 km/h = 1/3.6 m/s"""
        assert abs(kmh_to_ms(3.6) - 1.0) < TOL
        assert abs(kmh_to_ms(36.0) - 10.0) < TOL
        assert abs(kmh_to_ms(0.0)) < TOL

    def test_ms_to_kmh(self):
        """1 m/s = 3.6 km/h"""
        assert abs(ms_to_kmh(1.0) - 3.6) < TOL
        assert abs(ms_to_kmh(10.0) - 36.0) < TOL

    def test_roundtrip_kmh_ms(self):
        for v in [0.0, 10.0, 50.0, 100.0]:
            assert abs(ms_to_kmh(kmh_to_ms(v)) - v) < TOL

    def test_kmh_to_knots(self):
        """1 knot = 1.852 km/h"""
        assert abs(kmh_to_knots(1.852) - 1.0) < TOL
        assert abs(kmh_to_knots(185.2) - 100.0) < TOL


# ─── Value validation ─────────────────────────────────────────────────────────

class TestValidateWindValue:
    """Test 5: NaN / Infinity / None rejection."""

    def test_valid_positive(self):
        assert validate_wind_value(10.5, "U", 15.0, 80.0) == pytest.approx(10.5)

    def test_valid_negative(self):
        assert validate_wind_value(-7.3, "V", 15.0, 80.0) == pytest.approx(-7.3)

    def test_valid_zero(self):
        assert validate_wind_value(0.0, "U", 0.0, 0.0) == pytest.approx(0.0)

    def test_valid_string_number(self):
        """API may return numbers as strings in some implementations."""
        assert validate_wind_value("12.5", "U", 0.0, 0.0) == pytest.approx(12.5)

    def test_nan_raises(self):
        with pytest.raises(ValueError, match="NaN"):
            validate_wind_value(float("nan"), "U", 15.0, 80.0)

    def test_positive_infinity_raises(self):
        with pytest.raises(ValueError, match="Infinity"):
            validate_wind_value(float("inf"), "V", 15.0, 80.0)

    def test_negative_infinity_raises(self):
        with pytest.raises(ValueError, match="Infinity"):
            validate_wind_value(float("-inf"), "U", 15.0, 80.0)

    def test_none_raises(self):
        with pytest.raises(ValueError, match="Missing"):
            validate_wind_value(None, "V", 10.0, 70.0)

    def test_non_numeric_string_raises(self):
        with pytest.raises(ValueError):
            validate_wind_value("not_a_number", "U", 0.0, 0.0)


# ─── End-to-end vector cases ──────────────────────────────────────────────────

class TestKnownVectors:
    """
    Test 6: Comprehensive known-vector verification.
    Ensures the chain: (U, V) → speed, met_dir, travel_dir is all correct.
    """

    # Exact diagonal angles: atan2(3,4)*180/pi = 36.8699...°
    # u=3,v=4: wind blowing in the direction of the vector (u>0, v>0 → NE quadrant)
    #   met_dir = atan2(-3,-4)*180/pi + 360 = 216.87°  (FROM SW → blowing NE)
    #   travel  = atan2( 3, 4)*180/pi + 360 = 36.87°
    _DIAG_ANGLE = 36.86989764584402  # arctan(3/4) in degrees

    CASES = [
        # (u,  v,   expected_speed, expected_met_dir,          expected_travel_dir,           label)
        ( 5.0, 0.0,  5.0,  270.0,                   90.0,                    "Pure eastward (FROM west)"),
        (-5.0, 0.0,  5.0,   90.0,                  270.0,                    "Pure westward (FROM east)"),
        ( 0.0, 5.0,  5.0,  180.0,                    0.0,                    "Pure northward (FROM south)"),
        ( 0.0,-5.0,  5.0,    0.0,                  180.0,                    "Pure southward (FROM north)"),
        # u=3,v=4: blowing NE  →  FROM SW  →  met 216.87°, travel 36.87°
        ( 3.0, 4.0,  5.0,  180.0 + _DIAG_ANGLE,   _DIAG_ANGLE,              "u=3,v=4 blowing NE (FROM SW)"),
        # u=-3,v=-4: blowing SW →  FROM NE  →  met 36.87°, travel 216.87°
        (-3.0,-4.0,  5.0,  _DIAG_ANGLE,            180.0 + _DIAG_ANGLE,     "u=-3,v=-4 blowing SW (FROM NE)"),
        ( 0.0, 0.0,  0.0,    0.0,                    0.0,                    "Zero wind (calm)"),
    ]

    @pytest.mark.parametrize("u,v,exp_speed,exp_met,exp_travel,label", CASES)
    def test_vector(self, u, v, exp_speed, exp_met, exp_travel, label):
        speed  = compute_speed(u, v)
        met    = compute_meteorological_direction(u, v)
        travel = compute_particle_travel_direction(u, v)

        assert abs(speed - exp_speed) < TOL, f"[{label}] speed: expected {exp_speed}, got {speed}"

        # Direction comparison — handle 0/360 wrap
        met_diff = min(abs(met - exp_met), 360 - abs(met - exp_met))
        assert met_diff < TOL, f"[{label}] met_dir: expected {exp_met}, got {met}"

        travel_diff = min(abs(travel - exp_travel), 360 - abs(travel - exp_travel))
        assert travel_diff < TOL, f"[{label}] travel_dir: expected {exp_travel}, got {travel}"
