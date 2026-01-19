from fastapi import APIRouter
# from app.src.constants import TRANSACTION_CATEGORIES

router = APIRouter()

@router.get("/categories")
async def get_categories():
    return {"categories": "need to implement"}
