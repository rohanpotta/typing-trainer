"""
Session routes.

Endpoints:
  POST /sessions       — submit a completed typing session
  GET  /sessions       — list sessions for the authenticated user
  GET  /sessions/{id}  — get session details
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.user import User
from app.models.session import TypingSession
from app.models.exercise import Exercise
from app.schemas import SessionCreate, SessionResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse, status_code=201)
async def create_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify exercise exists
    result = await db.execute(select(Exercise).where(Exercise.id == data.exercise_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Exercise not found")

    session = TypingSession(
        user_id=current_user.id,
        exercise_id=data.exercise_id,
        wpm=data.wpm,
        accuracy=data.accuracy,
        duration=data.duration,
        keystroke_log=data.keystroke_log,
    )
    db.add(session)
    await db.flush()

    # Re-fetch to get relationships populated
    await db.refresh(session)
    return session


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TypingSession)
        .where(TypingSession.user_id == current_user.id)
        .order_by(TypingSession.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TypingSession).where(
            TypingSession.id == session_id,
            TypingSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
