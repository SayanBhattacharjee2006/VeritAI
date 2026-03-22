import json

from app.services.openai_client import chat

SYSTEM = """You are a search query generation agent for a fact-checking system.
For a given factual claim, generate exactly 3 diverse search queries that will
find the best evidence to verify or refute it.

Query strategy:
- Query 1: Broader topic search — search the general topic, not the exact claim
  (e.g. for "Apollo flag still standing 2012" search "Apollo moon landing evidence photos")
- Query 2: Fact-check angle — look for debunking or verification sources
  (e.g. "moon landing conspiracy debunked evidence")
- Query 3: Authoritative source angle — target Wikipedia, NASA, scientific orgs
  (e.g. "NASA Apollo mission verification Wikipedia")

IMPORTANT: Do NOT make queries too specific or literal — overly specific queries
return zero results. Broaden the claim into its underlying topic.

Return ONLY a JSON object with key "queries" containing an array of 3 strings:
{"queries": ["query one", "query two", "query three"]}"""


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
        if isinstance(parsed, dict):
            queries = parsed.get('queries',
                      parsed.get('searches',
                      list(parsed.values())[0] if parsed else []))
        elif isinstance(parsed, list):
            queries = parsed
        else:
            queries = []
        queries = [str(q) for q in queries if q][:3]
        while len(queries) < 3:
            queries.append(f'fact check {claim_text}')
        return queries
    except Exception:
        topic = ' '.join(claim_text.split()[:6])
        return [
            topic,
            f'fact check {topic}',
            f'{topic} evidence wikipedia',
        ]
