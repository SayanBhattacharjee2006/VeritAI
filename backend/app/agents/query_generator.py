import json

from app.services.openai_client import chat

SYSTEM = """You are a search query generation agent for a fact-checking system.
For a given factual claim, generate exactly 3 diverse search queries that will
find the best evidence to verify or refute it.

Query strategy:
- Query 1: Direct factual lookup (most obvious search)
- Query 2: Contextual / background angle
- Query 3: Skeptical / contradicting angle

Return ONLY a JSON array of exactly 3 strings:
["query one", "query two", "query three"]"""


async def generate_queries(claim_text: str) -> list[str]:
    raw = await chat(
        system=SYSTEM,
        user=f'Generate 3 search queries for: "{claim_text}"',
        temperature=0.2,
        max_tokens=300,
        response_format={'type': 'json_object'},
    )
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            queries = parsed
        elif isinstance(parsed, dict):
            queries = parsed.get('queries', list(parsed.values())[0] if parsed else [])
        else:
            queries = []
        queries = [str(query) for query in queries if query][:3]
        while len(queries) < 3:
            queries.append(claim_text)
        return queries
    except Exception:
        return [claim_text, f'evidence {claim_text}', f'fact check {claim_text}']
