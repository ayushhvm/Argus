from sqlalchemy import Column, Integer, String, Text, Float
from app.core.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    overview = Column(Text)
    genres = Column(String)
    director = Column(String)
    cast = Column(String)
    keywords = Column(String)
    average_rating = Column(Float)
    vote_count = Column(Integer)
    poster_url = Column(String)
    backdrop_url = Column(String)
    release_year = Column(Integer)
