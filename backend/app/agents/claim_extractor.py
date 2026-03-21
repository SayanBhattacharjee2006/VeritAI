import json
import uuid

from app.models.claim import ExtractedClaim
from app.services.openai_client import chat

SYSTEM = """You are a precise claim extraction agent for a fact-checking system.
Your task: extract atomic, verifiable factual claims from the given text.

Rules:
- Each claim must be a single, self-contained, verifiable statement
- Remove opinions, predictions without specifics, and rhetorical questions
- Keep claims concise (1-2 sentences max)
- Extract 5-10 claims maximum; prioritize the most specific and checkable ones
- Do NOT merge multiple facts into one claim
- Output ONLY a JSON array of strings, no other text

Example output:
["The Eiffel Tower is 330 meters tall.",
 "France joined the EU in 1957.",
 "The population of Paris is 2.1 million."]"""


async def extract_claims(text: str) -> list[ExtractedClaim]:
    raw = await chat(
        system=SYSTEM,
        user=f'Extract verifiable claims from this text:\n\n{text}',
        temperature=0.0,
        max_tokens=1500,
        response_format={'type': 'json_object'},
    )
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            claim_texts = parsed
        elif isinstance(parsed, dict):
            claim_texts = parsed.get('claims', list(parsed.values())[0] if parsed else [])
        else:
            claim_texts = []
    except json.JSONDecodeError:
        claim_texts = [
            line.strip().strip('"').strip("'")
            for line in raw.splitlines()
            if len(line.strip()) > 20
        ]

    claims: list[ExtractedClaim] = []
    for text_str in claim_texts[:10]:
        if isinstance(text_str, str) and len(text_str.strip()) > 10:
            claims.append(ExtractedClaim(
                id=str(uuid.uuid4()),
                text=text_str.strip(),
            ))
    return claims
