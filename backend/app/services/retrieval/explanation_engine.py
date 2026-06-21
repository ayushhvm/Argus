def generate_explanation(hybrid_result: dict, expanded_query: str) -> dict:
    """
    Generates an explanation for a retrieved document based on its RRF components.
    """
    tfidf_rank = hybrid_result.get("tfidf_rank")
    semantic_rank = hybrid_result.get("semantic_rank")
    
    explanation_parts = []
    
    if tfidf_rank and semantic_rank:
        explanation_parts.append(f"Strong match across both keyword (Rank {tfidf_rank}) and semantic similarity (Rank {semantic_rank}).")
    elif tfidf_rank:
        explanation_parts.append(f"Retrieved primarily due to exact keyword matches (TF-IDF Rank {tfidf_rank}).")
    elif semantic_rank:
        explanation_parts.append(f"Retrieved primarily due to thematic and conceptual similarity (Semantic Rank {semantic_rank}).")
        
    return {
        "tfidf_rank": tfidf_rank,
        "semantic_rank": semantic_rank,
        "rrf_score": hybrid_result.get("rrf_score"),
        "explanation": " ".join(explanation_parts)
    }
