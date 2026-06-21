import math

def precision_at_k(retrieved: list[str], relevant: list[str], k: int) -> float:
    retrieved_k = retrieved[:k]
    hits = sum(1 for doc in retrieved_k if doc in relevant)
    return hits / k if k > 0 else 0.0

def recall_at_k(retrieved: list[str], relevant: list[str], k: int) -> float:
    if not relevant:
        return 0.0
    retrieved_k = retrieved[:k]
    hits = sum(1 for doc in retrieved_k if doc in relevant)
    return hits / len(relevant)

def mrr(retrieved: list[str], relevant: list[str]) -> float:
    for rank, doc in enumerate(retrieved, start=1):
        if doc in relevant:
            return 1.0 / rank
    return 0.0

def ndcg_at_k(retrieved: list[str], relevant: list[str], k: int) -> float:
    retrieved_k = retrieved[:k]
    dcg = 0.0
    for i, doc in enumerate(retrieved_k, start=1):
        if doc in relevant:
            dcg += 1.0 / math.log2(i + 1)
            
    idcg = 0.0
    for i in range(1, min(len(relevant), k) + 1):
        idcg += 1.0 / math.log2(i + 1)
        
    return dcg / idcg if idcg > 0 else 0.0

def evaluate_retrieval(retrieved: list[str], relevant: list[str], k: int = 5) -> dict:
    return {
        f"Precision@{k}": precision_at_k(retrieved, relevant, k),
        f"Recall@{k}": recall_at_k(retrieved, relevant, k),
        "MRR": mrr(retrieved, relevant),
        f"NDCG@{k}": ndcg_at_k(retrieved, relevant, k)
    }
