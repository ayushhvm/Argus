# CineSeek

An Intelligent Movie Discovery and Recommendation Platform using state-of-the-art Information Retrieval techniques.

## Overview
CineSeek is a premium movie discovery platform that demonstrates core Information Retrieval concepts (Lexical, Semantic, Hybrid) while maintaining the look and feel of a modern commercial product.

## Architecture
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python, SQLite
- **Retrieval Engines**: TF-IDF (Lexical), FAISS + Sentence Transformers (Semantic), RRF (Hybrid)

## Setup Guide

### Running with Docker (Recommended)
1. Ensure Docker Desktop is running.
2. Run `docker-compose up --build -d`
3. Access the Frontend at `http://localhost:3000`
4. Access the Backend API docs at `http://localhost:8000/docs`

### Running Locally (Development)
1. Backend:
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload
   ```
2. Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Academic Documentation
Please refer to the `/docs` folder for extensive academic documentation, including architecture diagrams, methodology, evaluation reports, and results.
