from fastapi import APIRouter
from .endpoints import search, movies, analytics

api_router = APIRouter()
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(movies.router, prefix="/movies", tags=["movies"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
