from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String(500))
    description = Column(Text)
    status = Column(String(50), default="active")  # active, processing, completed, archived
    thumbnail_url = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    photos = relationship("Photo", back_populates="event", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Event {self.name}>"


class Photo(Base):
    __tablename__ = "photos"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    
    # File paths
    original_path = Column(String(500), nullable=False)
    thumbnail_path = Column(String(500))
    watermarked_path = Column(String(500))
    
    # Face detection
    has_face = Column(Boolean, default=False, index=True)
    face_count = Column(Integer, default=0)
    face_embeddings = Column(JSON)  # Store face embedding vectors
    
    # Processing status
    status = Column(String(50), default="pending")  # pending, processing, completed, failed, no_face
    processed_at = Column(DateTime)
    
    # Metadata
    file_size = Column(Integer)  # bytes
    width = Column(Integer)
    height = Column(Integer)
    mime_type = Column(String(100))
    
    # Pricing (ใส่ตาม business logic ของคุณ)
    price = Column(Float, default=50.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    event = relationship("Event", back_populates="photos")
    purchases = relationship("Purchase", back_populates="photo")
    
    def __repr__(self):
        return f"<Photo {self.id} - Event {self.event_id}>"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255))
    
    # Profile
    full_name = Column(String(255))
    phone = Column(String(50))
    
    # Role: customer, photographer, admin
    role = Column(String(50), default="customer", index=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    purchases = relationship("Purchase", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email}>"


class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False, index=True)
    
    # Payment
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50))  # stripe, omise, promptpay, etc.
    payment_status = Column(String(50), default="pending")  # pending, completed, failed, refunded
    transaction_id = Column(String(255), unique=True)
    
    # Download tracking
    download_count = Column(Integer, default=0)
    max_downloads = Column(Integer, default=3)  # ใส่ตาม business logic
    download_expires_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    photo = relationship("Photo", back_populates="purchases")
    
    def __repr__(self):
        return f"<Purchase {self.id} - User {self.user_id} - Photo {self.photo_id}>"


class SearchLog(Base):
    """Log face searches for analytics"""
    __tablename__ = "search_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), index=True)
    
    # Search metadata
    face_embedding = Column(JSON)
    results_count = Column(Integer)
    search_duration_ms = Column(Integer)
    
    # User tracking (optional, for analytics)
    ip_address = Column(String(50))
    user_agent = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f"<SearchLog {self.id}>"
