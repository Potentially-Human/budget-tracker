from app.models.transactions import Transaction
from datetime import datetime
from app.src.llm_caller import LLMCaller
# Import your teammate's LLMCaller here
# from app.services.llm_caller import LLMCaller


async def process_voice_input(audio_data: bytes, user_id: int, db):
    """
    Process voice input and create transaction.
    
    Use Gemini integration to extract:
    - amount
    - category  
    - description
    """
    
    # TODO: Call Gemini audio API
    # result = await llm_caller.call_audio(audio_data)
    # extracted_data = result['tool_call_result']
    
    # Placeholder extraction
    extracted_data = {
        "amount": 25.50,
        "category": "Food & Dining",
        "description": "Coffee at Starbucks"
    }
    
    # Create transaction
    transaction = Transaction(
        user_id=user_id,
        amount=extracted_data["amount"],
        category=extracted_data["category"],
        merchant=extracted_data.get("description"),
        date=datetime.utcnow(),
        input_method="voice"
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return {
        "transcription": "Spent $25.50 on coffee at Starbucks",
        "transaction": transaction,
        "confidence": 0.95
    }