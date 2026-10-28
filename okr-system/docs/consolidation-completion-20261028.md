# Kish consolidation and entry screen — 28 October 2026

This change reconciles draft PR #7 with the menu cleanup already merged in #8. It is confined to `okr-system/**`; no storage migration or destructive data operation is introduced.

## Result
- Nine primary modules: Home, Goals/KPIs, Explore, Teams, People, Dashboards, Meetings, Reviews, Configure. Projects/tasks and check-ins remain available under Home/Goals.
- Rich Strategy Map becomes an Explore Map layout. Zoom, pan, nested pillars, year filters, direct goal links and calculation details remain available. Both layouts use the existing snapshot. A filtered-out parent remains available for ancestry calculations without appearing as a matching record.
- Map/alignment aliases resolve to Explore; analytics/reporting/weekly reports use Dashboards; cadence/timeframe/company/strategy/access/history/cycle settings use Configure; meeting calendar and 1:1 notes use Meetings. Old forms and stored records remain intact.
- Detailed company/team editing, implementation follow-up and document resources remain reachable.
- The superseded competing menu builder is removed; local profile wording is retained.
- Entry screen has a readable light surface, one primary workspace action, retained strategy document access and a single-column phone layout. Duplicate module launchers are hidden. The previous application screen is concealed while the entry is open.

## Validation
- Existing Map/Team and Explore-model regression suites.
- Browser smoke plus canonical route and record-preservation checks; rich Map zoom, pillar focus, year selection, layout/Board switching and reload; timeframe form.
- Existing write/reload, saved-view, weighted-progress, archive/lifecycle and stale-write suites.
- Entry checks at 1440, 390 and 360 pixels; workspace/document buttons, minimum text/touch sizing and overflow; screenshots for entry, Map, dashboard and Configure.
- Screenshots reviewed independently from automated assertions. Contrast defects found in the first run were corrected before publication.

The GitHub Actions result for the final commit is the release gate. Draft #7 is superseded by PR #10; it must not be merged separately.

## Explicit remaining scope
This is navigation/workflow consolidation, not full Perdoo functional parity. Server RBAC, shared enterprise persistence, integrations and AI remain separate work. Public records remain browser-local. Existing specialized report renderers are retained behind the unified Dashboards navigation. Exhaustive comparison against 79 reference images is not claimed; those images were not available in this task.

Rollback: revert PR #10. Browser records do not require reverse migration.
