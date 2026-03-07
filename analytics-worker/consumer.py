"""
Kafka consumer for processing typing session events.

Consumes:
  - session_completed: triggers metrics computation
  - exercise_generated: logs adaptive exercise creation

Computes:
  - Error frequency per character
  - Digraph latency analysis
  - Typing performance trends

Updates aggregate tables in PostgreSQL.
"""

# TODO: Implement Kafka consumer (Phase 3)
