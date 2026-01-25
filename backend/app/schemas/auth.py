from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import IncomeRange

class UpdateProfileRequest(BaseModel):
    income_range: IncomeRange | None = None  
    goals: dict | None = None
    
    @field_validator('goals')
    @classmethod
    def validate_goals(cls, v):
        """Validate goals structure."""
        if v is None:
            return v
        
        # Check that goals is a dict
        if not isinstance(v, dict):
            raise ValueError("goals must be a dictionary")
        
        # Optional: Validate specific fields
        # allowed_keys = {"save_for", "target", "deadline", "priority"}
        # for key in v.keys():
        #     if key not in allowed_keys:
        #         raise ValueError(f"Invalid goal key: {key}. Allowed: {allowed_keys}")
        
        # Optional: Validate target is a number if present
        # if "target" in v and not isinstance(v["target"], (int, float)):
        #     raise ValueError("target must be a number")
        
        return v
    
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    income_range: str | None = None
    goals: dict | None = None

    _validate_goals = field_validator('goals')(UpdateProfileRequest.validate_goals.__func__)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    income_range: IncomeRange | None
    goals: dict | None
    
    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    email: EmailStr
    oldPass: str
    newPass: str