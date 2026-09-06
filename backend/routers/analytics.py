from fastapi import APIRouter, Query
from typing import Dict, Any, List
from ..database.db_manager import db

router = APIRouter(prefix="/api/v1/analytics", tags=["Model Registry & Analytics"])

@router.get("/models")
def get_ai_models_registry():
    """Returns registered deep learning models, architecture backbones, and benchmark metrics."""
    models = db.get_registered_models()
    return {
        "success": True,
        "count": len(models),
        "models": models
    }

@router.get("/inferences")
def get_inference_history(limit: int = Query(20, ge=1, le=100)):
    """Returns persistent AI inference audit logs from SQLite storage."""
    logs = db.get_recent_inferences(limit=limit)
    return {
        "success": True,
        "count": len(logs),
        "logs": logs
    }

@router.get("/benchmarks")
def get_system_benchmarks():
    """Returns validated meteorological model accuracy metrics, MAE error curves, and inference latencies."""
    return {
        "success": True,
        "phase": "Phase 3B Real Benchmark (Scientific Validation)",
        "scientific_disclosure": "Prototype measurement — insufficient sample size for generalization claim.",
        "benchmark_summary": {
            "identification_cnn": {
                "name": "MobileNetV3-Small-CenterFix (Phase 3B)",
                "accuracy_pct": 100.0,
                "eye_error_km": 52.33,
                "validation_error_km": 25.65,
                "precision": 1.0,
                "recall": 1.0,
                "f1_score": 1.0,
                "calm_false_positive_rate": 0.0,
                "latency_ms": 41.2
            },
            "classification_vit": {
                "name": "ResNet18-Dvorak-Morphology (Phase 3B Prototype)",
                "classes_count": 4,
                "classes_authenticated": ["Eye", "Curved Band", "Shear", "Calm"],
                "classes_insufficient": ["CDO", "Embedded Center"],
                "validation_accuracy_pct": 50.0,
                "test_accuracy_pct": 0.0,
                "macro_f1": 0.0,
                "note": "Prototype model with severe class imbalance (N=14 train). Generalization across unseen test storms is unachieved.",
                "latency_ms": 41.8
            },
            "prediction_lstm": {
                "name": "CycloneTrajectoryGRU-Seq2Seq (Phase 3D Retrained)",
                "sampling_interval_hours": 3.0,
                "track_mae_6h_km": 68.9,
                "track_mae_12h_km": 114.9,
                "track_mae_18h_km": 158.9,
                "track_mae_24h_km": 197.7,
                "track_mae_48h_km": 278.7,
                "track_mae_72h_km": 311.9,
                "persistence_baseline_24h_km": 110.9,
                "persistence_baseline_72h_km": 397.9,
                "gru_vs_persistence_72h_winner": "GRU (Outperforms Persistence Baseline by 86.0 km)",
                "overall_test_mae_km": 178.5,
                "obsolete_phase3b_metrics": {
                    "status": "OBSOLETE — INCORRECT 3-HOUR/6-HOUR LABELING",
                    "old_reported_6h_km": 40.6,
                    "old_reported_24h_km": 96.9,
                    "old_reported_72h_km": 203.2
                },
                "latency_ms": 22.3
            }
        }
    }
