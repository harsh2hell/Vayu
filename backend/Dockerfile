# ==============================================================================
# VAYU FastAPI Production Container Image
# Multi-Source Satellite & Spatiotemporal Cyclone Prediction Platform
# Team Chakravat Crew — SIH 2026
# ==============================================================================

FROM python:3.11-slim

# Prevent python from writing pyc files to disk and ensure unbuffered standard output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install minimal OS dependencies for network operations, health checks, and OpenCV/Pillow image support
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to leverage Docker layer caching
COPY requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy complete backend application code (including models, checkpoints, database, routers, and services)
COPY . /app/backend

# Expose default HTTP port
EXPOSE 8000

# Container healthcheck targeting the unauthenticated /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-8000}/api/health || exit 1

# Start FastAPI using Uvicorn ASGI server honoring dynamic cloud PORT
CMD ["sh", "-c", "exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
