import os
import sqlite3
import pandas as pd
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(SCRIPT_DIR, "../backend")
sys.path.append(BACKEND_DIR)

from app.services.retrieval.query_processor import preprocess_text

DATA_DIR = os.path.join(BACKEND_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "cineseek.db")
PARQUET_PATH = os.path.join(DATA_DIR, "movies_processed.parquet")

def preprocess_dataset():
    print("[Preprocess] Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    
    df = pd.read_sql_query("SELECT * FROM movies", conn)
    print(f"[Preprocess] Loaded {len(df)} movies for preprocessing.")
    
    # Create a combined document field
    df['search_document'] = (
        df['title'].fillna('') + " " +
        df['overview'].fillna('') + " " +
        df['genres'].fillna('') + " " +
        df['director'].fillna('') + " " +
        df['cast'].fillna('') + " " +
        df['keywords'].fillna('')
    )
    
    # Apply centralized preprocessing
    df['processed_document'] = df['search_document'].apply(preprocess_text)
    
    docs_df = df[['id', 'search_document', 'processed_document']]
    docs_df.to_sql('movie_documents', conn, if_exists='replace', index=False)
    
    # Save to parquet as requested
    df.to_parquet(PARQUET_PATH, index=False)
    print(f"[Preprocess] Preprocessing complete. Saved to 'movie_documents' table and {PARQUET_PATH}.")
    print(f"[Preprocess] Number of processed documents: {len(docs_df)}")
    
    # Show a sample
    if len(docs_df) > 0:
        print("\n--- Sample Processed Document ---")
        sample = df.iloc[0]
        print(f"Title: {sample['title']}")
        print(f"Document: {sample['processed_document'][:300]}...")
        print("---------------------------------\n")

    conn.close()

if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        print(f"[Preprocess] Database not found at {DB_PATH}. Run 01_ingest.py first.")
    else:
        preprocess_dataset()
