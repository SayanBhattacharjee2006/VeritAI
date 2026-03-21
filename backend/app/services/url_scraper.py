import httpx
from bs4 import BeautifulSoup

from app.utils.text_cleaner import clean_text


async def scrape_url(url: str) -> str:
    """
    Extract article text with httpx + BeautifulSoup.
    Returns cleaned text or raises ValueError if extraction fails.
    """
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={'User-Agent': 'Mozilla/5.0 (compatible; VeritAI/1.0)'},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text

        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']):
            tag.decompose()

        article = soup.find('article')
        main = soup.find('main')
        content_root = article or main or soup.body or soup

        paragraphs = soup.find_all('p')
        if content_root is not soup:
            paragraphs = content_root.find_all('p')

        text = '\n'.join(
            p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 40
        )
        if text and len(text.strip()) > 100:
            return clean_text(text)
    except Exception:
        pass

    raise ValueError(f'Failed to extract content from URL: {url}')
