import os
import time
from .tfidf_engine import TFIDFEngine
from .semantic_engine import SemanticEngine
from .rrf_ranker import compute_rrf
from .explanation_engine import generate_explanation

class HybridEngine:
    def __init__(self, indices_dir: str):
        self.tfidf = TFIDFEngine(indices_dir)
        self.semantic = SemanticEngine(indices_dir)
        
    def search(self, query: str, top_k: int = 10, rrf_k: int = 60):
        start_time = time.time()
        
        # We fetch more documents initially to ensure a deep pool for RRF
        fetch_k = max(50, top_k * 2)
        
        # 1. Fetch TF-IDF Results
        tfidf_response = self.tfidf.search(query, top_k=fetch_k)
        
        # 2. Fetch Semantic Results
        semantic_response = self.semantic.search(query, top_k=fetch_k)
        
        # 3. Apply Reciprocal Rank Fusion
        hybrid_ranked = compute_rrf(tfidf_response['results'], semantic_response['results'], k=rrf_k)
        
        # 4. Truncate to top_k
        top_hybrid = hybrid_ranked[:top_k]
        
        # 5. Generate Explanations
        expanded_query = tfidf_response.get("expanded_query", query)
        results = []
        for item in top_hybrid:
            explanation = generate_explanation(item, expanded_query)
            # Combine the base dict with the explanation
            results.append({**item, **explanation})
            
        latency = (time.time() - start_time) * 1000 # ms
        
        return {
            "query": query,
            "expanded_query": expanded_query,
            "latency_ms": latency,
            "results": results
        }
