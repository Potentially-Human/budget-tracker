from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

from user import IncomeRange


class SpendingCircle(Base):
    __tablename__ = "peer_groups"
    
    income_range = Column(IncomeRange)
    avg_spending = Column(Float)
    percentile_data = Column(JSON)

    # other fields needed