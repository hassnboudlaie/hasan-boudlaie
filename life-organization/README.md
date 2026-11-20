# سازمان عالی زندگی من — The Life Organization · Book One v0.5

**Official application:** https://hassnboudlaie.github.io/hasan-boudlaie/life-organization/

The Book One architecture is **12 chapters in three approved parts**, of which **chapters 1–10 are available as authored Persian manuscripts** and chapters 11–12 remain title-only placeholders. The existing six-volume PWA, its approved brand mark and unrelated applications are unchanged.

## Editorial and manuscript register — 20 November 2026

| Chapter | Approved subject | Learning instrument |
|---|---|---|
| 1 | سازمانی که همین حالا اداره می‌کنید | Life organization snapshot; 8 prompts |
| 2 | سازمان عالی زندگی چیست؟ | Fit criteria and evidence; 10 prompts |
| 3 | چگونه وضع موجود و وضع مناسب را ببینیم؟ | Current/suitable-state comparison; 12 prompts |
| 4 | فلسفه زندگی من | Assumptions, values, stability/agility × formality; 8 prompts |
| 5 | سعادت من و رابطه شادی و موفقیت | Happiness × success; 9 prompts |
| 6 | من کی هستم؟ ترجیحات رفتاری با DiSC | Pace/directness × questioning/accepting; 11 prompts |
| 7 | عالمِ عامل؛ دانستن و عمل‌کردن | Knowledge × action; 8 prompts |
| 8 | مدیرعامل زندگی خودت باش | **Effectiveness × efficiency of resources**; 12 prompts |
| 9 | رفتار من و نتایجی که می‌بینم | **Behavioral fit × outcome**; 10 prompts |
| 10 | منفعت، هزینه و گزینه ازدست‌رفته | **Intrinsic effort × yield, with alternative/opportunity cost**; 11 prompts |
| 11 | پرمشغله بودن و مفید بودن | Not yet authored; title only |
| 12 | نمایه و ممیزی بنیادین من | Not yet authored; title only |

**Part I:** chapters 1–3 (seeing the life organization). **Part II:** chapters 4–11 (eight fundamental orientations). **Part III:** chapter 12 (integrated foundational profile).

Source of truth is **the updated individual Drive chapter files**, not the older `Book1_Part1_FINAL` archive. Chapter content has been editorially updated to maintain four-character continuity: **نیلوفر، رضا، آرش، لیلا**. This revision is substantial; the earlier Hamid/Sara narrative was replaced in the new Drive manuscripts. Historical workbook field keys and saved answers are preserved to prevent data loss, although previously entered observations may refer to older stories and users should revisit their meanings.

- Chapters 1–7: up-to-date individual source manuscripts including the approved chapter folder and chapter 7 in its separate current manuscript folder.
- Chapter 8: Drive document **08 - فصل هشتم - مدیرعامل زندگی خودت باش - نهایی.docx**.
- Chapters 9–10: Drive documents marked **نسخه بازبینی**. They are available in the app for learning and review but **are explicitly not described as final approved editions**.
- Source URLs are attached separately to every chapter in `book1-chapters-20261120.js`. No changes were made to the original Drive documents.

The source text from Drive is preserved and paged. Word-extracted figure and table text can appear as trailing text because the source connector does not reproduce original embedded image layouts. Interactive diagrams are faithful *adaptations* of each book-specific two-axis model, not image copies of the Word figures. The eight-orientation architecture is not rewritten to fit the app.

## Functionality and assessment boundaries

- **47 گفتار**, **99 authored-source-aligned workbook prompts**, ten chapter journeys, ten linked dossier sections and **seven distinct contextual matrices for chapters 4–10**.
- Twelve-chapter planning view shows ten interactive chapters and two read-only future chapters; no fabricated teaching material for chapters 11 and 12.
- Current state **●**, suitable state **○**, unknown/clear selection and free-text evidence on the matrices. Chapter 7 does not equate intention with action; chapter 8 resource-efficiency logic remains separate from chapter 10 intrinsic effort/yield; chapter 9 behavior/result is a different lens.
- Learning badges: **11** total (ten chapter awards and the existing Part I Foundation Builder). Completing all 47 readings plus ten workbooks results in **1155 XP / 385 learning coins**, not life-performance scores.
- One chapter reading marker is awarded at most once. Workbook outputs award once per chapter; the original v0.3 local state keys retain existing progress. Badges may be downloaded as PNG with SVG fallback.
- Scripted reflective questions give a mentor-like tone, without pretending to provide a validated psychological assessment or live AI dialogue.
- Chapter 6 is **DiSC-informed behavioral observation**, not an official Everything DiSC or MBTI questionnaire. None of the authored contextual matrices claims psychometric validity or yields a numerical life grade.

## Application and data architecture

Static HTML/CSS/JavaScript PWA without a build step. Read `index.html` in a local HTTP server or via GitHub Pages. Main components:

- `book1-content.js`: preserved earlier baseline source.
- `book1-part2-content.js`: preserved previous 4–6 import.
- `book1-chapters-20261120.js`: **last-loaded, authoritative current content override for chapters 1–10** with per-chapter provenance and editorial status; it does not change workbook storage.
- `book1-ui.js`: all ten chapter-specific workbook schemas, export, reader foundations, plus the 12-chapter plan with chapter 11/12 placeholders.
- `book1-journey.js`: paginated story reading, optional contextual coaching, progress and earned recognition.
- `book1-matrices.js` and `book1-matrices.css`: seven distinct maps and ten-section dossier.
- `app.js`: existing shell and routes `#book1/1` through `#book1/10`, and `#book1/<n>/workbook`.
- `sw.js`: versioned service worker cache `life-org-book1-ten-chapters-v050-20261120`.

### Privacy and continuity

The app is still a **local-browser prototype**, not a user-account platform. No authentication, shared backend, automatic cross-device synchronization, encrypted private storage or validated psychometric diagnostics. Do not enter confidential material on a shared device. Back up important work using the app-level JSON export; clearing browser storage may erase data.

These existing keys are retained intentionally:
- `tlo-book1-part1-workbook-v1`: now holds book-one responses for all ten existing chapters while retaining chapters 1–6.
- `tlo-guided-learning-v03`: chapter reading markers, rewards and coaching reflections for all ten chapters.
- `tlo-book1-context-maps-v1`: current/suitable positions for all seven contextual matrices.

The main app JSON export includes all workbook answers, activity ledger, contextual maps, reflective notes and other volume shell notes. Book I's text workbook export includes ten authored workbooks but matrix coordinate backups are part of the **main** full app JSON export.

## Verification

- Dependency-free smoke tests: `node life-organization/book1-smoke-test.cjs`. These assert ten authored chapter sources, 47 reading stages, 99 prompts, distinct interactive maps, badges, local persistence, routes, offline declarations, and the 12-chapter plan.
- Browser layout and interaction QA: `node life-organization/book1-visual-qa.cjs` (requires Playwright/Chromium), including Android-size and desktop viewports, editable workbooks, matrix interactions, source review labels and horizontal-overflow checks.
- The GitHub Actions workflow **Life Organization Book I QA** executes the smoke and visual tests; the Pages workflow deploys the public app.

**Editorial governance:** The book's source models and locked editorial architecture govern the app, not the reverse. Keep scope → current state → suitable state → gap → fit → readiness → justified action, preserve comparative evidence and alternative explanations, and never turn exploratory reflections into unsupported diagnoses.
