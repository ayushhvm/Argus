import os
import pickle
import numpy as np
import time
from sklearn.metrics.pairwise import cosine_similarity
from .query_processor import preprocess_text
from .adaptive_expansion import expand_query

class TFIDFEngine:
    def __init__(self, indices_dir: str):
        self.vectorizer_path = os.path.join(indices_dir, "tfidf_vectorizer.pkl")
        self.matrix_path = os.path.join(indices_dir, "tfidf_matrix.pkl")
        self.movie_ids_path = os.path.join(indices_dir, "movie_ids.pkl")
        
        self.vectorizer = None
        self.tfidf_matrix = None
        self.movie_ids = None
        self._load_indices()

    def _load_indices(self):
        try:
            with open(self.vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            with open(self.matrix_path, 'rb') as f:
                self.tfidf_matrix = pickle.load(f)
            with open(self.movie_ids_path, 'rb') as f:
                self.movie_ids = pickle.load(f)
        except Exception as e:
            print(f"Failed to load TF-IDF indices: {e}")

    def search(self, query: str, top_k: int = 10):
        """
        Retrieves top_k movies based on cosine similarity of TF-IDF vectors.
        """
        start_time = time.time()
        
        # 1. Preprocess
        clean_query = preprocess_text(query)
        
        # 2. Adaptive Expansion
        expanded_query = expand_query(clean_query)
        
        # 3. Vectorize
        query_vector = self.vectorizer.transform([expanded_query])
        
        # 4. Cosine Similarity
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        
        # 5. Top K Retrieval
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0:
                results.append({
                    "movie_id": self.movie_ids[idx],
                    "score": score
                })
                
        latency = (time.time() - start_time) * 1000 # ms
        
        return {
            "original_query": query,
            "expanded_query": expanded_query,
            "latency_ms": latency,
            "results": results
        }
