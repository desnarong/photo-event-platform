from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import List, Optional
import os
from datetime import datetime
import httpx

from models import Base, Event, Photo, User, Purchase
from pydantic import BaseModel, EmailStr

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/eventphotos")
# Convert to async URL
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# FastAPI app
app = FastAPI(
    title="Photo Event Platform API",
    description="API for event photo management and face search",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ใส่ domain จริงใน production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
async def get_db():
    async with async_session_maker() as session:
        yield session

# Pydantic schemas
class EventCreate(BaseModel):
    name: str
    date: datetime
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "active"

class EventUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    name: str
    slug: str
    date: datetime
    location: Optional[str]
    status: str
    thumbnail_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class PhotoResponse(BaseModel):
    id: int
    event_id: int
    thumbnail_path: Optional[str]
    has_face: bool
    status: str
    price: float
    
    class Config:
        from_attributes = True

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Events endpoints
@app.post("/api/events", response_model=EventResponse)
async def create_event(event: EventCreate, db: AsyncSession = Depends(get_db)):
    """Create new event"""
    from sqlalchemy import select
    
    # Generate slug
    slug = event.name.lower().replace(" ", "-")
    
    # Check if slug exists
    result = await db.execute(select(Event).where(Event.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    
    db_event = Event(
        name=event.name,
        slug=slug,
        date=event.date,
        location=event.location,
        description=event.description,
        status=event.status
    )
    
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    return db_event

@app.get("/api/events", response_model=List[EventResponse])
async def list_events(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all events"""
    from sqlalchemy import select
    
    query = select(Event).offset(skip).limit(limit).order_by(Event.date.desc())
    
    if status:
        query = query.where(Event.status == status)
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    return events

@app.get("/api/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    """Get event by ID"""
    from sqlalchemy import select
    
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return event

@app.get("/api/events/slug/{slug}", response_model=EventResponse)
async def get_event_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get event by slug"""
    from sqlalchemy import select
    
    result = await db.execute(select(Event).where(Event.slug == slug))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return event

@app.put("/api/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_update: EventUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update event"""
    from sqlalchemy import select
    
    # Get existing event
    result = await db.execute(select(Event).where(Event.id == event_id))
    db_event = result.scalar_one_or_none()
    
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Update fields
    update_data = event_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "name" and value:
            # Regenerate slug if name changes
            slug = value.lower().replace(" ", "-")
            # Check if slug exists (excluding current event)
            slug_check = await db.execute(
                select(Event).where(Event.slug == slug, Event.id != event_id)
            )
            if slug_check.scalar_one_or_none():
                slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
            setattr(db_event, "slug", slug)
        
        setattr(db_event, field, value)
    
    await db.commit()
    await db.refresh(db_event)
    
    return db_event

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    """Delete event"""
    from sqlalchemy import select
    
    # Get event
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # TODO: Also delete associated photos and data
    await db.delete(event)
    await db.commit()
    
    return {"message": "Event deleted successfully", "id": event_id}

@app.post("/api/events/{event_id}/photos")
async def upload_photos(
    event_id: int,
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    """Upload photos to event"""
    from sqlalchemy import select
    import uuid
    from minio import Minio
    from io import BytesIO
    
    # Check event exists
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # MinIO client
    minio_client = Minio(
        os.getenv("MINIO_ENDPOINT", "minio:9000"),
        access_key=os.getenv("MINIO_ACCESS_KEY"),
        secret_key=os.getenv("MINIO_SECRET_KEY"),
        secure=False
    )
    
    bucket_name = os.getenv("MINIO_BUCKET", "photos")
    
    # Ensure bucket exists
    if not minio_client.bucket_exists(bucket_name):
        minio_client.make_bucket(bucket_name)
    
    uploaded_photos = []
    
    for file in files:
        # Generate unique filename
        file_ext = file.filename.split(".")[-1]
        object_name = f"{event_id}/{uuid.uuid4()}.{file_ext}"
        
        # Read file
        contents = await file.read()
        
        # Upload to MinIO
        minio_client.put_object(
            bucket_name,
            object_name,
            BytesIO(contents),
            len(contents),
            content_type=file.content_type
        )
        
        # Create photo record
        photo = Photo(
            event_id=event_id,
            original_path=object_name,
            file_size=len(contents),
            mime_type=file.content_type,
            status="pending"
        )
        
        db.add(photo)
        uploaded_photos.append(photo.id)
    
    await db.commit()
    
    # Queue AI processing (background task)
    background_tasks.add_task(queue_photo_processing, uploaded_photos)
    
    return {
        "message": f"Uploaded {len(files)} photos",
        "photo_ids": uploaded_photos
    }

async def queue_photo_processing(photo_ids: List[int]):
    """Queue photos for AI processing"""
    from celery_app import process_photos
    process_photos.delay(photo_ids)

@app.get("/api/events/{event_id}/photos", response_model=List[PhotoResponse])
async def list_event_photos(
    event_id: int,
    skip: int = 0,
    limit: int = 100,
    has_face: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """List photos for an event"""
    from sqlalchemy import select
    
    query = select(Photo).where(Photo.event_id == event_id).offset(skip).limit(limit)
    
    if has_face is not None:
        query = query.where(Photo.has_face == has_face)
    
    result = await db.execute(query)
    photos = result.scalars().all()
    
    return photos

@app.delete("/api/photos/{photo_id}")
async def delete_photo(photo_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a photo"""
    from sqlalchemy import select
    
    # Get photo
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # TODO: Also delete from MinIO storage
    # TODO: Delete from Redis cache
    
    await db.delete(photo)
    await db.commit()
    
    return {"message": "Photo deleted successfully", "id": photo_id}

@app.post("/api/search-face")
async def search_face(
    event_id: int,
    face_image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Search for photos containing the uploaded face"""
    from sqlalchemy import select
    
    # Check event exists
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Read uploaded face image
    face_data = await face_image.read()
    
    # Call AI service
    ai_service_url = os.getenv("AI_SERVICE_URL", "http://ai-service:8001")
    
    async with httpx.AsyncClient() as client:
        files = {"file": (face_image.filename, face_data, face_image.content_type)}
        response = await client.post(
            f"{ai_service_url}/extract-embedding",
            files=files,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Face detection failed")
        
        embedding = response.json()["embedding"]
    
    # Search similar faces in database
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ai_service_url}/search-similar",
            json={
                "event_id": event_id,
                "embedding": embedding,
                "top_k": 50
            },
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Search failed")
        
        similar_photo_ids = response.json()["photo_ids"]
    
    # Get photos from database
    result = await db.execute(
        select(Photo).where(Photo.id.in_(similar_photo_ids))
    )
    photos = result.scalars().all()
    
    # Log search
    from models import SearchLog
    search_log = SearchLog(
        event_id=event_id,
        face_embedding=embedding,
        results_count=len(photos)
    )
    db.add(search_log)
    await db.commit()
    
    return {
        "event_id": event_id,
        "results_count": len(photos),
        "photos": [PhotoResponse.from_orm(p) for p in photos]
    }

# Database initialization
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
