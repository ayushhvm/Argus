from pydantic import BaseModel
from typing import Dict, Any, List

class SystemAnalyticsResponse(BaseModel):
    db_size_mb: float
    total_movies: int
    engines_loaded: bool

class EvaluationResponse(BaseModel):
    aggregate_metrics: Dict[str, Dict[str, float]]
    per_query_metrics: List[Dict[str, Any]]

class DatasetInsightsResponse(BaseModel):
    total_movies: int
    genre_distribution: Dict[str, int]
    movies_per_decade: Dict[str, int]
    common_keywords: List[Dict[str, Any]]
