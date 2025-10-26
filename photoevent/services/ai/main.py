from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
import io
from typing import List
import redis
import json
import os
from datetime import datetime

app = FastAPI(title="AI Service - Face Detection & Matching")

# Initialize models
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Face detection
mtcnn = MTCNN(
    image_size=160,
    margin=0,
    min_face_size=20,
    thresholds=[0.6, 0.7, 0.7],
    factor=0.709,
    post_process=True,
    device=device,
    keep_all=True
)

# Face recognition
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Redis connection for caching embeddings
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=6379,
    db=2,
    decode_responses=False
)

def preprocess_image(image_data: bytes) -> Image.Image:
    """Load and preprocess image"""
    try:
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

def detect_faces(img: Image.Image):
    """Detect faces in image"""
    try:
        # Detect faces
        boxes, probs = mtcnn.detect(img)
        
        if boxes is None:
            return None, None
        
        # Filter by confidence
        min_confidence = 0.9
        valid_faces = [(box, prob) for box, prob in zip(boxes, probs) if prob > min_confidence]
        
        if not valid_faces:
            return None, None
        
        # Extract face tensors
        faces = mtcnn.extract(img, boxes, None)
        
        return faces, [prob for _, prob in valid_faces]
    except Exception as e:
        print(f"Face detection error: {e}")
        return None, None

def get_embedding(face_tensor: torch.Tensor) -> np.ndarray:
    """Get face embedding from face tensor"""
    try:
        with torch.no_grad():
            face_tensor = face_tensor.to(device)
            embedding = facenet(face_tensor.unsqueeze(0))
            embedding = embedding.detach().cpu().numpy()[0]
        
        # Normalize
        embedding = embedding / np.linalg.norm(embedding)
        
        return embedding
    except Exception as e:
        print(f"Embedding extraction error: {e}")
        return None

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": str(device),
        "models_loaded": True,
        "redis_connected": redis_client.ping()
    }

@app.post("/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    """Extract face embedding from uploaded image"""
    
    # Read image
    image_data = await file.read()
    img = preprocess_image(image_data)
    
    # Detect faces
    faces, probs = detect_faces(img)
    
    if faces is None:
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    # Get embedding for first/best face
    embedding = get_embedding(faces[0])
    
    if embedding is None:
        raise HTTPException(status_code=500, detail="Failed to extract embedding")
    
    return {
        "success": True,
        "face_count": len(faces),
        "confidence": float(probs[0]),
        "embedding": embedding.tolist()
    }

@app.post("/process-photo")
async def process_photo(photo_id: int, photo_url: str):
    """Process a photo: detect faces and store embeddings"""
    
    # Download photo
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.get(photo_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download photo")
        
        image_data = response.content
    
    img = preprocess_image(image_data)
    
    # Detect faces
    faces, probs = detect_faces(img)
    
    if faces is None:
        return {
            "photo_id": photo_id,
            "has_face": False,
            "face_count": 0,
            "embeddings": []
        }
    
    # Extract embeddings for all faces
    embeddings = []
    for i, face in enumerate(faces):
        emb = get_embedding(face)
        if emb is not None:
            embeddings.append({
                "index": i,
                "confidence": float(probs[i]),
                "embedding": emb.tolist()
            })
    
    # Cache embeddings in Redis
    cache_key = f"photo:{photo_id}:embeddings"
    redis_client.setex(
        cache_key,
        86400 * 7,  # 7 days
        json.dumps(embeddings)
    )
    
    return {
        "photo_id": photo_id,
        "has_face": True,
        "face_count": len(embeddings),
        "embeddings": embeddings
    }

@app.post("/search-similar")
async def search_similar(event_id: int, embedding: List[float], top_k: int = 50):
    """Search for similar faces in an event"""
    
    query_embedding = np.array(embedding)
    
    # Get all photos with faces in this event
    # In production, use a proper vector database (Faiss, Milvus, etc.)
    # For now, we'll do brute force search from Redis
    
    pattern = f"photo:*:embeddings"
    photo_keys = []
    
    for key in redis_client.scan_iter(match=pattern):
        photo_keys.append(key)
    
    similarities = []
    
    for key in photo_keys:
        photo_id = int(key.decode().split(':')[1])
        
        # Get embeddings from cache
        embeddings_json = redis_client.get(key)
        if not embeddings_json:
            continue
        
        embeddings = json.loads(embeddings_json)
        
        # Calculate similarity for each face in photo
        for emb_data in embeddings:
            stored_embedding = np.array(emb_data['embedding'])
            
            # Cosine similarity
            similarity = np.dot(query_embedding, stored_embedding)
            
            similarities.append({
                'photo_id': photo_id,
                'similarity': float(similarity),
                'confidence': emb_data['confidence']
            })
    
    # Sort by similarity
    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    
    # Get top K unique photos
    seen_photos = set()
    top_results = []
    
    for item in similarities:
        if item['photo_id'] not in seen_photos:
            seen_photos.add(item['photo_id'])
            top_results.append(item)
            
            if len(top_results) >= top_k:
                break
    
    return {
        "event_id": event_id,
        "results_count": len(top_results),
        "photo_ids": [r['photo_id'] for r in top_results],
        "results": top_results
    }

@app.post("/batch-process")
async def batch_process(photo_ids: List[int], photo_urls: List[str]):
    """Batch process multiple photos"""
    
    results = []
    
    for photo_id, photo_url in zip(photo_ids, photo_urls):
        try:
            result = await process_photo(photo_id, photo_url)
            results.append(result)
        except Exception as e:
            results.append({
                "photo_id": photo_id,
                "error": str(e),
                "has_face": False
            })
    
    return {
        "processed": len(results),
        "results": results
    }

# Initialize on startup
@app.on_event("startup")
async def startup():
    print("AI Service started")
    print(f"Device: {device}")
    print(f"Redis connected: {redis_client.ping()}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
