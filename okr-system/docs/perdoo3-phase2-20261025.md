# Kish OKR phase 2 — unified Explore

Date: 2026-10-25. Base: bd65a94. This release extends PR #1; it does not assert full Perdoo parity or enterprise readiness.

## Implemented

- `#explore` projects existing pillars, objectives, nested KRs, KPIs and initiatives into Cascade, Map and a six-week historical Board. No second goal database, seed reset or data migration.
- Shared multi-select filters for type, stage, team, owner and timeframe; search, sorting, device-local saved views and CSV export. Existing details/forms/check-ins remain linked.
- Nested pillar create/edit with cycle rejection; goal calculation mode and KR weights editable in existing forms. Operational goal scores now use the same measured/weighted calculation as Explore, Map and Team Goals.
- Before the first write, retain the existing local workspace envelope at `kish_okr_before_unified_explore_v1`. A failed backup prevents the write. New mutation handlers roll back memory on save failure. Existing optimistic revision checks prevent stale browser tabs from overwriting newer revisions.
- Public storage wording corrected. No public authentication gate added; no server permissions weakened.

Board cells use the latest actual recorded value on/before the date. Objectives use historical KR values with the **current** baseline, target and weights. Definition-versioned historical scoring remains unimplemented. Missing observations remain unknown. This is a weekly sampled view, not a full arbitrary-period Perdoo Board. The Map is a hierarchical card projection; the existing rich strategy canvas remains at `#map`.

## Source audit

The attached strategic PDF has 366 pages; SHA-256 `4544a3b9fd76110071c9309f544e5cf81fd348ffca30423d063ee52541f24d17`. The previous embedded source hash is `8c0d5fd410a7ecfed698b6c3f6a7a33676cf745bdd5f043d5f949b9dc1e579bc`; byte identity is not established. Visual inspection of supplied PDF pages 58–60 confirms the titles of all 13 strategic objectives. Goal 13 begins on page 59 and continues on 60. Full verification of every KPI/target in the 366-page PDF is still open. The three supplied logistics DOCX files were text-extracted and inspected for scope; their source bytes were not published or copied into the repository. No assumed actuals, targets or approvals were added.

## Reference behavior

- https://support.perdoo.com/en/articles/12656021-explore (updated September 16, 2026)
- https://www.perdoo.com/resources/blog/introducing-perdoo-3-0-simpler-faster-and-way-more-powerful
- https://support.perdoo.com/en/articles/4898961-progress-drivers-for-objectives
- https://support.perdoo.com/en/articles/4515060-cadences-and-timeframes

## Validation

- Node: `tests/perdoo3-map-regression.cjs`, `tests/explore-model.cjs`.
- Interactive browser QA in isolated `?qa=explore-20261025`: nested pillar creation persists after reload; weighted goal plus KRs 100%×1 and 0%×3 produces 25% in Cascade, Map and Board.
- `tests/explore-browser.cjs` provides CI coverage for creation, reload, common filters, saved views, backup, stale writes and mobile RTL. A checked-in test is not itself evidence of a passing run; see GitHub Actions for the actual result.

## Backup and rollback

Code checkpoint: branch `backup/kish-before-explore-20261025`, plus an initial local git bundle. Users can export the current workspace as JSON and the pre-upgrade envelope from Explore. Do not overwrite current data when reverting code. Revert only the phase-2 commits; added record properties are additive and older code can preserve them. Restoring a user's data requires exporting their current data first and deliberately selecting the prior snapshot. We cannot claim a backup of all users' browser stores: only the user's own browser can capture those local records.

## Remaining scope

Server-authenticated shared storage, multiuser role tests, private HR reviews, full KPI weekly/binary rules, arbitrary-period board, rich graph pan/zoom in unified Explore, folders/shared views, bulk edits, full historical definition versions and complete source reconciliation remain open. Existing Profiles, Meetings, Reviews, Cadences and Jalali Timeframes are retained; this release does not certify every legacy interaction.
