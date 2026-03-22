from app.models.claim import Source

# Signals of GENUINE content disagreement in evidence text
_CONFLICT_SIGNALS = [
    'however', 'contradicts', 'contradicted', 'contradicting',
    'conflicts with', 'conflicting', 'disagrees', 'disputes',
    'disputed', 'on the other hand', 'while some sources',
    'other sources suggest', 'not all sources agree',
    'some claim', 'others claim', 'contested',
    'inconsistent', 'contrary to', 'contradictory',
    'debate', 'debated',
]

# Signals of consensus — override conflict flags
_CONSENSUS_SIGNALS = [
    'all sources', 'consistently', 'universally', 'unanimously',
    'no contradictions', 'no conflicting', 'widely accepted',
    'well established', 'consensus', 'uniformly',
    'all agree', 'sources agree',
]


def compute_confidence(
    verdict: str,
    sources: list[Source],
    raw_confidence: float,
    snippets_count: int,
) -> float:
    """
    Compute final confidence from multiple signals.

    Weights:
    - 40%  Judge Agent raw confidence (LLM reasoning)
    - 30%  Source quality (average tier score)
    - 20%  Evidence coverage (snippet count)
    - 10%  Source count bonus

    When no sources found: use raw_confidence directly
    (don't hard-cap at 40% — LLM still knows basic facts).
    """
    if not sources:
        # No web sources found — trust LLM knowledge but reduce confidence
        # Cap at 65% max since we couldn't verify with external sources
        return round(min(raw_confidence * 0.75, 65.0), 1)

    tier_scores = {1: 100, 2: 65, 3: 30}
    quality_score = sum(
        tier_scores[s.tier] for s in sources
    ) / len(sources)
    coverage_score = min(100.0, snippets_count * 12)
    count_score = min(100.0, len(sources) * 14)

    final = (
        raw_confidence * 0.40 +
        quality_score * 0.30 +
        coverage_score * 0.20 +
        count_score * 0.10
    )

    return round(min(99.0, max(1.0, final)), 1)


def detect_conflict(sources: list[Source], snippets: list[str]) -> bool:
    """
    Detect REAL content disagreement by looking for contradiction
    signals in the actual evidence text — NOT source tier diversity.

    Requires at least 2 conflict signals to avoid false positives
    from normal sentence flow (e.g. a single "however").
    Consensus signals override conflict detection entirely.
    """
    if len(sources) < 2:
        return False

    combined = ' '.join(snippets).lower()

    # Consensus overrides conflict
    for signal in _CONSENSUS_SIGNALS:
        if signal in combined:
            return False

    conflict_count = sum(
        1 for signal in _CONFLICT_SIGNALS
        if signal in combined
    )
    return conflict_count >= 2
