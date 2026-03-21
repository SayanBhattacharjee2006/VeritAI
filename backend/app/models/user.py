from typing import Literal

from pydantic import BaseModel


class User(BaseModel):
    id: str
    name: str
    email: str
    plan: Literal['free', 'pro', 'premium'] = 'free'
    daily_checks_used: int = 0


class UserInDB(User):
    hashed_password: str
