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
    print("[Ingest] Downloading wykonos/movies from Hugging Face...")
    ds = load_dataset('wykonos/movies', split='train')
    df = ds.to_pandas()
    print(f"[Ingest] Downloaded {len(df)} records. Columns: {list(df.columns)}")
    
    df = df[df['original_language'] == 'en']
    df = df.dropna(subset=['overview', 'title', 'poster_path', 'vote_count'])
    df = df.sort_values(by='vote_count', ascending=False)
    df = df.head(10000)
    print(f"[Ingest] Filtered to top {len(df)} movies by vote_count.")
    return df

def clean_dataset(df):
    print("[Ingest] Cleaning dataset...")
    
    if 'id' not in df.columns:
        df['id'] = range(1, len(df)+1)
    
    df = df.drop_duplicates(subset=['id'])
    
    def format_str(val):
        if not isinstance(val, str) or not val: return ""
        return val.replace("-", ", ")

    df['genres_str'] = df['genres'].apply(format_str) if 'genres' in df.columns else ""
    df['keywords_str'] = df['keywords'].apply(format_str) if 'keywords' in df.columns else ""
    df['cast_str'] = df['credits'].apply(format_str) if 'credits' in df.columns else ""
    
    df['release_year'] = pd.to_datetime(df['release_date'], errors='coerce').dt.year
    df['release_year'] = df['release_year'].fillna(0).astype(int)
    
    # Prepare final clean df
    clean_df = pd.DataFrame()
    clean_df['id'] = df['id']
    clean_df['title'] = df['title']
    clean_df['overview'] = df['overview']
    clean_df['genres'] = df['genres_str']
    clean_df['director'] = "" # No simple director column in wykonos/movies, usually in crew
    clean_df['cast'] = df['cast_str']
    clean_df['keywords'] = df['keywords_str']
    clean_df['average_rating'] = df['vote_average'] if 'vote_average' in df.columns else 0.0
    clean_df['vote_count'] = df['vote_count'] if 'vote_count' in df.columns else 0
    clean_df['poster_url'] = df['poster_path'].apply(lambda x: f"https://image.tmdb.org/t/p/w500{x}" if isinstance(x, str) and x else "")
    clean_df['backdrop_url'] = df['backdrop_path'].apply(lambda x: f"https://image.tmdb.org/t/p/original{x}" if isinstance(x, str) and x else "")
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
