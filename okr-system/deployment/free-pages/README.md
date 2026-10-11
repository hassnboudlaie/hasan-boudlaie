# Kish OKR — free public practice edition

Public entry: https://hassnboudlaie.github.io/hasan-boudlaie/okr-system/

This is the existing application frontend with a narrowly scoped browser-storage adapter. It preserves the original pages, five handbook modules, eight-step rollout, strategy, objectives, KRs, alignment, initiatives, check-ins, review cycles, workshop exercises, dashboards and bilingual interface. It no longer redirects the public Pages visitor to the blocked `chatgpt.site` hostname. No hosting subscription, payment card or visitor account is required.

The initial public dataset now uses the owner-provided company strategy (first edition 1404): 13 objectives, 53 key results, six values, six proposed strategic pillars and 18 proposed health KPIs. Measured current values and baselines are empty; source objectives start in draft. The optional learning example remains fictional. Every browser gets an independent practice workspace. Edits are saved immediately in that browser; JSON export/import allows a manual transfer to another browser/device and preserves objective status, progress and exercises. Separate devices do not synchronize automatically. Clearing browser storage removes its practice data; export a JSON copy to keep it. The access page explains the organization role design but does not simulate secure accounts or issue invitations. Password entry is unavailable in this practice edition. Browser edits change only the visitor's practice; they do not change the published source for all visitors.

The existing authenticated production application at https://kish-okr-execution.hasanboudlaie.chatgpt.site remains unchanged. Its Workers backend, D1 organization data, login, server RBAC and session controls were not modified or exposed by this update. Its visitor-edge block is unresolved. The rejected Render trial created no service and incurred no deployment charge; this edition does not use Render.

`offline.html` is a self-contained copy with embedded SVG assets. Download it from the homepage and open it locally if the public hosting address is unavailable. Optional external learning-resource links still require internet access. Local file storage availability depends on the browser; a storage failure displays a message to export the work instead of claiming it was saved.

## Rebuild from this repository

From the repository root, with Node 22 or newer:

```sh
node okr-system/deployment/free-pages/build-free-pages.mjs okr-system/deployment/free-pages/source.html okr-system okr-system
node okr-system/deployment/free-pages/verify-free-pages.mjs okr-system/deployment/free-pages/source.html okr-system
node okr-system/deployment/free-pages/verify-public-url.mjs free-20261011 okr-system
```

`source.html` preserves the cloud frontend before this adaptation; `practice-adapter.js` supplies only the practice behavior. The builder checks source anchors before generating the two HTML files, so a changed source contract cannot silently omit an adaptation. Do not paste real organization records or activation tokens into source files.

## Validation and limits

Node VM tests execute the actual frontend event handlers for goal/KR creation, approval workflow, check-ins, exercise entry and JSON transfer. Tests cover immediate persistence and refresh restoration, independent-browser isolation, all view routes, original handbook/sections, FA/EN direction, stale-tab conflict handling, storage failure, self-contained offline initialization, and zero cloud requests/redirects/polling. These are functional checks using a DOM shim, not rendered browser or physical-device tests. Anonymous HTTP verification of the deployed Pages files is performed after publishing. The owner has confirmed that the public entry opens on their laptop. Physical-browser data entry/save/refresh and mobile rendering have not been independently verified; VPN/network conditions for the owner's successful visit were not specified.

Rollback point: branch `backup/okr-before-free-pages-20261011`, created from the existing `main` before these changes. Restore only `okr-system/index.html` from that branch if needed; preserve unrelated website edits made afterwards.

## Verified release — 2026-10-11

Entry release commit: `ea369370d6a574b8e07910c471f882de1d9c22eb`. Anonymous HTTP requests returned 200 for the public entry, offline HTML, favicon and both SVG assets. Both HTML bodies matched the local release SHA-256 exactly. The functional suite was then rerun on those downloaded, publicly deployed HTML bodies and passed. The unchanged central backend health endpoint still returned 200 with organization-account authentication. A commit comparison confirmed that every changed file is inside `okr-system/`; the personal homepage and unrelated applications were not edited. GitHub Pages deployment is verified from this environment. The owner subsequently confirmed that the public entry opens on their laptop. Physical-browser save/refresh, mobile rendering and Iran-network conditions remain unverified.


## Data-entry, Save and reload retest — 2026-10-11

The anonymous deployed HTML and assets were downloaded again and matched the published release exactly. The functional suite then executed the actual event handlers in that downloaded frontend: entered a Persian objective, created its KR, advanced the approval workflow, recorded a check-in with current value 65 (70% progress for a 100-to-50 reduction), entered a workshop answer, and clicked the Save button. The Save button created revision 19. A fresh execution restored the complete saved workspace, including the objective, active status, current value, progress and exercise. JSON export/import into an independent storage context also passed. These are automated VM/DOM tests with simulated browser storage; they do not claim a real laptop browser Refresh test. No real organization data or visitor browser storage was changed by the tests.

The existing central-server code also passed its separate SQLite integration suite for administrator/standard-user login, role enforcement, invitations, one-time activation and saved-data retrieval in a second session. That is a local integration result; the central hostname's visitor-edge block remains unresolved.

## Granting administrator access

The public Pages edition has independent browser workspaces and no organization accounts. Sharing its public URL lets someone use their own practice workspace; it does not grant administration of another person's data or of the published application.

In the existing central-server edition, once the owner can access and sign in to it, open **مدیریت دسترسی / Access**, enter the intended user's name and email, choose **مدیر سازمان / Organization Admin** (or Department Manager with a department for a narrower role), and select **ساخت لینک فعال‌سازی / Create activation link**. Share that private link only with its intended user; it expires in 72 hours. The recipient sets their own password, then signs in with their own email/password. Existing accounts can have their role changed through **ذخیره مجوزها / Save permissions**. A Super Admin can grant ownership-level access; Organization Admin cannot grant Super Admin. No invitation was issued during this audit.


## Official organization chart — 2026-10-11

The owner supplied a scanned 11-page chart named `چارت جدید مهر 1404.pdf`. All pages were visually reviewed. Its printed amendment date is Khordad 1404; the upload name says Mehr 1404. `organization-chart.js` transcribes 65 organization units from pages 2–10: two directorates general, seven deputy directorates, management units, and department-head offices. It retains Charak Port, Hendorabi Port/Airport, and the administrative hierarchy. Expert, shift, outsourced and consultant positions are not introduced as independent departments. Persian is authoritative; English names are translations. The source PDF, signatures and personal information are not published.

The same roster supplies the direct unit picker, branch/level/search filters, OKR scope and dependency selectors, participating units, reports, and prepared organization-access department fields. The weekly report and Explore filter include descendants when a parent unit is selected. Units are navigable without completing a linear learning path. Official names/parents are fixed to the supplied chart; user-created units remain editable. Official units cannot accidentally be deleted from the roster, and pilot participation remains independently selectable.

Fresh fictional examples use actual unit names, with fictional goals and no real organizational records. Existing browser data is upgraded by adding missing units while preserving custom units, existing IDs, OKRs, KRs, check-ins, exercises, dependency references and other content. Exact-name matches retain their previous IDs. Before a saved workspace is upgraded, its previous JSON is copied locally to `kish_okr_before_org_chart_v1` when storage permits; the migration is idempotent. JSON imports apply the same non-destructive roster upgrade.

Rollback branch: `backup/okr-before-real-org-chart-20261011`. App entry, offline edition, builder, adapter and functional tests can be restored from this branch if required. The original Workers/D1 deployment and organization database remain unchanged; this update applies to the currently accessible public Pages edition.

Validation: the automated suite checks 65 unique units, valid parents/no cycles, seven deputy directorates, all dropdown options, actual branch/level/search and unit-jump controls, department-specific goal creation, parent/descendant report scope, bilingual labels, preserved legacy identifiers/content/dependency references, a local rollback copy, and reload deduplication. Original handbook content and pages are unchanged, and all save/reload/export/import tests pass. Published-file HTTP verification is performed after release. Rendered browser layout is outside these automated checks.


Publication verified: release commit `be8e416edc4931a073272090e55f90d1daa8b9e8`. Anonymous HTTP returned 200 for the entry, offline HTML and existing assets, and both deployed HTML bodies matched the tested release SHA-256. The full organization/save/reload suite passed again on those downloaded deployed HTML files. The backup-to-release comparison contained exactly seven changed paths, all inside `okr-system/`; the personal website and other apps were unchanged. The original central backend health remained 200. These HTTP and VM results do not claim a physical-device layout test.


## Company strategy integration — 2026-10-11

Source: `sanad-rahbordi-tahavol (1)(1).pdf`, Strategic Transformation and Progress of Kish Ports & Airports, first edition 1404, 366 PDF pages. The author-provided source is the authority for Persian content; source-page references accompany the core entities. Latest organizational approval is not independently asserted. The source text contains editorial annotations and several target/metric differences between chapters, retained and surfaced as review points.

`strategy-records.js` contains the six values, Vision (page 50), Mission (page 53), Ultimate Goal (page 306), six proposed pillars (pages 307–308), 18 proposed health KPIs (pages 308–309), 13 objectives (pages 58–60), 53 KR definitions with formulas, source benchmarks/classifications/targets (pages 62–107), 822 deduplicated chapter-five action records, 110 optional appendix-bank actions and extracted text for all 366 pages. Rotated tables and figures do not retain PDF layout in the text reader. Core metrics have structured views.

`strategy-integration.js` connects this immutable reference to the editable browser-local plan. Search, pillar filters, department/parent-branch filters and pagination support document exploration. Source actions can be adopted into the plan with objective/KR provenance, assigned an execution department, owner, deadline and status, then saved/exported. Optional bank actions require selecting an objective. Adoption is idempotent; initiative completion never changes KR measurements. Original source-unit labels remain visible next to current chart crosswalks. Old port technical-deputy actions map only to the parent port directorate pending precise assignment; ambiguous IT/unspecified labels are unassigned and discoverable under crosswalk review.

New workspaces start with company objectives rather than fictional performance. Existing workspaces receive missing source entities without removing existing goals, custom strategy fields, units, exercises, history, IDs or dependencies. A best-effort local rollback copy uses `kish_okr_before_company_document_v1`; the repository rollback branch is `backup/okr-before-company-strategy-20261011` at `e1ca803e2c674c4666ce72cd5103c7eb4bebbd67`. Migration is versioned and idempotent. Private central Workers/D1 organization data and authentication are unchanged.

Functional checks execute the actual frontend handlers: source routes, full-text page search, source/entity counts and references, pillar/department filtering, pagination, adoption, department reassignment, save/reload, reference immutability, blank measurements/draft defaults, legacy data preservation, repeat-load deduplication, JSON transfer and existing workflow/handbook regression checks. They pass using a VM DOM shim. Rendered browser and physical-device QA have not been performed for this release. Anonymous HTTP and exact deployed-byte verification follow publication.
