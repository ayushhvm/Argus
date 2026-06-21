from pydantic import BaseModel
from typing import Optional

class MovieBase(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    genres: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    keywords: Optional[str] = None
    release_year: Optional[int] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    average_rating: Optional[float] = None
    vote_count: Optional[int] = None

class MovieResponse(MovieBase):
    pass

class MovieResult(BaseModel):
    movie: MovieResponse
    score: float
    explanation: Optional[str] = None
    tfidf_rank: Optional[int] = None
    semantic_rank: Optional[int] = None
    rrf_score: Optional[float] = None
