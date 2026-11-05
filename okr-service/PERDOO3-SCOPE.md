# Public OKR / Perdoo 3-inspired — Release and Placement Audit (2026-11-05)

## Product boundary and correct placement

| Product | Canonical implementation | Website | Separation |
|---|---|---|---|
| **OKR — اهداف و نتایج کلیدی (public)** | `okr-service/index.html` | مدیریت استراتژیک → OKR | An independent browser-local PWA, not a client tenant |
| **OKR کیش — فرودگاه‌ها و بنادر** | `okr-system/` | Client-specific / organizational tool | **DO NOT MODIFY**; both home-screen shortcuts remain the user's concern, not a website duplicate |
| **HB Hub — Super App launcher** | `hub/` | App Hub and full app directory | Contains navigable launch links to all **19 other catalog items**; no embedded shared data |
| **Business Model Canvas** | `business-model-canvas/studio.html` | مشاوره کسب‌وکار | Independent |
| **Start Your Own Small Business** | `small-business/index.html` | مشاوره کسب‌وکار | Independent |

This product is independently authored and **is not affiliated with, endorsed by, or a copy of Perdoo**. Perdoo is a functional benchmark for strategy architecture and OKR discipline; no Perdoo brand assets or proprietary UI components have been reused.

## Implemented now (tested in public browser-local pilot)

- **Strategy:** Ultimate Goal and Strategic Pillars, including nested pillars, parent-cycle rejection.
- **Objectives:** Draft/Active/Closed, team, lead, timeframe, one optional alignment to a Pillar / Objective / KPI. Objective alignment cycle guards.
- **Key Results:** Numeric (up/down) and binary outcomes; baseline, target, current, unit, weight. Correct weighted progress for positive/negative movement with 0–100% clamp. Missing or degenerate numeric targets do not produce fabricated progress.
- **Explore/Map/Board:** Consistent views over one data model; goal details, KR edits and copy/new cycle.
- **KPIs:** Numeric/weekly/binary manual measurements, direction-dependent current health and timestamped history.
- **Initiatives:** Standalone or linked to Objective/KPI, owner, state.
- **Weekly Check-in:** Manual measured KR updates, confidence, blockers and date, stored in history and reflected in progress.
- **Reports and data ownership:** CSV of Objectives and progress; explicit JSON export/import, confirmation on overwrite, local versioning, stale-tab guard, backup copy on successive saves. No user data transmitted to a server.
- **PWA:** Independent manifest/service-worker scope and cache prefix; not the same as Kish, My Finance, or HB Hub.
- **Hub:** All 19 non-Hub entries linked once, grouped and searchable, with the OKR pilot distinguished from Kish.

## Important missing or incomplete Perdoo 3 features

**Not a full Perdoo clone or production-ready collaborative OKR tool.** No shared team workspace, real-time server storage, RBAC, invitations or login; no notifications/scheduled reports, external data connectors, team profile system, per-user assignments or permission rules. No calendar-based/automated cadence rules, Jira/Slack integration, advanced target history or multi-select saved Explore views. No final Perdoo-parity claim for full 3.0 Board/Cascade UX, goal type conversion, advanced KPI threshold engine, strategic weighted roll-ups beyond the explicit numeric KR model, performance reviews or 1:1 workflow. Persian RTL is implemented, but the input timeframe is free text rather than native Jalali calendar automation.

**Security and privacy:** This pilot uses localStorage scoped to the public OKR app key. Do not enter sensitive customer or HR information. Data from another installation/device does not sync. Export files may contain sensitive titles; they must be stored privately. No common login between apps.

## Quality and safeguarding

- CI: `okr-service/tests/public-okr-regression.cjs` covers numeric increase/decrease, binary, weighted progress, cycle rejection, app forms for Objective/KR/KPI/Initiative, weekly check-ins, model data and app-local storage.
- CI: `scripts/verify-app-directory.cjs` covers the canonical link per phone screenshot app, all 19 Super App links, categorization and correctness of public OKR pilot status.
- Git comparison must contain **zero** files under `okr-system/`, `my-finance/`, `behparvar`, or other PWA directories. Only public OKR, hub and public site navigation/verification changed.
- Automated browser test is simulated JSDOM, not independent actual mobile/browser visual acceptance. On the device, verify PWA update and start URL, offline behavior, install icon, import/export and persistence before considering rollout.
- The general OKR pilot never retrieves, mutates or writes the client's Kish datasets.

## Perdoo 3 primary references (as of 2026-11)

- https://www.perdoo.com/resources/blog/introducing-perdoo-3-0-simpler-faster-and-way-more-powerful
- https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon
- https://support.perdoo.com/en/articles/12656021-explore
- https://support.perdoo.com/en/articles/5391069-aligning-okrs
- https://support.perdoo.com/en/articles/4898961-progress-drivers-for-objectives
