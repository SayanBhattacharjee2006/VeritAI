import json
import re
import uuid

from app.models.claim import ExtractedClaim
from app.services.openai_client import chat

SYSTEM = """You are a precise claim extraction agent for a fact-checking system.
Your task: extract atomic, verifiable factual claims from the given text.

CRITICAL RULE: Extract ALL factual claims regardless of whether they appear
true or false. The fact-checking pipeline will determine correctness - you must
NOT pre-judge. A claim like "The Earth is flat" or "Vaccines cause autism" are
EXACTLY the kind of claims that must be extracted and fact-checked.

Rules:
- Each claim must be a single, self-contained, verifiable statement
- Include claims that appear obviously true AND obviously false - both need checking
- Remove ONLY pure opinions, emotions, and predictions without specifics
- Keep claims concise (1-2 sentences max)
- Extract 5-10 claims maximum; prioritize the most specific and checkable ones
- Do NOT merge multiple facts into one claim
- COREFERENCE RULE: If a sentence uses pronouns (he, she, it, they,
  his, her, their) or vague references ("the company", "the team",
  "the player") that refer to an entity named earlier, REPLACE the
  pronoun/reference with the actual entity name in the extracted claim.
  Example: "Virat Kohli scored a century. He won the match."
  -> Extract as: "Virat Kohli won the match for India." NOT "He won the match."
- Return ONLY a JSON object with a single key "claims" containing an array of strings

Example output:
{"claims": [
  "The Eiffel Tower is 330 meters tall.",
  "The Earth is flat.",
  "France joined the EU in 1957."
]}"""


async def extract_claims(text: str) -> list[ExtractedClaim]:
    raw = await chat(
        system=SYSTEM,
        user=f'Extract verifiable claims from this text:\n\n{text}',
        temperature=0.0,
        max_tokens=1500,
        response_format={'type': 'json_object'},
    )
    claim_texts: list[str] = []
    try:
        parsed = json.loads(raw)
        # Always expect {"claims": [...]} - consistent wrapper key
        if isinstance(parsed, dict):
            val = parsed.get('claims', parsed.get('statements',
                  parsed.get('facts', list(parsed.values())[0] if parsed else [])))
            if isinstance(val, list):
                claim_texts = [str(v) for v in val if v]
            elif isinstance(val, str):
                claim_texts = [val]
        elif isinstance(parsed, list):
            claim_texts = [str(v) for v in parsed if v]
    except json.JSONDecodeError:
        # Fallback: extract quoted strings from raw output
        claim_texts = re.findall(r'"([^"]{15,})"', raw)

    # Last resort: split input into sentences
    if not claim_texts:
        claim_texts = [
            s.strip() for s in re.split(r'(?<=[.!?])\s+', text)
            if len(s.strip()) > 10
        ]

    claims: list[ExtractedClaim] = []
    for text_str in claim_texts[:10]:
        if isinstance(text_str, str) and len(text_str.strip()) > 10:
            claims.append(ExtractedClaim(
                id=str(uuid.uuid4()),
                text=text_str.strip(),
            ))
    return claims
