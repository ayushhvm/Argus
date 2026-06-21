from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import time

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
