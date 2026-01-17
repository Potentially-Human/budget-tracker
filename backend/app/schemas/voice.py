from pydantic import BaseModel


class VoiceTranscription(BaseModel):
    text: str
    confidence: float | None = None


class VoiceTransactionResponse(BaseModel):
    """Response after processing voice input."""
    transcription: str
    transaction: dict  # The created transaction
    confidence: float