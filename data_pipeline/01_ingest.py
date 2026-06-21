import os
import sqlite3
import pandas as pd
import json
from datasets import load_dataset

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "../backend/data")
os.makedirs(DATA_DIR, exist_ok=True)
RAW_DATA_PATH = os.path.join(DATA_DIR, "raw_movies.csv")
CLEAN_DATA_PATH = os.path.join(DATA_DIR, "clean_movies.csv")

def extract_names(json_str):
    if not isinstance(json_str, str) or not json_str:
        return ""
    try:
        items = json.loads(json_str)
        return ", ".join([item['name'] for item in items])
    except:
        return ""

def download_dataset():
    print("[Ingest] Downloading TMDB 5000 Movies from Hugging Face...")
    ds = load_dataset('AiresPucrs/tmdb-5000-movies', split='train')
    df = ds.to_pandas()
    print(f"[Ingest] Downloaded {len(df)} records. Columns: {list(df.columns)}")
    return df

def clean_dataset(df):
    print("[Ingest] Cleaning dataset...")
    # Map typical tmdb 5000 columns
    # Depending on the dataset layout it might have 'title', 'overview', 'genres'
    
    if 'id' not in df.columns:
        df['id'] = range(1, len(df)+1)
    
    df = df.drop_duplicates(subset=['id'])
    
    # Check for title/overview, otherwise fallback
    title_col = 'title' if 'title' in df.columns else ('original_title' if 'original_title' in df.columns else None)
    
    df = df.dropna(subset=[title_col, 'overview'])
    
    df['genres_str'] = df['genres'].apply(extract_names) if 'genres' in df.columns else ""
    df['keywords_str'] = df['keywords'].apply(extract_names) if 'keywords' in df.columns else ""
    
    df['release_year'] = pd.to_datetime(df['release_date'], errors='coerce').dt.year
    df['release_year'] = df['release_year'].fillna(0).astype(int)
    
    # Prepare final clean df
    clean_df = pd.DataFrame()
    clean_df['id'] = df['id']
    clean_df['title'] = df[title_col]
    clean_df['overview'] = df['overview']
    clean_df['genres'] = df['genres_str']
    clean_df['director'] = df['director'] if 'director' in df.columns else ""
    clean_df['cast'] = df['cast'].apply(extract_names) if 'cast' in df.columns else ""
    clean_df['keywords'] = df['keywords_str']
    clean_df['average_rating'] = df['vote_average'] if 'vote_average' in df.columns else 0.0
    clean_df['vote_count'] = df['vote_count'] if 'vote_count' in df.columns else 0
    clean_df['poster_url'] = ""
    clean_df['backdrop_url'] = ""
    clean_df['release_year'] = df['release_year']
    
    clean_df.to_csv(CLEAN_DATA_PATH, index=False)
    print(f"[Ingest] Cleaned dataset saved to {CLEAN_DATA_PATH} with {len(clean_df)} records.")
    return clean_df

def populate_database(clean_df):
    db_path = os.path.join(DATA_DIR, "cineseek.db")
    print(f"[Ingest] Populating SQLite database at {db_path}...")
    
    import sys
    sys.path.append(os.path.join(SCRIPT_DIR, "../backend"))
    from app.core.database import engine, Base
    from app.models.movie import Movie
    from app.models.search_log import SearchLog
    from app.models.evaluation import EvaluationResult
    
    Base.metadata.create_all(bind=engine)
    
    conn = sqlite3.connect(db_path)
    clean_df.to_sql('movies', conn, if_exists='replace', index=False)
    conn.close()
    print("[Ingest] Database population complete.")

if __name__ == "__main__":
    df = download_dataset()
    clean_df = clean_dataset(df)
    populate_database(clean_df)
