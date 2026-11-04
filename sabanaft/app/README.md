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
