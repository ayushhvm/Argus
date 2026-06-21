import os
import pickle
import numpy as np
import time
import faiss
from sentence_transformers import SentenceTransformer
from .query_processor import preprocess_text

class SemanticEngine:
    def __init__(self, indices_dir: str):
        self.faiss_index_path = os.path.join(indices_dir, "faiss_index.bin")
        self.movie_ids_path = os.path.join(indices_dir, "movie_ids.pkl")
        
        self.model = None
        self.faiss_index = None
        self.movie_ids = None
        self._load_indices()

    def _load_indices(self):
        try:
            # We load the model dynamically. In production, this would be a singleton or loaded at startup.
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.faiss_index = faiss.read_index(self.faiss_index_path)
            
            with open(self.movie_ids_path, 'rb') as f:
                self.movie_ids = pickle.load(f)
        except Exception as e:
            print(f"Failed to load Semantic indices: {e}")

    def search(self, query: str, top_k: int = 10):
        """
        Retrieves top_k movies based on semantic similarity using FAISS.
        """
        start_time = time.time()
        
        # We do not use the adaptive genre expander here because semantic models 
        # implicitly understand relationships like "scary" -> "horror".
        # We also don't aggressively strip punctuation for the semantic encoder,
        # but lowercasing can help standardize user input.
        clean_query = query.lower().strip()
        
        # Generate embedding
        query_vector = self.model.encode([clean_query], normalize_embeddings=True)
        
        # FAISS search
        similarities, indices = self.faiss_index.search(query_vector, top_k)
        
        results = []
        for i in range(top_k):
            idx = indices[0][i]
            score = float(similarities[0][i])
            results.append({
                "movie_id": self.movie_ids[idx],
                "score": score
            })
                
        latency = (time.time() - start_time) * 1000 # ms
        
        return {
            "original_query": query,
            "latency_ms": latency,
            "results": results
        }
