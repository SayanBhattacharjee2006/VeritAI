import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator
from asyncio import Queue

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.core.security import get_current_user
from app.models.verification import VerifyRequest
from app.models.claim import Report, ReportStats, VerifiedClaim, Verdict
from app.agents.claim_extractor import extract_claims
from app.agents.claim_refiner import refine_claims
from app.agents.query_generator import generate_queries
from app.agents.evidence_summarizer import summarize_evidence
from app.agents.judge_agent import judge_claim
from app.agents.self_reflection import reflect_on_verdict
from app.agents.confidence_scorer import compute_confidence, detect_conflict
from app.services.tavily_search import search_claim
from app.services.url_scraper import scrape_url
from app.services.ocr_service import extract_text_from_image
from app.utils.text_cleaner import clean_text

router = APIRouter()


def sse_event(event_type: str, data: dict) -> str:
    """Format a Server-Sent Event string."""
    payload = json.dumps({'event': event_type, **data})
    return f'data: {payload}\n\n'


def _apply_evidence_sufficiency_guard(
    verdict: Verdict,
    reasoning: str,
    confidence: float,
    sources_count: int,
) -> tuple[Verdict, str, float]:
    # Evidence sufficiency check:
    # If we found very few sources AND confidence is low,
    # the verdict is based on LLM training data not real
    # evidence — this is a hallucination risk.
    # Force to unverifiable to be honest with the user.
    if sources_count <= 1 and confidence < 60.0:
        verdict = 'unverifiable'
        reasoning = (
            reasoning +
            ' Note: Insufficient web evidence was found '
            'to verify this claim with confidence. '
            'The verdict has been marked unverifiable '
            'to avoid potentially incorrect conclusions.'
        )
        confidence = min(confidence, 45.0)

    return verdict, reasoning, confidence


async def run_pipeline(
    input_type: str,
    content: str,
    user_id: str | None,
) -> AsyncGenerator[str, None]:
    """
    Optimized two-phase pipeline:
      Phase 1: Extract all claims in one batch LLM call
      Phase 2: Each claim independently runs refine → search → verify
               ALL claims process concurrently via asyncio.gather
    
    Uses a Queue-based producer/consumer pattern so SSE events from
    parallel tasks can be safely yielded from this async generator.
    """

    def step(step_id: str, status: str, sub: str = '') -> str:
        return sse_event(
            'step_update',
            {'stepId': step_id, 'status': status, 'subLabel': sub}
        )

    def log(text: str, log_type: str = 'info') -> str:
        return sse_event('terminal_line', {'text': text, 'type': log_type})

    event_queue: Queue[str | None] = Queue()

    async def emit(event: str) -> None:
        await event_queue.put(event)

    async def producer() -> None:
        """
        Full pipeline logic. Puts SSE event strings into event_queue.
        Puts None when finished to signal the consumer to stop.
        """
        try:
            # ── PHASE 1: INPUT PROCESSING + CLAIM EXTRACTION ──────
            await emit(step('extract', 'active'))
            await emit(log(
                f'Initializing {input_type} input processing...'
            ))

            # Input type routing
            if input_type == 'url':
                await emit(log(f'Scraping URL: {content[:80]}...'))
                try:
                    text = await scrape_url(content)
                    await emit(log(
                        f'✓ Extracted {len(text)} characters from URL',
                        'success'
                    ))
                except ValueError as e:
                    await emit(log(
                        f'⚠ Scraping failed: {e}', 'warning'
                    ))
                    text = content

            elif input_type == 'image':
                await emit(log('Processing image with OCR...'))
                try:
                    text = await extract_text_from_image(content)
                    if text == '__NO_CLAIMS__':
                        await emit(sse_event('error', {
                            'message': (
                                'No factual claims found in this image. '
                                'This appears to be a photograph without text or '
                                'verifiable claims. Try the AI Detect tab to check '
                                'if this image was AI-generated.'
                            )
                        }))
                        return
                    await emit(log(
                        '✓ Image processed successfully', 'success'
                    ))
                except ValueError as e:
                    await emit(sse_event('error', {'message': str(e)}))
                    return

            else:  # text
                text = clean_text(content)
                await emit(log(
                    f'✓ Text input cleaned ({len(text)} chars)', 'success'
                ))

            # Extract all claims in one batch call
            await emit(log('Extracting verifiable claims...'))
            raw_claims = await extract_claims(text)

            if not raw_claims:
                await emit(sse_event(
                    'error',
                    {'message': 'No verifiable claims found in input.'}
                ))
                return

            for c in raw_claims:
                await emit(log(
                    f'Claim identified: "{c.text[:80]}..."', 'claim'
                ))

            await emit(step(
                'extract', 'done', f'{len(raw_claims)} claims found'
            ))
            await emit(log(
                f'✓ Extracted {len(raw_claims)} verifiable claims',
                'success'
            ))

            # ── PHASE 2: PARALLEL PER-CLAIM PROCESSING ────────────
            # All three steps (refine, search, verify) start immediately
            # across all claims concurrently
            await emit(step('refine', 'active'))
            await emit(step('search', 'active'))
            await emit(step('verify', 'active'))
            await emit(log(
                f'Processing all {len(raw_claims)} claims in parallel '
                f'(refine + search + verify simultaneously)...',
                'info'
            ))

            # Semaphore: max 3 claims fully in-flight at once
            # Prevents hammering OpenAI and Tavily rate limits
            sem = asyncio.Semaphore(3)
            completed_count = 0
            completed_lock = asyncio.Lock()

            async def process_single_claim(
                raw_claim,
                index: int,
            ) -> VerifiedClaim | None:
                """
                Full pipeline for one claim:
                refine → query_gen → search → summarize → judge → reflect
                Runs concurrently with all other claims.
                """
                nonlocal completed_count
                async with sem:
                    claim_num = f'Claim {index + 1}/{len(raw_claims)}'
                    try:
                        # Step A: Refine this single claim
                        refined_list = await refine_claims([raw_claim])
                        refined = (
                            refined_list[0] if refined_list else raw_claim
                        )

                        if refined.is_temporal:
                            await emit(log(
                                f'⚠ {claim_num}: Time-sensitive claim',
                                'warning'
                            ))

                        # Step B: Generate 3 search queries
                        queries = await generate_queries(refined.text)

                        # Step C: Search all 3 queries in parallel
                        sources, snippets = await search_claim(queries)

                        await emit(log(
                            f'{claim_num}: '
                            f'"{refined.text[:55]}..." '
                            f'— {len(sources)} sources found',
                            'info'
                        ))

                        # Step D: Summarize evidence
                        # Summarizer sees only evidence — not raw sources
                        summary = await summarize_evidence(
                            refined.text, snippets
                        )

                        # Step E: Judge Agent gives verdict
                        verdict, reasoning, raw_conf = await judge_claim(
                            refined.text, summary
                        )

                        # Step F: Self-reflection pass
                        verdict, reasoning, raw_conf = await reflect_on_verdict(
                            refined.text, summary,
                            verdict, reasoning, raw_conf
                        )

                        # Step G: Compute final weighted confidence score
                        confidence = compute_confidence(
                            verdict, sources, raw_conf, len(snippets)
                        )
                        has_conflict = detect_conflict(sources, snippets)
                        verdict, reasoning, confidence = (
                            _apply_evidence_sufficiency_guard(
                                verdict,
                                reasoning,
                                confidence,
                                len(sources),
                            )
                        )

                        # Emit verdict to terminal log
                        await emit(log(
                            f'{claim_num}: {verdict.upper()} '
                            f'(Confidence: {confidence:.0f}%) — '
                            f'"{refined.text[:45]}..."',
                            'verdict'
                        ))

                        # Update verified count in step sublabel
                        async with completed_lock:
                            completed_count += 1
                            done = completed_count

                        await emit(step(
                            'verify', 'active',
                            f'{done}/{len(raw_claims)} verified'
                        ))

                        return VerifiedClaim(
                            id=refined.id,
                            text=refined.text,
                            verdict=verdict,
                            confidence=confidence,
                            reasoning=reasoning,
                            sources=sources[:5],
                            is_temporal=refined.is_temporal,
                            has_conflict=has_conflict,
                        )

                    except Exception as e:
                        await emit(log(
                            f'{claim_num}: Processing failed — '
                            f'{str(e)[:80]}',
                            'error'
                        ))
                        return None

            # Launch ALL claims concurrently
            tasks = [
                process_single_claim(c, i)
                for i, c in enumerate(raw_claims)
            ]
            results = await asyncio.gather(*tasks)

            # Filter out None results (failed claims)
            verified_claims: list[VerifiedClaim] = [
                r for r in results if r is not None
            ]

            if not verified_claims:
                await emit(sse_event(
                    'error',
                    {'message': 'All claims failed to process.'}
                ))
                return

            # Mark all three parallel steps as done
            temporal_count = sum(
                1 for c in verified_claims if c.is_temporal
            )
            await emit(step(
                'refine', 'done',
                f'{len(verified_claims)} refined'
            ))
            await emit(step(
                'search', 'done',
                f'{len(verified_claims)} searched'
            ))
            await emit(step(
                'verify', 'done',
                f'{len(verified_claims)}/{len(raw_claims)} verified'
            ))

            if temporal_count > 0:
                await emit(log(
                    f'⚠ {temporal_count} time-sensitive claim(s) — '
                    f'may need re-verification over time',
                    'warning'
                ))

            await emit(log(
                '✓ Self-reflection complete — all verdicts confirmed',
                'success'
            ))

            # ── PHASE 3: BUILD REPORT ──────────────────────────────
            await emit(step('report', 'active'))
            await emit(log(
                'Generating comprehensive analysis report...'
            ))

            # Compute verdict statistics
            stats = ReportStats(
                true=sum(
                    1 for c in verified_claims if c.verdict == 'true'
                ),
                false=sum(
                    1 for c in verified_claims if c.verdict == 'false'
                ),
                partial=sum(
                    1 for c in verified_claims if c.verdict == 'partial'
                ),
                unverifiable=sum(
                    1 for c in verified_claims
                    if c.verdict == 'unverifiable'
                ),
            )

            # Score excludes unverifiable claims from denominator
            # so they don't drag the score to 0 unfairly
            total = len(verified_claims)
            verifiable_total = (
                stats.true + stats.false + stats.partial
            )
            if verifiable_total > 0:
                score = round(
                    (stats.true * 100 + stats.partial * 50)
                    / verifiable_total,
                    1
                )
            elif total > 0:
                # All claims unverifiable — score is not meaningful
                score = -1.0
            else:
                score = 0.0

            await emit(log(
                'Calculating accuracy score and generating takeaways...'
            ))

            # Generate AI takeaways
            claims_summary = '\n'.join(
                f'- [{c.verdict.upper()}] {c.text} '
                f'(confidence: {c.confidence:.0f}%)'
                for c in verified_claims
            )
            from app.services.openai_client import chat as llm_chat
            takeaways_raw = await llm_chat(
                system=(
                    'You are a report summary agent. Given fact-check '
                    'results, generate 3-5 concise informative bullet-point '
                    'takeaways for a non-technical reader. '
                    'Focus on what matters most. '
                    'Return a JSON array of strings. '
                    'No markdown, no numbering, plain sentences only.'
                ),
                user=(
                    f'Fact-check results:\n{claims_summary}\n\n'
                    f'Overall accuracy score: {score}%'
                ),
                temperature=0.3,
                max_tokens=600,
                response_format={'type': 'json_object'},
            )

            try:
                parsed_ta = json.loads(takeaways_raw)
                if isinstance(parsed_ta, list):
                    takeaways = [str(t) for t in parsed_ta[:5]]
                elif isinstance(parsed_ta, dict):
                    vals = list(parsed_ta.values())
                    takeaways = (
                        vals[0]
                        if vals and isinstance(vals[0], list)
                        else [str(v) for v in vals[:5]]
                    )
                else:
                    takeaways = []
            except Exception:
                takeaways = [
                    'Analysis complete. '
                    'Review individual claims for details.'
                ]

            # Build final report
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
                input_preview=(
                    content[:120]
                    + ('...' if len(content) > 120 else '')
                ),
                timestamp=datetime.now(timezone.utc).isoformat(),
                score=score,
                stats=stats,
                claims=verified_claims,
                takeaways=takeaways,
                has_conflict=any(
                    c.has_conflict for c in verified_claims
                ),
            )

            # Persist to MongoDB if user is authenticated
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
                except Exception:
                    # Never fail the response due to a DB write error
                    pass

            await emit(step('report', 'done', 'Complete'))
            await emit(log(
                '✓ Report generated successfully', 'success'
            ))
            await emit(sse_event(
                'report_complete', {'report': report.model_dump()}
            ))

        except Exception as e:
            await emit(sse_event(
                'error',
                {'message': f'Pipeline error: {str(e)}'}
            ))
        finally:
            # Always signal consumer that production is finished
            await event_queue.put(None)

    # ── CONSUMER: yield SSE events from queue ─────────────────────
    # Start the producer as a background task so this generator
    # can yield events as they arrive from parallel claim processing
    producer_task = asyncio.create_task(producer())

    try:
        while True:
            event = await event_queue.get()
            if event is None:
                # None is the termination signal from producer
                break
            yield event
    finally:
        producer_task.cancel()
        try:
            await producer_task
        except asyncio.CancelledError:
            pass


@router.post('/verify')
async def verify_endpoint(
    request: Request,
    body: VerifyRequest,
    current_user: dict = Depends(get_current_user),
):
    # Explicit empty content guard
    if not body.content or not body.content.strip():
        raise HTTPException(
            status_code=400,
            detail='Content cannot be empty'
        )

    user_id = current_user.get('sub')

    return StreamingResponse(
        run_pipeline(body.type, body.content.strip(), user_id),
        media_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        },
    )
