import os
import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "../backend/data")
INDICES_DIR = os.path.join(SCRIPT_DIR, "../backend/indices")
PARQUET_PATH = os.path.join(DATA_DIR, "movies_processed.parquet")

VECTORIZER_PATH = os.path.join(INDICES_DIR, "tfidf_vectorizer.pkl")
MATRIX_PATH = os.path.join(INDICES_DIR, "tfidf_matrix.pkl")
MOVIE_IDS_PATH = os.path.join(INDICES_DIR, "movie_ids.pkl")

def build_tfidf():
    print("[TF-IDF] Building TF-IDF indices...")
    os.makedirs(INDICES_DIR, exist_ok=True)
    
    if not os.path.exists(PARQUET_PATH):
        print(f"[TF-IDF] Processed data not found at {PARQUET_PATH}. Run Phase 1 scripts.")
        return
        
    df = pd.read_parquet(PARQUET_PATH)
    print(f"[TF-IDF] Loaded {len(df)} records.")
    
    # We use the centralized preprocessing output
    documents = df['processed_document'].tolist()
    movie_ids = df['id'].tolist()
    
    # Initialize and fit TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english', max_df=0.85, min_df=2)
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    print(f"[TF-IDF] Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"[TF-IDF] Matrix shape: {tfidf_matrix.shape}")
    
    # Persist objects
    with open(VECTORIZER_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
        
    with open(MATRIX_PATH, 'wb') as f:
        pickle.dump(tfidf_matrix, f)
        
    with open(MOVIE_IDS_PATH, 'wb') as f:
        pickle.dump(movie_ids, f)
        
    print(f"[TF-IDF] Saved vectorizer and matrix to {INDICES_DIR}")

if __name__ == "__main__":
    build_tfidf()
