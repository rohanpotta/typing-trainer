# Adaptive Typing Trainer

A web platform that captures **keystroke-level typing data**, analyzes user weaknesses (slow key transitions, error patterns), and dynamically generates targeted typing exercises to improve speed and accuracy.

## Architecture

The system separates **real-time typing interactions** from **analytics processing** using an **event-driven architecture**.

```
Frontend (React)
        │
        ▼
     FastAPI
        │
   ┌────┴───────┐
   │             │
Postgres       Redis
   │
   ▼
  Kafka
   │
   ▼
Analytics Worker
```

**User interaction path stays fast. Analytics happens asynchronously.**

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend API | FastAPI (Python) | Auth, exercises, sessions, leaderboards |
| Database | PostgreSQL | Users, exercises, sessions, metrics |
| Cache | Redis | Leaderboards (sorted sets), session caching |
| Event Streaming | Kafka | Async analytics pipeline |
| Analytics Worker | Python (Kafka consumer) | Digraph latency, error frequency, trends |
| Frontend | React | Typing UI, stats visualization |
| Containerization | Docker + Docker Compose | Full local stack |

## Key Features

- **Real-time typing sessions** with WPM and accuracy tracking
- **Adaptive exercise generation** based on weakest digraphs (no AI required)
- **Event-driven analytics pipeline** processing typing data asynchronously via Kafka
- **Redis-powered leaderboards** using sorted sets
- **Longitudinal typing metrics** and progress visualization

## Development Phases

### Phase 1 — MVP
FastAPI + PostgreSQL + React frontend. Basic typing exercises, session tracking, WPM calculation.

### Phase 2 — Caching & Leaderboards
Add Redis for leaderboards (sorted sets) and session caching.

### Phase 3 — Event-Driven Analytics
Add Kafka + analytics worker for async processing, adaptive exercise generation.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### Run Locally

```bash
docker-compose up -d
```

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
typing-trainer/
├── backend/
│   └── app/
│       ├── api/          # Route handlers
│       ├── services/     # Business logic
│       ├── models/       # SQLAlchemy models
│       ├── db/           # Database config
│       └── main.py       # FastAPI entrypoint
├── analytics-worker/     # Kafka consumer + metrics processing
├── frontend/             # React application
├── infra/
│   └── docker/           # Dockerfiles
├── scripts/              # Seed data, utilities
└── docker-compose.yml
```

## License

MIT
