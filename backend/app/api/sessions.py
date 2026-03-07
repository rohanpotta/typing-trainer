"""
Session routes.

Endpoints:
  POST /sessions       — submit a completed typing session
  GET  /sessions       — list sessions for the authenticated user
  GET  /sessions/{id}  — get session details
"""

from fastapi import APIRouter

router = APIRouter(prefix="/sessions", tags=["sessions"])

# TODO: Implement session endpoints (Phase 1)
