import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from src.face_recognition.face_service import FaceService
from src.embeddings.clip_service import CLIPService

router = APIRouter()
logger = logging.getLogger(__name__)

# Services will be injected
face_service: Optional[FaceService] = None
clip_service: Optional[CLIPService] = None


class FaceDetectionRequest(BaseModel):
    image_url: Optional[str] = None
    asset_id: str


class FaceDetectionResponse(BaseModel):
    faces: List[Dict[str, Any]]
    asset_id: str


class EmbeddingRequest(BaseModel):
    text: Optional[str] = None
    asset_id: Optional[str] = None


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    model: str


class SearchRequest(BaseModel):
    query: str
    limit: int = 50


class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    query: str


@router.post("/detect-faces", response_model=FaceDetectionResponse)
async def detect_faces(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    asset_id: str = None
):
    """Detect faces in an image."""
    try:
        # Read image
        image_data = await file.read()

        # Detect faces
        faces = await face_service.detect_faces(image_data)

        return FaceDetectionResponse(
            faces=faces,
            asset_id=asset_id
        )
    except Exception as e:
        logger.error(f"Error detecting faces: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(
    file: UploadFile = File(...),
    asset_id: str = None
):
    """Generate CLIP embeddings for an image."""
    try:
        # Read image
        image_data = await file.read()

        # Generate embeddings
        embedding = await clip_service.encode_image(image_data)

        return EmbeddingResponse(
            embedding=embedding.tolist(),
            model="clip-ViT-B-32"
        )
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text-embeddings", response_model=EmbeddingResponse)
async def text_embeddings(request: EmbeddingRequest):
    """Generate CLIP embeddings for text."""
    try:
        if not request.text:
            raise HTTPException(status_code=400, detail="Text is required")

        embedding = await clip_service.encode_text(request.text)

        return EmbeddingResponse(
            embedding=embedding.tolist(),
            model="clip-ViT-B-32"
        )
    except Exception as e:
        logger.error(f"Error generating text embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=SearchResponse)
async def semantic_search(request: SearchRequest):
    """Search for images using semantic similarity."""
    try:
        # Generate embedding for query
        query_embedding = await clip_service.encode_text(request.query)

        # This would typically query the database for similar embeddings
        # For now, return empty results
        results = []

        return SearchResponse(
            results=results,
            query=request.query
        )
    except Exception as e:
        logger.error(f"Error in semantic search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cluster-faces")
async def cluster_faces(user_id: str):
    """Cluster faces for a user into people."""
    try:
        # This would typically query the database for face embeddings
        # and cluster them using DBSCAN or similar
        clusters = await face_service.cluster_faces(user_id)

        return {"clusters": clusters, "user_id": user_id}
    except Exception as e:
        logger.error(f"Error clustering faces: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/status")
async def models_status():
    """Get the status of loaded models."""
    return {
        "face_recognition": {
            "loaded": face_service is not None and face_service.is_initialized,
            "model": "buffalo_l"
        },
        "embeddings": {
            "loaded": clip_service is not None and clip_service.is_initialized,
            "model": "clip-ViT-B-32"
        }
    }