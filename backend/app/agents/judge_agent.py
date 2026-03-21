import json

from app.models.claim import Verdict
from app.services.openai_client import chat

SYSTEM = """You are an impartial Judge Agent in a fact-checking system.
You ONLY see a claim and an evidence summary — never the raw sources.
Your task: determine whether the claim is TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIABLE.

Definitions:
- TRUE: The evidence clearly supports the claim
- FALSE: The evidence clearly contradicts the claim
- PARTIALLY TRUE: Some elements are supported, others are not, or evidence is mixed
- UNVERIFIABLE: Insufficient or no relevant evidence to make a determination

Think step by step (Chain of Thought), then provide your verdict.

Return ONLY valid JSON:
{
  "reasoning": "Step-by-step analysis of why this verdict was reached (2-4 sentences)",
  "verdict": "true" | "false" | "partial" | "unverifiable",
  "raw_confidence": 0-100
}"""


async def judge_claim(claim_text: str, evidence_summary: str) -> tuple[Verdict, str, float]:
    """Returns (verdict, reasoning, raw_confidence)"""
    prompt = f'Claim: "{claim_text}"\n\nEvidence Summary:\n{evidence_summary}'

    raw = await chat(
        system=SYSTEM,
        user=prompt,
        temperature=0.0,
        max_tokens=600,
        response_format={'type': 'json_object'},
    )

    try:
        data = json.loads(raw)
        verdict_str = data.get('verdict', 'unverifiable').lower()
        if verdict_str not in ('true', 'false', 'partial', 'unverifiable'):
            verdict_str = 'unverifiable'
        verdict: Verdict = verdict_str  # type: ignore[assignment]
        reasoning = data.get('reasoning', 'No reasoning provided.')
        raw_conf = float(data.get('raw_confidence', 50))
        return verdict, reasoning, raw_conf
    except Exception:
        return 'unverifiable', 'Failed to parse judge response.', 50.0
