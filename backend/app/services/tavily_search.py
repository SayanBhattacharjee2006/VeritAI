import asyncio
from tavily import TavilyClient
from app.core.config import settings
from app.models.claim import Source
from app.utils.source_credibility import score_domain, get_domain

tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

async def search_single(query: str, max_results: int = 7) -> list[dict]:
    """
    Run one Tavily search query.
    max_results increased to 7 to ensure enough results survive filtering.
    Returns only valid dict results — filters out bools and None.
    """
    try:
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            lambda: tavily.search(
                query=query,
                max_results=max_results,
                include_raw_content=True,
                search_depth='advanced',
            )
        )
        raw = results.get('results', [])
        # Filter: only return actual dict results, skip bools/None/etc
        return [r for r in raw if isinstance(r, dict)]
    except Exception:
        return []


async def search_claim(
    queries: list[str],
) -> tuple[list[Source], list[str]]:
    """
    Run up to 3 queries in parallel.
    Returns (deduplicated Source list, evidence snippets list).

    Content fallback chain:
      raw_content (full article) → content (tavily summary) → snippet (short)
    This ensures results are not discarded just because raw_content is empty,
    which commonly happens with fact-check/debunking pages.
    """
    tasks = [search_single(q, max_results=7) for q in queries[:3]]
    all_results_nested = await asyncio.gather(*tasks)

    seen_domains: set[str] = set()
    sources: list[Source] = []
    snippets: list[str] = []

    for results in all_results_nested:
        for r in results:
            # Skip non-dict entries (safety guard)
            if not isinstance(r, dict):
                continue

            url = r.get('url', '')
            if not url:
                continue

            domain = get_domain(url)
            title = r.get('title', '')

            # Three-level content fallback
            content = (
                r.get('raw_content') or
                r.get('content') or
                r.get('snippet', '')
            )
            # Ensure content is a string
            if not isinstance(content, str):
                content = ''

            # Skip results with no meaningful content
            # Lowered threshold to 20 chars to capture short snippets
            if len(content.strip()) < 20:
                continue

            # Deduplicate by domain
            if domain in seen_domains:
                continue
            seen_domains.add(domain)

            tier = score_domain(url)
            sources.append(Source(
                domain=domain,
                url=url,
                tier=tier,
                title=title[:120],
            ))
            # Increased to 800 chars for richer Judge Agent context
            snippet = f'Source: {title}\nURL: {url}\n{content[:800]}'
            snippets.append(snippet)

    # Sort by tier (Tier 1 first — most authoritative)
    sources.sort(key=lambda s: s.tier)
    return sources, snippets
