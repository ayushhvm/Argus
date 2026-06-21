from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, index=True)
    metric_name = Column(String)
    metric_value = Column(Float)
    model_type = Column(String) # E.g., 'tfidf', 'semantic', 'hybrid'
    created_at = Column(DateTime, default=datetime.utcnow)
