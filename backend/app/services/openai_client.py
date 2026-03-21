from openai import AsyncOpenAI

from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def chat(
    system: str,
    user: str,
    temperature: float = 0.1,
    max_tokens: int = 2000,
    response_format: dict | None = None,
) -> str:
    kwargs: dict = dict(
        model=settings.OPENAI_MODEL,
        messages=[
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    if response_format:
        kwargs['response_format'] = response_format
    resp = await client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content or ''
