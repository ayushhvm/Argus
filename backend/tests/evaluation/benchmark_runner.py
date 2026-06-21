import os
import sys
import sqlite3
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../../"))
sys.path.append(BACKEND_DIR)

from app.services.retrieval.tfidf_engine import TFIDFEngine
from app.services.retrieval.semantic_engine import SemanticEngine
from app.services.retrieval.hybrid_engine import HybridEngine
from app.services.evaluation.metrics import evaluate_retrieval

INDICES_DIR = os.path.join(BACKEND_DIR, "indices")
DB_PATH = os.path.join(BACKEND_DIR, "data", "cineseek.db")
BENCHMARKS_FILE = os.path.join(BACKEND_DIR, "benchmarks", "benchmark_queries.json")
REPORT_JSON = os.path.join(SCRIPT_DIR, "evaluation_report.json")
REPORT_MD = os.path.join(SCRIPT_DIR, "evaluation_summary.md")

def get_movie_title(movie_id, conn):
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM movies WHERE id=?", (movie_id,))
    res = cursor.fetchone()
    return res[0] if res else "Unknown"

def run_evaluations():
    print("Loading Engines...")
    tfidf = TFIDFEngine(INDICES_DIR)
    semantic = SemanticEngine(INDICES_DIR)
    hybrid = HybridEngine(INDICES_DIR)
    
    conn = sqlite3.connect(DB_PATH)
    
    with open(BENCHMARKS_FILE, 'r') as f:
        benchmarks = json.load(f)
        
    K = 5
    report = []
    
    aggregate = {
        "TF-IDF": {"Precision@5": 0, "Recall@5": 0, "MRR": 0, "NDCG@5": 0, "Latency": 0},
        "Semantic": {"Precision@5": 0, "Recall@5": 0, "MRR": 0, "NDCG@5": 0, "Latency": 0},
        "Hybrid": {"Precision@5": 0, "Recall@5": 0, "MRR": 0, "NDCG@5": 0, "Latency": 0}
    }
    
    for item in benchmarks:
        query = item['query']
        relevant = item['relevant_movies']
        
        # Run TF-IDF
        res_t = tfidf.search(query, top_k=K)
        titles_t = [get_movie_title(x['movie_id'], conn) for x in res_t['results']]
        met_t = evaluate_retrieval(titles_t, relevant, k=K)
        met_t['Latency'] = res_t['latency_ms']
        
        # Run Semantic
        res_s = semantic.search(query, top_k=K)
        titles_s = [get_movie_title(x['movie_id'], conn) for x in res_s['results']]
        met_s = evaluate_retrieval(titles_s, relevant, k=K)
        met_s['Latency'] = res_s['latency_ms']
        
        # Run Hybrid
        res_h = hybrid.search(query, top_k=K)
        titles_h = [get_movie_title(x['movie_id'], conn) for x in res_h['results']]
        met_h = evaluate_retrieval(titles_h, relevant, k=K)
        met_h['Latency'] = res_h['latency_ms']
        
        # Store
        report.append({
            "query": query,
            "relevant_movies": relevant,
            "TF-IDF": met_t,
            "Semantic": met_s,
            "Hybrid": met_h
        })
        
        # Accumulate
        for engine_name, met in [("TF-IDF", met_t), ("Semantic", met_s), ("Hybrid", met_h)]:
            for k_m, v_m in met.items():
                aggregate[engine_name][k_m] += v_m
                
    num_queries = len(benchmarks)
    for engine_name in aggregate:
        for k_m in aggregate[engine_name]:
            aggregate[engine_name][k_m] /= num_queries
            
    conn.close()
    
    # Write JSON
    full_report = {
        "aggregate_metrics": aggregate,
        "per_query_metrics": report
    }
    with open(REPORT_JSON, 'w') as f:
        json.dump(full_report, f, indent=2)
        
    # Write Markdown
    md_lines = ["# Information Retrieval Evaluation Summary\n"]
    md_lines.append("## Aggregate Performance\n")
    md_lines.append("| Metric | TF-IDF | Semantic | Hybrid |")
    md_lines.append("|---|---|---|---|")
    
    metrics_keys = ["Precision@5", "Recall@5", "MRR", "NDCG@5", "Latency"]
    for mk in metrics_keys:
        t_val = aggregate['TF-IDF'][mk]
        s_val = aggregate['Semantic'][mk]
        h_val = aggregate['Hybrid'][mk]
        if mk == "Latency":
            md_lines.append(f"| {mk} | {t_val:.2f} ms | {s_val:.2f} ms | {h_val:.2f} ms |")
        else:
            md_lines.append(f"| {mk} | {t_val:.4f} | {s_val:.4f} | {h_val:.4f} |")
            
    md_lines.append("\n## Per-Query Comparison (NDCG@5)\n")
    md_lines.append("| Query | TF-IDF | Semantic | Hybrid |")
    md_lines.append("|---|---|---|---|")
    
    for row in report:
        q = row['query']
        t_n = row['TF-IDF']['NDCG@5']
        s_n = row['Semantic']['NDCG@5']
        h_n = row['Hybrid']['NDCG@5']
        md_lines.append(f"| {q} | {t_n:.4f} | {s_n:.4f} | {h_n:.4f} |")
        
    md_lines.append("\n## Conclusion\n")
    best_mrr = max(aggregate['TF-IDF']['MRR'], aggregate['Semantic']['MRR'], aggregate['Hybrid']['MRR'])
    best_ndcg = max(aggregate['TF-IDF']['NDCG@5'], aggregate['Semantic']['NDCG@5'], aggregate['Hybrid']['NDCG@5'])
    
    if aggregate['Hybrid']['NDCG@5'] == best_ndcg and aggregate['Hybrid']['MRR'] == best_mrr:
        md_lines.append("**Result:** The **Hybrid Retrieval** engine using Reciprocal Rank Fusion performs best overall.")
    elif aggregate['Semantic']['NDCG@5'] == best_ndcg:
        md_lines.append("**Result:** The **Semantic Retrieval** engine performs best overall.")
    else:
        md_lines.append("**Result:** The **TF-IDF Retrieval** engine performs best overall.")
        
    with open(REPORT_MD, 'w') as f:
        f.write("\n".join(md_lines))
        
    print(f"Generated {REPORT_JSON}")
    print(f"Generated {REPORT_MD}")

if __name__ == "__main__":
    run_evaluations()
