import httpx
import json
import sys
import time
import asyncio

BASE_URL = "http://localhost:8000/api"

# ANSI colors
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

results = []
token = None
test_email = f"testuser_{int(time.time())}@veritai-test.io"
test_password = "TestPass123!"
test_name = "Test User"

def passed(name: str, detail: str = ""):
    results.append(("PASS", name))
    print(f"  {GREEN}✓ PASS{RESET}  {name}" + (f"  {CYAN}→ {detail}{RESET}" if detail else ""))

def failed(name: str, reason: str = ""):
    results.append(("FAIL", name))
    print(f"  {RED}✗ FAIL{RESET}  {name}" + (f"\n         {YELLOW}{reason}{RESET}" if reason else ""))

def section(title: str):
    print(f"\n{BOLD}{CYAN}━━━ {title} ━━━{RESET}")

async def test_all():
    global token

    async with httpx.AsyncClient(timeout=60.0) as client:

        # ─────────────────────────────────────────────
        section("HEALTH CHECK")
        # ─────────────────────────────────────────────

        try:
            r = await client.get(f"{BASE_URL}/health")
            if r.status_code == 200 and r.json().get("status") == "ok":
                passed("GET /health", f"status={r.json()['status']}")
            else:
                failed("GET /health", f"status={r.status_code} body={r.text}")
        except Exception as e:
            failed("GET /health", f"Connection error: {e}")
            print(f"\n{RED}Backend is not running. Start it with:{RESET}")
            print("  uvicorn app.main:app --reload --port 8000")
            sys.exit(1)

        # Test: MongoDB is connected (shown in health response)
        try:
            r = await client.get(f"{BASE_URL}/health")
            if r.status_code == 200:
                db_status = r.json().get('database', '')
                if db_status == 'connected':
                    passed("MongoDB connection", "database=connected")
                else:
                    failed("MongoDB connection", f"database={db_status}")
                    print(f"  {YELLOW}Run: curl http://localhost:8000/api/auth/debug-db{RESET}")
                    print(f"  {YELLOW}to diagnose the MongoDB connection issue.{RESET}")
                    print(f"  {YELLOW}Also check: curl http://localhost:8000/api/health{RESET}")
                    print(f"  {YELLOW}See MONGODB_SETUP.md for connection instructions.{RESET}\n")
        except Exception as e:
            failed("MongoDB connection", str(e))

        # ─────────────────────────────────────────────
        section("AUTH — REGISTER")
        # ─────────────────────────────────────────────

        # Test: Register new user
        try:
            r = await client.post(f"{BASE_URL}/auth/register", json={
                "name": test_name,
                "email": test_email,
                "password": test_password,
            })
            if r.status_code == 201:
                data = r.json()
                token = data.get("access_token")
                user = data.get("user", {})
                if token and user.get("email") == test_email:
                    passed("POST /auth/register", f"user_id={user.get('id', '')[:8]}...")
                else:
                    failed("POST /auth/register", f"Missing token or wrong email. body={data}")
            else:
                failed("POST /auth/register", f"status={r.status_code} body={r.text[:200]}")
        except Exception as e:
            failed("POST /auth/register", str(e))

        # Test: Register duplicate email should fail
        try:
            r = await client.post(f"{BASE_URL}/auth/register", json={
                "name": test_name,
                "email": test_email,
                "password": test_password,
            })
            if r.status_code == 400:
                passed("POST /auth/register (duplicate → 400)", "correctly rejected duplicate")
            else:
                failed("POST /auth/register (duplicate)", f"Expected 400, got {r.status_code}")
        except Exception as e:
            failed("POST /auth/register (duplicate)", str(e))

        # Test: Register with missing fields
        try:
            r = await client.post(f"{BASE_URL}/auth/register", json={
                "email": "incomplete@test.com",
            })
            if r.status_code == 422:
                passed("POST /auth/register (missing fields → 422)", "correctly rejected")
            else:
                failed("POST /auth/register (missing fields)", f"Expected 422, got {r.status_code}")
        except Exception as e:
            failed("POST /auth/register (missing fields)", str(e))

        # ─────────────────────────────────────────────
        section("AUTH — LOGIN")
        # ─────────────────────────────────────────────

        # Test: Valid login
        try:
            r = await client.post(f"{BASE_URL}/auth/login", json={
                "email": test_email,
                "password": test_password,
            })
            if r.status_code == 200:
                data = r.json()
                token = data.get("access_token")  # refresh token
                if token:
                    passed("POST /auth/login", f"token_length={len(token)}")
                else:
                    failed("POST /auth/login", f"No token in response. body={data}")
            else:
                failed("POST /auth/login", f"status={r.status_code} body={r.text[:200]}")
        except Exception as e:
            failed("POST /auth/login", str(e))

        # Test: Wrong password
        try:
            r = await client.post(f"{BASE_URL}/auth/login", json={
                "email": test_email,
                "password": "wrongpassword",
            })
            if r.status_code == 401:
                passed("POST /auth/login (wrong password → 401)", "correctly rejected")
            else:
                failed("POST /auth/login (wrong password)", f"Expected 401, got {r.status_code}")
        except Exception as e:
            failed("POST /auth/login (wrong password)", str(e))

        # Test: Non-existent user
        try:
            r = await client.post(f"{BASE_URL}/auth/login", json={
                "email": "nonexistent@nowhere.com",
                "password": "anything",
            })
            if r.status_code == 401:
                passed("POST /auth/login (unknown user → 401)", "correctly rejected")
            else:
                failed("POST /auth/login (unknown user)", f"Expected 401, got {r.status_code}")
        except Exception as e:
            failed("POST /auth/login (unknown user)", str(e))

        # ─────────────────────────────────────────────
        section("SUBSCRIPTION — PLAN")
        # ─────────────────────────────────────────────

        auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

        # Test: Get current plan
        try:
            r = await client.get(f"{BASE_URL}/user/plan", headers=auth_headers)
            if r.status_code == 200:
                data = r.json()
                if "plan" in data:
                    passed("GET /user/plan", f"plan={data['plan']}")
                else:
                    failed("GET /user/plan", f"Missing 'plan' key. body={data}")
            else:
                failed("GET /user/plan", f"status={r.status_code} body={r.text[:200]}")
        except Exception as e:
            failed("GET /user/plan", str(e))

        # Test: No auth → 401/403
        try:
            r = await client.get(f"{BASE_URL}/user/plan")
            if r.status_code in (401, 403):
                passed("GET /user/plan (no auth → 401/403)", "correctly rejected")
            else:
                failed("GET /user/plan (no auth)", f"Expected 401/403, got {r.status_code}")
        except Exception as e:
            failed("GET /user/plan (no auth)", str(e))

        # Test: Upgrade to pro
        try:
            r = await client.post(
                f"{BASE_URL}/user/upgrade",
                json={"plan": "pro"},
                headers=auth_headers,
            )
            if r.status_code == 200:
                data = r.json()
                if data.get("plan") == "pro":
                    passed("POST /user/upgrade (→ pro)", f"plan={data['plan']}")
                else:
                    failed("POST /user/upgrade", f"Wrong plan in response. body={data}")
            else:
                failed("POST /user/upgrade", f"status={r.status_code} body={r.text[:200]}")
        except Exception as e:
            failed("POST /user/upgrade", str(e))

        # Test: Upgrade to premium
        try:
            r = await client.post(
                f"{BASE_URL}/user/upgrade",
                json={"plan": "premium"},
                headers=auth_headers,
            )
            if r.status_code == 200 and r.json().get("plan") == "premium":
                passed("POST /user/upgrade (→ premium)", "plan=premium")
            else:
                failed("POST /user/upgrade (→ premium)", f"status={r.status_code}")
        except Exception as e:
            failed("POST /user/upgrade (→ premium)", str(e))

        # Test: Invalid plan name
        try:
            r = await client.post(
                f"{BASE_URL}/user/upgrade",
                json={"plan": "enterprise"},
                headers=auth_headers,
            )
            if r.status_code == 422:
                passed("POST /user/upgrade (invalid plan → 422)", "correctly rejected")
            else:
                failed("POST /user/upgrade (invalid plan)", f"Expected 422, got {r.status_code}")
        except Exception as e:
            failed("POST /user/upgrade (invalid plan)", str(e))

        # ─────────────────────────────────────────────
        section("HISTORY — EMPTY STATE")
        # ─────────────────────────────────────────────

        # Test: History is empty for new user
        try:
            r = await client.get(f"{BASE_URL}/history", headers=auth_headers)
            if r.status_code == 200:
                data = r.json()
                if "items" in data:
                    passed("GET /history (empty)", f"items={len(data['items'])}")
                else:
                    failed("GET /history", f"Missing 'items' key. body={data}")
            else:
                failed("GET /history", f"status={r.status_code} body={r.text[:200]}")
        except Exception as e:
            failed("GET /history", str(e))

        # Test: History without auth
        try:
            r = await client.get(f"{BASE_URL}/history")
            if r.status_code in (401, 403):
                passed("GET /history (no auth → 401/403)", "correctly rejected")
            else:
                failed("GET /history (no auth)", f"Expected 401/403, got {r.status_code}")
        except Exception as e:
            failed("GET /history (no auth)", str(e))

        # Test: Non-existent report
        try:
            r = await client.get(
                f"{BASE_URL}/history/FAKE-REPORT-ID",
                headers=auth_headers,
            )
            if r.status_code == 404:
                passed("GET /history/:id (not found → 404)", "correctly rejected")
            else:
                failed("GET /history/:id (not found)", f"Expected 404, got {r.status_code}")
        except Exception as e:
            failed("GET /history/:id (not found)", str(e))

        # ─────────────────────────────────────────────
        section("VERIFY — INPUT VALIDATION")
        # ─────────────────────────────────────────────

        # Test: No auth on verify
        try:
            r = await client.post(f"{BASE_URL}/verify", json={
                "type": "text",
                "content": "The sky is blue.",
            })
            if r.status_code in (401, 403):
                passed("POST /verify (no auth → 401/403)", "correctly rejected")
            else:
                failed("POST /verify (no auth)", f"Expected 401/403, got {r.status_code}")
        except Exception as e:
            failed("POST /verify (no auth)", str(e))

        # Test: Invalid input type
        try:
            r = await client.post(
                f"{BASE_URL}/verify",
                json={"type": "audio", "content": "test"},
                headers=auth_headers,
            )
            if r.status_code == 422:
                passed("POST /verify (invalid type → 422)", "correctly rejected")
            else:
                failed("POST /verify (invalid type)", f"Expected 422, got {r.status_code}")
        except Exception as e:
            failed("POST /verify (invalid type)", str(e))

        # Test: Empty content
        try:
            r = await client.post(
                f"{BASE_URL}/verify",
                json={"type": "text", "content": ""},
                headers=auth_headers,
            )
            if r.status_code in (400, 422):
                passed("POST /verify (empty content → 400/422)", "correctly rejected")
            else:
                failed("POST /verify (empty content)", f"Expected 400/422, got {r.status_code}")
        except Exception as e:
            failed("POST /verify (empty content)", str(e))

        # ─────────────────────────────────────────────
        section("VERIFY — FULL PIPELINE (TEXT)")
        # ─────────────────────────────────────────────

        print(f"  {YELLOW}⏳ Running full text verification pipeline...{RESET}")
        print(f"  {YELLOW}   (This takes 30-90 seconds — calling OpenAI + Tavily){RESET}")

        step_updates = []
        terminal_lines = []
        report_received = None
        error_received = None
        pipeline_start = time.time()

        try:
            async with client.stream(
                "POST",
                f"{BASE_URL}/verify",
                json={
                    "type": "text",
                    "content": (
                        "The Great Wall of China is visible from space. "
                        "Albert Einstein failed math in school. "
                        "Humans only use 10 percent of their brains."
                    ),
                },
                headers=auth_headers,
            ) as stream_resp:
                if stream_resp.status_code != 200:
                    failed(
                        "POST /verify (text pipeline)",
                        f"status={stream_resp.status_code} body={await stream_resp.aread()}"
                    )
                else:
                    buffer = ""
                    async for chunk in stream_resp.aiter_text():
                        buffer += chunk
                        lines = buffer.split("\n")
                        buffer = lines.pop()
                        for line in lines:
                            if line.startswith("data: "):
                                try:
                                    event = json.loads(line[6:])
                                    etype = event.get("event", event.get("type", ""))
                                    if etype == "step_update":
                                        step_updates.append(event)
                                        sid = event.get("stepId", "")
                                        status = event.get("status", "")
                                        print(
                                            f"    {CYAN}step:{sid} → {status}{RESET}",
                                            end="\r"
                                        )
                                    elif etype == "terminal_line":
                                        terminal_lines.append(event)
                                    elif etype == "report_complete":
                                        report_received = event.get("report")
                                    elif etype == "error":
                                        error_received = event.get("message")
                                except json.JSONDecodeError:
                                    pass

            elapsed = round(time.time() - pipeline_start, 1)
            print()  # newline after \r

            if error_received:
                failed("POST /verify (text pipeline)", f"Pipeline error: {error_received}")
            elif report_received:
                passed(
                    "POST /verify (text pipeline — SSE streams)",
                    f"{elapsed}s elapsed",
                )

                # Validate step_updates contain all 5 steps
                done_steps = {
                    e["stepId"] for e in step_updates
                    if e.get("status") == "done"
                }
                expected_steps = {"extract", "refine", "search", "verify", "report"}
                if expected_steps.issubset(done_steps):
                    passed(
                        "All 5 pipeline steps completed",
                        f"steps={done_steps}",
                    )
                else:
                    missing = expected_steps - done_steps
                    failed(
                        "Pipeline steps incomplete",
                        f"Missing done steps: {missing}",
                    )

                # Validate terminal lines received
                if len(terminal_lines) >= 5:
                    passed(
                        "Terminal lines streamed",
                        f"{len(terminal_lines)} lines received",
                    )
                else:
                    failed(
                        "Terminal lines insufficient",
                        f"Only {len(terminal_lines)} lines (expected ≥5)",
                    )

                # Validate report structure
                r = report_received
                required_fields = [
                    "id", "title", "input_type", "score",
                    "stats", "claims", "takeaways",
                ]
                missing_fields = [f for f in required_fields if f not in r]
                if not missing_fields:
                    passed(
                        "Report structure valid",
                        f"claims={len(r.get('claims', []))} score={r.get('score')}%",
                    )
                else:
                    failed("Report structure invalid", f"Missing: {missing_fields}")

                # Validate claims have correct fields
                claims = r.get("claims", [])
                if claims:
                    c = claims[0]
                    claim_fields = [
                        "id", "text", "verdict", "confidence",
                        "reasoning", "sources",
                    ]
                    missing_cf = [f for f in claim_fields if f not in c]
                    if not missing_cf:
                        passed(
                            "Claim structure valid",
                            f"verdict={c['verdict']} confidence={c['confidence']}%",
                        )
                    else:
                        failed("Claim structure invalid", f"Missing: {missing_cf}")

                    # Validate verdict is one of the 4 allowed values
                    valid_verdicts = {"true", "false", "partial", "unverifiable"}
                    invalid_claims = [
                        c for c in claims
                        if c.get("verdict") not in valid_verdicts
                    ]
                    if not invalid_claims:
                        verdicts = [c["verdict"] for c in claims]
                        passed("All verdicts valid", f"verdicts={verdicts}")
                    else:
                        failed(
                            "Invalid verdicts found",
                            f"Bad: {[c['verdict'] for c in invalid_claims]}",
                        )

                    # Validate sources have tier 1/2/3
                    sources = c.get("sources", [])
                    if sources:
                        tiers = [s.get("tier") for s in sources]
                        if all(t in (1, 2, 3) for t in tiers):
                            passed("Source tiers valid", f"tiers={tiers[:3]}")
                        else:
                            failed("Source tiers invalid", f"tiers={tiers}")
                    else:
                        failed("No sources returned for claim", "sources=[]")

                # Validate stats add up to total claims
                stats = r.get("stats", {})
                total_in_stats = (
                    stats.get("true", 0) +
                    stats.get("false", 0) +
                    stats.get("partial", 0) +
                    stats.get("unverifiable", 0)
                )
                if total_in_stats == len(claims):
                    passed(
                        "Stats total matches claims count",
                        f"total={total_in_stats}",
                    )
                else:
                    failed(
                        "Stats total mismatch",
                        f"stats_total={total_in_stats} claims={len(claims)}",
                    )

                # Check takeaways
                takeaways = r.get("takeaways", [])
                if takeaways and len(takeaways) >= 1:
                    passed("Takeaways generated", f"count={len(takeaways)}")
                else:
                    failed("No takeaways generated", f"takeaways={takeaways}")

                # ── Check history was saved ──────────────────
                print(f"\n  {YELLOW}Checking history was saved...{RESET}")
                await asyncio.sleep(1)  # brief wait for DB write

                rh = await client.get(
                    f"{BASE_URL}/history",
                    headers=auth_headers,
                )
                if rh.status_code == 200:
                    history_data = rh.json()
                    items = history_data.get("items", [])
                    if len(items) >= 1:
                        passed(
                            "GET /history (after verify)",
                            f"{len(items)} item(s) saved to DB",
                        )
                        # Fetch the specific report
                        report_id = r["id"]
                        rr = await client.get(
                            f"{BASE_URL}/history/{report_id}",
                            headers=auth_headers,
                        )
                        if rr.status_code == 200:
                            passed(
                                f"GET /history/{report_id[:8]}...",
                                "full report retrievable from DB",
                            )
                        else:
                            failed(
                                f"GET /history/{report_id[:8]}...",
                                f"status={rr.status_code}",
                            )
                    else:
                        failed(
                            "GET /history (after verify)",
                            "No items saved — check MongoDB write",
                        )
                else:
                    failed("GET /history (after verify)", f"status={rh.status_code}")

            else:
                failed(
                    "POST /verify (text pipeline)",
                    "Stream ended with no report_complete event",
                )

        except Exception as e:
            failed("POST /verify (text pipeline)", f"Exception: {e}")

        # ─────────────────────────────────────────────
        section("VERIFY — URL INPUT")
        # ─────────────────────────────────────────────

        print(f"  {YELLOW}⏳ Testing URL scraping pipeline (30-90s)...{RESET}")

        url_report = None
        url_error = None
        url_start = time.time()

        try:
            async with client.stream(
                "POST",
                f"{BASE_URL}/verify",
                json={
                    "type": "url",
                    "content": "https://en.wikipedia.org/wiki/Moon_landing",
                },
                headers=auth_headers,
            ) as stream_resp:
                if stream_resp.status_code != 200:
                    failed(
                        "POST /verify (url pipeline)",
                        f"status={stream_resp.status_code}",
                    )
                else:
                    buffer = ""
                    async for chunk in stream_resp.aiter_text():
                        buffer += chunk
                        lines = buffer.split("\n")
                        buffer = lines.pop()
                        for line in lines:
                            if line.startswith("data: "):
                                try:
                                    event = json.loads(line[6:])
                                    etype = event.get("event", event.get("type", ""))
                                    if etype == "report_complete":
                                        url_report = event.get("report")
                                    elif etype == "error":
                                        url_error = event.get("message")
                                except json.JSONDecodeError:
                                    pass

            url_elapsed = round(time.time() - url_start, 1)

            if url_error:
                failed(
                    "POST /verify (url pipeline)",
                    f"Error: {url_error}",
                )
            elif url_report:
                passed(
                    "POST /verify (url pipeline)",
                    f"{url_elapsed}s, claims={len(url_report.get('claims', []))}",
                )
            else:
                failed(
                    "POST /verify (url pipeline)",
                    "No report received",
                )
        except Exception as e:
            failed("POST /verify (url pipeline)", f"Exception: {e}")

    # ─────────────────────────────────────────────
    # FINAL SUMMARY
    # ─────────────────────────────────────────────
    total  = len(results)
    passed_count = sum(1 for r in results if r[0] == "PASS")
    failed_count = sum(1 for r in results if r[0] == "FAIL")

    print(f"\n{BOLD}{'━'*50}{RESET}")
    print(f"{BOLD}  RESULTS: {GREEN}{passed_count} passed{RESET}{BOLD}  "
          f"{RED}{failed_count} failed{RESET}{BOLD}  / {total} total{RESET}")
    print(f"{BOLD}{'━'*50}{RESET}\n")

    if failed_count > 0:
        print(f"{RED}Failed tests:{RESET}")
        for status, name in results:
            if status == "FAIL":
                print(f"  {RED}✗{RESET} {name}")
        print()
        sys.exit(1)
    else:
        print(f"{GREEN}All tests passed! Backend is fully operational.{RESET}\n")
        sys.exit(0)


if __name__ == "__main__":
    print(f"\n{BOLD}{CYAN}VeritAI Backend — Route Test Suite{RESET}")
    print(f"{CYAN}Testing against: {BASE_URL}{RESET}")
    print(f"{YELLOW}Note: Full pipeline tests call OpenAI + Tavily APIs{RESET}")
    print(f"{YELLOW}      and take 1-3 minutes to complete.\n{RESET}")
    asyncio.run(test_all())
