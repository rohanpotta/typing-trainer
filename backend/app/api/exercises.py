"""
Exercise routes.

Endpoints:
  GET  /exercises       — list available exercises
  GET  /exercises/{id}  — get a specific exercise
  POST /exercises/adaptive — generate an adaptive exercise for the user
"""

from fastapi import APIRouter

router = APIRouter(prefix="/exercises", tags=["exercises"])

# TODO: Implement exercise endpoints (Phase 1)
