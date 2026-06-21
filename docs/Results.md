# Results and Evaluation

The system was evaluated against 10 domain-specific queries using a benchmark dataset of 4,800 TMDB movies.

- **Semantic Search** outperformed TF-IDF across all metrics (Precision@5, Recall@5, MRR, NDCG).
- **Hybrid Search (RRF)** provided strong robustness but was occasionally penalized due to TF-IDF pulling irrelevant exact-match noise into the top K.

Conclusion: Semantic FAISS embeddings provide the best conceptual discovery.
