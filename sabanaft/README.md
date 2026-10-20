# صبا نفت | مهارت‌های رهبری مدیران

Public URL: https://hassnboudlaie.github.io/hasan-boudlaie/sabanaft/

Book-aligned revision: Armin Trost (2025), *The Reflective Leader: A Guide to Context-Driven Leadership and Building Trust*. DOI: https://doi.org/10.1007/978-3-662-70860-6. Complete reading and interpretation audit: `BOOK-ALIGNMENT.md`. Public printed-page mapping: `sources.html`.

Nine sessions, 47 independently navigable sections. Section counts: 5, 5, 5, 5, 6, 5, 5, 6, 5. All 11 book chapters and the appendix are covered. Each section carries a chapter/printed-page reference. The course is an independently worded educational adaptation, not a translation or reproduction of the book. The source PDF and extracted text are not part of this repository.

## Application

Buildless HTML/CSS/JavaScript with no server, accounts or analytics. `reflective-content.js` holds the lessons, four roles, 18 context dimensions and eight tool benefits. `reflective-cases.js` holds 15 original fictional cases matching the appendix themes, with four plausible role responses and no normative correct-role score. `reflective-app.js` renders the responsive RTL course and handles local state. `assets/reflective.css` provides layout, local typography, focus states, mobile drawer and print styling.

Practical tools: separate work contexts; unrated present/future context maps with explicit horizon; manual ten-point role mix across three distinct perspectives; manually recorded four-perspective reflection; case choice, reasons, alternatives and switching conditions; last-situation journal; benefit-led tool design; action plan; readable/printable portfolio and JSON export/import. Two conceptual checks per session reveal explanations only after submission. Viewing a page does not mark it completed. No automatic context-to-role calculation, personality diagnosis, proprietary inventory claim or organization-wide ranking.

## Local data

New key: `sabanaft_reflective_v2`, schema 2. Notes, completion, context ratings, mix, cases, checks and practical tools are isolated per work context. Three initial labels are only placeholders and contain no assessment. Users can add contexts. JSON export includes all contexts; print includes the active context. Import validates and normalizes fields, asks before replacing v2 data, escapes text and rejects unsupported files. Storage failures retain work in memory and prompt the user to export.

Previous keys remain untouched: `sabanaft_session1_v4`, `sabanaft_session2_v1` through `sabanaft_session6_v1`, and `sabanaft_practice_v1`. A separate legacy export reads only these known keys. Previous assumptions and assessment results are not automatically translated into the new book's model. Legacy session hashes resolve to current overviews. The former session-one handout URL now links to the current journal and portfolio.

Company identity and verified official photo provenance: `ASSETS.md` and `sources.html`. All company examples and cases are fictional instructional applications. Farmanieh is an architectural rendering; Niayesh/site/meeting images are official photographs. Typeface: Vazirmatn, OFL license retained.

## Verification

With jsdom 26 installed in a development environment:

```sh
NODE_PATH=/path/to/node_modules node sabanaft/verify-reflective.cjs
```

Checks cover all 47 routes, variable navigation, all 60 case options, context isolation, notes and completion, manual role totals and validation, concept-check submission, employee-input gating, portfolio, print/export hooks, import validation and cancellation, reload, blocked/malformed storage, escaped text, v1 preservation, legacy routes and mobile drawer keyboard behavior. JavaScript syntax and local asset references are also checked. This is DOM behavior verification; no real-browser visual/layout check was available in the editing environment.
