from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    income_range: str | None = None
    goals: dict | None = None

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str