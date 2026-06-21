import os
import sys
import sqlite3
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../../"))
sys.path.append(BACKEND_DIR)

from app.services.retrieval.tfidf_engine import TFIDFEngine

INDICES_DIR = os.path.join(BACKEND_DIR, "indices")
DB_PATH = os.path.join(BACKEND_DIR, "data", "cineseek.db")
RESULTS_DIR = os.path.join(SCRIPT_DIR, "results")

BENCHMARK_QUERIES = [
    "sci fi space",
    "superhero marvel",
    "scary terrifying ghost",
    "mind bending",
    "funny relationship",
    "time travel",
    "dinosaur theme park",
    "heist casino",
    "artificial intelligence future",
    "world war battle"
]

def get_movie_title(movie_id, conn):
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM movies WHERE id=?", (movie_id,))
    res = cursor.fetchone()
    return res[0] if res else "Unknown"

def run_benchmarks():
    print("Loading TF-IDF Engine...")
    engine = TFIDFEngine(INDICES_DIR)
    
    if engine.tfidf_matrix is None:
        print("Error: Indices not found. Run 04_build_tfidf.py first.")
        return
        
    print("Connecting to DB for Titles...")
    conn = sqlite3.connect(DB_PATH)
    
    os.makedirs(RESULTS_DIR, exist_ok=True)
    results_json = []
    
    print("\n" + "="*50)
    print("=== TF-IDF RETRIEVAL BENCHMARKS ===")
    print("="*50)
    
    for query in BENCHMARK_QUERIES:
        res = engine.search(query, top_k=5)
        
        entry = {
            "query": res['original_query'],
            "expanded_query": res['expanded_query'],
            "latency_ms": res['latency_ms'],
            "retrieved_documents": []
        }
        
        for rank, item in enumerate(res['results'], 1):
            title = get_movie_title(item['movie_id'], conn)
            entry["retrieved_documents"].append({
                "rank": rank,
                "movie_id": item['movie_id'],
                "title": title,
                "score": item['score']
            })
            
        results_json.append(entry)
            
    conn.close()
    
    # Save to JSON
    out_path = os.path.join(RESULTS_DIR, "tfidf_results.json")
    with open(out_path, "w") as f:
        json.dump(results_json, f, indent=2)
    print(f"Saved benchmark results to {out_path}")
    
if __name__ == "__main__":
    run_benchmarks()
