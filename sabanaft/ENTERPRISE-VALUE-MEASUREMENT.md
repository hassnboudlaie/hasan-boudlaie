# Reflective Leadership OS — Enterprise Value Measurement & Renewal Model
Product measurement design. Date: 2026-10-25. Status: SPECIFICATION (not live organization-wide analytics).

## Decision this measurement system must serve
At 30, 60 and 90 days, a sponsoring organization must be able to decide: (1) are enough managers finding and repeatedly using the tool for real leadership situations? (2) do managers report actionable value and make documented decisions? (3) is there **credible external evidence** of changes in agreed operational outcomes? (4) is renewal or a changed package justified relative to cost and risk?

A manager must also have a private self-development view. The enterprise must **not** see personal case content, daily journals, simulated dialogues or unshared human coaching sessions by default.

## Product and measurement hierarchy
One primary business hypothesis: access to personally contextualized reflection and optional coaching helps managers make and follow through on better-considered leadership decisions. This requires external testing: repeated product usage and self-reported confidence do **not** prove business impact.

Three primary measures:
| KPI | Numerator / denominator | Decision supported | Grain | Caveat |
| --- | --- | --- | --- | --- |
| Meaningfully engaged managers (28d) | Number of eligible, activated managers with 2+ distinct qualifying days with a completed case decision, post-action reflection or practice session within rolling 28d / eligible activated managers | Is the product worth continuing to make available? Where is onboarding failing? | org/28d | Time-on-site and clicks do not count. Two distinct days avoid bulk entries on day one. Not a productivity outcome. |
| Voluntary decision usefulness (28d) | Average 1–5 answer to "Did this experience help clarify your decision?", with unique user count and response rate separately; use per-user averaged responses to avoid power users dominating | Is the help relevant to the manager's actual work? | cohort/28d | Selection/nonresponse bias; **not** a scientific leadership score, effectiveness or objective benefit. |
| Reviewed next actions with recorded outcome (28d) | Case-linked due actions with a post-decision review containing an observed outcome and declared evidence provenance / eligible due actions | Do decisions lead to subsequent examination of outcomes? | org/28d | Self-reported completion/review; does not prove the action itself succeeded or created business benefit. |

Two diagnostic drivers:
- **Time to first meaningful case**: median elapsed minutes from first account activation to first complete situation or case decision, exclude idle sessions, report observation count and percent who never complete. Faster is not automatically better for complex cases.
- **Case-to-action transfer**: cases with a specific next action AND due date / all cases with a saved decision, optionally segment by role and department only with privacy suppression.

Two essential guardrails:
- **Private content access incidents / trust:** number of verified unauthorized private-information disclosures, number of access control failures, and proportion of managers reporting that they do not trust the privacy model. Any breach triggers investigation independent of KPI success.
- **Response quality and harm:** voluntary sample audit for wrong/context-insensitive suggestions, unsafe HSE/legal/HR advice, model hallucinations, or users feeling pressured to use a prescribed leadership role. Escalate safety, suspend AI features if warranted.

### Business outcome and ROI layer — gated, never invented
Select ONE or TWO business outcomes with each pilot organization at contract signing, such as:
- Verified project decision cycle time: days from issue creation in an independent project system to an authorized decision; compare similar tasks over time.
- Verified rework/clarification requests: number per 100 comparable deliverables.
- Documented team issue escalation timeliness, if sourced from independently governed operational processes.
These must come from approved external systems, not from the manager's self-written case summary. Pre-specify case mix, eligible population, time window, seasonality and confounding interventions. Prefer staggered rollout or appropriate comparison groups if possible.

**ROI formula**: (credible incremental attributable monetary benefit − product+training+coaching+support+implementation total cost) / total cost. Label as "ROI not established" when attribution, credible monetization or costs are missing. Never fabricate currency values or performance improvements.

## Manager versus sponsor interface
- **Personal My Impact:** number of cases, decisions, evidence-backed reflections, scheduled reviews, user-provided usefulness feedback, coach/roleplay session history (private). Distinguish self-report from verified evidence; support export/delete.
- **Sponsor Enterprise Dashboard:** license activation, meaningful adoption, cohort percentages with N and denominators, aggregated usefulness with response rate, aggregated evidence-follow-through, verified external outcomes when integration exists, subscription cost and renewal recommendation with limitations.
- **Org billing admin:** membership and seat management, invoice and service credits, never case contents.
- **Coach:** only manager-selected case briefing and selected reflections with active consent; no passive organizational insight into coaching conversations.

## Instrumentation contract (future server only)
| Event | Minimum properties | Data minimization notes |
| --- | --- | --- |
| account_activated | opaque user_id, tenant_id, timestamp, entitlement | do not include personal CV or manager name in analytics |
| case_started | case_id, user_id, tenant_id, timestamp, source text/voice flag | never transmit actual case text to analytics |
| case_decision_saved | case_id, date, source "manual" or "AI-assisted", user_id, tenant_id | no rationale or exact action text in product analytics |
| roleplay_completed | case_id, persona_type, role_id, duration bucket, date | no conversation transcript |
| reflection_completed | opaque reflection_id, case_id nullable, date, source_of_evidence category | no diary text |
| next_action_due | action_id, due day, case_id, manager_id | no action description |
| next_action_reviewed | action_id, reviewed day, result_provenance enum, manager_id | don't conflate reviewed vs successfully accomplished |
| usefulness_submitted | score 1–5, user_id, case_id, date | opt-in; report response rate and confidence in coverage |
| coaching_session_completed | session_id, manager_id, duration 30/60, modality, date | no case content, mentor notes or recording |
| privacy_preference_changed | date, setting, consent scope | consent and revocation audit separate from analytics |

Key uniqueness: retain separate event_id, event_time UTC and tenant-level aggregation region. Derive durations only from auditable event timestamps. Define sessions and exclusions in metric registry before launch. Dedupe events, handle replay, deleted users, bot/testing accounts, stale tenants, time-zone day boundaries (including Iran and European locales), sparse cohorts and asynchronous sync. Events should be generated and checked server-side, not accepted blindly from mutable client counters.

## Minimum privacy threshold and lawfulness
- Authorization checks on every row read/write and service event; tenant ID/role verified by server from token/session, not submitted client claims.
- Before reporting any cohort, apply an organization-agreed k-anonymity minimum (initial design suggestion: k>=7 distinct eligible managers), AND check overlapping filters/time windows to reduce differencing attacks; do not claim k suppression guarantees anonymity.
- Suppress breakdowns likely to reveal an individual's behavior, especially small teams. No individual manager leaderboard, coercive reflection quotas, employment or promotion decisions derived from journaling.
- Privacy notices and legal basis for employment data require counsel/organization review, especially in worker-monitoring contexts. Coach-client confidentiality is distinct from HR reporting.
- Audio/transcription provenance and separate processing terms; use STT only after explicit notice/authorization, with redaction options and no raw audio retention by default.

## Pilot evaluation cadence and evidence gates
**Before Day 1**: approve baseline, eligible seats, decision-related operational outcomes, data-access contract, 28-day event definitions, feedback prompts, reporting thresholds, costs and renewal success criteria. Set numeric targets only once baselines and feasible opportunities are understood.

**Day 30**: activation, time-to-value, access/setup barriers, safety issues; do not infer impact.

**Day 60**: meaningful engagement and usefulness distribution with N/nonrespondents, action review completeness, follow-up usability improvement.

**Day 90**: evaluate agreed outcomes and credible comparisons; show unmeasured effects and confounders. Conclude: expand, renew with changes, prolong evidence-building pilot, or not renew; no unsupported financial ROI.

## Current state / gaps
The public GitHub Pages pilot exposes **self-only** local case counts, decisions, actions, roleplay history, reflections and a voluntary usefulness question. These are neither organization-controlled nor independently verifiable. No multi-user authentication, subscriptions, tenant attribution, shared analytics datastore, external operational KPI or measured ROI is implemented. All organizational metrics above are a **future measurement contract**, not existing data.
