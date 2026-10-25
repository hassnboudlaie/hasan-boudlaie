# Reflective Leadership OS — My Reflection Product Specification

Status: interactive browser pilot, 2026-10-25.
Working route: `/sabanaft/leadership-studio.html#daily`.
Source: `my-reflection.js`, `assets/my-reflection.css`, integrated into `leadership-studio.html`.

## Product promise
A manager can turn one actual leadership moment into an observable improvement in about three minutes. The app remembers their current Leadership Idea and case history but does not ask them to complete the entire onboarding, context map, or role mix again.

The journal is personal, **not** an organization-wide scorecard, psychological test, or employee performance monitoring system.

## Experience principles
- Start with the real moment, not an educational introduction. The four steps are **Notice → Recognize → Understand → Act**.
- Short by default; optional context link, evidence and follow-up date. The user can pause and resume.
- Ask adaptive, limited questions based on role, case history, observed outcome and the provenance of feedback.
- Source-aware: a leader's own report must not be represented as actual employee feedback.
- A role difference is a prompt for inquiry, not a right/wrong judgment. No deterministic role scoring.
- Allow **positive** moments, unexpected moments, challenges and ordinary situations.
- No mandatory daily streaks, normative comparisons, anxiety-inducing push notifications or manager rankings.
- Present book material only as just-in-time micro-guidance. Training pages remain separate from the daily experience.

## Four-step flow

### 1. Notice the moment
- Select moment: challenge, successful moment, unexpected, ordinary.
- Optionally link to an existing Case ID. The Case Lab must offer a direct link into My Reflection with the case preselected.
- Describe one observable event without names, business secrets or other sensitive information.
- Validation: a linked case or a short description suffices. No forced long narrative.

### 2. Recognize the role actually played
- Choose one dominant behavior among Boss, Coach, Partner and Enabler for today's moment; this is a self-report, not a psychometric classification.
- Describe what was actually said or done.
- Compare in the sidebar with the user's **intended** role mix where available. Do not convert the context variables into an algorithmically prescribed role.
- Encourage noticing legitimate role switching.

### 3. Understand impact and evidence
- Record the response/outcome (including “unknown so far”).
- Label evidence source: my own observation, genuinely received colleague feedback, a verifiable artifact or insufficient evidence.
- Optionally record a specific observation or assumption still to be verified.
- Flag situational context change, distinguishing a temporary case exception from durable baseline change.
- Adaptive follow-up prompts ask what might be overlooked, which signals would test the interpretation and whether employees experienced the behavior as intended.

### 4. Learn and act
- Name one learning, assumption to challenge, or inconsistency between intent and behavior.
- Set one next best observable action, optional review date, optional desired support.
- Support choice: self-directed, later AI conversation, or human coach/mentor. In the public pilot the latter two are **saved preferences only**, not actual bookings or external messages.
- Save to an append-only personal history; start a clean draft. Prior reflections must never be silently truncated.

## Current implemented interaction
- Responsive RTL four-step wizard; clear hierarchy, progress and keyboard-supporting native buttons/inputs.
- Local autosave of draft under the app's existing storage key; backup JSON includes this daily data.
- At least one daily entry is possible, but there is no artificial “one per day” limit.
- Role-specific and case-specific prompts, prominent Leadership Idea and Context links.
- History shows the last eight entries while retaining all valid entries in persisted state.
- Due items are shown in Follow-through with a manual “review completed” action; marking review complete does not imply the assigned action itself succeeded.
- Inputs are escaped before HTML insertion. Records are client-side only. Confidential material must not be entered into the public pilot.
- Data schema preserves previous profiles, role mixes, cases, case journal and legacy session keys.
- Save failure must not falsely report a completed record; keep the draft in memory and prompt export.

## Commercial product architecture (not yet implemented)
The production system needs:
1. **Manager identity and consent** — SSO/invitation, independent membership; sessions bound to user ID, org ID and tenant.
2. **Durable private storage** — entities `reflection_entries`, `reflection_drafts`, `reflection_case_links`, `reflection_actions`, `evidence_sources`, `coach_share_consents`. All mutable rows have timestamps, actor and tenant ownership; server-side row-level authorization.
3. **Context service** — an entry references the applicable context snapshot at event time; do not retroactively rewrite old reflection interpretation when the context changes.
4. **Case service** — linked cases may be copied as minimal summaries; avoid duplicating sensitive case narratives.
5. **Role-idea service** — read historical/intended role mix as dated snapshots; distinguish observed behavior and assumptions about others' expectations.
6. **AI guidance gateway** — server-side provider call with content minimization/redaction; grounded, optional follow-up questions with provenance and uncertainty; no invented feedback, no high-stakes autonomous organizational/personnel judgment. Coaching conversational mode distinct from Trost's Coach role.
7. **Human support** — coach/mentor directory, availability, booking, payment/credits and case-brief sharing only with granular explicit consent; revoke sharing and apply retention limits.
8. **Privacy and compliance** — encryption, server access control, audit trail, regional hosting as needed, export/correction/delete, retention policies, anti-leakage logging, separation of personal data from organization statistics.

## SaaS entitlement and measurement
- Individual: unlimited private reflection, optional AI credits and backup/sync.
- Professional: case-linked reflection, optional AI dialogue and human session credits.
- Organization: paid seats and adoption indicators on a privacy-preserving **aggregate** basis; no raw reflection content or person-level behavioral scoring for HR by default.
- Useful measures: voluntary weekly engaged managers, first-to-second reflection retention, percentage of entries with a next step, action follow-through **self-reported**, return to prior case/role mix, optional perceived helpfulness. Never imply such measures directly prove leadership effectiveness.

## QA / acceptance
- Onboarding context and role mix remain intact after creating/updating/deleting a draft.
- Day 1 and repeated same-day entries persist; refresh preserves draft.
- Active Case → My Reflection preserves the selected case ID; empty linked-case description passes first-step validation.
- Only completed entries appear in History; no exposure of raw HTML/script from user text.
- Valid feedback provenance labels and no fabricated employee-perspective claims.
- No role presented as invariably correct; prompts vary with selected role and case.
- More than 160 entries can be restored/saved without silent deletion; if storage fails, do not claim success.
- Due review can be marked completed and disappears from “due” without deleting the original entry.
- Keyboard access, focus state, mobile RTL and responsive layout assessed in real browsers before user pilot.
- Penetration testing and private cross-account boundary tests required **before** production launch.

## Scientific provenance
Armin Trost (2025), *The Reflective Leader: A Guide to Context-Driven Leadership and Building Trust*:
- Ch. 4: thoughtful reflection on behavior, intuitions, relationship and trust.
- Ch. 5–6: leadership context and leadership idea.
- Ch. 7: distinct four roles, with possible dysfunctional counterparts.
- Ch. 8: context-driven role mix without any deterministic mapping.
- Ch. 9: distinguishing intended versus attributed roles, actual feedback and observation.
- Ch. 11: continuous reflection and adaptation.
Follow `BOOK-ALIGNMENT.md`. This app is an original applied workflow, not a reproduction of any proprietary inventory or a clinical assessment.
