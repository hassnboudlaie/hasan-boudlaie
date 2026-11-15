# Alborz Management Academy — Impeccable Suite Audit & Release

**Date:** 2026-11-15  
**Source of truth:** Alborz Session 4 — UX/UI, Visual Rhythm, Readability, Page-flip Navigation  
**Change scope:** `alborz-communication-skills/` production entrypoints and dedicated regression QA only.

## 1. User goal

Transfer the strongest visual and learning-experience principles of session four to the whole existing Alborz Management Academy without disrupting participant data, live group synchronization, login, scoring, instructor controls, or workshop curriculum.

## 2. Five production surfaces enhanced

| Surface | Entry | Applied |
| --- | --- | --- |
| Academy and communication course | `index.html` | Unified navy/teal/champagne system, stronger hierarchy, bold Vazirmatn, readable cards and controls for sessions 0/1 plus intact session 4 |
| Communication session 2 | `session2-demo.html` | Shared system with higher-contrast typography and large scenario/dialogue action surfaces |
| Communication session 3 | `index.html?m=3` + `session3-impeccable-journey.js` | Full guided 2-stage learning journey, six individual micro-practices, six two-case audience groups, step-by-step scenario progression, focus management |
| Claims training | `claims-workshop-v2.html` | Existing resilience, anger and assertiveness modules take aligned hierarchy, panels, responsive layouts and readable language |
| Live resilience & group learning | `resilience.html?classroom=1` | Instructor and participant layouts, typography, form controls, group boards and award screens visually aligned |
| Instructor presentation | `claims-presentation.html` | Harmonized stage, projector slide, accessible controls and stronger reading layout |

## 3. Impeccable design audit — priorities and remedies

| Priority | Finding | Remediation |
| --- | --- | --- |
| P1 | Separate sub-apps lacked a common visual language: greens, blues, whites and inconsistent density | Introduced isolated `alborz-impeccable.css` with consistent palette, scale and typography |
| P1 | Session 3 had a tall six-technique + twelve-case list, not the focused screen-by-screen experience established in S4 | Added progressive-disclosure journey: home → six techniques → details + micro-practice → six role groups → two scenarios → four-stage roleplay |
| P1 | Classroom interactive surfaces used many small type levels | Increased body and explanatory text sizes, bold headlines and touch-friendly actions in viewport-specific rules |
| P2 | Course modules differed in visual hierarchy, focus indication, radius, nav and primary action | Standardized borders, background, focus-visible rings, action sizes and responsive spacing |
| P2 | Accessibility and motion behaviors lacked an academy-wide foundation | Added keyboard focus and reduced-motion support with RTL preserved |
| P2 | Static instruction pages did not consistently translate into an observable learning action | Added six low-stakes 30-second exercises to session 3, with locally stored optional progress |

### What was not changed

- No edits to Supabase, live-class API, teacher/student roles, national-ID login, group allocation, timing, scores or response storage.
- No edits to 12 original session 3 roleplay texts, character briefs, educator instructions or quiz data.
- No changes to session 4's six techniques, 12 cases, answer explanations or six-minute first-answer exam timer.
- No changes to independent non-Alborz apps, including Behparvar, Saba Naft, Allameh and HB Hub.

## 4. Automated verification (PR #163)

- **PASS:** `Alborz Session 3 Content QA`, validating 12 cases, six relationship groups and substantive roleplay dialogue.
- **PASS:** `Alborz Academy — Impeccable Suite QA / static` for source integrity and all five entrypoints.
- **PASS:** `Alborz Academy — Impeccable Suite QA / browser`, **33 checks** in headless Chromium.
- Browser scenarios included: session 3 home, lesson choice, 30-second exercise state, next lesson, six audience groups, case selection, next/back roleplay stage, phone scroll, session 4 regression, course landing, standalone S2, claims workshop, live resilience shell and presentation shell.
- Screenshot evidence: https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/43670025703/artifacts/14143762289

## 5. Release and validation boundaries

Automated tests verify the source and UI interaction in a local Chromium server. They do **not** represent a full WCAG 2.2 AA certification, real multi-participant Supabase load test, or validation on a physically installed PWA. Real hardware and slow-network checks should follow, especially for classroom group sync. GitHub Pages publication must be verified independently after the merge.

## 6. Acceptance criteria

- All listed entrypoints include the namespaced CSS and are navigable without horizontal overflow at tested sizes.
- Session 3 enters both paths and progresses through the first case, with back navigation and completed practice status.
- Session 4 loads as before.
- Static and browser regression workflows are green.
- No live user state or backend schema is mutated by the design upgrade.
