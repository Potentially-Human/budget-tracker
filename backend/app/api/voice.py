from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import asyncio

from app.database import get_db
from app.models.user import User
from app.models.transactions import Transaction
from app.api.auth import get_current_user
from app.schemas.voice import VoiceTransactionResponse
from app.ai_services.voice import process_voice_input

router = APIRouter()


@router.post("/upload", response_model=VoiceTransactionResponse)
async def upload_voice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload audio file and extract transaction data.
    
    - Accepts audio file (WAV, MP3, etc.)
    - Uses Gemini to transcribe and extract amount/category/description
    - Creates transaction in database
    - Returns the created transaction
    """
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be audio format")
    
    # Read audio file
    audio_data = await file.read()
    
    # Process voice input using your teammate's LLM service
    result = await process_voice_input(audio_data, current_user.id, db)
    
    return result


@router.post("/realtime/start")
async def start_realtime_session(
    current_user: User = Depends(get_current_user)
):
    """
    Start a real-time voice session with Gemini.
    
    Returns session ID that frontend can use for WebSocket connection.
    """
    # This would need WebSocket implementation
    # For hackathon, you might skip this and just use file upload
    return {"message": "Real-time audio not implemented yet"}