import os
import sqlite3
import pandas as pd
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "../backend/data")
DB_PATH = os.path.join(DATA_DIR, "cineseek.db")
INSIGHTS_PATH = os.path.join(DATA_DIR, "dataset_insights.json")

def generate_insights():
    print("[Insights] Generating dataset insights...")
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM movies", conn)
    
    total_movies = len(df)
    
    # Genre Distribution
    all_genres = df['genres'].dropna().str.split(', ').explode()
    genre_dist = all_genres.value_counts().head(10).to_dict()
    genre_dist = {k: int(v) for k, v in genre_dist.items() if k}
    
    # Release Year Distribution
    year_dist_raw = df['release_year'].dropna().astype(int)
    year_bins = pd.cut(year_dist_raw, bins=range(1900, 2040, 10), right=False)
    year_dist = year_bins.value_counts().sort_index().to_dict()
    year_dist = {f"{k.left}-{k.right-1}": int(v) for k, v in year_dist.items() if v > 0}
    
    # Keywords
    all_keywords = df['keywords'].dropna().str.split(', ').explode()
    keyword_counts = all_keywords.value_counts().head(15).to_dict()
    common_keywords = [{"keyword": str(k), "count": int(v)} for k, v in keyword_counts.items() if k]
    
    insights = {
        "total_movies": total_movies,
        "genre_distribution": genre_dist,
        "movies_per_decade": year_dist,
        "common_keywords": common_keywords
    }
    
    with open(INSIGHTS_PATH, 'w') as f:
        json.dump(insights, f, indent=2)
        
    print(f"[Insights] Insights generated and saved to {INSIGHTS_PATH}")
    
    # Output execution evidence for user
    db_size = os.path.getsize(DB_PATH) / (1024 * 1024)
    print("\n=== EXECUTION EVIDENCE ===")
    print(f"Total Movies Loaded: {total_movies}")
    print(f"SQLite Database Size: {db_size:.2f} MB")
    print(f"Top 5 Genres: {list(genre_dist.keys())[:5]}")
    print(f"Top 5 Keywords: {[k['keyword'] for k in common_keywords[:5]]}")
    print("Movies per decade:")
    for decade, count in year_dist.items():
        print(f"  {decade}: {count}")
    print("=========================\n")
    
    conn.close()

if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        print(f"[Insights] Database not found at {DB_PATH}. Run 01_ingest.py first.")
    else:
        generate_insights()
