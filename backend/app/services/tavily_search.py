import asyncio

from tavily import TavilyClient

from app.core.config import settings
from app.models.claim import Source
from app.utils.source_credibility import get_domain, score_domain

tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)


async def search_single(query: str, max_results: int = 5) -> list[dict]:
    """Run one Tavily search query. Returns list of result dicts."""
    try:
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            lambda: tavily.search(
                query=query,
                max_results=max_results,
                include_raw_content=True,
                search_depth='advanced',
            ),
        )
        return results.get('results', [])
    except Exception:
        return []


async def search_claim(queries: list[str]) -> tuple[list[Source], list[str]]:
    """
    Run up to 3 queries in parallel.
    Returns (deduplicated Source list, evidence snippets list).
    """
    tasks = [search_single(query, max_results=5) for query in queries[:3]]
    all_results_nested = await asyncio.gather(*tasks)

    seen_domains: set[str] = set()
    sources: list[Source] = []
    snippets: list[str] = []

    for results in all_results_nested:
        for result in results:
            url = result.get('url', '')
            domain = get_domain(url)
            content = result.get('raw_content') or result.get('content', '')
            title = result.get('title', '')

            if domain not in seen_domains and content:
                seen_domains.add(domain)
                tier = score_domain(url)
                sources.append(Source(
                    domain=domain,
                    url=url,
                    tier=tier,
                    title=title[:120],
                ))
                snippets.append(f'Source: {title}\nURL: {url}\n{content[:600]}')

    sources.sort(key=lambda source: source.tier)
    return sources, snippets
