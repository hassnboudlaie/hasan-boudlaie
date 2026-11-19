# سازمان عالی زندگی من | The Life Organization — Book One, Six-Chapter Journey v0.4

**Official app:** https://hassnboudlaie.github.io/hasan-boudlaie/life-organization/

This is the existing six-volume, modular, mobile-first FA/EN PWA. Release v0.4 extends **Book One** from its first three complete authored chapters to **all six chapters authored as of 19 November 2026**. There is no parallel app. The other five volumes remain module shells; no content is fabricated for unpublished chapters. No files from \`my-finance/\`, \`sabanaft/\`, \`okr-system/\` or unrelated apps are changed.

## Content architecture — chapter fidelity before features

| Book One chapter | Authoritative authored content | Active individual tool |
|---|---|---|
| 1. سازمانی که همین حالا اداره می‌کنید | Approved locked Part I | نمای فوری سازمان زندگی (8 fields) |
| 2. سازمان عالی زندگی چیست | Approved locked Part I | معیارهای مناسب‌بودن و شواهد (10 fields) |
| 3. چگونه وضع موجود و وضع مناسب را ببینیم | Approved locked Part I | موضوع/بازه، وضع موجود، وضع مناسب و شکاف (12 fields) |
| 4. فلسفه زندگی من | Drive chapter 04, including Part II introduction | برگه فرض‌ها و منطق اداره زندگی (8 fields), contextual matrix: stability/agility × formal/informal coordination |
| 5. سعادت من و رابطه شادی و موفقیت | Drive chapter 05 | برگه شادی و موفقیت (9 fields), contextual map: success yes/no × happiness yes/no |
| 6. من کی هستم؟ — ترجیحات رفتاری با DiSC | Drive chapter 06 | دو موقعیت و یک الگوی رفتاری (11 fields), contextual DiSC-informed map: pace/directness × questioning/accepting |

The manuscript is displayed in a paginated reading experience with the original Persian storytelling and research reference text; two fields appear per workbook page. Every chapter has coaching-style reflection prompts, and the six outputs form a connected personal learning dossier. Chapters 4–6 add two-axis **Current State ● / Suitable State ○** interactive matrices. A placement can be left unknown and is stored only in the current browser.

### Source provenance and editorial restraint

- Chapters 1–3: existing canonical \`book1-content.js\`, source \`Book1_Part1_FINAL_v1.0_FA\`, https://docs.google.com/document/d/15AIIR5_2V81fqcGuBmtuml64Wn0HE65V/edit.
- Checked against individually authored Drive documents dated 19 November 2026: the first three chapter prose strings match their current files through their full existing text. Drive's extraction contains **additional detached table fragments after** those files' prose. To preserve the editorially locked text and avoid duplicating tables, those detached strings were not appended to the first three interactive readers.
- Chapter 4 source: https://docs.google.com/document/d/1qVLtLheK-i_PzOX4sXH3yl9QpbAEMQwU/edit.
- Chapter 5 source: https://docs.google.com/document/d/1rubxFS2T2epL-mMZKGL2tlgjOXqlygTv/edit.
- Chapter 6 source: https://docs.google.com/document/d/1hI4BqwrdqmzPCq7l3AF30lFgn1n9sjco/edit.
- Part II source text is imported into \`book1-part2-content.js\`, without altering the source Word documents. An inert two-line reading header is prepended to preserve the book-page parser's existing first-two-lines behavior. Word-extracted table text, including detached table tails, is preserved as *text*; original embedded charts/visuals are **not** reproduced as their Word images. Consult Drive originals for original layout.
- Preserve the four characters **نیلوفر، حمید، سارا، لیلا** in their source stories and cross-chapter comparisons. Do not conflate separate conceptual maps (productivity, happiness/success, DiSC style).
- Individual workbook exercises are **authorial reflective instruments, not psychometric scales**. The DiSC-informed map does not administer or claim to score an official Everything DiSC assessment. A map placement is a provisional, contextual observation, not a diagnosis or permanent personality type.
- The matrices and diagrams here implement the conceptual two-axis models. They are interactive adaptations, **not screenshots or copies of original Word figures**.

## Guided Learning and recognition

- Full chapter talk coverage: **4 / 4 / 5 / 6 / 5 / 5 = 29 گفتار** in six independently navigable reading journeys.
- Six chapter workbooks contain **58 prompts** total (8/10/12/8/9/11). All preserve their own labels, context and evidence rather than computing an arbitrary "life score".
- Each reviewed reading step earns **15 Learning XP and 5 Journey Coins**, once per step; each recorded chapter workbook output earns **45 XP and 15 Coins**, once per chapter. All six fully completed yield **705 XP and 235 Coins** — participation counters only.
- There are **seven badges**: one for each of chapters 1–6 and the existing first-part Foundation Builder badge, earned after chapters 1–3. The foundation badge does not require chapters 4–6.
- Badges download as PNG with SVG fallback. In-app coaching check-ins are scripted editorial prompts and not a live AI coach.
- Two optional 30-second reflection stations remain from v0.3.

## App and offline structure

Static HTML/CSS/JS; serve \`index.html\` from an HTTP server or GitHub Pages, no build tooling. File list:
- \`book1-content.js\`: approved first-three manuscripts.
- \`book1-part2-content.js\`: authored chapters 4–6, source metadata and chapter question metadata.
- \`book1-ui.js\`: six workbook schemas, persistence, exports, baseline chapter UI.
- \`book1-journey.js\`: guided reading, narrative coaching prompts, journey markers, gamification and chapter awards.
- \`book1-matrices.js\` + \`book1-matrices.css\`: contextual, selectable source-aligned two-axis maps and six-chapter dossier.
- \`app.js\`: existing six-volume app shell, routing \`#book1/1\` through \`#book1/6\`, workbook routes.
- \`index.html\`: script loading order and PWA shell; \`sw.js\`: updated offline cache \`life-org-book1-six-chapters-v040-20261119\`.
- Existing approved Life Architecture logo and assets remain intact.

## Privacy, limitations and data continuity

**There is no user authentication, backend, cross-device sync, encrypted storage, or multi-user isolation.** Notes and observations are stored in browser LocalStorage; **do not put confidential data into a shared browser** and keep backup exports if important. Clearing browsing data can erase progress. This remains an interactive educational prototype, not a commercial production system, validated personality instrument, therapy or clinical coaching service. The original authored text is Persian; interface navigation is partially bilingual, **not a full professionally translated English edition**.

Persistent keys:
- \`tlo-book1-part1-workbook-v1\`: six chapters' worksheet answers and review markers; chapter 1–3 fields retain their existing keys.
- \`tlo-guided-learning-v03\`: reading rewards, chapter output confirmations, notes and journey cursor. Existing v0.3 progress is retained.
- \`tlo-book1-context-maps-v1\`: maps for chapters 4–6.
- App-wide reset clears these after user confirmation.
- The main app JSON export includes all six chapters, journey, reflection notes, contextual matrices and module-level notes. Chapter workbook TXT and backup JSON come from the original Book I workbook controls and cover the six chapter forms; matrix placements are in the **main app's** full JSON export.

## QA and quality gates

1. Script parse / isolated runtime QA confirmed all six chapter data objects, 29 گفتار, 58 prompts, three interactive matrices, six-card dossier, seven badge slots and correct chapter source links.
2. Updated dependency-free \`node life-organization/book1-smoke-test.cjs\` for full six-chapter checks, saved entries, navigation, no double awards, matrices, reset and offline asset declarations.
3. Updated Playwright-based \`node life-organization/book1-visual-qa.cjs\` for mobile & desktop screenshot/contrast/layout regression, including new matrices and dossier. Requires Playwright and a Chromium browser installed.
4. **Code parsing and isolated render verification do not by themselves establish a successful browser deployment or end-to-end device test.** Verify on GitHub Pages after deployment and on target device before public use.

## Design governance

The prescribed structure is **Book → chapter → source narrative and references → tool → reflection → evidence → current/suitable fit → review**. Adopt *Tool-First, Profile over Score, Fit over one-size-fits-all* and keep **Current State → Suitable State → Gap → Fit/Misfit → Readiness → Action** intact without imposing a generic psychometric score on book-specific reflection.

Related prior editorial/UX audit: [UX_LEARNING_AUDIT_v03.md](./UX_LEARNING_AUDIT_v03.md).
