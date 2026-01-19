from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.transactions import Transaction
from app.models.budget import Budget
from app.api.auth import get_current_user
from app.schemas.ai_insights import NarrativeRequest, NarrativeResponse
from app.ai_services.spending_analysis import generate_financial_narrative

router = APIRouter()

@router.post("/narrative", response_model=NarrativeResponse)
async def get_financial_narrative(
    request: NarrativeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered financial narrative (money story).
    
    - Analyzes user's spending patterns
    - Identifies value alignment/misalignment
    - Provides personalized insights
    """
    # Get transactions for time period
    if request.time_period == "week":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif request.time_period == "month":
        start_date = datetime.utcnow() - timedelta(days=30)
    else:  # year
        start_date = datetime.utcnow() - timedelta(days=365)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_date
    ).all()
    
    # Get budgets
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    
    # Generate narrative using AI
    narrative = await generate_financial_narrative(
        transactions=transactions,
        budgets=budgets,
        user_goals=current_user.goals
    )
    
    return narrative


@router.get("/spending-analysis")
async def get_spending_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed spending analysis.
    
    - Breakdown by category
    - Trends over time
    - Unusual patterns
    """
    # Calculate spending by category
    from sqlalchemy import func
    
    spending_by_category = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total'),
        func.count(Transaction.id).label('count'),
        func.avg(Transaction.amount).label('avg')
    ).filter(
        Transaction.user_id == current_user.id
    ).group_by(
        Transaction.category
    ).all()
    
    return {
        "categories": [
            {
                "category": cat,
                "total": float(total),
                "count": count,
                "average": float(avg)
            }
            for cat, total, count, avg in spending_by_category
        ]
    }