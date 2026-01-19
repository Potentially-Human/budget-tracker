from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.transactions import Transaction
from app.api.auth import get_current_user
from app.schemas.peer_group import GroupComparison, GroupStats

router = APIRouter()


@router.post("/join")
async def join_peer_group(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Opt into peer comparison.
    
    User must have income_range set.
    """
    if not current_user.income_range:
        raise HTTPException(
            status_code=400,
            detail="Please set your income range first"
        )
    
    return {
        "message": "Successfully joined peer comparison",
        "income_range": current_user.income_range
    }


@router.get("/compare", response_model=GroupStats)
async def compare_with_peers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare your spending with peers in same income bracket.
    
    - Shows category-by-category comparison
    - Anonymous aggregated data
    - Your percentile ranking
    """
    if not current_user.income_range:
        raise HTTPException(
            status_code=400,
            detail="Please set your income range to compare with peers"
        )
    
    # Get peers with same income range
    peer_users = db.query(User).filter(
        User.income_range == current_user.income_range,
        User.id != current_user.id  # Exclude self
    ).all()
    
    if len(peer_users) < 3:
        raise HTTPException(
            status_code=400,
            detail="Not enough peers in your income range for comparison"
        )
    
    # Calculate your spending by category
    your_spending = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user.id
    ).group_by(Transaction.category).all()
    
    # Calculate peer averages by category
    peer_ids = [p.id for p in peer_users]
    peer_spending = db.query(
        Transaction.category,
        func.avg(Transaction.amount).label('avg'),
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id.in_(peer_ids)
    ).group_by(Transaction.category).all()
    
    # Build comparisons
    comparisons = []
    your_spending_dict = {cat: float(total) for cat, total in your_spending}
    
    for category, peer_avg, peer_total in peer_spending:
        your_amount = your_spending_dict.get(category, 0.0)
        peer_avg_float = float(peer_avg)
        
        # Calculate comparison text
        if your_amount < peer_avg_float:
            diff_pct = int(((peer_avg_float - your_amount) / peer_avg_float) * 100)
            comparison_text = f"You spend {diff_pct}% less than peers"
        elif your_amount > peer_avg_float:
            diff_pct = int(((your_amount - peer_avg_float) / peer_avg_float) * 100)
            comparison_text = f"You spend {diff_pct}% more than peers"
        else:
            comparison_text = "You spend the same as peers"
        
        comparisons.append(GroupComparison(
            category=category,
            your_spending=your_amount,
            peer_avg=peer_avg_float,
            peer_median=peer_avg_float,  # Simplified for hackathon
            percentile=50,  # Calculate properly later
            comparison_text=comparison_text
        ))
    
    return GroupStats(
        income_range=current_user.income_range,
        peer_count=len(peer_users),
        comparisons=comparisons,
        overall_rank="middle_50"  # Calculate properly later
    )