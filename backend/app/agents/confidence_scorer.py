from app.models.claim import Source


def compute_confidence(
    verdict: str,
    sources: list[Source],
    raw_confidence: float,
    snippets_count: int,
) -> float:
    if not sources:
        return min(raw_confidence, 40.0)

    tier_scores = {1: 100, 2: 65, 3: 30}
    quality_score = sum(tier_scores[source.tier] for source in sources) / len(sources)
    coverage_score = min(100.0, snippets_count * 12)
    agreement_score = raw_confidence

    final = (
        agreement_score * 0.40 +
        quality_score * 0.30 +
        coverage_score * 0.20 +
        raw_confidence * 0.10
    )

    tier1_count = sum(1 for source in sources if source.tier == 1)
    has_conflict = tier1_count > 0 and len(sources) > 3 and tier1_count < len(sources) // 2
    if has_conflict:
        final = final * 0.85

    return round(min(99.0, max(1.0, final)), 1)


def detect_conflict(sources: list[Source], snippets: list[str]) -> bool:
    """Heuristic: conflict if sources span tiers 1 and 3 with many results"""
    tiers = {source.tier for source in sources}
    return 1 in tiers and 3 in tiers and len(sources) >= 4
