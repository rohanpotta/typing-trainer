"""
Leaderboard routes.

Endpoints:
  GET /leaderboard         — get top N users by WPM
  GET /leaderboard/rank    — get current user's rank
"""

from fastapi import APIRouter

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

# TODO: Implement leaderboard endpoints (Phase 2)
