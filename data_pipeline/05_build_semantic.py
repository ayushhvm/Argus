import os
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "../backend/data")
INDICES_DIR = os.path.join(SCRIPT_DIR, "../backend/indices")
PARQUET_PATH = os.path.join(DATA_DIR, "movies_processed.parquet")

EMBEDDINGS_PATH = os.path.join(INDICES_DIR, "movie_embeddings.npy")
FAISS_INDEX_PATH = os.path.join(INDICES_DIR, "faiss_index.bin")

def build_semantic_indices():
    print("[Semantic] Building Semantic Embeddings and FAISS Index...")
    os.makedirs(INDICES_DIR, exist_ok=True)
    
    if not os.path.exists(PARQUET_PATH):
        print(f"[Semantic] Processed data not found at {PARQUET_PATH}.")
        return
        
    df = pd.read_parquet(PARQUET_PATH)
    print(f"[Semantic] Loaded {len(df)} records.")
    
    # For semantic search, natural language structure is preferred over heavily preprocessed tokens.
    # Therefore, we use the original `search_document` which contains punctuation and stopwords.
    documents = df['search_document'].tolist()
    
    # Load SentenceTransformer
    print("[Semantic] Loading all-MiniLM-L6-v2 model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Generate embeddings
    print("[Semantic] Encoding documents. This may take a few minutes...")
    start_time = time.time()
    embeddings = model.encode(documents, show_progress_bar=True, normalize_embeddings=True)
    print(f"[Semantic] Encoding finished in {time.time() - start_time:.2f} seconds.")
    
    # Save raw embeddings
    np.save(EMBEDDINGS_PATH, embeddings)
    print(f"[Semantic] Saved embeddings to {EMBEDDINGS_PATH}")
    
    # Build FAISS Index
    # Since embeddings are normalized, Inner Product (IP) is equivalent to Cosine Similarity
    embedding_dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(embedding_dim)
    index.add(embeddings)
    
    faiss.write_index(index, FAISS_INDEX_PATH)
    print(f"[Semantic] Saved FAISS index to {FAISS_INDEX_PATH}")
    print(f"[Semantic] Index contains {index.ntotal} vectors of dimension {embedding_dim}.")

if __name__ == "__main__":
    build_semantic_indices()
