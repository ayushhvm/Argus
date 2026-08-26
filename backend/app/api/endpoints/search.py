from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
import time

from ...schemas.search import SearchResponse, PlaygroundResponse
from ...schemas.movie import MovieResult, MovieResponse
from ..deps import get_db, get_tfidf_engine, get_semantic_engine, get_hybrid_engine
from ...models.movie import Movie
from ...models.search_log import SearchLog

router = APIRouter()

def _augment_with_movies(db: Session, engine_results: list) -> list:
    augmented = []
    for item in engine_results:
        movie_obj = db.query(Movie).filter(Movie.id == item["movie_id"]).first()
        if movie_obj:
            # Prepare MovieResponse dict
            movie_dict = {
                "id": movie_obj.id,
                "title": movie_obj.title,
                "overview": movie_obj.overview,
                "genres": movie_obj.genres,
                "director": movie_obj.director,
                "cast": movie_obj.cast,
                "keywords": movie_obj.keywords,
                "release_year": movie_obj.release_year,
                "poster_url": movie_obj.poster_url,
                "backdrop_url": movie_obj.backdrop_url,
                "average_rating": movie_obj.average_rating,
                "vote_count": movie_obj.vote_count
            }
            item_dict = {
                "movie": movie_dict,
                "score": item.get("score", item.get("rrf_score", 0.0)),
                "explanation": item.get("explanation"),
                "tfidf_rank": item.get("tfidf_rank"),
                "semantic_rank": item.get("semantic_rank"),
                "rrf_score": item.get("rrf_score")
            }
            augmented.append(item_dict)
    return augmented

@router.get("", response_model=SearchResponse)
def search_movies(
    q: str = Query(..., min_length=1),
    engine: str = Query("hybrid", pattern="^(tfidf|semantic|hybrid)$"),
    db: Session = Depends(get_db),
    tfidf = Depends(get_tfidf_engine),
    semantic = Depends(get_semantic_engine),
    hybrid = Depends(get_hybrid_engine)
):
    if engine == "tfidf":
        res = tfidf.search(q, top_k=20)
    elif engine == "hybrid":
        res = hybrid.search(q, top_k=20)
    else:
        res = semantic.search(q, top_k=20)
        
    augmented_results = _augment_with_movies(db, res["results"])
    
    # Log to database
    log = SearchLog(
        original_query=q,
        expanded_query=res.get("expanded_query", ""),
        retrieval_type=engine,
        latency_ms=res["latency_ms"],
        results_count=len(augmented_results)
    )
    db.add(log)
    db.commit()
    
    return {
        "query": q,
        "expanded_query": res.get("expanded_query", q),
        "engine": engine,
        "latency_ms": res["latency_ms"],
        "results": augmented_results
    }

@router.get("/playground", response_model=PlaygroundResponse)
def search_playground(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    tfidf = Depends(get_tfidf_engine),
    semantic = Depends(get_semantic_engine),
    hybrid = Depends(get_hybrid_engine)
):
    # Execute all three
    res_t = tfidf.search(q, top_k=10)
    res_s = semantic.search(q, top_k=10)
    res_h = hybrid.search(q, top_k=10)
    
    return {
        "query": q,
        "expanded_query": res_t.get("expanded_query", q),
        "tfidf_latency_ms": res_t["latency_ms"],
        "semantic_latency_ms": res_s["latency_ms"],
        "hybrid_latency_ms": res_h["latency_ms"],
        "tfidf_results": _augment_with_movies(db, res_t["results"]),
        "semantic_results": _augment_with_movies(db, res_s["results"]),
        "hybrid_results": _augment_with_movies(db, res_h["results"])
    }
