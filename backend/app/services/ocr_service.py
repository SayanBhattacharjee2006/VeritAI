import base64
import io

import pytesseract
from PIL import Image

from app.core.config import settings
from app.utils.text_cleaner import clean_text


async def extract_text_from_image(image_data: str) -> str:
    """
    image_data: base64-encoded image string.
    Tries pytesseract OCR first.
    Falls back to GPT-4o vision if OCR yields < 50 chars.
    Returns extracted text or claim description.
    """
    try:
        img_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(img_bytes))
    except Exception as exc:
        raise ValueError(f'Invalid image data: {exc}') from exc

    try:
        ocr_text = pytesseract.image_to_string(image).strip()
        if len(ocr_text) >= 50:
            return clean_text(ocr_text)
    except Exception:
        pass

    from openai import AsyncOpenAI

    vision_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    resp = await vision_client.chat.completions.create(
        model='gpt-4o',
        messages=[{
            'role': 'user',
            'content': [
                {
                    'type': 'text',
                    'text': (
                        'This image may contain text, charts, screenshots, or infographics with '
                        'factual claims. Extract ALL verifiable factual statements visible in this '
                        'image. List each statement on a new line. If no factual claims are present, '
                        'describe what you see.'
                    ),
                },
                {
                    'type': 'image_url',
                    'image_url': {
                        'url': f'data:image/jpeg;base64,{image_data}',
                        'detail': 'high',
                    },
                },
            ],
        }],
        max_tokens=1000,
    )
    text = resp.choices[0].message.content or ''

    # Check if vision returned actual claims or just a description
    # If GPT says there are no factual claims, return a clear signal
    no_claims_phrases = [
        'no factual claims',
        'no text',
        'no charts',
        'no infographics',
        'does not contain',
        'cannot be verified',
        'no verifiable',
    ]
    text_lower = text.lower()
    description_only = sum(
        1 for phrase in no_claims_phrases if phrase in text_lower
    ) >= 2

    if description_only:
        return '__NO_CLAIMS__'

    return text
