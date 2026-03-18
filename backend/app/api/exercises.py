"""
Exercise routes.

Endpoints:
  GET  /exercises       — list available exercises
  GET  /exercises/{id}  — get a specific exercise
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.exercise import Exercise
from app.schemas import ExerciseResponse

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseResponse])
async def list_exercises(
    difficulty: str | None = Query(None, description="Filter by difficulty: easy, medium, hard"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Exercise).order_by(Exercise.created_at)
    if difficulty:
        query = query.where(Exercise.difficulty == difficulty)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(exercise_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise
