from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import time
import numpy as np

from ...schemas.movie import MovieResponse, MovieResult
from ..deps import get_db, get_semantic_engine
from ...models.movie import Movie
from .search import _augment_with_movies

router = APIRouter()

@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/{movie_id}/similar", response_model=List[MovieResult])
def get_similar_movies(
    movie_id: int, 
    db: Session = Depends(get_db),
    semantic = Depends(get_semantic_engine)
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    # Since we are using Semantic Retrieval for 'similar', we can either encode the movie's 
    # overview/search_document, or if we had a direct movie_id vector lookup, we could use that.
    # The simplest is to encode the movie's title + overview + genres.
    doc_text = f"{movie.title} {movie.overview} {movie.genres}"
    
    # We use search(), but we might get the movie itself back as rank 1.
    res = semantic.search(doc_text, top_k=11)
    
    # Filter out the requested movie itself
    filtered_results = [r for r in res["results"] if r["movie_id"] != movie_id][:10]
    
    augmented = _augment_with_movies(db, filtered_results)
    return augmented


@router.get("/{movie_id}/galaxy")
def get_movie_galaxy(
    movie_id: int,
    top_k: int = Query(default=12, ge=5, le=20),
    db: Session = Depends(get_db),
    semantic = Depends(get_semantic_engine)
):
    """
    Returns a force-graph payload for the Vibe Galaxy feature.
    Uses direct FAISS vector lookup (by position in the index) to find
    the most semantically similar movies without needing to re-encode.
    """
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # --- Direct vector lookup ---
    # movie_ids list maps FAISS index position -> movie_id
    # We find the position of this movie_id in the list
    try:
        movie_id_list = semantic.movie_ids  # list of movie IDs in FAISS order
        if movie_id not in movie_id_list:
            raise HTTPException(status_code=404, detail="Movie not in semantic index")
        
        pos = movie_id_list.index(movie_id)
        
        # Reconstruct the vector from the FAISS index
        d = semantic.faiss_index.d  # embedding dimension
        center_vector = np.zeros((1, d), dtype=np.float32)
        semantic.faiss_index.reconstruct(pos, center_vector[0])
        
        # Search for nearest neighbors
        distances, indices = semantic.faiss_index.search(center_vector, top_k + 1)
        
        neighbor_ids = []
        neighbor_scores = []
        for i, idx in enumerate(indices[0]):
            nid = movie_id_list[idx]
            if nid == movie_id:
                continue
            neighbor_ids.append(nid)
            neighbor_scores.append(float(distances[0][i]))
        
        neighbor_ids = neighbor_ids[:top_k]
        neighbor_scores = neighbor_scores[:top_k]

    except Exception as e:
        # Fallback: encode the movie text
        doc_text = f"{movie.title} {movie.overview} {movie.genres}"
        res = semantic.search(doc_text, top_k=top_k + 1)
        neighbors_raw = [r for r in res["results"] if r["movie_id"] != movie_id][:top_k]
        neighbor_ids = [r["movie_id"] for r in neighbors_raw]
        neighbor_scores = [r["score"] for r in neighbors_raw]

    # Build node list from DB
    def movie_to_node(m: Movie, score: float = 1.0) -> Dict[str, Any]:
        return {
            "id": m.id,
            "title": m.title,
            "genres": m.genres or "",
            "poster_url": m.poster_url or "",
            "average_rating": m.average_rating or 0.0,
            "release_year": m.release_year,
            "score": score,
        }

    center_node = movie_to_node(movie, 1.0)
    neighbor_movies = db.query(Movie).filter(Movie.id.in_(neighbor_ids)).all()
    neighbor_map = {m.id: m for m in neighbor_movies}

    nodes = [center_node]
    edges = []

    for nid, score in zip(neighbor_ids, neighbor_scores):
        nm = neighbor_map.get(nid)
        if nm:
            nodes.append(movie_to_node(nm, score))
            edges.append({"source": movie_id, "target": nid, "weight": score})

    return {
        "center_id": movie_id,
        "nodes": nodes,
        "edges": edges,
    }

