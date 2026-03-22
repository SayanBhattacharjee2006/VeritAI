from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.agents.ai_detector import detect_ai_text, detect_ai_image
from app.core.security import get_current_user

router = APIRouter()


class AIDetectRequest(BaseModel):
    type: Literal['text', 'image']
    content: str


@router.post('/ai-detect')
async def detect_ai_content(
    body: AIDetectRequest,
    current_user: dict = Depends(get_current_user),
):
    _ = current_user

    if not body.content or not body.content.strip():
        raise HTTPException(status_code=400, detail='Content cannot be empty')

    if body.type == 'text':
        if len(body.content.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail='Text too short for analysis. Please provide at least 50 characters.'
            )
        result = await detect_ai_text(body.content)
    else:
        result = await detect_ai_image(body.content)

    return result
