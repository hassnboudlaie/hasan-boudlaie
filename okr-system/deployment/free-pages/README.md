# Kish OKR — free public practice edition

Public entry: https://hassnboudlaie.github.io/hasan-boudlaie/okr-system/

This is the existing application frontend with a narrowly scoped browser-storage adapter. It preserves the original pages, five handbook modules, eight-step rollout, strategy, objectives, KRs, alignment, initiatives, check-ins, review cycles, workshop exercises, dashboards and bilingual interface. It no longer redirects the public Pages visitor to the blocked `chatgpt.site` hostname. No hosting subscription, payment card or visitor account is required.

The initial public dataset is fictional. Every browser gets an independent practice workspace. Edits are saved immediately in that browser; JSON export/import allows a manual transfer to another browser/device and preserves objective status, progress and exercises. Separate devices do not synchronize automatically. Clearing browser storage removes its practice data; export a JSON copy to keep it. The access page explains the organization role design but does not simulate secure accounts or issue invitations. Password entry is unavailable in this practice edition. Browser edits change only the visitor's practice; they do not change the published source for all visitors.

The existing authenticated production application at https://kish-okr-execution.hasanboudlaie.chatgpt.site remains unchanged. Its Workers backend, D1 organization data, login, server RBAC and session controls were not modified or exposed by this update. Its visitor-edge block is unresolved. The rejected Render trial created no service and incurred no deployment charge; this edition does not use Render.

`offline.html` is a self-contained copy with embedded SVG assets. Download it from the homepage and open it locally if the public hosting address is unavailable. Optional external learning-resource links still require internet access. Local file storage availability depends on the browser; a storage failure displays a message to export the work instead of claiming it was saved.

## Rebuild from this repository

From the repository root, with Node 22 or newer:

```sh
node okr-system/deployment/free-pages/build-free-pages.mjs okr-system/deployment/free-pages/source.html okr-system okr-system
node okr-system/deployment/free-pages/verify-free-pages.mjs okr-system/deployment/free-pages/source.html okr-system
```

`source.html` preserves the cloud frontend before this adaptation; `practice-adapter.js` supplies only the practice behavior. The builder checks source anchors before generating the two HTML files, so a changed source contract cannot silently omit an adaptation. Do not paste real organization records or activation tokens into source files.

## Validation and limits

Node VM tests execute the actual frontend event handlers for goal/KR creation, approval workflow, check-ins, exercise entry and JSON transfer. Tests cover immediate persistence and refresh restoration, independent-browser isolation, all view routes, original handbook/sections, FA/EN direction, stale-tab conflict handling, storage failure, self-contained offline initialization, and zero cloud requests/redirects/polling. These are functional checks using a DOM shim, not rendered browser or physical-device tests. Anonymous HTTP verification of the deployed Pages files is performed after publishing. Reachability from the owner's Iran network and physical laptop remains pending until the owner opens the new link.

Rollback point: branch `backup/okr-before-free-pages-20261011`, created from the existing `main` before these changes. Restore only `okr-system/index.html` from that branch if needed; preserve unrelated website edits made afterwards.
