import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.agents.claim_extractor import extract_claims
from app.agents.claim_refiner import refine_claims
from app.agents.confidence_scorer import compute_confidence, detect_conflict
from app.agents.evidence_summarizer import summarize_evidence
from app.agents.judge_agent import judge_claim
from app.agents.query_generator import generate_queries
from app.agents.self_reflection import reflect_on_verdict
from app.core.security import get_current_user
from app.models.claim import Report, ReportStats, VerifiedClaim
from app.models.verification import VerifyRequest
from app.services.ocr_service import extract_text_from_image
from app.services.tavily_search import search_claim
from app.services.url_scraper import scrape_url
from app.utils.text_cleaner import clean_text

router = APIRouter()


def sse_event(event_type: str, data: dict) -> str:
    """Format a Server-Sent Event string."""
    payload = json.dumps({'event': event_type, **data})
    return f'data: {payload}\n\n'


async def run_pipeline(
    input_type: str,
    content: str,
    user_id: str | None,
) -> AsyncGenerator[str, None]:
    """Full verification pipeline as an async SSE generator."""

    def step(step_id: str, status: str, sub: str = '') -> str:
        return sse_event('step_update', {'stepId': step_id, 'status': status, 'subLabel': sub})

    def log(text: str, log_type: str = 'info') -> str:
        return sse_event('terminal_line', {'text': text, 'type': log_type})

    try:
        yield step('extract', 'active')
        yield log(f'Initializing {input_type} input processing...')

        if input_type == 'url':
            yield log(f'Scraping URL: {content[:80]}...')
            try:
                text = await scrape_url(content)
                yield log(f'✓ Extracted {len(text)} characters from URL', 'success')
            except ValueError as exc:
                yield log(f'⚠ Scraping failed: {exc}', 'warning')
                text = content
        elif input_type == 'image':
            yield log('Processing image with OCR...')
            try:
                text = await extract_text_from_image(content)
                yield log('✓ Image processed successfully', 'success')
            except ValueError as exc:
                yield sse_event('error', {'message': str(exc)})
                return
        else:
            text = clean_text(content)
            yield log(f'✓ Text input cleaned ({len(text)} chars)', 'success')

        yield log('Extracting verifiable claims...')
        claims = await extract_claims(text)

        if not claims:
            yield sse_event('error', {'message': 'No verifiable claims found in input.'})
            return

        for claim in claims:
            yield log(f'Claim identified: "{claim.text[:80]}..."', 'claim')

        yield step('extract', 'done', f'{len(claims)} claims found')
        yield log(f'✓ Extracted {len(claims)} verifiable claims', 'success')

        yield step('refine', 'active')
        yield log('Refining and categorizing claims...')
        refined = await refine_claims(claims)

        temporal_count = sum(1 for claim in refined if claim.is_temporal)
        if temporal_count > 0:
            yield log(f'⚠ {temporal_count} time-sensitive claim(s) detected', 'warning')

        yield step('refine', 'done', f'{len(refined)} claims refined')
        yield log('✓ Claims refined and ready for verification', 'success')

        yield step('search', 'active')
        yield log('Initiating multi-query evidence search...')

        all_sources_map: dict[str, list] = {}
        all_snippets_map: dict[str, list] = {}

        sem = asyncio.Semaphore(5)

        async def search_one(claim):
            async with sem:
                queries = await generate_queries(claim.text)
                sources, snippets = await search_claim(queries)
                return claim.id, sources, snippets

        tasks = [search_one(claim) for claim in refined]
        results = await asyncio.gather(*tasks)

        total_sources = 0
        for index, (claim_id, sources, snippets) in enumerate(results):
            all_sources_map[claim_id] = sources
            all_snippets_map[claim_id] = snippets
            claim = refined[index]
            yield log(
                f'Claim {index + 1}/{len(refined)}: "{claim.text[:60]}..." — {len(sources)} sources found',
                'info',
            )
            total_sources += len(sources)

        yield step('search', 'done', f'{total_sources} sources found')
        yield log(f'✓ Evidence search complete — {total_sources} total sources', 'success')

        yield step('verify', 'active')
        yield log('Starting Judge Agent analysis...')

        verify_sem = asyncio.Semaphore(3)

        async def verify_one(claim):
            async with verify_sem:
                sources = all_sources_map.get(claim.id, [])
                snippets = all_snippets_map.get(claim.id, [])
                summary = await summarize_evidence(claim.text, snippets)
                verdict, reasoning, raw_conf = await judge_claim(claim.text, summary)
                verdict, reasoning, raw_conf = await reflect_on_verdict(
                    claim.text,
                    summary,
                    verdict,
                    reasoning,
                    raw_conf,
                )
                confidence = compute_confidence(verdict, sources, raw_conf, len(snippets))
                has_conflict = detect_conflict(sources, snippets)

                return VerifiedClaim(
                    id=claim.id,
                    text=claim.text,
                    verdict=verdict,
                    confidence=confidence,
                    reasoning=reasoning,
                    sources=sources[:5],
                    is_temporal=claim.is_temporal,
                    has_conflict=has_conflict,
                )

        verified_claims = list(await asyncio.gather(*[verify_one(claim) for claim in refined]))

        for verified_claim in verified_claims:
            verdict_upper = verified_claim.verdict.upper()
            yield log(
                f'Claim: {verdict_upper} (Confidence: {verified_claim.confidence:.0f}%) — "{verified_claim.text[:60]}..."',
                'verdict',
            )

        yield log('Running self-reflection verification pass...', 'info')
        yield log('✓ Self-reflection complete — verdicts confirmed', 'success')
        yield step('verify', 'done', f'{len(verified_claims)}/{len(refined)} verified')

        yield step('report', 'active')
        yield log('Generating comprehensive analysis report...')

        stats = ReportStats(
            true=sum(1 for claim in verified_claims if claim.verdict == 'true'),
            false=sum(1 for claim in verified_claims if claim.verdict == 'false'),
            partial=sum(1 for claim in verified_claims if claim.verdict == 'partial'),
            unverifiable=sum(1 for claim in verified_claims if claim.verdict == 'unverifiable'),
        )

        total = len(verified_claims)
        score = round((stats.true * 100 + stats.partial * 50) / total if total > 0 else 0, 1)

        yield log('Calculating accuracy score and generating takeaways...')

        claims_summary = '\n'.join(
            f'- [{claim.verdict.upper()}] {claim.text} (confidence: {claim.confidence:.0f}%)'
            for claim in verified_claims
        )
        from app.services.openai_client import chat as llm_chat

        takeaways_raw = await llm_chat(
            system=(
                'You are a report summary agent. Given fact-check results, generate 3-5 '
                'concise, informative bullet-point takeaways for a non-technical reader. '
                'Focus on what matters most. Return a JSON array of strings.'
            ),
            user=f'Fact-check results:\n{claims_summary}\nOverall score: {score}%',
            temperature=0.3,
            max_tokens=600,
            response_format={'type': 'json_object'},
        )
        try:
            parsed_ta = json.loads(takeaways_raw)
            if isinstance(parsed_ta, list):
                takeaways = [str(item) for item in parsed_ta[:5]]
            elif isinstance(parsed_ta, dict):
                values = list(parsed_ta.values())
                takeaways = values[0] if values and isinstance(values[0], list) else []
            else:
                takeaways = []
        except Exception:
            takeaways = ['Analysis complete. Review individual claims for details.']

        report_id = f'VX-{uuid.uuid4().hex[:6].upper()}'
        title_map = {
            'url': 'URL Article Analysis',
            'image': 'Image Claim Analysis',
            'text': 'Text Analysis Report',
        }

        report = Report(
            id=report_id,
            title=title_map.get(input_type, 'Analysis Report'),
            input_type=input_type,
            input_preview=content[:120] + ('...' if len(content) > 120 else ''),
            timestamp=datetime.now(timezone.utc).isoformat(),
            score=score,
            stats=stats,
            claims=verified_claims,
            takeaways=takeaways,
            has_conflict=any(claim.has_conflict for claim in verified_claims),
        )

        if user_id:
            try:
                from app.services.mongodb_client import history_col
                col = history_col()
                await col.insert_one({
                    '_id': report.id,
                    'id': report.id,
                    'user_id': user_id,
                    'title': report.title,
                    'input_type': input_type,
                    'input_preview': report.input_preview,
                    'timestamp': report.timestamp,
                    'claim_count': len(report.claims),
                    'accuracy': report.score,
                    'report_json': report.model_dump(),
                })
            except Exception as e:
                # Don't fail the response if DB save fails
                pass

        yield step('report', 'done', 'Complete')
        yield log('✓ Report generated successfully', 'success')
        yield sse_event('report_complete', {'report': report.model_dump()})
    except Exception as exc:
        yield sse_event('error', {'message': f'Pipeline error: {str(exc)}'})


@router.post('/verify')
async def verify_endpoint(
    request: Request,
    body: VerifyRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get('sub')

    return StreamingResponse(
        run_pipeline(body.type, body.content, user_id),
        media_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        },
    )
