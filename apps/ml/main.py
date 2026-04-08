import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.api.routes import router
from src.face_recognition.face_service import FaceService
from src.embeddings.clip_service import CLIPService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Immich Clone ML Service",
    description="Machine learning service for face recognition, object detection, and embeddings",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
face_service = None
clip_service = None

@app.on_event("startup")
async def startup_event():
    global face_service, clip_service

    logger.info("Initializing ML services...")

    # Initialize face recognition service
    face_service = FaceService()
    await face_service.initialize()

    # Initialize CLIP embedding service
    clip_service = CLIPService()
    await clip_service.initialize()

    logger.info("ML services initialized successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down ML services...")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": {"face": face_service is not None, "clip": clip_service is not None}}

# Include routers
app.include_router(router, prefix="/api/ml")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3003"))
    uvicorn.run(app, host="0.0.0.0", port=port)