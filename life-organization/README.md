# The Life Organization — Super App (Book I / Part I v0.2)

A separate modular, FA/EN, RTL/LTR, mobile-first and installable PWA in the life-organization/ directory. Nothing in my-finance/ or okr-system/ is modified.

## Scope of the current release
- Six independently navigable modules corresponding to the six-book series.
- Restrained home dashboard; responsive desktop sidebar/mobile bottom navigation.
- **Book One · Part One fully readable:** all three chapters from the final locked Persian manuscript `Book1_Part1_FINAL_v1.0_FA`, including the chapter introductions, 13 گفتار, chapter endings and references.
- **Linked chapter workbook:** Chapter 1 current-state snapshot (8 prompts), Chapter 2 evidence-based fit criteria (10 prompts), Chapter 3 current/suitable-state gap observation (12 prompts). All responses auto-save locally.
- Reading-section review markers (not assessment scores), deep-linkable chapters, and a three-chapter workbook overview.
- Export in readable TXT and backup JSON; existing general workbook JSON export also includes Book I responses.
- One interactive reflection note per other module, stored locally on this device.
- Workbook index with JSON export of local notes.
- Usage-only journey view, explicitly not a life score.
- Personal name, language and theme settings, plus PWA/offline shell.
- Accessibility basics: headings, focus states, semantic navigation, contrast and reduced-motion handling.

## Important limitations
This is **not** a digitization of all six volumes or a validated assessment or production/commercial system. Only the first three chapters of Volume I have full manuscript reading experiences. They retain the original Persian text (English navigation and worksheet UI; no full English translation). Visual figures embedded in the Word source and detached appendix tables are **not reproduced as original images**. Consult the source Word file for those originals.
There is **no authentication, backend, synchronization, encrypted storage, payment or shared multi-user isolation**.
LocalStorage on a shared device is not private; do **not** enter confidential personal information.
The three Book I chapter readers use the locked manuscript source; content for later chapters will be mapped to future modules after editorial review.
Do not infer scientific assessment scores from app usage. Data ownership and explicit consent must precede backend integrations.

## Development
Static files, no build tooling. Open index.html from a local HTTP server or GitHub Pages.
Main entry points: app.js (shell/router), book1-ui.js (reader/workbook), book1-content.js (unaltered manuscript text), book1.css (book UI), styles.css (shell), manifest.webmanifest and sw.js (install/offline).
Deployment: https://hassnboudlaie.github.io/hasan-boudlaie/life-organization/

## Editorial model
Book series > module > tool/experience > reflection > action > review.
Guiding principles: Tool-First, Profile over Score, Fit rather than universal best practice, and Current State → Suitable State → Gap → Fit/Misfit → Readiness → Action.


## Content provenance / QA
- Source: https://docs.google.com/document/d/15AIIR5_2V81fqcGuBmtuml64Wn0HE65V/edit
- Manuscript verified against 4 / 4 / 5 chapter گفتار headings; references included. Non-linear text extractor detached some original DOCX table content to the end; duplicate detached table strings are excluded from chapter-body rendering.
- The persistent workbook key `tlo-book1-part1-workbook-v1` is distinct from the existing module notes key. The app-wide reset clears both after user confirmation.
- Stored responses are private only to the current browser/device and are not encrypted or synchronized; avoid confidential details.
- Completion counts are **reading markers and filled-form counts**, never quality-of-life or psychological scores.
