import uvicorn
import os
import sys

# Ensure backend package is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    print("=" * 60)
    print("  CYCLONEAI REST API BACKEND SERVER (SIH 2026)")
    print("  PyTorch CNN + BiLSTM Inference Gateway")
    print("  Listening on: http://127.0.0.1:8000")
    print("  API Docs:     http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
