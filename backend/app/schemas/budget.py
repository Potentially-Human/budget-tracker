from pydantic import BaseModel


class BudgetCreate(BaseModel):
    category: str
    amount: float
    period: str  # "monthly" or "weekly"

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category: str
    amount: float
    period: str
    spent: float = 0.0  # Calculated field
    remaining: float = 0.0  # Calculated field
    
    class Config:
        from_attributes = True

class BudgetStatus(BaseModel):
    """Budget with current spending status."""
    id: int
    category: str
    amount: float  # Budget limit
    spent: float  # Amount spent so far
    remaining: float  # Amount left
    percentage_used: float  # 0-100
    period: str
    status: str  # "on_track", "warning", "exceeded"