# صبا نفت · اپ رهبری بازتابی من (PWA)

Live entry: https://hassnboudlaie.github.io/hasan-boudlaie/sabanaft/app/

This is a new standalone installable mobile-first experience. Existing course (/sabanaft/index.html#home) and Leadership Studio (/sabanaft/leadership-studio.html) are preserved unchanged.

- Course content is not duplicated: read live from ../reflective-content.js. Nine sessions, 47 sections, no invented lessons.
- Original source course and studio are embedded on the same origin; original working assessments, cases, notes, completion, reflection and export stay in their original code and original storage keys.
- Home, session navigator, reader tabs, bookmarks and installed shell are in app/ only. Progress reads actual completion data for the active course context from sabanaft_reflective_v2. Source completion is only user-marked, never inferred from a view.
- App-specific bookmarks and last location are stored locally in sabanaft_reflective_app_shell_v1. Nothing is sent centrally.
- Logo and original company photography live in ../assets/ with provenance in ../ASSETS.md.
- No passwords, accounts, server sync or confidential manager records. This site is public. Never enter confidential case data.
- App shell is partially cached offline. Real original course/studio interactions need a network connection.
- Source book: Armin Trost (2025), The Reflective Leader; content is original educational adaptation, not reproduction.

## Future AI Leadership Coach placeholder (2026-10-30)
A clear coming-soon card on Home routes to `#/coach`, which is a product-preview page only. It lists future context analysis, AI role-play, and action/reflection. No LLM connection, input, chat, API token, user cases, or data transmission. The preexisting Leadership Studio is unaffected. All interactive coaching functionality remains future scope.

## Case-first learning and coaching desk (2026-11-03)
- `#/coach` is now an interactive case-first workspace with optional browser speech-to-text, situation/urgency/context selection, and two defensible book-grounded role approaches with trade-offs, questions and next steps. This in-app guidance is a **rule-based educational aid, NOT generative AI**.
- Case handoff writes a one-time payload (`sabanaft_case_handoff_v1`) on the same origin. The existing Leadership Studio consumes it and creates a new case, retaining existing cases and drafts. Use test/fictitious company situations only.
- Human coaching is currently a `mailto:` request to the owner. The case description is omitted by default, and attached only if the user explicitly ticks the disclosure box; no booking confirmation or payment integration exists.
- The ChatGPT option **copies a prompt on request** and opens ChatGPT separately. There is no embedded OpenAI model, automatic transmission, account linkage or API key. True AI and user authentication require a private, funded backend and security review.
- The nine-session main course now includes detailed signature role-plays and four scenario-aware checks per session with reasons for every option. These use the original course storage and do not change its schema.


## Interactive leadership business model canvas (2026-11-04)
- Independent route: `/sabanaft/app/business-model.html` (linked from the app Home).
- Standalone, responsive RTL visual Business Model Canvas: nine clickable areas in a readable, horizontally scrollable comprehensive overview plus nine tappable navigation cards and deep-linked visual explanation panels.
- Each block explains the user's selected strategy from the 32-question discovery: customer segments, value, channels, customer relations, activities, resources, key partners, revenues, costs, execution next step and caveats. Includes sales packages and customer journey.
- Full-screen overview, print/PDF-friendly styling, keyboard focus, and Escape to leave expanded mode.
- Self-contained, zero user data, no API calls or storage; original course, cases, studio and coaching flows are untouched.
- This is a DOM/CSS re-creation of the approved schematic for clickable, readable text and accessibility, **not the original generated raster file**.
- No authentication is imposed: business/pricing assumptions on this page are publicly accessible wherever the app URL is accessible. Do not place private company or client data here.
- The commercial target of 11 × 2-hour sessions is distinct from the currently published nine-session course.
- Service worker v6 precaches this page and preserves per-path navigation cache boundaries (business model navigation cannot overwrite cached app Home).
- Verification: static source audits check JavaScript syntax, 9 unique interactive blocks, 9 detail definitions, Home route and offline manifest; an actual external browser test is still needed.

## Executive learning UX refresh (2026-11-12)
- Transferable presentation design principles from Allameh OB MBA, Alborz session 4, and Behparvar communication journey: RTL visual hierarchy, large type, high-contrast cards, layered interactions and consistent touch targets.
- Case-first Home: real managerial issue is the primary action, ahead of four leadership-model cards and continuous reflection.
- All four existing model routes, their three-activity drill-down screens, the nine educational sessions, Case/Coaching workspace, practice, reflection and achievements remain navigable. The redesigned cards do not open inline or create duplicate menus.
- This is a presentation-focused release: no change to The Reflective Leader content, source data, scoring criteria, storage keys, manager records, AI integration or coaching status.
- Mobile single-column layout, keyboard focus visibility, reduced-motion support and a refreshed PWA shell cache.

## Corrective visual and density audit (2026-11-12)
- **Root cause found:** the app shell embedded course, context and Studio iframes with later-injected `background:#fff!important` and `font-size:16px!important`, defeating source visual styles. The injected overrides are now replaced with readable 18px and tinted backgrounds; fine print minimum 15px.
- Home routes retain 4 model elements and the 5th continuous-reflection entry, but use five differentiated surfaces, a shorter image banner, and one clear case-first primary action. Stage pages use compact, separate drill-down screens, not expanding fragments.
- 9 course cards use compact image-text rows on mobile and three columns on wide screens. Lesson content receives the same colored, high-contrast reading system; no chapter content has been rewritten.
- Coach: initial form only; follow-through options appear after a response. Disabled AI option and human-coach contact remain accessible under a native disclosure panel, rather than occupying the initial viewport. Safety note remains visible.
- Leadership Studio embedded and standalone views now share the typography/color hierarchy; data persistence and book-grounded coaching are unaffected.
- Horizontal clipping, responsive min-width, 48px controls, keyboard focus, reduced-motion, and PWA cache v18. Regression suite must pass before publication.

## Coach-supported ten-stage reflective leadership journey (2026-11-13)

- Integrated route in the **existing** app: `#/journey`. Enter from Home, the nine-session course navigator, or Session 9 capstone. The original nine sessions, book interpretation, Leadership Studio, case storage, business-model canvas, and annual participation scores remain separate and unchanged.
- The original ten-step *learning design logic* from Behparvar is reinterpreted through ten linked, original **hypothetical** leadership cases aligned with Armin Trost: reflective self-awareness, context, competing narratives, Boss/Coach/Partner/Enabler roles, role clarity, difficult conversations, delegation, multiunit coordination, benefit-led tools, and follow-through. These are educational applications, not descriptions of verified Saba Naft incidents.
- Competitive mission: 60-minute wall clock, decision + written applied practice per step; 100-point maximum raw score; 2 coaching guides free, each *new stage* guide after that costs 2 points. A guide opened repeatedly in the same stage is free. The single voluntary pause lasts at most 5 minutes including across Refresh; extensions are requested only on expiry, priced at `2 × ceil(minutes/5)` points (1–60 minutes per request). Progress and drafts persist locally.
- Study mode preserves all ten stage explanations, decisions, option rationales, techniques, practice prompts and guides, with untimed step navigation, zero competitive score or badge. Switching a competitive attempt to study gives up that attempt's score; a new distinct attempt is required to compete again. Using Restart within the same attempt does *not* reset coaching quotas, the pause, the timer or penalties.
- Two 30-second recovery stations occur after steps 4 and 8, with reduced-motion support. Immediate phase completion shows earned points but hides answer rationales until final completion.
- Final mission credential: `max(0, raw − overtime penalty − coaching-hint penalty)`, bronze/silver/gold level, stage-by-stage analyses, local-history panel integrated into the existing Passport **without mixing** with annual case/participation scores. Badge downloadable as PNG via Canvas or print-to-PDF.
- State key: `sabanaft_leadership_journey_v1`. Saved on the current browser/device only; no accounts, multi-device synchronization, cryptographic tamper-proof scoring, officially verified HR ranking, or generative AI coach. The contextual coach is an explicit deterministic learning guide, not an authenticated AI/human service.
- Regression: `sabanaft/verify-leadership-journey.cjs` (jsdom + engine), `sabanaft/verify-leadership-journey-browser.cjs` (Chromium mobile/desktop), and GitHub Actions workflow `sabanaft-journey-browser.yml` plus the original Saba workflows.
