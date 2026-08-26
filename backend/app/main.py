import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .api.api import api_router
from .api import deps
from .services.retrieval.tfidf_engine import TFIDFEngine
from .services.retrieval.semantic_engine import SemanticEngine
from .services.retrieval.hybrid_engine import HybridEngine
from .core.database import Base, engine

# Ensure DB tables are created
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Loading Retrieval Engines...")
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))
    indices_dir = os.path.join(base_dir, "indices")
    
    deps._engines["tfidf"] = TFIDFEngine(indices_dir)
    deps._engines["semantic"] = SemanticEngine(indices_dir)
    deps._engines["hybrid"] = HybridEngine(indices_dir)
    print("Engines loaded successfully.")
    
    yield
    
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="Argus API",
    description="Information Retrieval Backend for Argus",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}
