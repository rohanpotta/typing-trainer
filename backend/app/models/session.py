"""
Session model.

Fields:
  - id: UUID primary key
  - user_id: FK -> users
  - exercise_id: FK -> exercises
  - wpm: float
  - accuracy: float (0-100)
  - duration: float (seconds)
  - keystroke_data: JSONB (raw keystroke timings)
  - created_at: timestamp
"""

# TODO: Implement SQLAlchemy model (Phase 1)
