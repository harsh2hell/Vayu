import time
import threading
from ..services.incois_ocean import incois_service
from ..services.mosdac_client import mosdac_client

class BackgroundTelemetryWorker:
    """
    Background worker thread that periodically polls live ocean buoys and updates
    active telemetry buffers every 15 minutes.
    """
    def __init__(self, interval_seconds: int = 900):
        self.interval = interval_seconds
        self.running = False
        self._thread = None

    def _worker_loop(self):
        while self.running:
            try:
                # Sync Bay of Bengal & Arabian Sea buoys
                incois_service.fetch_or_sync_live_buoys(basin="Bay of Bengal")
                incois_service.fetch_or_sync_live_buoys(basin="Arabian Sea")
                
                # Ingest synthetic periodic frame snapshot
                mosdac_client.simulate_or_parse_satellite_payload(source_id="insat-3dr", channel="TIR1", basin="Bay of Bengal")
            except Exception as e:
                print(f"[Telemetry Poller Worker Error]: {e}")
            
            time.sleep(self.interval)

    def start(self):
        if not self.running:
            self.running = True
            self._thread = threading.Thread(target=self._worker_loop, daemon=True)
            self._thread.start()
            print("🚀 [Background Worker] Telemetry stream poller started successfully.")

    def stop(self):
        self.running = False

# Global Singleton Worker
telemetry_worker = BackgroundTelemetryWorker()
