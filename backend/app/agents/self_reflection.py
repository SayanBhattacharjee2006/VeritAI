import json

from app.models.claim import Verdict
from app.services.openai_client import chat

SYSTEM = """You are a self-reflection verification agent.
A Judge Agent has already given a verdict on a claim. Your role is to
critically review whether the verdict logically follows from the evidence.

If the verdict is well-supported: confirm it unchanged.
If the verdict is overconfident or doesn't match the evidence: revise it.

Return ONLY valid JSON:
{
  "confirmed": true | false,
  "revised_verdict": "true" | "false" | "partial" | "unverifiable",
  "revised_reasoning": "Updated reasoning if changed, else same reasoning",
  "confidence_adjustment": -15 to +10
}"""


async def reflect_on_verdict(
    claim_text: str,
    evidence_summary: str,
    verdict: Verdict,
    reasoning: str,
    raw_confidence: float,
) -> tuple[Verdict, str, float]:
    """Returns (final_verdict, final_reasoning, final_confidence)"""
    prompt = (
        f'Claim: "{claim_text}"\n\n'
        f'Evidence Summary:\n{evidence_summary}\n\n'
        f'Current Verdict: {verdict}\n'
        f'Current Reasoning: {reasoning}'
    )

    raw = await chat(
        system=SYSTEM,
        user=prompt,
        temperature=0.0,
        max_tokens=500,
        response_format={'type': 'json_object'},
    )

    try:
        data = json.loads(raw)
        revised = data.get('revised_verdict', verdict).lower()
        if revised not in ('true', 'false', 'partial', 'unverifiable'):
            revised = verdict
        final_verdict: Verdict = revised  # type: ignore[assignment]
        final_reasoning = data.get('revised_reasoning', reasoning)
        adjustment = float(data.get('confidence_adjustment', 0))
        final_confidence = max(0.0, min(100.0, raw_confidence + adjustment))
        return final_verdict, final_reasoning, final_confidence
    except Exception:
        return verdict, reasoning, raw_confidence
