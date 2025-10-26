from celery import Celery
import os
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from minio import Minio

# Celery app
celery_app = Celery(
    'tasks',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/1'),
    backend=os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/1')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# MinIO client
minio_client = Minio(
    os.getenv("MINIO_ENDPOINT", "minio:9000"),
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=False
)

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-service:8001")
BUCKET_NAME = os.getenv("MINIO_BUCKET", "photos")

@celery_app.task(name='tasks.process_photo')
def process_photo(photo_id: int):
    """Process single photo - detect faces and extract embeddings"""
    
    from models import Photo
    from datetime import datetime
    
    db = SessionLocal()
    
    try:
        # Get photo from database
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        
        if not photo:
            print(f"Photo {photo_id} not found")
            return {"status": "error", "message": "Photo not found"}
        
        # Update status
        photo.status = "processing"
        db.commit()
        
        # Get photo URL from MinIO
        photo_url = minio_client.presigned_get_object(
            BUCKET_NAME,
            photo.original_path,
            expires=3600
        )
        
        # Call AI service to process photo
        with httpx.Client() as client:
            response = client.post(
                f"{AI_SERVICE_URL}/process-photo",
                json={
                    "photo_id": photo_id,
                    "photo_url": photo_url
                },
                timeout=120.0
            )
            
            if response.status_code != 200:
                raise Exception(f"AI service error: {response.text}")
            
            result = response.json()
        
        # Update photo with results
        photo.has_face = result['has_face']
        photo.face_count = result['face_count']
        
        if result['has_face']:
            photo.face_embeddings = result['embeddings']
            photo.status = "completed"
            
            # Generate thumbnail if not exists
            if not photo.thumbnail_path:
                generate_thumbnail.delay(photo_id)
        else:
            photo.status = "no_face"
        
        photo.processed_at = datetime.utcnow()
        db.commit()
        
        print(f"Processed photo {photo_id}: {result['face_count']} faces found")
        
        return {
            "status": "success",
            "photo_id": photo_id,
            "has_face": result['has_face'],
            "face_count": result['face_count']
        }
        
    except Exception as e:
        print(f"Error processing photo {photo_id}: {e}")
        
        # Update status to failed
        photo.status = "failed"
        db.commit()
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@celery_app.task(name='tasks.process_photos')
def process_photos(photo_ids: list):
    """Process multiple photos"""
    
    results = []
    
    for photo_id in photo_ids:
        result = process_photo.delay(photo_id)
        results.append(result)
    
    return {
        "queued": len(photo_ids),
        "task_ids": [r.id for r in results]
    }

@celery_app.task(name='tasks.generate_thumbnail')
def generate_thumbnail(photo_id: int):
    """Generate thumbnail for photo"""
    
    from models import Photo
    from PIL import Image
    import io
    
    db = SessionLocal()
    
    try:
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        
        if not photo:
            return {"status": "error", "message": "Photo not found"}
        
        # Download original
        response = minio_client.get_object(BUCKET_NAME, photo.original_path)
        image_data = response.read()
        
        # Create thumbnail
        img = Image.open(io.BytesIO(image_data))
        
        # Resize to max 800px width while maintaining aspect ratio
        max_width = 800
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save thumbnail
        thumbnail_buffer = io.BytesIO()
        img.save(thumbnail_buffer, format='JPEG', quality=85, optimize=True)
        thumbnail_buffer.seek(0)
        
        # Upload to MinIO
        thumbnail_path = photo.original_path.replace('.', '_thumb.')
        
        minio_client.put_object(
            BUCKET_NAME,
            thumbnail_path,
            thumbnail_buffer,
            len(thumbnail_buffer.getvalue()),
            content_type='image/jpeg'
        )
        
        # Update database
        photo.thumbnail_path = thumbnail_path
        db.commit()
        
        print(f"Generated thumbnail for photo {photo_id}")
        
        return {"status": "success", "thumbnail_path": thumbnail_path}
        
    except Exception as e:
        print(f"Error generating thumbnail for photo {photo_id}: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@celery_app.task(name='tasks.cleanup_old_searches')
def cleanup_old_searches():
    """Cleanup old search logs (keep last 30 days)"""
    
    from models import SearchLog
    from datetime import datetime, timedelta
    
    db = SessionLocal()
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        deleted = db.query(SearchLog).filter(
            SearchLog.created_at < cutoff_date
        ).delete()
        
        db.commit()
        
        print(f"Deleted {deleted} old search logs")
        
        return {"status": "success", "deleted": deleted}
        
    except Exception as e:
        print(f"Error cleaning up search logs: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

# Periodic tasks
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'cleanup-old-searches': {
        'task': 'tasks.cleanup_old_searches',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}
