from typing import Literal

from pydantic import BaseModel


class VerifyRequest(BaseModel):
    type: Literal['text', 'url', 'image']
    content: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UpgradeRequest(BaseModel):
    plan: Literal['pro', 'premium']
