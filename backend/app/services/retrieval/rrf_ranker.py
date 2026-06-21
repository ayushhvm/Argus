from collections import defaultdict

def compute_rrf(tfidf_results: list[dict], semantic_results: list[dict], k: int = 60) -> list[dict]:
    """
    Computes Reciprocal Rank Fusion (RRF) on two lists of retrieved documents.
    
    Expected input format for both lists:
    [
        {"movie_id": int, "score": float}, ...
    ]
    
    Formula: RRF(d) = 1 / (k + rank_tfidf(d)) + 1 / (k + rank_semantic(d))
    """
    
    rrf_scores = defaultdict(float)
    rank_map = defaultdict(dict)
    
    # Process TF-IDF ranks
    for rank, item in enumerate(tfidf_results, start=1):
        mid = item["movie_id"]
        rrf_scores[mid] += 1.0 / (k + rank)
        rank_map[mid]["tfidf_rank"] = rank
        rank_map[mid]["tfidf_score"] = item["score"]
        
    # Process Semantic ranks
    for rank, item in enumerate(semantic_results, start=1):
        mid = item["movie_id"]
        rrf_scores[mid] += 1.0 / (k + rank)
        rank_map[mid]["semantic_rank"] = rank
        rank_map[mid]["semantic_score"] = item["score"]
        
    # Sort by RRF score descending
    sorted_rrf = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    
    final_results = []
    for mid, rrf_score in sorted_rrf:
        final_results.append({
            "movie_id": mid,
            "rrf_score": rrf_score,
            "tfidf_rank": rank_map[mid].get("tfidf_rank"),
            "semantic_rank": rank_map[mid].get("semantic_rank"),
            "tfidf_score": rank_map[mid].get("tfidf_score", 0.0),
            "semantic_score": rank_map[mid].get("semantic_score", 0.0)
        })
        
    return final_results
