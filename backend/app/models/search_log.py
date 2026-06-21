from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    original_query = Column(String)
    expanded_query = Column(String)
    retrieval_type = Column(String)
    latency_ms = Column(Float)
    results_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
