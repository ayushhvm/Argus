import re

# Simple domain mappings
GENRE_MAPPINGS = {
    "sci fi": ["science fiction", "space", "future", "technology", "alien"],
    "scifi": ["science fiction", "space", "future", "technology", "alien"],
    "superhero": ["marvel", "dc", "hero", "comic", "superpower", "mutant"],
    "rom com": ["romantic comedy", "love", "relationship", "funny"],
    "romcom": ["romantic comedy", "love", "relationship", "funny"]
}

SYNONYM_MAPPINGS = {
    "scary": ["horror", "terrifying", "creepy", "ghost", "monster"],
    "funny": ["comedy", "hilarious", "laugh", "humor"],
    "sad": ["drama", "tragic", "emotional", "tears"],
    "action packed": ["action", "explosions", "fight", "thrilling"],
    "mind bending": ["psychological", "thriller", "plot twist", "complex"]
}

def expand_query(query: str) -> str:
    """
    Expands a preprocessed query string with domain-specific keywords.
    """
    expanded_terms = set(query.split())
    
    # Check for multi-word or single-word matches in mappings
    for key, expansions in GENRE_MAPPINGS.items():
        if key in query:
            expanded_terms.update(expansions)
            
    for key, expansions in SYNONYM_MAPPINGS.items():
        if key in query:
            expanded_terms.update(expansions)
            
    return " ".join(sorted(expanded_terms))
