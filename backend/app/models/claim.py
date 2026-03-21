from typing import Literal

from pydantic import BaseModel

Verdict = Literal['true', 'false', 'partial', 'unverifiable']


class Source(BaseModel):
    domain: str
    url: str
    tier: Literal[1, 2, 3]
    title: str = ''


class ExtractedClaim(BaseModel):
    id: str
    text: str
    is_temporal: bool = False


class VerifiedClaim(BaseModel):
    id: str
    text: str
    verdict: Verdict
    confidence: float
    reasoning: str
    sources: list[Source]
    is_temporal: bool
    has_conflict: bool


class ReportStats(BaseModel):
    true: int
    false: int
    partial: int
    unverifiable: int


class Report(BaseModel):
    id: str
    title: str
    input_type: str
    input_preview: str
    timestamp: str
    score: float
    stats: ReportStats
    claims: list[VerifiedClaim]
    takeaways: list[str]
    has_conflict: bool
