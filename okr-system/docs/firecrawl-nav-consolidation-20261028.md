# Firecrawl verified Kish OKR navigation consolidation — 2026-10-28

## Scope and provenance
- Public application live audit with Firecrawl `firecrawl_scrape` + `firecrawl_interact`: https://hassnboudlaie.github.io/hasan-boudlaie/okr-system/#explore
- Perdoo official Explore documentation (updated Sep 16, 2026): https://support.perdoo.com/en/articles/12656021-explore
- Perdoo official release notes, October 2026: https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon
- Baseline: PR #5 merged; teaching sidebar hidden, 20 visible operational links across 5 groups, legacy classroom button label "نام من در تمرین".
- Distinguish actual visible DOM via browser interaction from Firecrawl scrape: scrape can read hidden legacy nodes, and MUST NOT be taken as proof those links are visible.

## Current Perdoo benchmark
- Explore centralizes Cascade, Map and Board with shared goals.
- Archived goals, multi-select filters, private/shared saved views, date and lead/status filters, reports, inline edits and progress-related displays are documented.
- Oct 2026 beta AI Agent and integration access control exist at Perdoo; not connected to Kish.
- Perdoo has a new direction for personal tasks, company reviews, and performance review cycles. Kish's local pages are not secure HR modules.

## Consolidation implemented (frontend/navigation only)
- Canonical visible daily links: Home (#start), Explore (#explore), Goals (#goals), KPIs (#kpis), Dashboards (#analytics), Teams (#organization), People (#people), Meetings (#sessions), Initiatives (#projects).
- Two collapsed utility groups, not duplicate primary entries:
  - Configure: Cadences (#cadences), Timeframes (#program), Access (#admin).
  - Advanced views: Detailed Strategy Map (#map), Team Goals Dashboard (#team/company/goals), meeting calendar (#rhythm), detailed reports (#reporting), implementation follow-up (#revision), documents (#resources), change history (#history).
- Keep old DOM menu hidden with an explicit marker for router/compatibility; do not remove modules or records.
- Add direct link in Explore toolbar to the richer detailed Strategy Map, preserving zoom/pan (new Explore Map remains simpler).
- Relabel classroom identifier to "پروفایل محلی من" with explicit local-not-verified hint. Do not imply organization authentication.
- Historical training/rollout routes suppressed by PR #5 remain suppressed.

## Explicitly not changed
- NO goal, pillar, KR, KPI, user or history records changed.
- NO localStorage migrations, browser store reads, deletions, or permission claims.
- NO change to base `index.html` or embedded source strategic seed.
- NO app outside `okr-system/**` touched.
- Advanced routes preserved because they contain features not yet in the Explore implementation. This is navigation consolidation, not complete feature consolidation.

## Acceptance / residual gaps
- CI regression test must confirm 9 primary visible links, old nav hidden, no training labels, Advanced Map clickable and actual map loads, mobile RTL preserved.
- Test deployed URL in Firecrawl browser after GitHub Pages success. Browser visually inspect desktop & mobile.
- Remaining Perdoo parity deficits per existing register: server auth/RBAC and shared persistence, complete KPI target engine, full Explore saved view permission rules, inline editing for all fields, arbitrary Board intervals, custom dashboards, integration credentials and AI agent.
- Do not delete old `#map` or `#reporting` until all unique features have a tested canonical replacement; preserve old deep links.
- Source screenshot coverage: only explicitly supplied screenshots verified through user conversation; no claim of exhaustive 79 image comparison.

## Rollback
Revert only this PR. Browser data stays intact. Backups and original strategic content are unchanged.
