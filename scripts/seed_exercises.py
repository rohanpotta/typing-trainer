"""
Seed script for populating the exercises table with initial typing exercises.

Usage:
    python scripts/seed_exercises.py
"""

import asyncio
import sys
import os

# Add backend to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.database import async_session, engine, Base
from app.models.exercise import Exercise


EXERCISES = [
    # Easy
    {
        "title": "Common Words",
        "text": "the quick brown fox jumps over the lazy dog and the cat sat on the mat while the bird sang a sweet song in the morning sun",
        "difficulty": "easy",
    },
    {
        "title": "Simple Sentences",
        "text": "she went to the store to buy some milk and bread then came home and made a nice lunch for the whole family",
        "difficulty": "easy",
    },
    {
        "title": "Short Words",
        "text": "it is a big day for us all we can do our best and see how far we get in the end it will be fun and good for us",
        "difficulty": "easy",
    },
    {
        "title": "Nature Walk",
        "text": "the sun rose over the hills and cast long shadows on the green fields below a gentle breeze moved through the tall grass",
        "difficulty": "easy",
    },
    {
        "title": "Daily Routine",
        "text": "every morning i wake up brush my teeth eat breakfast and head out the door to start another day of work and learning",
        "difficulty": "easy",
    },
    # Medium
    {
        "title": "Technology Paragraph",
        "text": "modern software systems rely on distributed architectures that separate concerns across multiple services enabling teams to deploy and scale components independently while maintaining system reliability",
        "difficulty": "medium",
    },
    {
        "title": "Backend Engineering",
        "text": "the database processes queries through an optimized execution plan that leverages indexed columns and cached results to minimize disk access and reduce response latency for concurrent users",
        "difficulty": "medium",
    },
    {
        "title": "Problem Solving",
        "text": "debugging complex systems requires methodical thinking start by reproducing the issue then isolate variables check assumptions and trace the execution path until the root cause becomes clear",
        "difficulty": "medium",
    },
    {
        "title": "Data Structures",
        "text": "a hash table provides constant time lookups by mapping keys through a hash function to array indices handling collisions with chaining or open addressing to maintain performance under load",
        "difficulty": "medium",
    },
    {
        "title": "Networking Basics",
        "text": "when a client sends an http request it travels through dns resolution tcp handshake and tls negotiation before the server processes the payload and returns a structured response",
        "difficulty": "medium",
    },
    {
        "title": "System Design",
        "text": "designing for high availability means eliminating single points of failure through redundancy implementing health checks and automated failover and distributing traffic across geographic regions",
        "difficulty": "medium",
    },
    {
        "title": "API Design",
        "text": "restful apis should use consistent resource naming return appropriate status codes support pagination for collection endpoints and provide clear error messages that help developers debug integration issues",
        "difficulty": "medium",
    },
    # Hard
    {
        "title": "Distributed Systems",
        "text": "in a microservices architecture event-driven communication through message brokers like kafka enables asynchronous processing decouples service dependencies and provides durability through persistent log-based storage with configurable retention policies",
        "difficulty": "hard",
    },
    {
        "title": "Algorithm Complexity",
        "text": "the fibonacci sequence computed recursively exhibits exponential time complexity whereas dynamic programming with memoization reduces it to linear time by caching previously calculated subproblems in a dictionary or array",
        "difficulty": "hard",
    },
    {
        "title": "Concurrency Patterns",
        "text": "asynchronous programming with coroutines allows thousands of concurrent connections without thread overhead by yielding control during io-bound operations and resuming execution when the awaited result becomes available through the event loop",
        "difficulty": "hard",
    },
    {
        "title": "Container Orchestration",
        "text": "kubernetes manages containerized workloads by scheduling pods across nodes performing rolling deployments with health-check-based readiness gates and automatically scaling replicas based on cpu utilization and custom metrics from prometheus",
        "difficulty": "hard",
    },
    {
        "title": "Database Internals",
        "text": "postgresql uses multiversion concurrency control where each transaction sees a snapshot of the database at its start time enabling readers and writers to operate simultaneously without blocking through careful management of row visibility and vacuum processes",
        "difficulty": "hard",
    },
    {
        "title": "Machine Learning Pipeline",
        "text": "a production machine learning pipeline ingests raw features through a transformation layer normalizes distributions handles missing values trains models with cross-validated hyperparameter tuning and deploys versioned artifacts behind a prediction serving gateway",
        "difficulty": "hard",
    },
    {
        "title": "Security Engineering",
        "text": "implementing defense in depth requires layered security controls including network segmentation encrypted transport with mutual tls authentication token rotation least-privilege access policies and comprehensive audit logging with tamper-evident storage",
        "difficulty": "hard",
    },
    {
        "title": "Graph Algorithms",
        "text": "dijkstras shortest path algorithm maintains a priority queue of unvisited vertices greedily selecting the minimum distance node at each step and relaxing adjacent edges until all reachable vertices have their optimal distances calculated from the source",
        "difficulty": "hard",
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Check if exercises already exist
        from sqlalchemy import select, func
        result = await session.execute(select(func.count()).select_from(Exercise))
        count = result.scalar()
        if count > 0:
            print(f"Database already has {count} exercises. Skipping seed.")
            return

        for ex_data in EXERCISES:
            exercise = Exercise(
                title=ex_data["title"],
                text=ex_data["text"],
                difficulty=ex_data["difficulty"],
                word_count=len(ex_data["text"].split()),
            )
            session.add(exercise)

        await session.commit()
        print(f"Seeded {len(EXERCISES)} exercises.")


if __name__ == "__main__":
    asyncio.run(seed())
