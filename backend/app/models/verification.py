from typing import Literal

from pydantic import BaseModel, field_validator


class VerifyRequest(BaseModel):
    type: Literal['text', 'url', 'image']
    content: str

    @field_validator('content')
    @classmethod
    def content_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('content cannot be empty')
        return v.strip()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UpgradeRequest(BaseModel):
    plan: Literal['pro', 'premium']
