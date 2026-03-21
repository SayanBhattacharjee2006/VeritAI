from typing import Literal
from urllib.parse import urlparse

TIER_1_DOMAINS = {
    'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk',
    'nature.com', 'science.org', 'thelancet.com', 'nejm.org',
    'who.int', 'cdc.gov', 'nih.gov', 'nasa.gov', 'noaa.gov',
    'ipcc.ch', 'iea.org', 'worldbank.org', 'un.org',
    'nytimes.com', 'theguardian.com', 'washingtonpost.com',
    'economist.com', 'ft.com', 'bloomberg.com',
    'snopes.com', 'politifact.com', 'factcheck.org',
    'wikipedia.org', 'britannica.com',
}

TIER_2_DOMAINS = {
    'forbes.com', 'time.com', 'newsweek.com', 'theatlantic.com',
    'npr.org', 'pbs.org', 'cbsnews.com', 'nbcnews.com',
    'abcnews.go.com', 'usatoday.com', 'latimes.com',
    'scientificamerican.com', 'nationalgeographic.com',
    'wired.com', 'techcrunch.com', 'arstechnica.com',
    'statista.com', 'ourworldindata.org', 'pewresearch.org',
}


def get_domain(url: str) -> str:
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        return domain.replace('www.', '')
    except Exception:
        return url.lower()


def score_domain(url: str) -> Literal[1, 2, 3]:
    domain = get_domain(url)
    if domain in TIER_1_DOMAINS:
        return 1
    if domain in TIER_2_DOMAINS:
        return 2
    return 3
