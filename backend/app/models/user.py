from sqlalchemy import Column, Integer, String, JSON, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum

from app.database import Base

class IncomeRange(str, Enum):
    RANGE_0_15K = "0k-15k"
    RANGE_15K_25K = "15k-25k"
    RANGE_25K_40K = "25k-40k"
    RANGE_40K_60K = "40k-60k"
    RANGE_60K_80K = "60k-80k"
    RANGE_80K_100K = "80k-100k"
    RANGE_100K_150K = "100k-150k"
    RANGE_150K_PLUS = "150k+"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    income_range = Column(SQLEnum(IncomeRange), nullable=True)
    goals = Column(JSON)  # e.g., {"save_for": "vacation", "target": 5000}
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships: access user's data via user.transactions, user.budgets
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")