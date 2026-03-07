"""
User typing metrics model (analytics output).

Fields:
  - user_id: FK -> users (primary key)
  - avg_wpm: float
  - error_rate: float
  - slowest_digraphs: JSONB (e.g., {"th": 150, "qu": 200})
  - total_sessions: int
  - last_updated: timestamp
"""

# TODO: Implement SQLAlchemy model (Phase 3)
