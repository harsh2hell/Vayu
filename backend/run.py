import uvicorn
import os
import sys

# Ensure backend package is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    reload = os.environ.get("RELOAD", "true").lower() in ("true", "1")

    print("=" * 60)
    print("  CYCLONEAI REST API BACKEND SERVER (SIH 2026)")
    print("  PyTorch CNN + BiLSTM Inference Gateway")
    print(f"  Listening on: http://{host}:{port}")
    print(f"  API Docs:     http://{host}:{port}/docs")
    print("=" * 60)
    uvicorn.run("backend.main:app", host=host, port=port, reload=reload)
