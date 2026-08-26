<div align="center">
  <img src="https://raw.githubusercontent.com/ayushhvm/Argus/main/frontend/public/favicon.ico" alt="Argus Logo" width="80" height="80">
  <h1 align="center">Argus</h1>
  <p align="center">
    <strong>An Intelligent Movie Discovery & Recommendation Platform</strong>
    <br />
    Powered by state-of-the-art Information Retrieval techniques.
  </p>
  <p align="center">
    <a href="https://argus.vercel.app/">Live Demo</a>
    ·
    <a href="https://github.com/ayushhvm/Argus/issues">Report Bug</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
    <img src="https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

<hr />

## 🌟 Overview
Argus is a premium, AI-powered movie discovery platform. Moving beyond traditional exact-match SQL search, Argus demonstrates the power of modern Information Retrieval by combining **Lexical**, **Semantic**, and **Hybrid** search algorithms behind a sleek, commercial-grade user interface. 

Want a "heartwarming family movie about a dog"? Or a "gritty cyberpunk thriller"? Argus understands the *vibe* of your query and finds the perfect match.

---

## 🚀 Key Features
- **🧠 Semantic Understanding:** Uses `all-MiniLM-L6-v2` neural network embeddings and FAISS vector search to understand the conceptual meaning of your query, not just the keywords.
- **🔍 Lexical Precision:** Employs TF-IDF matrix vectorization for blazing-fast, precise keyword matching on titles, cast, and genres.
- **🤝 Hybrid RRF Fusion:** Intelligently merges the results of Semantic and Lexical searches using Reciprocal Rank Fusion (RRF) to give you the absolute best recommendations.
- **🕹️ Developer Playground:** A built-in visualizer that allows you to run queries against all three engines side-by-side in real-time, complete with latency metrics.
- **⚡ Optimized for Serverless:** Custom-tuned PyTorch thread management to run heavy ML models blazingly fast even on constrained serverless containers (like Railway's Free Tier).

---

## 🏗️ Architecture

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, Python, PyTorch, FAISS, Scikit-Learn, SQLite
- **Deployment:** Dockerized architecture. Frontend hosted on Vercel, Backend hosted on Railway.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Method 1: Docker (Recommended)
The easiest way to spin up the entire stack (Database, Backend, and Frontend).

```bash
# 1. Clone the repository
git clone https://github.com/ayushhvm/Argus.git
cd Argus

# 2. Spin up the containers
docker-compose up --build -d
```
- **Frontend** will be running at: `http://localhost:3000`
- **Backend API Docs** will be running at: `http://localhost:8000/docs`

### Method 2: Manual Setup
If you want to run the components independently for active development:

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Academic & Technical Documentation
Looking for the math and methodology behind Argus? 
Please refer to the `/docs` folder for extensive academic documentation, including architecture diagrams, TF-IDF vs FAISS methodology, evaluation metrics (NDCG, Precision@5), and tuning reports.

---
<div align="center">
  <i>Built with ❤️ by Ayush Mangalgi</i>
</div>
