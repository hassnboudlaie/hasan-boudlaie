# Alborz Insurance — Isolated Live Collaboration Pilot (Work handoff)

**Date:** 2026-11-06  
**Branch:** `feature/alborz-live-sync-isolated`  
**Do not merge without reconciling any concurrently running ChatGPT Work changes.**

## User-approved scope
- Keep the existing **My Finance main** project unchanged.
- Keep the **Beta Supabase project**; repurpose only a logically isolated portion for Alborz.
- Do not delete any Finance users or data before independent backup and acceptance.
- Preserve the original communications course and claims workshop files in `main`.
- Target 10 groups × 5 members, four original resilience missions, instructor monitoring.

## Implemented now
1. In Supabase project `cymatyfnwuxikrghydrn`:
   - Created `public.alborz_team_fields` (field-granularity shared team state).
   - Created `public.alborz_access_keys` (SHA-256 hashes of high-entropy team and teacher codes).
   - Enabled RLS and revoked anonymous/authenticated table privileges; access via isolated Edge Function only.
   - Generated 10 independent team access codes and one teacher access code. **Raw codes must never be committed.**
   - Deployed Edge Function `alborz-workshop-sync`, currently version 2 (teacher read-all, scoped team read/write).
   - No Finance tables, users, app code or Finance-related Edge Functions changed.
2. On this branch only:
   - `alborz-communication-skills/alborz-live-pilot.html`: standalone, nonproduction group workspace + instructor view.
   - Participant inputs are segregated by both team and member; team-level decisions are shared.
   - Polls every ~10 seconds (group) / ~12 seconds (teacher) after authentication.

## Integration contract for future Work session
The existing four-hour resilience app lives in `alborz-communication-skills/resilience.html` and `resilience-game.js` on `main`. **Those files have NOT been modified by this work.**

When Work resumes:
- Compare current `main` and this branch before any cherry-pick or merge.
- Reuse the isolated API and field contract; do not duplicate the database schema or token system.
- Map existing keys `r0initial` ... `r3revision`, `r0evidence`, team name, stage to shared writes.
- Personal group contributions use `r0member1` ... `r3member5`.
- Self-assessment may contain personal reflections; do not automatically sync or publicly display personal pre/post answers.
- Protect instructor view by teacher-only code; each team's secret cannot read another team's data.
- No Finance data should appear in the Alborz app or in the public repository.

## Pilot QA still required
- Functional verification of Edge Function HTTP responses (valid team read/write, wrong-team 403, invalid code 401, teacher view).
- Two-device concurrent editing test with same team code; cross-team isolation test.
- Ten-team aggregate teacher test; mobile UX, cache behavior, expired connections.
- Replace polling with genuinely pushed Realtime events if subsecond feedback is required; for now polling is near-live, not websocket streaming.
- Real use requires distributing each team's 24-character code confidentially; never expose codes in frontend or GitHub.
- Require an explicit content/feature reconciliation before adding a production link to the Academy home page.

## Status definition
**Backend deployed; isolated frontend staged in branch; NOT production-integrated or field-tested.**
