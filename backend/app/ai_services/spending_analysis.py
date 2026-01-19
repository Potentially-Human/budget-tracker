from app.models.transactions import Transaction
from datetime import datetime
from app.src.llm_caller import LLMCaller

async def generate_financial_narrative(user_id: int, time_period: str):
    # Gets spending data
    # Calls Claude with prompt about values analysis
    # Returns narrative text
    return

async def analyze_spending_patterns(transactions: list):
    # Categorization, trend detection
    return