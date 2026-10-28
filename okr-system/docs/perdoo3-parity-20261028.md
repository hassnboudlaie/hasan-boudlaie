# Kish OKR operational release and parity register

Date: 2026-10-28. Scope: upgrade the existing `okr-system/` in place. Baseline: `090694c347517498e7808d43dd6c30e94a820bae`. Backup: `backup/kish-before-parity-20261028` and a local git bundle. No user browser store was accessed or centrally backed up. Existing first-write backup and stale-tab protection remain active.

This is a bounded operational improvement, not completion of the full master mission. The public application is still browser-local. Server RBAC, confidential HR data, shared views and real integrations must not be represented as operational.

## Evidence and traceability

| Source | Reviewed evidence | Components / consequence |
|---|---|---|
| [Explore](https://support.perdoo.com/en/articles/12656021-explore) | Current Cascade, map actions, filters, local vs shared semantics | `kish-explore.js`, bridge in `index.html`; title/lead inline editing, lifecycle, monitoring, expand/collapse, report |
| [Objective progress drivers](https://support.perdoo.com/en/articles/4898961-progress-drivers-for-objectives) | KR default, weighted results, selected aligned goals | Existing weighted KR calculation retained; `pGoalTrend` now uses shared weighted model. Selected aligned-goal drivers remain missing |
| [Update results](https://support.perdoo.com/en/articles/1588540-update-key-results-and-initiatives) | Baseline/target normalization, 0–100% clamp | Existing model tests cover increasing/decreasing goals. No invented actuals |
| [KPI progress drivers](https://support.perdoo.com/en/articles/11775919-progress-drivers-for-kpis) | Manual, integration, aligned aggregation | Current manual/history supported; other drivers remain missing |
| [KPI target types](https://support.perdoo.com/en/articles/2298516-add-company-kpis) | 3.0 thresholds, growth, binary, milestone | Current threshold UI preserved; expanded target engine not implemented |
| [Roles & rights](https://support.perdoo.com/en/articles/1588568-roles-rights) | Four primary roles, shared-view restriction | Local mutation guard retained, not called server authorization |
| [Release notes](https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon) | October AI Agent beta, HR review cycles, company reviews, integration access controls | Released vs beta vs coming-soon separation below |
| Supplied strategic PDF | Hash matches prior audit; text of pages 58–60 extracted for strategic-goal context | Approved strategy/target definitions not changed; all 366 pages not reconciled |
| Three supplied logistics DOCX files | Text extracted; opening scope checked against prior source audit | No new logistics values/approvals invented or published |
| 79 screenshots and two GIF demonstrations | NOT AVAILABLE in attached project sources; two searches returned no matches | No screenshot-by-screenshot fidelity claim; exact filenames unavailable |
| Entire previous Project conversation | NOT AVAILABLE in full; only supplied prompt/context and repository history | Earlier unseen decisions cannot be certified |

Source hashes: PDF `4544a3b9fd76110071c9309f544e5cf81fd348ffca30423d063ee52541f24d17`; port plan `f8bc74e7707b9141a9c6433d8ab7464b7f15c59c5044dc6feaacc068bb2163ac`; airport plan `40a332cdfcc5990cd0fa32b1e82dc8cbe8401f496531bd18194e025d382a4f18`; airport appendices `3ce7220c124d9180b88e056c5c220e6b91e3a1d6ba35191231e01690f94f9a64`.

## Functional parity matrix

Status is against the requested capability as a whole, not just a visible control. Test evidence is the named suite; current run links and conclusions are recorded in the release verification section.

| Capability | Perdoo reference | Kish implementation at baseline | Classification / gap | Action in this release | Test evidence |
|---|---|---|---|---|---|
| Ultimate goal / nested pillars | Explore | Existing strategy, nested pillar CRUD subset | Partially Implemented; no complete lifecycle across all types | Preserve source and alignment guards | Map model; Explore E2E |
| Objective / KR creation, lead, unit | Explore | Working forms and original nested records | Partially Implemented; not all Perdoo type rules | Preserve forms; add contributors and update interval | Explore / parity E2E |
| KR weighted actual progress | Progress drivers | Equal and explicit weighted KR modes | Fully Implemented for this bounded calculation; aligned drivers missing | Fix weighted historical trend | Model tests; 25% across three views |
| Historical definition versions | Progress drivers | History values with current definitions | Missing | Disclose; do not invent historical weights | Model test |
| Expected progress | Explore | Not in unified view | Partially Implemented | Linear cycle estimate, unknown without dates, behind filter; not official status override | Model date/boundary tests |
| Outdated goals | Explore | Not in unified view | Partially Implemented | Default 7-day rule, configurable objective interval, filter; no notification service | Model / UI controls |
| Goal lifecycle | Explore | Draft/active/closed; limited review | Partially Implemented | Confirmed clone, close notes, comments, archive/restore in Explore | Parity E2E |
| Clone integrity | Roles / Explore | No unified clone workflow | Fully Implemented for Objectives + nested KRs | Fresh IDs, draft, actuals/history cleared; original unchanged | Model + parity E2E |
| KPI improvement OKR | Goal alignment | No dedicated shortcut | Partially Implemented | KPI shortcut preselects linked KPI on existing goal form; explicit relation retained | Pass: parity browser KPI shortcut and persisted association |
| Cascade / Map / Board truth | Explore | Same live records, weekly board | Partially Implemented | Keep single source; inherited archive visibility; current week includes today | Explore / parity E2E |
| Inline editing | Explore | Modal editing only | Partially Implemented | Inline title and lead, validation, rollback on save failure | Parity E2E |
| Filter / sort / saved views | Explore | Multi-select team/type/stage/owner/timeframe, local saved views | Partially Implemented; shared views and all sorts missing | Add behind/outdated filters | Explore E2E / model |
| Expand/collapse | Release notes | Individual Cascade fold | Fully Implemented for unified view bulk controls | Both Cascade and unified Map bulk fold | Parity E2E |
| Custom columns, drag sizing | Explore | Fixed columns | Missing | Deferred | Not Implemented |
| CSV / PDF / PPT | Explore | CSV | Partially Implemented | Filtered management report with browser Print/Save PDF | Parity E2E; PPT missing |
| KPI target engine | KPI docs | Up/down thresholds, history | Partially Implemented | Preserve; binary, weekly targets, cumulative rules not added | No parity claim |
| Home / responsibility / teams | Release notes | Existing Home, teams and tasks | Partially Implemented | Preserve; no full action-center audit | Smoke test team profile |
| Meetings and follow-ups | Release notes | Existing next-actions-to-task logic | Partially Implemented | Preserve; talking-point conversion not added | Source inspected; browser acceptance pending |
| Reviews and HR cycles | Release notes | Legacy reviews / cycle close | Partially Implemented; secure HR workflow missing | No confidential HR data published | Blocked server security |
| Executive/team dashboards | Dashboard docs / release notes | Existing dashboards and shared scoring | Partially Implemented | Weighted history correction and management report | Model / report E2E |
| Custom dashboards/widgets | Release notes | No verified widget builder | Missing | Deferred | Not Implemented |
| Roles / organization | Roles | Five areas, chart, local guard | Partially Implemented; server RBAC missing | Preserve guard, no false security claim | Distinct server-role tests Blocked |
| Shared persistence | Roles | Browser local; separate unverified bridge | Missing in public deployment | No backend simulated | Reload + stale-write tests only |
| AI Agent / MCP | October notes | No connected service | Planned / Beta benchmark; Kish Not Connected | No AI-output simulation or auto updates | Not Implemented |
| Integrations | Progress driver docs | No verified connector credentials | Missing / Not Connected | Existing backend contract retained | Blocked external services |
| Persian / calendar / RTL | Existing Kish requirements | Jalali calendar and RTL, Saturday cadence | Partially Implemented overall | Saturday-based Board; current period ends today | Model + keyboard/contrast/mobile tests |

## Release classification of benchmark

Released: Perdoo 3.0 core goals/Explore (August), bulk expand/collapse (September), personal tasks, company reviews, custom dashboard goal lists, HR-admin review cycles and integration access controls (October).

Beta: October in-app AI Agent. Existing MCP tools are released; additional agent/MCP tools are coming soon. Dedicated project/task management, tasks for initiatives, peer/360 reviews, enhanced review analytics, cumulative-total row and conversion of every goal type to every other type are shown as coming soon in the current release page. Older KPI docs describe cumulative totals; this conflict is not treated as proof of current 3.0 availability. Classic Map is legacy. This release does not copy proprietary branding.

## Prioritized implementation register

| Priority | Work | Status / next dependency |
|---|---|---|
| P0 | Protect approved content, local backup, baseline, scope | Implemented; no seed or source content changes |
| P0 | Server authentication, per-record authorization, tenant persistence, audit log | Blocked: no verified backend deployment/configuration for public app; use existing backend contract |
| P1 | Weighted history consistency | Implemented; model and browser verification |
| P1 | Goal lifecycle / inline edits / monitoring / report | Implemented subset, verified per acceptance table |
| P1 | Full KPI measurement/target engine and aligned goal drivers | Not Implemented; schema/calculation work remains |
| P1 | Cross-module archive policy and read-only closed-goal rules | Incomplete: archive filters apply to Explore; legacy views retain records; existing forms can still edit closed goals |
| P2 | Secure reviews, action center, all task/meeting conversions | Incomplete; confidential workflows depend on P0 backend |
| P2 | Custom dashboards, all saved-view permissions, columns, PPT | Not Implemented |
| P2 | Review all 79 visuals, GIF interactions, 366-page targets | Blocked visuals/full conversation; full document reconciliation remains |
| P3 | Real integrations and approved AI drafts | Not Connected; requires backend plus service configuration |

## Acceptance register

| # | Required workflow | Result / evidence |
|---|---|---|
| 1 | Pillar and aligned objective | Pass: `explore-browser.cjs` creates both |
| 2 | Objective with multiple KRs | Pass: Explore E2E, weighted fixtures |
| 3 | Team, lead and timeframe | Partial: lead/company form exercised; full assignment combination not verified — Blocked certification |
| 4 | KR update recalculates objective | Pass for recorded initial values 100×1 + 0×3 = 25%; Pass: subsequent check-in to 100% and retained evidence/history |
| 5 | Cascade/Map/Board/dashboard consistency | Pass three Explore views + Map/Team model; full dashboard browser verification pending |
| 6 | Edit from Explore | Pass modal baseline; inline phase3 suite |
| 7 | Team/status/timeframe/expected filters | Pass pure filter model; browser suite covers type; full combinations pending |
| 8 | Private/shared view permission | Pass local-device saved view; shared/server-private permission Blocked |
| 9 | Clone without corrupting original | Phase3 browser + pure model |
| 10 | Create OKR to improve KPI | Implemented relationship + shortcut; Pass: dedicated browser workflow and persisted KPI association |
| 11 | Check-in with retained history | Existing recorded measurements persist; Pass: subsequent Check-in, recalculated progress, retained history |
| 12 | Close and record wins/learnings/next steps | Phase3 browser suite |
| 13 | Meeting talking point → task completion | Not Implemented as requested; existing next-action conversion only |
| 14 | Management report export | Phase3 report + print rendering; CSV baseline; PPT Not Implemented |
| 15 | Distinct role data/API tests | Blocked: no verified backend role service |
| 16 | Refresh/navigation persistence | Pass Explore E2E; lifecycle suite |
| 17 | Jalali and Saturday | Pass Saturday unit test; existing Jalali conversion not exhaustively retested |
| 18 | Desktop/mobile/keyboard/contrast/RTL | Existing accessibility suite; final CI conclusion below |

## Verification and rollback

Final CI and deployment evidence are appended after verification. Local Node model and Map/Team regression passed. Local browser installation initially failed; an alternative download succeeded but OS socket restrictions prevented launch. Browser tests therefore run in GitHub Actions against the branch before merging.

First CI run caught loss of current-week Board observations after Saturday anchoring; corrected to include today's observations in the current column. Second run passed baseline E2E and detected that the closure-detail assertion needed to open the existing progressive-disclosure section; the test now opens it before asserting visible text. No assertions were removed.

Rollback only this release's application/code commits. Preserve current JSON exports before any deliberate data restore. Added fields are additive; no browser store reset or bulk deletion is performed. No raw attachments or private credentials were added to public source.


### Verified release candidate

- Application candidate `288852de2087e41e6e247d2350a6523f8a30f68a`: [successful full CI run](https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/40653437171).
- Expanded acceptance tests at `12b11fb5a212dd70beca9984f0e382ca38edd8df`: [successful CI run](https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/40653600793). This commit changes tests only, not application behavior.
- All suites passed: JS module parsing, Map/Team model, Explore model, browser smoke, Explore E2E, phase-3 lifecycle/check-in/KPI association E2E, keyboard/contrast/touch-target/mobile RTL suite. The app is static HTML/JS/CSS; there is no bundler compilation step to claim.
- Acceptance 9, 10, 11, 12, 14 and 16 pass within the explicitly local scope. Acceptance 18 passes the tested keyboard tabs, four status-color contrast ratios, tab touch targets, viewport fit and RTL; this is not a complete WCAG audit.
- Screenshots: [Cascade desktop](qa-20261028/cascade-desktop.png), [Map desktop](qa-20261028/map-desktop.png), [Map mobile](qa-20261028/map-mobile.png). Images contain isolated QA/sample records, not verified Kish performance. A resize-transition image was excluded; the mobile image is after page reload.
- Source scope verified: only `okr-system/**` plus its existing dedicated regression workflow changed. No other application was edited. Public source attachments and original strategy seed content were not replaced.
- Deployment proceeds through PR #4 after successful tests; deployment commit and live URL are reported with final verification. Existing URL: https://hassnboudlaie.github.io/hasan-boudlaie/okr-system/#explore
