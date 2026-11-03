# TRM Workspace 3.0 — Trost × CRM × OKR engineering audit
Date: 2026-11-03. Scope: independent existing `trm-workspace/` in website repository. No changes to Kish OKR, Finance, Alborz or Behparvar.

## Reference and authority
Primary: Armin Trost (2014), *Talent Relationship Management*, Springer, DOI 10.1007/978-3-642-54557-3. Supplied full 157-page English PDF, figures and chapters 3–9. Supplement: supplied Trost HRM lecture deck. UX / operating patterns: Attio kanban views, HubSpot CRM activity timeline and contextual agent, Salesforce pipeline inspection and human-approved agent action. Architecture comparison: local Kish OKR system's separation of visual workflow, evidence-backed status and enterprise backend contract. The app is an independent implementation, never attributed to the author/publisher.

## Central product principle
**Talent-centered CRM, not a vacancy-centered ATS.** The persistent entity is a relationship, not a requisition. When a vacancy opens it activates a structured recruitment workflow that FIRST checks strategy, existing talent relationships, target-group EVP and consent, THEN sourcing, assessment and candidate experience. No automatic hiring decision.

## Critical audit findings
| Priority | Gap in baseline | Status and disposition |
|---|---|---|
| P0 | No actual AI engine, EVP draft merely concatenated input | Explainable local decision engine implemented; connected generative agent remains OPEN |
| P0 | Vacancy activation absent from data model | Vacancy CRUD and stage pipeline added |
| P0 | Home noisy, instructional paragraphs and pilot notices | Lean four-tile home / CTA / real metrics / next action implemented |
| P0 | Generic vs role-specific EVP ambiguous | EVP evidence- and gap-check coach added; publishing still human decision |
| P0 | Browser-local personal candidate data, no organizational isolation | BLOCKED for real sensitive candidate data until dedicated secured backend |
| P0 | No authenticated roles, audit, access rights or retention/deletion workflow | OPEN enterprise deployment prerequisite |
| P1 | CRM-style link of candidate, relationship and open vacancy weak | Decision coach checks role-specific pool counts and consent; explicit linking actions to vacancies remains OPEN |
| P1 | No visual Kanban for open positions | Pipeline of five states added |
| P1 | No Next Best Action or reasons for missing inputs | Four decision types + missing evidence lists implemented |
| P1 | Candidate relationship activity chronology partial | Existing timeline preserved; task automation and configurable cadence OPEN |
| P1 | No per-organization evidence quality measure | Basic completeness evaluation added; source/document audit and quality calibration OPEN |
| P2 | KPI and ROI assumptions not linked to outcomes | Existing report and ROI retained; causal impact attribution OPEN |
| P2 | No bulk imports, ATS, calendar/email links | OPEN; only via explicit consent and authorized server integrations |

## Book-to-product traceability
- Ch. 3, Fig. 3.1, 3.3 — talent vs vacancy focus, cyclical candidate relationships → workspace architecture, vacancy check.
- Ch. 4, Figs. 4.1, 4.4, 4.5, 4.7–4.9 — critical roles, challenges, acceptable competency gaps, workforce planning → role wizard, portfolio, role coach.
- Ch. 5, Figs. 5.2–5.6 — EVP assessment: employer strengths, target preferences, competitor strengths; signature-experience proof → EVP studio and coach.
- Ch. 6, Fig. 6.1 — active sourcing, employee referrals, social/community and line manager involvement → sourcing plan and suggested activation sequence.
- Ch. 7, Fig. 7.1 — pool, candidate retention, measures, documentation and recurring cycle → contacts, consent-aware relationship analysis.
- Ch. 8 — speed, transparency, appreciation and consistency → candidate journey and feedback.
- Ch. 9 — senior management support, HR organization, technology, international context and monetary benefit → governance, rollout roadmap and ROI.

## CRM patterns borrowed (NOT copied)
- **HubSpot:** person activity timeline, unified context, next action, meaningful data completeness.
- **Attio:** stage-based operational board, focused cards and contextual detail.
- **Salesforce:** inspect opportunity/role risks, provide reasons for recommended actions, human approval for writes.
- **OKR UX:** navigable hierarchy, persistent Home, real baseline/actual values, clear status and evidence requirements, deploy boundaries.

## AI Agent target architecture — NOT deployed
1. **Context**: authenticated organization's critical-role definitions, aggregated pipeline, EVP evidence, consent flags, authorized activities; pseudonymize people and exclude protected/sensitive attributes.
2. **Reason**: source-tagged Trost domain knowledge indexed by figure/chapter and validated structured workflows; distinguish observed facts, hypotheses and recommendations.
3. **Tools**: `get_role_portfolio`, `analyze_workforce_gap`, `review_evp`, `inspect_talent_pool`, `build_vacancy_activation_plan`, `draft_opt_in_outreach`, `find_overdue_activities`, `explain_candidate_experience`.
4. **Draft outputs**: editable EVP, role-specific sourcing plan, vacancy timeline, recommended next best actions, risks, missing evidence, owner/date fields.
5. **Human approval**: agents may draft only; any update, message, invitation, prioritization or status change must be confirmed by authorized user and written server-side with audit trace.
6. **Security**: tenant isolation/RLS, MFA where appropriate, server-side short-lived identity, encrypted backups, per-tenant rate limits and spending caps, purpose/retention schedule, access logging; no secrets on GitHub Pages.
7. **Evaluation**: grounded answer rate, evidence completeness, invalid promise avoidance, action utility, data-leak and cross-tenant isolation tests; track optional human overruling, do not equate model confidence with applicant quality.

## Verified in this revision
- Syntax parse of `app.js` passed (V8).
- Local analysis methods: role / EVP / vacancy / relationship returned structured, source-tagged outputs.
- Render smoke tests of routes: home, agent, vacancies, evp, roles, settings using test fixtures.
- PWA index and service worker versioned asset mapping present.
- No production backend or connected LLM deployed; external browser live visual test not verified (browser service wallet exhausted).
- Scope entirely within `trm-workspace/`. Existing localStorage key unchanged, existing records preserved.

## Production acceptance gates (non-negotiable)
A. Real authentication and per-tenant authorization demonstrated with two isolated organizations; no cross-tenant read/write.
B. Candidate consent capture and withdrawal enforced server-side; retention, deletion/export and access log tests.
C. Multiuser edit reconciliation / revision conflicts and encrypted restore verified.
D. LLM service behind a secured server-side proxy; no client API key. Prompt injection and sensitive-data exclusion tests.
E. Agent citations/evidence flags, human approval for all consequential writes/outreach, deterministic rollback.
F. Real-device install and desktop/mobile accessibility verified.
G. Complete end-to-end case: a strategic role → target group → EVP evidence → sourcing → consented talent → vacancy activation → human-approved communication → experience feedback → dashboard.

## Explicit status
This is a substantially improved local-first **pilot** with decision-support. It is not a secure, organization-ready multiuser TRM SaaS and does not yet have a live LLM-backed agent. These are architectural implementation gates, not UI toggles.
