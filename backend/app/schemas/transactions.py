from pydantic import BaseModel, Field
from datetime import datetime


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: str
    merchant: str | None = None
    date: datetime | None = None
    notes: str | None = None

class TransactionUpdate(BaseModel):
    amount: float | None = Field(None, gt=0)
    category: str | None = None
    merchant: str | None = None
    date: datetime | None = None
    notes: str | None = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    merchant: str | None
    date: datetime | None
    notes: str | None
    input_method: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransactionSummary(BaseModel):
    """Summary of spending by category."""
    category: str
    total: float
    count: int
    avg: float