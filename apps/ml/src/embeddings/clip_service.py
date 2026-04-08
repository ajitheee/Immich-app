import logging
import numpy as np
from typing import List, Optional
from PIL import Image
import io

logger = logging.getLogger(__name__)


class CLIPService:
    def __init__(self):
        self.is_initialized = False
        self.model = None
        self.processor = None

    async def initialize(self):
        """Initialize the CLIP model."""
        try:
            logger.info("Initializing CLIP embedding service...")

            # Try to load transformers if available
            try:
                from transformers import CLIPProcessor, CLIPModel
                self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
                self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
                logger.info("CLIP model loaded successfully")
            except ImportError:
                logger.warning("Transformers not available, using placeholder implementation")
                self.model = None
                self.processor = None

            self.is_initialized = True
            logger.info("CLIP embedding service initialized")

        except Exception as e:
            logger.error(f"Failed to initialize CLIP: {e}")
            raise

    async def encode_image(self, image_data: bytes) -> np.ndarray:
        """Generate embedding for an image."""
        try:
            # Load image
            image = Image.open(io.BytesIO(image_data))

            if self.model and self.processor:
                # Use actual model
                inputs = self.processor(images=image, return_tensors="pt")
                image_features = self.model.get_image_features(**inputs)
                # Normalize
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                return image_features.detach().numpy()[0]
            else:
                # Placeholder implementation
                # Return a random embedding for testing
                return np.random.randn(512).astype(np.float32)

        except Exception as e:
            logger.error(f"Error encoding image: {e}")
            raise

    async def encode_text(self, text: str) -> np.ndarray:
        """Generate embedding for text."""
        try:
            if self.model and self.processor:
                # Use actual model
                inputs = self.processor(text=[text], return_tensors="pt", padding=True)
                text_features = self.model.get_text_features(**inputs)
                # Normalize
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
                return text_features.detach().numpy()[0]
            else:
                # Placeholder implementation
                return np.random.randn(512).astype(np.float32)

        except Exception as e:
            logger.error(f"Error encoding text: {e}")
            raise

    async def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compute cosine similarity between two embeddings."""
        try:
            # Cosine similarity
            similarity = np.dot(embedding1, embedding2) / (
                np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
            )
            return float(similarity)
        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            return 0.0

    async def find_similar_images(self, text_query: str, image_embeddings: List[np.ndarray], top_k: int = 10) -> List[int]:
        """Find images similar to a text query."""
        try:
            text_embedding = await self.encode_text(text_query)

            similarities = []
            for i, img_emb in enumerate(image_embeddings):
                sim = await self.compute_similarity(text_embedding, img_emb)
                similarities.append((i, sim))

            # Sort by similarity
            similarities.sort(key=lambda x: x[1], reverse=True)

            # Return top k indices
            return [idx for idx, _ in similarities[:top_k]]

        except Exception as e:
            logger.error(f"Error finding similar images: {e}")
            return []