from pydantic import BaseModel
from typing import List, Optional
from .movie import MovieResult

class SearchResponse(BaseModel):
    query: str
    expanded_query: str
    engine: str
    latency_ms: float
    results: List[MovieResult]

class PlaygroundResponse(BaseModel):
    query: str
    expanded_query: str
    tfidf_latency_ms: float
    semantic_latency_ms: float
    hybrid_latency_ms: float
    tfidf_results: List[MovieResult]
    semantic_results: List[MovieResult]
    hybrid_results: List[MovieResult]
