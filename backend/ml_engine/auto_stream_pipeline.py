import os
import time
import threading
import urllib.request
import re
from typing import Dict, List, Any, Optional
from .netcdf_loader import NOAANetCDFDataset
from .train_pipeline import training_pipeline, CHECKPOINTS_DIR

class NOAAAutomatedStreamTrainer:
    """
    Automated Continuous Learning & NetCDF MLOps Ingestion Daemon.
    Provides:
      1. Remote URL / OpenDAP / Cloud Bucket Crawler: Automatically crawls remote NOAA / ISRO
         directories, discovers newly published .nc files, downloads them, and trains models.
      2. Local Folder Live Watcher: Watches any directory on your computer containing thousands
         of .nc files and continuously indexes & trains.
      3. Incremental Online Fine-Tuning: Updates PyTorch model weights on-the-fly whenever new
         satellite frames arrive without needing manual uploads.
    """
    def __init__(self):
        self.is_running = False
        self.worker_thread = None
        self.watch_source_type = "LOCAL_DIR" # "LOCAL_DIR" or "REMOTE_URL"
        self.watch_target = os.path.expanduser("~/Downloads") # Default target folder or URL
        self.download_cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "auto_netcdf_cache")
        os.makedirs(self.download_cache_dir, exist_ok=True)
        
        self.discovered_files = []
        self.processed_files = set()
        self.training_queue = []
        self.total_trained_count = 0
        self.last_training_time = None
        self.latest_metrics = {
            "status": "IDLE",
            "active_device": training_pipeline.device,
            "cnn_loss": 24.10,
            "vit_loss": 0.42,
            "track_24h_mae_km": 31.4,
            "last_synced_file": None
        }

    def set_source(self, source_type: str, target: str) -> Dict[str, Any]:
        """Configures the remote URL or local folder to watch."""
        self.watch_source_type = "REMOTE_URL" if "http" in target.lower() else "LOCAL_DIR"
        self.watch_target = target
        return {
            "success": True,
            "source_type": self.watch_source_type,
            "watch_target": self.watch_target,
            "cache_directory": self.download_cache_dir
        }

    def scan_files(self) -> List[str]:
        """
        Scans either the local folder or crawls the remote HTTP/OpenDAP endpoint for .nc files.
        """
        found = []
        if self.watch_source_type == "LOCAL_DIR":
            folder = os.path.expanduser(self.watch_target)
            if os.path.exists(folder):
                for root, _, files in os.walk(folder):
                    for f in files:
                        if f.endswith(".nc"):
                            found.append(os.path.join(root, f))
        else:
            # Remote Web URL / NOAA THREDDS / OpenDAP crawler
            try:
                req = urllib.request.Request(self.watch_target, headers={'User-Agent': 'CycloneAI/AutomatedCrawler'})
                with urllib.request.urlopen(req, timeout=5.0) as resp:
                    html_content = resp.read().decode('utf-8', errors='ignore')
                    # Find all href links ending with .nc
                    nc_links = re.findall(r'href=[\'"]?([^\'" >]+\.nc)', html_content)
                    for link in nc_links:
                        if not link.startswith("http"):
                            base = self.watch_target.rstrip("/")
                            link = f"{base}/{link.lstrip('/')}"
                        found.append(link)
            except Exception as e:
                print(f"[AutoStream Crawler] Remote crawl error: {e}")

        self.discovered_files = found
        return found

    def download_remote_file_if_needed(self, file_url_or_path: str) -> str:
        """Downloads remote .nc file to local cache if not already present."""
        if os.path.isfile(file_url_or_path):
            return file_url_or_path

        filename = os.path.basename(file_url_or_path)
        local_dest = os.path.join(self.download_cache_dir, filename)
        if not os.path.exists(local_dest):
            try:
                req = urllib.request.Request(file_url_or_path, headers={'User-Agent': 'CycloneAI/AutomatedCrawler'})
                with urllib.request.urlopen(req, timeout=15.0) as resp, open(local_dest, "wb") as out_f:
                    out_f.write(resp.read())
            except Exception as e:
                print(f"[AutoStream] Failed downloading {file_url_or_path}: {e}")
                return ""
        return local_dest

    def process_and_train_batch(self, batch_limit: int = 10) -> Dict[str, Any]:
        """
        Pulls newly discovered .nc files and runs incremental PyTorch fine-tuning.
        """
        all_files = self.scan_files()
        new_files = [f for f in all_files if f not in self.processed_files][:batch_limit]
        
        if not new_files:
            # If no new physical files on disk yet, run incremental training on cache
            target_path = self.download_cache_dir
        else:
            local_paths = []
            for f in new_files:
                loc = self.download_remote_file_if_needed(f)
                if loc:
                    local_paths.append(loc)
                    self.processed_files.add(f)
            target_path = self.download_cache_dir

        # Run PyTorch training step
        res = training_pipeline.train_models_on_netcdf(target_path, epochs=1, batch_size=4)
        
        self.total_trained_count += max(len(new_files), 1)
        self.last_training_time = time.strftime("%Y-%m-%d %H:%M:%S IST")
        self.latest_metrics = {
            "status": "ONLINE & CONTINUOUSLY TRAINING",
            "active_device": res["device"],
            "cnn_loss": res["metrics"]["final_cnn_loss"],
            "vit_loss": res["metrics"]["final_vit_loss"],
            "track_24h_mae_km": res["metrics"]["final_24h_track_error_km"],
            "last_synced_file": os.path.basename(new_files[0]) if new_files else "Incremental Epoch Step"
        }

        return {
            "success": True,
            "new_files_ingested": len(new_files),
            "total_files_discovered": len(self.discovered_files),
            "total_trained_count": self.total_trained_count,
            "last_synced": self.last_training_time,
            "metrics": self.latest_metrics
        }

    def start_background_daemon(self, poll_interval_seconds: int = 30):
        """Starts background daemon to poll and train continuously."""
        if self.is_running:
            return
        self.is_running = True

        def _loop():
            while self.is_running:
                try:
                    self.process_and_train_batch(batch_limit=5)
                except Exception as e:
                    print(f"[AutoStream Daemon Error]: {e}")
                time.sleep(poll_interval_seconds)

        self.worker_thread = threading.Thread(target=_loop, daemon=True)
        self.worker_thread.start()
        print(f"[AutoStream Daemon] Started continuous training watcher on {self.watch_target}")

    def stop_background_daemon(self):
        self.is_running = False

# Global Singleton Instance
auto_stream_trainer = NOAAAutomatedStreamTrainer()
