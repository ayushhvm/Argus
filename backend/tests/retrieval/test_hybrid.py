import os
import sys
import sqlite3
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../../"))
sys.path.append(BACKEND_DIR)

from app.services.retrieval.hybrid_engine import HybridEngine

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

def load_json(filepath):
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return {item['query']: item for item in json.load(f)}
    return {}

def run_hybrid_benchmarks():
    print("Loading Hybrid Engine (TF-IDF + Semantic + RRF)...")
    engine = HybridEngine(INDICES_DIR)
        
    print("Connecting to DB for Titles...")
    conn = sqlite3.connect(DB_PATH)
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    # Load past results
    tfidf_map = load_json(os.path.join(RESULTS_DIR, "tfidf_results.json"))
    semantic_map = load_json(os.path.join(RESULTS_DIR, "semantic_results.json"))
    
    hybrid_results_json = []
    comparison_report = []
    
    print("\n" + "="*80)
    print("=== HYBRID VS TF-IDF VS SEMANTIC COMPARISON ===")
    print("="*80)
    
    for query in BENCHMARK_QUERIES:
        res = engine.search(query, top_k=5)
        
        # Build Hybrid Result entry
        hybrid_entry = {
            "query": res['query'],
            "expanded_query": res['expanded_query'],
            "latency_ms": res['latency_ms'],
            "retrieved_documents": []
        }
        
        hybrid_top_title = "None"
        if res['results']:
            hybrid_top_title = get_movie_title(res['results'][0]['movie_id'], conn)
            
        for rank, item in enumerate(res['results'], 1):
            title = get_movie_title(item['movie_id'], conn)
            hybrid_entry["retrieved_documents"].append({
                "rank": rank,
                "movie_id": item['movie_id'],
                "title": title,
                "rrf_score": item['rrf_score'],
                "tfidf_rank": item['tfidf_rank'],
                "semantic_rank": item['semantic_rank'],
                "explanation": item['explanation']
            })
            
        hybrid_results_json.append(hybrid_entry)
        
        # Get past top results
        tfidf_top = "None"
        if query in tfidf_map and tfidf_map[query]['retrieved_documents']:
            tfidf_top = tfidf_map[query]['retrieved_documents'][0]['title']
            
        semantic_top = "None"
        if query in semantic_map and semantic_map[query]['retrieved_documents']:
            semantic_top = semantic_map[query]['retrieved_documents'][0]['title']
            
        # Comparison logic
        comparison_entry = {
            "query": query,
            "latency_ms": res['latency_ms'],
            "tfidf_top_result": tfidf_top,
            "semantic_top_result": semantic_top,
            "hybrid_top_result": hybrid_top_title,
            "hybrid_explanation_top_1": res['results'][0]['explanation'] if res['results'] else ""
        }
        comparison_report.append(comparison_entry)
        
        # Print output to console
        print(f"\nQuery                 : {query}")
        print(f"Hybrid Latency        : {res['latency_ms']:.2f} ms")
        print(f"TF-IDF Top Result     : {tfidf_top}")
        print(f"Semantic Top Result   : {semantic_top}")
        print(f"HYBRID Top Result     : {hybrid_top_title}")
        print(f"Explanation (Top 1)   : {comparison_entry['hybrid_explanation_top_1']}")
            
    conn.close()
    
    # Save hybrid results
    out_hybrid = os.path.join(RESULTS_DIR, "hybrid_results.json")
    with open(out_hybrid, "w") as f:
        json.dump(hybrid_results_json, f, indent=2)
        
    # Save comparison report
    out_report = os.path.join(RESULTS_DIR, "retrieval_comparison_report.json")
    with open(out_report, "w") as f:
        json.dump(comparison_report, f, indent=2)
        
    print(f"\nSaved hybrid benchmark results to {out_hybrid}")
    print(f"Saved comparison report to {out_report}")

if __name__ == "__main__":
    run_hybrid_benchmarks()
