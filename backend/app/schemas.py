"""
Pydantic schemas for request/response validation.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ─── Auth ────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Exercises ───────────────────────────────────────────────────────────

class ExerciseResponse(BaseModel):
    id: uuid.UUID
    title: str
    text: str
    difficulty: str
    word_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Sessions ────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    exercise_id: uuid.UUID
    wpm: float = Field(..., ge=0)
    accuracy: float = Field(..., ge=0, le=100)
    duration: float = Field(..., gt=0)
    keystroke_log: dict | None = None


class SessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    exercise_id: uuid.UUID
    wpm: float
    accuracy: float
    duration: float
    keystroke_log: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
