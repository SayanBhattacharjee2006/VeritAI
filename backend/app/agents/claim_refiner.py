import json

from app.models.claim import ExtractedClaim
from app.services.openai_client import chat

SYSTEM = """You are a claim refinement agent for a fact-checking system.
For each claim:
1. If the claim is vague, add specificity from context
2. Mark as temporal if it references current state, recent events,
   or uses words like "now", "currently", "today", "latest", "still"
3. Remove duplicate or near-duplicate claims
4. Filter out non-verifiable claims (opinions, feelings, hypotheticals)
5. IMPORTANT: If a claim uses ambiguous role/position terms without
   specifying context (e.g. "X is the captain" without saying which
   team format, "X is the president" without saying which country,
   "X is the CEO" without saying which company), append a note:
   " (Note: role context is ambiguous - verify across all contexts)"
   This helps the Judge Agent give a partial verdict instead of
   a false TRUE/FALSE on incomplete information.
6. TEMPORAL ENFORCEMENT: For temporal claims (is_temporal=true),
   append this note to the claim text:
   " [TEMPORAL: verify with current sources only - ignore training knowledge]"
   This signals to the Judge Agent to rely ONLY on retrieved evidence,
   not its training data, for time-sensitive claims.

Return ONLY a JSON array of objects:
[{"id": "original_id", "text": "refined claim text",
  "is_temporal": true/false}]"""


async def refine_claims(claims: list[ExtractedClaim]) -> list[ExtractedClaim]:
    if not claims:
        return []

    claims_json = json.dumps([{'id': claim.id, 'text': claim.text} for claim in claims])

    raw = await chat(
        system=SYSTEM,
        user=f'Refine these claims:\n{claims_json}',
        temperature=0.0,
        max_tokens=2000,
        response_format={'type': 'json_object'},
    )

    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            items = parsed.get('claims', list(parsed.values())[0] if parsed else [])
        else:
            items = parsed
    except json.JSONDecodeError:
        return claims

    id_map = {claim.id: claim for claim in claims}
    refined: list[ExtractedClaim] = []
    seen_ids: set[str] = set()

    for item in items:
        if not isinstance(item, dict):
            continue
        claim_id = item.get('id', '')
        if claim_id in seen_ids:
            continue
        seen_ids.add(claim_id)
        original = id_map.get(claim_id)
        if original:
            refined.append(ExtractedClaim(
                id=original.id,
                text=item.get('text', original.text),
                is_temporal=bool(item.get('is_temporal', False)),
            ))

    return refined if refined else claims
