# سازمان عالی زندگی من | The Life Organization

## Book One · complete authored manuscript v0.7 (20 Nov 2026)

**Official application:** https://hassnboudlaie.github.io/hasan-boudlaie/life-organization/

Book One («من کجای زندگی ایستاده‌ام؟») now contains all **12 authored chapters** plus the original cover/title/copyright and preface, the introduction, the how-to-use guide, and the current twelve-item table of contents, all sourced from Google Drive. The six-volume PWA shell and the approved visual brand remain intact; no parallel life app was created.

### Authored manuscript provenance

| Chapter | Current manuscript title / original model | Interactive learning output |
|---|---|---|
| 1 | سازمانی که همین حالا اداره می‌کنید | Life snapshot; 8 prompts |
| 2 | سازمان عالی زندگی چیست؟ | Contextual fit criteria; 10 prompts |
| 3 | چگونه وضع موجود و وضع مناسب را ببینیم؟ | Current/suitable-state comparison; 12 prompts |
| 4 | فلسفه زندگی من | Stability/agility × existing rules/situational coordination; 8 prompts |
| 5 | سعادت من و رابطه شادی و موفقیت | Happiness × success; 9 prompts |
| 6 | من کی هستم؟ — DiSC | Pace/directness × questioning/warmth; 11 prompts |
| 7 | عالمِ عامل؛ دانستن و عمل‌کردن | Knowing × doing; 8 prompts |
| 8 | مدیرعامل زندگی خودت باش | Effectiveness × resource efficiency; 12 prompts |
| 9 | رفتار من و نتایجی که می‌بینم | Behavioral fit × outcome; 10 prompts |
| 10 | زحمت من، حاصل من | **Effort × yield**, including the forgone alternative; 11 prompts |
| 11 | فلسفه پیشرفت من | Starting point × progress method; 10 prompts |
| 12 | نمایه و ممیزی بنیادین من | **Eight-map integrated profile**; 10 prompts |

**Book structure:** Part I, «دیدن سازمان زندگی», chapters 1–3; Part II, «شناخت هشت موضع بنیادین», chapters 4–11; Part III, «ساختن نمایه بنیادین سازمان زندگی», chapter 12.

**Source priority:** The current, individually authored Google Drive manuscripts supersede the old historical `Book1_Part1_FINAL` archive. In particular, updated chapters 8–11, a new authored chapter 12, the authorial app/mentoring guides in those chapters, the updated table of contents, and the opening documents were re-read directly from Drive on **20 November 2026**. The current revised manuscript for Chapter 10 is «زحمت من، حاصل من», not its older long working title. The latest locked TOC calls Chapter 7 «من عالم یا من عامل؟», while the individual Chapter 7 manuscript presents «عالمِ عامل / دانستن و عمل‌کردن»; this title difference is preserved for editorial reconciliation rather than rewriting the chapter manuscript.

**Revision status:** The Drive documents for chapters 9–12 carry **«نسخه بازبینی»** and are labeled accordingly in the app. They are present and readable, but not claimed to be legally approved or typeset publication-final.

**Opening materials:** The frontmatter source documents in the Book One parent folder are:

- `01 - از صفحه جلد تا پایان پیشگفتار - جلد اول - v1.0.docx`
- `02 - مقدمه - پیش از آنکه چیزی را عوض کنید - جلد اول - v1.0.docx`
- `03 - چگونه از این کتاب استفاده کنیم؟ - جلد اول - v1.0.docx`
- `04 - فهرست مطالب قفل‌شده - جلد اول - v1.0.docx`

Access directly from the first-volume landing, or the official routes `#book1/front/about`, `#book1/front/intro`, `#book1/front/guide`, and `#book1/front/toc`. The TOC links to all 12 chapters.

### An authored and interactive book, not a generic coaching quiz

The application contains **57 original authored talks**; **119 guided worksheet fields**; **eight distinct two-axis contextual maps** for chapters 4–11; a printable **eight-map integrated profile** in Chapter 12; and **13 attainable learning badges** (12 chapter recognitions and the original Part I Foundation Builder). Completing all 57 reading steps and all 12 chapter outputs awards **1,395 XP** and **465 coins** (activity markers, *not* a life score). Chapter 12 is a synthesis: preserve the separate chapter units of analysis and time windows, compare two consequential choices and their dependencies, keep what is valuable, choose a feasible test, and schedule an evidence-based review.

The profile at `#book1/profile` reads saved positions from the pre-existing `tlo-book1-context-maps-v1` local storage and final synthesis notes from the existing workbook store. ● means observed current placement, ○ means proposed suitable placement; unknown is valid. *Quadrant similarity does not establish fit.* Readers must justify any connection between two choices using shared time, resources, decision rights or commitments and actual evidence.

An optional **ChatGPT external conversation prompt** is drawn verbatim from the author's Chapter 12 app/mentoring guide; it does not pretend to be a native live AI coach. No private answers are sent to ChatGPT automatically. Chapter 6’s DiSC reflection is **not** a psychometrically validated or officially licensed Everything DiSC assessment.

The **full Persian authored prose** is displayed without summarization, with links to each originating Drive document. The connector extracts DOCX narrative and chart/table *text*; the original DOCX's embedded image layouts and figure artwork are not automatically replicated. Each interactive quadrant is an authorial, book-aligned adaptation, not a claim to reproduce the exact figure artwork. The app does not silently mix the distinct constructs from chapters 8 (effectiveness × efficiency), 9 (behavior × outcome) and 10 (effort × yield).

### Source and runtime architecture

A static, Mobile-first RTL PWA, no build dependencies. Script load order in `index.html`:

1. `book1-content.js` and `book1-part2-content.js` — historical baseline preserved for compatibility
2. `book1-chapters-20261120.js` — authoritative chapters 1–10 baseline
3. `book1-chapter11-20261120.js` — previous chapter 11 imported layer
4. **`book1-complete-20261120.js`** — current 8–11 editorial refresh, chapter 12, frontmatter and updated TOC
5. `book1-ui.js` — 12 chapter-specific workbooks and original reading interfaces
6. `book1-journey.js` — paginated narrative reading, coaching check-ins, gamified progress
7. `book1-matrices.js` — eight maps, 12-section evidence dossier, persistence
8. **`book1-complete-ui.js`** and **`book1-complete.css`** — original opening texts, clickable TOC and mobile/print-friendly eight-map final profile
9. `app.js` — official shell/router; `sw.js` — offline cache `life-org-book1-twelve-chapters-v070-20261120`

### Privacy, migration and source fidelity

Existing localStorage keys are intentionally retained: `tlo-book1-part1-workbook-v1` for authored chapter notes, `tlo-guided-learning-v03` for learning progress, and `tlo-book1-context-maps-v1` for matrices. Progress is **not reset** by adding final chapters. The main app JSON export includes all available workbook responses, reflection notes and map selections; users should export their data before clearing browsing history or switching devices. This is **not** an authenticated, cross-device-synced or encrypted user database. Never put passwords, confidential details, sensitive client names or medical records into this shared-browser prototype.

**QA:** `node life-organization/book1-smoke-test.cjs` and `node life-organization/book1-visual-qa.cjs`. GitHub Actions workflow “Life Organization Book I QA” validates source synchronization, 12 reader/workbook routes, 57 reading sections, 119 fields, eight maps, profile, local storage/idempotent rewards, and mobile/desktop layout. GitHub Pages deployment is separately verified by Actions.

**Publisher-level next steps, not claimed finished:** scholarly source/fact-check, image/figure rights, final editorial approval and copyedit of the still-review-stage chapters, complete English adaptation with professional human editing, and reader-testing against comprehension/accessibility. The application is a digital companion, not a substitute for rights clearance, print-ready artwork, or a professional psychometric validation.


### Fun · Strategic Life Choices (20 November 2026)
The official PWA now includes a **سرگرمی / Fun** entry in the sidebar and mobile navigation, a home teaser, and direct routes #fun and #fun/{values|direction|growth|work|money|relations|wellbeing|character}.

The feature offers **58 contextualized either/or questions in eight areas** (10 + 4 + 8 + 5 + 4 + 9 + 11 + 7), preserving the editorial distinction between 42 explicitly identified source pairings and 16 interpretive prompts derived from images. Answers are saved locally, editable, and shown together at the end of each category with an answer-grounded narrative, reflection questions, progress and a next-theme link. After all eight categories, a local JSON export is available; the main app backup also includes Fun data. Reset clears its local choices.

Four compact visual excerpts came from the **user-supplied PDF** (source slide pages 3, 120, 77 and 42), while other themes have original SVG motifs. Image third-party rights should be checked before further public redistribution.

This is **reflective entertainment, not MBTI/DiSC or validated psychometrics**: no moral, success, personality or aggregate life score. Forced choices in fictional situations are not permanent dispositions. Original book content, matrices, workbook, chapter progress and existing learning rewards remain unchanged.

Files: fun-choices-data.js, fun-choices-images.js, fun-choices.js, fun-choices.css. The offline precache lives in sw.js; index.html loads source data, images, game and then the app shell.


### Named choice patterns · v0.9.0 (20 November 2026)
Each of the eight Fun categories now offers **four named two-axis patterns and a mixed outcome** (40 possible labels in total; 32 directional plus 8 mixed). The category-specific, deterministic and auditable editorial rules are in `fun-choices-patterns.js`; no inference is made about a person's stable traits, psychometrics, character or success. Each full-category result now displays a prominent named pattern, its two interpretable directions, selected evidence and a meaningful contrasting choice where present, followed by a contextual mentoring-style question. Pattern names are reproduced on completed theme tiles and in local export/backup data. Existing choice answers remain intact; no migration, personal-data collection, new permissions or book manuscript changes. Both the original v0.8 questions and their current answers continue to work. The pattern names are editorial hypotheses, not scientifically validated classifications.
