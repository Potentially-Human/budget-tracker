from pydantic import BaseModel

class GroupProfile(BaseModel):
    """User's profile for matching to peer groups."""
    income_range: str
    goals: dict

class GroupComparison(BaseModel):
    """Comparison with peer group."""
    category: str
    your_spending: float
    peer_avg: float
    peer_median: float
    percentile: int  # Where you rank (0-100)
    comparison_text: str  # "You spend 30% less than peers"


class GroupStats(BaseModel):
    """Overall peer comparison statistics."""
    income_range: str
    peer_count: int
    comparisons: list[GroupComparison]
    overall_rank: str  # "top_25", "middle_50", "bottom_25"