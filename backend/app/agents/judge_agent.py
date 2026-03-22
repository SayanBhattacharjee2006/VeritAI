import json

from app.models.claim import Verdict
from app.services.openai_client import chat

SYSTEM = """You are an impartial Judge Agent in a fact-checking system.
You ONLY see a claim and an evidence summary — never the raw sources.

Your task: determine whether the CLAIM ITSELF is TRUE or FALSE.

CRITICAL RULE — The verdict must describe the CLAIM, not the evidence:
- verdict "true"  = the claim IS factually correct
- verdict "false" = the claim IS factually wrong
- verdict "partial" = the claim is partly right, partly wrong
- verdict "unverifiable" = not enough evidence to decide

EXAMPLE (do not get this wrong):
  Claim: "The Earth is flat"
  Evidence: "All sources confirm Earth is a sphere"
  CORRECT verdict: "false"  ← the CLAIM is false
  WRONG verdict:   "true"   ← never return true just because
                               the evidence is clear

AMBIGUOUS CLAIMS: If the claim uses vague terms like "captain",
"president", "CEO" without specifying which role/format/division,
and the evidence only partially matches, use "partial".

Think step by step:
1. What exactly does the claim assert?
2. Does the evidence support OR contradict that assertion?
3. Is the claim TRUE, FALSE, PARTIAL, or UNVERIFIABLE?

Return ONLY valid JSON:
{
  "reasoning": "2-4 sentences of step-by-step analysis",
  "verdict": "true" | "false" | "partial" | "unverifiable",
  "raw_confidence": 0-100
}"""


def _align_verdict_with_reasoning(
    verdict_str: str,
    reasoning: str,
) -> str:
    # Sanity check: catch cases where reasoning contradicts verdict
    reasoning_lower = reasoning.lower()

    false_signals = [
        'claim is false', 'claim is incorrect', 'claim is wrong',
        'not true', 'is not accurate', 'is inaccurate',
        'contradicts the claim', 'claim is not supported',
        'therefore false', 'verdict should be false',
        'claim is not accurate', 'the claim is false',
        'this claim is false', 'claim cannot be confirmed',
    ]
    true_signals = [
        'claim is true', 'claim is correct', 'claim is accurate',
        'supports the claim', 'confirms the claim',
        'evidence supports', 'therefore true',
        'this claim is true', 'the claim is true',
    ]

    if verdict_str == 'true' and any(
        p in reasoning_lower for p in false_signals
    ):
        return 'false'
    if verdict_str == 'false' and any(
        p in reasoning_lower for p in true_signals
    ) and not any(
        p in reasoning_lower for p in false_signals
    ):
        return 'true'
    return verdict_str


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
        verdict_str = str(data.get('verdict', 'unverifiable')).lower()
        if verdict_str not in ('true', 'false', 'partial', 'unverifiable'):
            verdict_str = 'unverifiable'
        reasoning = str(data.get('reasoning', 'No reasoning provided.'))
        verdict_str = _align_verdict_with_reasoning(
            verdict_str,
            reasoning,
        )
        verdict: Verdict = verdict_str  # type: ignore[assignment]
        raw_conf = float(data.get('raw_confidence', 50))
        return verdict, reasoning, raw_conf
    except Exception:
        return 'unverifiable', 'Failed to parse judge response.', 50.0
