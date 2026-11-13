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


## Guided Leadership Journey | انتقال Design Logic به‌پرور (2026-11-13)
- Every original book-aligned session has a **native 10-stage optional learning journey**, offered alongside the unchanged reading paths. Original 47 sections, case workbench, reflection and business canvas remain in their original locations.
- Two modes: **Competitive Mission** (60 minutes, scored activities, graded context-specific situational choices, 2 original concept checks, 2 recovery stations, one bounded pause, extensions and coaching hints), or **Free Study** (untimed, unscored, freely navigable original content and guidance).
- Nine sessions have **18 original contextual leadership scenarios**; the option analysis reflects explicit scenario constraints, not a globally best management role. Each journey includes reflective evidence, a short role-play, a follow-through plan, and coaching-style prompts.
- One free pause up to 5 min; extensions cost 2 points for every 5 min or fraction, with separate confirmation. Two newly unlocked guidance cards free per mission; following distinct cards cost 2 points each after confirmation. Reopening one already unlocked card is free. Refresh cannot extend a pause; local storage retains in-progress state.
- Competitive mission raw points cap at 100, with a low-weight evidence-based self-assessment. **Net Score = max(0, Raw − Guide Penalties − Overtime Penalties)**. Bronze / silver / gold levels derive from net; review keys are withheld until all 10 steps completed. The original personal passport adds only completed **net** journey points; individual prior activity scores remain intact.
- Badge exports: PNG and browser Print to PDF. Completed runs and their score breakdowns kept in separate browser-local history (key `sabanaft_leadership_journey_v1`, up to 40). The application does not claim verified testing or central employee rankings. Local clock/storage can be manipulated: **do not use for formal evaluation or certification**.
- QA: `NODE_PATH=<node_modules> node sabanaft/verify-guided-journey.cjs` for DOM scoring/lifecycle tests, plus Playwright Chromium `node sabanaft/verify-guided-browser.cjs` for genuine desktop/mobile, reading layout and refresh flows. Dedicated CI captures screenshots to an artifact.
