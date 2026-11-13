# Saba Naft — executed journey quality audit

Date: 2026-11-13. Existing app: https://hassnboudlaie.github.io/hasan-boudlaie/sabanaft/app/#/journey

Change: https://github.com/hassnboudlaie/hasan-boudlaie/pull/148

## Scope and evidence

Reviewed baseline `854f52e52bfbc2b6ba222ddabab9884d73c0dba1`, PR #146, its live smoke run #43397432372, the existing content/state/render/CSS/cache code, `BOOK-ALIGNMENT.md`, the accessible Master Design Decision Register, and Behparvar's reference journey implementation. The original source PDF was not independently reread in this audit. Book alignment relies on the existing reviewed mapping and approved stable-context/exception distinction. New constraints, dialogue prompts and cases are explicitly fictional educational adaptations; no organization incident or quotation is claimed.

Code tested: `33510d89b69c2a07d00c9b6240c27d0c71e463c7`.

## Baseline findings and actual fixes

| Finding | Severity | Executed change | File |
|---|---|---|---|
| Chromium only completed stage one | High verification gap | Real completion of ten stages at four widths; temporal edges, study, exports, persistence and legacy-state checks | `sabanaft/verify-leadership-journey-browser.cjs` |
| Long mobile page mixed concepts, decision and practice | Medium | Three focused sections with persistent section selection, timer and guide; prior exercise available by disclosure | `sabanaft/app/leadership-journey.js`, `.css` |
| Guide modal could obscure timer-expiry UI | High | Expiry replaces guide with overtime dialog; paused submission/progression blocked | `sabanaft/app/leadership-journey.js` |
| Modal keyboard focus and pale secondary buttons | Medium | Focus loop, Escape for dismissible guide, focus restoration, inert journey content, dark dialog button text | same JS/CSS |
| Practice length represented as quality evaluation | High content integrity | Explicit participation credit, no automated text-quality claim; self-rating has zero direct points | same JS |
| Situation/context distinction incomplete | Medium | Stable three-month context versus exceptional temporary role; limits of authority and timing made explicit | `leadership-journey-content.js` |
| Weak options too extreme; correct positions clustered | Medium | More plausible low-quality alternatives, preserved canonical IDs/scores, balanced visual positions for new attempts | content + JS |
| Coaching generic; self-ratings overinterpreted | Medium | Ten sets of decision-level reflective questions, specific next practice, neutral self-report interpretation | content + JS |
| Study lacked completion; transfer was a generic link | Medium | Study conclusion, optional stored action/date/evidence commitment; stage-ten action surfaced on results | JS |
| Deployment test did not verify reviewed bytes | High verification gap | Wait for exact JS/content/CSS/SW bytes on Pages before live suite | `.github/workflows/sabanaft-live-browser-audit.yml` |

Cache moves from v22 to v23; existing LocalStorage key and scoring rules retained. New attempts snapshot their content. Old answers remain addressed by original option indices. No automatic migration into annual scores.

## Preserved capability inventory

- Existing 9 sessions and 47 lesson routes, bookmarks and saved learning progress.
- Four model components plus continuous reflection; 18-dimensional context workflow and case-context linkage.
- Role mix, relationship/expectation work, tools, personal cases, action/development plans and reflection.
- Existing rule-based assistance and existing separately represented AI/human-coach limitations.
- Annual participation passport, badges and independent journey history.
- Nine-block business model and lesson notes; existing brand icon, splash and manifest.
- Public/password-free entry, local data import/export mechanisms and existing routes.

All ten existing Saba regression scripts passed locally; the core suite reports 1,736 assertions. The two established CI regression suites also passed. Route smoke checks are not a claim that every legacy interaction was manually exercised in a browser.

## Content and learning changes

Every stage now states a fictional operational constraint: reporting deadline, specialist availability, stable experience, approval limits, document version, handoff timing, technical access or workload trade-off. Ten stage-specific bridges connect the narrative. Technique/practice/objective fields remain intact; the previous written practice can be recalled.

Immediate feedback is selected by decision level and stage, without exposing comparative rationales. Forty option rationales are available at competitive completion or in study. Questions and options are educational judgments, not psychometrically calibrated measures. The weak options were improved; independent item review and learner pilot remain necessary before claiming validated difficulty/discrimination.

## Verified browser evidence

- Full Chromium + accessibility/offline run: https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/43400815075
- Core regression: https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/43400815090
- Leadership practice regression: https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/43400815066
- Earlier successful full journey run: https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/43400400079
- Baseline live screenshots: https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/43397432372

At 1365, 768, 390 and 320px: ten genuine sequential stage submissions, both 30-second stops, pause/resume, two free guides and third guide charge, expiry while guide is open, seven-minute extension costing four points, mid-stage reload, tab close/reopen, final 40-option analysis and badge. Expected scoring is independently fixed in the test: 82 raw − 2 hint − 4 overtime = 76, silver. No horizontal clipping detected in the inspected journey elements.

Additional checks: five-minute pause cap and reload, keyboard modal escape/focus, restart preserves timer/quota, all ten study stages and conclusion, old v1 saved-state retention, ten legacy routes, annual storage untouched, offline reload after cache readiness. Four axe WCAG A/AA result files contain zero violations for inspected learning/result views. This is scoped automated coverage, not complete accessibility certification.

PNG downloads saved successfully. Print action invoked and real Chromium PDFs generated for all four widths; all four inspected PDFs have one page. Actual print-device UI and physical paper output are not tested.

The first expanded browser run failed at a `networkidle` wait after visiting embedded legacy sections. It was replaced by DOM-ready navigation plus application assertions. The full suite then passed; this failure was not hidden as a successful run.

## Visual before/after

Before: `mobile-step.png` in baseline artifact, a 390×3852 page with every section and floating guide. After: focused learning/decision/practice screens, contextual coach, reduced density and a compact two-row toolbar at 320px. Artifacts include full-page and viewport captures for all four widths, feedback, both recovery stations, final result and study completion.

Desktop learning, tablet feedback, mobile decision and narrow practice screenshots were visually inspected. The narrow toolbar was refined after screenshot review; the final 320px viewport shows separate topbar/toolbar without overlapping the form. Brand compass and restrained green/gold palette retained. This is an incremental redesign of the existing application, not a replacement product.

Workflow artifacts have GitHub retention limits; download the evidence ZIP from the run when a permanent external archive is required.

## Quality scorecard — evidence-bounded assessment

These are review estimates, not independent user ratings. A 9 requires implemented criteria plus observed test/screenshot evidence; missing independent learner or device validation limits claims. The requested ≥9 in every dimension is **not fully established**.

| Dimension | Before | After | Evidence / remaining constraint |
|---|---:|---:|---|
| Visual design | 7.0 | 8.5 | Actual before/after inspection and staged composition; aesthetic acceptance not independently tested |
| Typography/readability | 8.0 | 9.0 | Persian type, readable body/controls, four viewports, zero scoped axe findings |
| UX | 7.0 | 8.5 | Section navigation, saved drafts, study closure; no observed manager usability sessions |
| Instructional quality | 7.0 | 8.5 | Explicit constraints, plausible alternatives and transfer commitment; no learner item analysis |
| Leadership relevance | 7.5 | 8.5 | Approved context/role distinction and managerial cases; fictional, no field validation |
| Coaching/mentoring | 6.5 | 8.5 | Stage/decision-level reflection and neutral self-report feedback; no free-text semantic coaching |
| Gamification | 8.0 | 9.0 | Exact score/penalty/badge tests, transparent rules, annual-score independence |
| Mobile responsiveness | 7.5 | 9.0 | 390/320px plus tablet/desktop, clipping assertions and screenshot inspection; viewport scope only |
| Functional reliability | 7.0 | 9.0 | Ten-stage browser runs, regression, timing, persistence, offline and exports; scope is static Chromium product |

## Material limitations

Data remain device/browser-local and user-editable; no authenticated backend, cross-device sync, verified HR assessment or tamper-proof competition. Rule-based guide does not evaluate written practice. Action commitments do not trigger automatic reminders. Real iPhone/Safari/Android hardware testing and a manager pilot remain unverified. No claim that recovery stations have a measured psychological effect.

Publication is through the same repository/URL. PR merge and live-run results, including exact release commit, are reported in the PR conversation and delivery message rather than inferred from pre-release tests.
