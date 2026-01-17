from fastapi import APIRouter
from app.utils.constants import TRANSACTION_CATEGORIES

router = APIRouter()

@router.get("/categories")
async def get_categories():
    return {"categories": TRANSACTION_CATEGORIES}
