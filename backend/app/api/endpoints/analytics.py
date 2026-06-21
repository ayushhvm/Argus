from fastapi import APIRouter, Depends, HTTPException
import os
import json
from sqlalchemy.orm import Session

from ...schemas.analytics import SystemAnalyticsResponse, EvaluationResponse, DatasetInsightsResponse
from ..deps import get_db, get_semantic_engine
from ...models.movie import Movie

router = APIRouter()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
EVAL_PATH = os.path.join(BASE_DIR, "tests", "evaluation", "evaluation_report.json")
INSIGHTS_PATH = os.path.join(BASE_DIR, "data", "dataset_insights.json")
DB_PATH = os.path.join(BASE_DIR, "data", "cineseek.db")

@router.get("/evaluation", response_model=EvaluationResponse)
def get_evaluation_report():
    if not os.path.exists(EVAL_PATH):
        raise HTTPException(status_code=404, detail="Evaluation report not found")
    with open(EVAL_PATH, "r") as f:
        return json.load(f)

@router.get("/system", response_model=SystemAnalyticsResponse)
def get_system_analytics(
    db: Session = Depends(get_db),
    semantic = Depends(get_semantic_engine)
):
    total = db.query(Movie).count()
    db_size = os.path.getsize(DB_PATH) / (1024 * 1024) if os.path.exists(DB_PATH) else 0.0
    
    return {
        "db_size_mb": round(db_size, 2),
        "total_movies": total,
        "engines_loaded": semantic is not None
    }

@router.get("/insights/dataset", response_model=DatasetInsightsResponse)
def get_dataset_insights():
    if not os.path.exists(INSIGHTS_PATH):
        raise HTTPException(status_code=404, detail="Dataset insights not found")
    with open(INSIGHTS_PATH, "r") as f:
        data = json.load(f)
        
    return {
        "total_movies": data.get("total_movies", 0),
        "genre_distribution": data.get("top_genres", {}),
        "movies_per_decade": data.get("movies_per_decade", {}),
        "common_keywords": [{"keyword": k, "count": v} for k, v in data.get("top_keywords", {}).items()]
    }
