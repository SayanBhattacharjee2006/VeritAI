import re


def clean_text(text: str, max_chars: int = 8000) -> str:
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]', '', text)
    text = text.strip()
    if len(text) > max_chars:
        text = text[:max_chars] + '...[truncated]'
    return text
