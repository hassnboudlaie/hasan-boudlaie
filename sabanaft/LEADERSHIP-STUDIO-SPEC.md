# Sabanaft Reflective Leadership Studio — Product & Security Contract

Owner: Hasan Boudlaie. Public app entry: `/sabanaft/`, with the personal workspace served from `/sabanaft/leadership-studio.html` and the prior 9-session book experience retained at `/sabanaft/index.html#home`.

## Product outcome
A manager logs into their own **secure individual leadership workspace**, captures real but privacy-safe cases, reflects on leadership context, develops and revises their leadership idea, rehearses choices across Boss, Coach, Partner and Enabler, follows through and compares the intended role with observed behavior. The user sees their **current decision or next action**, not a curriculum or designer/teacher notes.

## Source of truth
Armin Trost (2025), *The Reflective Leader: A Guide to Context-Driven Leadership and Building Trust*, DOI 10.1007/978-3-662-70860-6. Read alongside `BOOK-ALIGNMENT.md`. No book pages, tables, graphics or copyrighted full text are published. The product does not claim to reproduce or validate any proprietary leadership inventory.

- **Ch. 5**: context -> leadership idea -> relationship, reinforced by reflection and compatible tools.
- **Ch. 6**: 18 context dimensions within tasks / employees / team / organizational embeddedness. Subjective reflection is not psychometrics.
- **Ch. 7**: Boss, Coach, Partner, Enabler; all four are potentially functional or dysfunctional. Responsibility for team results persists across roles.
- **Ch. 8**: distinguish the *appropriate* leadership role mix from historical behavior and **assumed** subordinate attribution; assign ten points across four roles. The relationship between context and roles is explicitly nondeterministic.
- **Ch. 9**: reflect on actual leadership situations and seek real feedback. Never invent employee feedback. Preserve separate perspective provenance.
- **Ch. 10**: desired benefit -> context -> role -> compatible tool. Follow-up and behavioral evidence, not a generic toolkit.
- **Ch. 11 and appendix**: continuous reflection and critical practical cases.

## Core state and information architecture
1. Manager identity: name, role, unit/project and authority boundaries.
2. One or more *leadership contexts*, including time horizon and 18 annotated dimensions (no aggregate diagnostic score).
3. Ten-point role mix: appropriate leadership idea; past/observed behavior; *assumed* expectations; future verified feedback is a separate source.
4. Case workspace: description, stakeholders by role (no names), stakes, time pressure, safety/legal limits, competence, dependencies and organizational constraints.
5. Role rehearsal: four distinct behaviors, alternative role, actual spoken script, authority gate, switching condition. The manager owns the decision.
6. Action and follow-through: next best step, owner, date, result and review.
7. Reflection: what happened, evidence/source of feedback, role change and next experiment.
8. Private manager portfolio and optional organization-level **aggregated, consented** participation reporting.

## Current implementation (pilot)
- Source: `leadership-studio.html`; reads the existing authoritative 18 dimensions and four roles from `reflective-content.js`.
- Covers profile, 18-dimension context map, three separate ten-point perspectives (appropriate, self-observed, assumed team expectations), case capture, conditional situation prompts, four-role rehearsal, action, reflection and JSON export/import.
- Isolated key: `sabanaft_leadership_studio_v1`. Does **not** migrate, overwrite or delete the original `sabanaft_reflective_v2` or earlier course data.
- GitHub Pages hosts static UI only. **There is no authenticated manager account, organization database, secure synchronization, LLM integration, automated private feedback collection or central admin portal yet.** LocalStorage can be read by another user of the same browser and does not constitute a secure multi-manager deployment.
- No names or confidential company details should be placed in real cases until the server-side security gates have been implemented and tested.

## Required production backend
- Server-side identity provider, manager-owned sessions, invited organization membership, revocation and audit log.
- Database tables: `orgs`, `org_members`, `manager_profiles`, `leadership_contexts`, `context_dimension_observations`, `role_mix_snapshots`, `cases`, `role_rehearsals`, `action_plans`, `reflections`, `feedback_requests`, `feedback_responses`, `consent_events`, `audit_events`.
- Enforced Row Level Security: authenticated owner can read/write own records; an organizational administrator can see only specifically authorized organizational metadata/consented aggregate reports, never sensitive private case narratives by default. Do not rely on browser filters for access controls.
- Strict server-side validation, minimization, encryption in transit and at rest, export/delete/retention controls and restricted logs. No secrets in public GitHub files.
- For future AI-assisted case analysis: a server-side model gateway, organizational opt-in, PII redaction, explicit evidence/uncertainty, prevention of autonomous personnel decisions, and traceability to book concepts. A language model may suggest *alternatives* and inquiry prompts, not definitive role prescriptions.

## Release acceptance criteria
- Separate manager accounts retain independent records when switching devices and cannot see each other's entries.
- Context captures all 18 dimensions with level and evidence; more than one working context is supported.
- Role mix for each perspective totals exactly 10, perspective/source are clearly labeled and dates retained.
- At least two defensible behaviors are compared for each real case. No universally correct role or psychometric score.
- A recorded case progresses through decision, rehearsal, action, observed result, feedback and future reflection.
- Validated mobile RTL layout, keyboard access, readable contrast, no training-design notes in manager workspace, no missing links.
- Security tests include unauthorized API access, role escalation, data export/delete, and leak prevention before organizational pilot.

## Immediate next work
Implement secure backend and API for manager accounts, central persisted contexts and cases, authenticated feedback, owner-scoped records and optional management analytics. Then perform real mobile browser QA and a usability pilot with managers. Preserve current local data and offer opt-in migration, not destructive replacement.