from pydantic import BaseModel


class NarrativeRequest(BaseModel):
    time_period: str = "month"  # "week", "month", "year"


class NarrativeResponse(BaseModel):
    """AI-generated financial story."""
    narrative: str
    key_insights: list[str]
    spending_by_category: dict[str, float]
    recommendations: list[str]
    generated_at: str


class SpendingPattern(BaseModel):
    """Identified spending patterns."""
    pattern_type: str  # "increasing", "decreasing", "stable", "irregular"
    category: str
    description: str
    suggestion: str