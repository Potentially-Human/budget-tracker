from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base

class TransactionCategory(Enum):
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Personal Care",
    "Groceries",
    "Other"

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(TransactionCategory, nullable=False)  # "food", "transport", "entertainment", etc.
    merchant = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    notes = Column(String)
    input_method = Column(String, default="manual")  # "manual" or "voice"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to User (optional but useful)
    user = relationship("User", backref="transactions")


