# Alborz Live Collaboration — reviewed integration

Reviewed 2026-11-06 against main `dd0aaee` and PR #68 head `cee3af9`.

## Scope and integration
- The existing 240-minute course remains the source of teaching content. The live layer is loaded only by `resilience.html` and decorates its existing group fields.
- Communications course index, session files, claims-workshop-v2.html and My Finance are unchanged by this PR.
- Supabase Beta `cymatyfnwuxikrghydrn`: only Alborz tables, indexes and the `alborz-workshop-sync` function were changed. No Finance tables, auth users, secrets or global Auth settings were changed.
- Polling is near-live, approximately ten seconds; this is not WebSocket push.

## Security and concurrency fixes
- Each of 50 members has an independent 96-bit random code; one separate teacher code. Only SHA-256 hashes are stored server-side. Initial pilot codes are revoked; test credentials are rotated before release. Raw codes are delivered privately and never committed.
- Server derives team, member and editor label from the capability. A member cannot edit another member's contribution, another team or instructor grades.
- Direct anon/authenticated table and RPC privileges are revoked; RLS remains enabled. The service-only RPC is SECURITY INVOKER with a fixed empty search_path.
- Atomic per-team transaction with optimistic field versions: a stale writer receives 409. The UI retains the draft and requires explicit review before another write.
- Code expiration/revocation and database-backed request rate limits. No body/code logging. CORS allowlist, bounded request bodies and validated field names/types.
- Private pre/post assessments and individual action plans are rejected by the shared API. Online drafts survive failed saves in the current tab. Offline course data is not automatically uploaded.
- Server data is rendered as escaped text. Credentials are held in sessionStorage for the current tab and cleared at logout.

## Verification performed
- 20 API acceptance assertions passed, including cross-team isolation, teacher isolation, member impersonation denial, private-field denial, conflict detection and atomic rejection.
- 50 simultaneous member writes and 50 simultaneous scoped reads passed; all 50 contributions appeared in a ten-team dashboard. Burst write p50 7208ms, p95 9058ms, max 9328ms in this environment.
- Four independent browser contexts exercised two collaborating members, another team and instructor: sharing, isolation, conflicts, offline recovery, grading and logout passed.
- Existing nine-stage course tests passed at 390px and 1366px: navigation, local state isolation, budget, event reveal and exports.
- Additional checks: expired code 401, revoked code 401, rate limit 429. Direct tables and service RPCs denied to anon; SQL confirms authenticated has no table or RPC privileges either.
- No claim of a test on 50 physical phones or a full four-hour endurance test. Browser tests used a local source route with the real Beta endpoint. The test proxy's private CA required a harness-only TLS override; API tests used normal TLS validation. Production code has no TLS bypass.

## Advisories and operational limits
Supabase reports INFO for RLS without policies on the service-only Alborz tables; this is intentional deny-all for client roles, with revoked grants. The pre-existing project-wide leaked-password-protection warning remains unchanged because this code uses no Supabase Auth passwords and altering shared Auth would exceed scope.
- https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

One capability identifies a workshop seat, not a verified human identity. Keep member and teacher codes confidential. No real claim records or sensitive personal data belong in this educational system. Follow-on workshops should rotate keys and use a separate data lifecycle; this integration serves the existing ten-team cohort.

## Reproducible tests
- `node scripts/alborz-resilience-browser-qa.mjs` (Playwright 1.56.1).
- `python scripts/alborz-live-api-qa.py /private/path/test-codes.json` (temporary credentials only).
- `node scripts/alborz-live-browser-qa.cjs /private/path/test-codes.json` (same temporary credentials).
- Do not run write tests against live learner data. Test credentials are not repository assets.
