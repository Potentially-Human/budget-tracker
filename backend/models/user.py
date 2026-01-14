from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime

from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    income_range = Column(String)  # e.g., "50k-75k"
    goals = Column(JSON)  # e.g., {"save_for": "vacation"}