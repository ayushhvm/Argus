# Information Retrieval Evaluation Summary

## Aggregate Performance

| Metric | TF-IDF | Semantic | Hybrid |
|---|---|---|---|
| Precision@5 | 0.4800 | 0.6000 | 0.4800 |
| Recall@5 | 0.5050 | 0.6450 | 0.5050 |
| MRR | 0.9250 | 1.0000 | 0.9333 |
| NDCG@5 | 0.5839 | 0.7194 | 0.5948 |
| Latency | 3.08 ms | 19.73 ms | 10.74 ms |

## Per-Query Comparison (NDCG@5)

| Query | TF-IDF | Semantic | Hybrid |
|---|---|---|---|
| sci fi space | 0.6548 | 0.5087 | 0.5087 |
| superhero marvel | 0.7227 | 0.6548 | 0.7227 |
| scary terrifying ghost | 0.3904 | 0.5856 | 0.1952 |
| mind bending | 0.3392 | 0.4852 | 0.3392 |
| funny relationship | 0.1681 | 0.8319 | 0.3904 |
| time travel | 0.8688 | 0.6992 | 0.8688 |
| dinosaur theme park | 0.7877 | 0.9829 | 0.8319 |
| heist casino | 0.6992 | 0.7227 | 0.5531 |
| artificial intelligence future | 0.8688 | 0.8539 | 0.8539 |
| world war battle | 0.3392 | 0.8688 | 0.6844 |

## Conclusion

**Result:** The **Semantic Retrieval** engine performs best overall.