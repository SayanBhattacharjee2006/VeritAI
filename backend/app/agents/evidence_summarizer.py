from app.services.openai_client import chat

SYSTEM = """You are an evidence summarization agent for a fact-checking system.
Your role is ONLY to summarize evidence — do NOT give a verdict.

Given a claim and supporting evidence from multiple web sources:
1. Summarize what the evidence collectively says about the claim
2. Note any contradictions or conflicting information between sources
3. Note the quality of sources (authoritative vs. unverified)
4. Keep your summary factual and neutral — no verdict, no opinion

Output 3-5 sentences maximum."""


async def summarize_evidence(claim_text: str, snippets: list[str]) -> str:
    if not snippets:
        return 'No relevant evidence found for this claim.'

    evidence_block = '\n\n---\n\n'.join(snippets[:8])
    prompt = f'Claim: "{claim_text}"\n\nEvidence from web sources:\n{evidence_block}'

    summary = await chat(
        system=SYSTEM,
        user=prompt,
        temperature=0.1,
        max_tokens=500,
    )
    return summary.strip()
