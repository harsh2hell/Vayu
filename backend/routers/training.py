import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from ..ml_engine.train_pipeline import training_pipeline, CHECKPOINTS_DIR
from ..ml_engine.uncertainty_lstm import uncertainty_lstm_model
from ..ml_engine.netcdf_loader import NOAANetCDFDataset
from ..ml_engine.auto_stream_pipeline import auto_stream_trainer

router = APIRouter(prefix="/api/v1/ml", tags=["Deep Learning & NetCDF Training Engine"])

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "netcdf_uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

class TrainRequest(BaseModel):
    dataset_path: Optional[str] = None
    epochs: int = 5
    batch_size: int = 4

class UncertaintyPredictRequest(BaseModel):
    lat: float = 15.4
    lon: float = 87.8
    wind: float = 85.0
    mslp: float = 980.0
    sst: float = 29.8
    shear: float = 12.0
    basin: str = "Bay of Bengal"
    num_mc_samples: int = 50

class AutoStreamConfigRequest(BaseModel):
    source_type: str = "LOCAL_DIR" # "LOCAL_DIR" or "REMOTE_URL"
    target: str = "~/Downloads"     # e.g., "/path/to/thousands_of_nc_files" or "https://www.ncei.noaa.gov/..."

class DaemonToggleRequest(BaseModel):
    enabled: bool = True
    poll_interval_seconds: int = 30

@router.post("/upload-netcdf")
async def upload_noaa_netcdf_file(file: UploadFile = File(...)):
    """Uploads a single NOAA NetCDF (.nc) file."""
    if not file.filename.endswith('.nc'):
        raise HTTPException(status_code=400, detail="Only .nc (NetCDF) scientific files are supported")
    
    file_path = os.path.join(UPLOADS_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "success": True,
        "filename": file.filename,
        "saved_location": file_path,
        "size_bytes": os.path.getsize(file_path),
        "message": "NetCDF file uploaded successfully. Ready for DL training & feature extraction."
    }

@router.get("/uploaded-netcdf-files")
def list_uploaded_netcdf_files():
    """Lists all uploaded NOAA NetCDF (.nc) scientific data files available on the server."""
    files = []
    if os.path.exists(UPLOADS_DIR):
        for f in os.listdir(UPLOADS_DIR):
            if f.endswith('.nc'):
                fp = os.path.join(UPLOADS_DIR, f)
                files.append({
                    "filename": f,
                    "filepath": fp,
                    "size_mb": round(os.path.getsize(fp) / (1024 * 1024), 2)
                })
    return {
        "success": True,
        "count": len(files),
        "files": files,
        "storage_dir": UPLOADS_DIR
    }

@router.post("/train")
def train_deep_learning_models(req: TrainRequest):
    """Executes end-to-end PyTorch training across CNN, ViT, and BiLSTM."""
    target_path = req.dataset_path or UPLOADS_DIR
    try:
        result = training_pipeline.train_models_on_netcdf(
            nc_dataset_path=target_path,
            epochs=req.epochs,
            batch_size=req.batch_size
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training pipeline error: {str(e)}")

@router.post("/predict-uncertainty")
def predict_with_bayesian_uncertainty(req: UncertaintyPredictRequest):
    """Runs Monte Carlo Dropout (N=50 passes) on Physics-Informed BiLSTM."""
    try:
        result = uncertainty_lstm_model.predict_with_monte_carlo_uncertainty(
            initial_state={
                "lat": req.lat,
                "lon": req.lon,
                "wind": req.wind,
                "mslp": req.mslp,
                "sst": req.sst,
                "shear": req.shear,
                "basin": req.basin
            },
            num_mc_samples=req.num_mc_samples
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Uncertainty prediction error: {str(e)}")

# --------------------------------------------------------------------------
# Automated Continuous MLOps Ingestion & Auto-Training Stream Endpoints
# --------------------------------------------------------------------------
@router.post("/auto-stream/set-source")
def configure_auto_stream_source(req: AutoStreamConfigRequest):
    """
    Configures the automated source to continuously watch thousands of .nc files:
      - Point it to a local folder with thousands of files (e.g., /Users/harsh/Downloads/noaa_data)
      - OR point it to a remote NOAA / THREDDS / OpenDAP / S3 URL endpoint.
    """
    return auto_stream_trainer.set_source(req.source_type, req.target)

@router.post("/auto-stream/scan-and-train")
def trigger_batch_scan_and_train(batch_limit: int = Query(10, ge=1, le=100)):
    """
    Automatically scans the configured directory/URL, detects new .nc files,
    ingests them in bulk, and executes incremental PyTorch fine-tuning.
    """
    try:
        return auto_stream_trainer.process_and_train_batch(batch_limit=batch_limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-stream training error: {str(e)}")

@router.get("/auto-stream/status")
def get_auto_stream_status():
    """Returns real-time status of the automated MLOps continuous ingestion & training daemon."""
    return {
        "is_daemon_running": auto_stream_trainer.is_running,
        "watch_source_type": auto_stream_trainer.watch_source_type,
        "watch_target": auto_stream_trainer.watch_target,
        "total_files_discovered": len(auto_stream_trainer.discovered_files),
        "total_files_processed": len(auto_stream_trainer.processed_files),
        "total_trained_epochs": auto_stream_trainer.total_trained_count,
        "last_synced_time": auto_stream_trainer.last_training_time,
        "latest_metrics": auto_stream_trainer.latest_metrics,
        "cache_dir": auto_stream_trainer.download_cache_dir
    }

@router.post("/auto-stream/toggle-daemon")
def toggle_auto_stream_daemon(req: DaemonToggleRequest):
    """Enables or disables the 24/7 background continuous learning daemon."""
    if req.enabled:
        auto_stream_trainer.start_background_daemon(poll_interval_seconds=req.poll_interval_seconds)
    else:
        auto_stream_trainer.stop_background_daemon()
    return {
        "success": True,
        "is_daemon_running": auto_stream_trainer.is_running,
        "poll_interval_seconds": req.poll_interval_seconds,
        "message": "Continuous learning daemon is now ACTIVE. Watching for new .nc files." if req.enabled else "Daemon stopped."
    }
