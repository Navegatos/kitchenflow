from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.base import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    password_hash = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)