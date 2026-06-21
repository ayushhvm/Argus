# Architecture

The system uses a decoupled architecture:
1. **Frontend**: Next.js 14, React, Tailwind CSS
2. **Backend**: FastAPI, Python, SQLite
3. **Information Retrieval**: Scikit-Learn (TF-IDF), SentenceTransformers (MiniLM), FAISS.

```mermaid
graph TD
    A[Frontend UI] -->|REST API| B[FastAPI Backend]
    B --> C[Lexical Engine]
    B --> D[Semantic Engine]
    C --> E[Hybrid RRF Fusion]
    D --> E[Hybrid RRF Fusion]
```
