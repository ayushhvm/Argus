import re

def preprocess_text(text: str) -> str:
    """
    Centralized text preprocessing used across the IR pipeline.
    Applies lowercasing, punctuation removal, and whitespace normalization.
    """
    if not isinstance(text, str):
        return ""
    
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tokenize_text(text: str) -> list[str]:
    """
    Splits the preprocessed text into tokens.
    """
    clean_text = preprocess_text(text)
    return [token for token in clean_text.split() if token]

def detect_intent(query: str) -> str:
    """
    Intent detection hook for future expansion.
    Currently categorizes queries basically to demonstrate the architectural pipeline.
    """
    query = query.lower()
    if any(word in query for word in ["movie", "film", "show"]):
        return "GENERAL_SEARCH"
    if any(word in query for word in ["director", "directed by"]):
        return "DIRECTOR_SEARCH"
    if any(word in query for word in ["actor", "starring", "with"]):
        return "ACTOR_SEARCH"
    return "KEYWORD_SEARCH"
