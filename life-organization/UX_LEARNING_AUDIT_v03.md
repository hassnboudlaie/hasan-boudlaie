# The Life Organization | Book I · v0.3 Design & Learning Experience Audit
**Scope:** the existing six-volume app shell and Book One, Part One chapters 1–3.
**Editorial baseline:** Book1_Part1_FINAL_v1.0_FA. Its canonical manuscript text is not revised in this release.
**Design lineage:** mobile-first training experiences, progressively disclosed activities, readable Persian, approachable feedback, strong visual contrast, and downloadable learner recognition.

## Audit findings → implemented improvements

| Priority | Previous condition / risk | v0.3 resolution | Verification |
|---|---|---|---|
| P0 | Expanding multiple large chapter sections produces a long and dense page, especially on mobile | A one-step-at-a-time **guided reader** with page-sized manuscript segments, next/previous page, and freely navigable stage rail; all original text remains accessible | source paragraph coverage + rendered reading-stage checks |
| P0 | Workbook has 8–12 fields visible at once and invites form fatigue | Two prompts per screen in a **multi-page, revisitable worksheet**; existing entries preserved | 8/10/12 fields, page-group and persistence tests |
| P0 | Generic progress tracking could resemble scoring the user's life | Label XP and coins explicitly as **learning engagement**, not outcomes or life quality; no ranking, no peer comparison | scoring invariants, UI wording |
| P0 | Gamification could reward repeatedly clicking the same marker | Award **15 learning XP + 5 coins** once per distinct reading milestone; **45 XP + 15 coins** once per confirmed chapter output; no more coins for longer personal disclosures | ledger and idempotence tests |
| P1 | Coaching was a coming-soon shell rather than context-specific scaffolding | Source-aligned **coaching check-ins** for every chapter stage with optional non-graded reflections, supportive completion responses, and next-step language | route/page coverage and check-in tests |
| P1 | No memorable milestone recognition | Four **distinctible and downloadable badge designs**: Chapter 1 observer, Chapter 2 fit architect, Chapter 3 evidence explorer, and Part One foundation; unlock only after reading sections and chapter output | unlock logic and badge rendering |
| P1 | Mostly pale panels, weak spatial separation and small labels | Editorial dark-teal headings, warm paper reader, differentiated accents, large Persian typesetting, clear multi-step progress, dark theme adjustments | CSS + responsive structure audit |
| P1 | Breaks and pauses not integrated into the journey | Two optional **30-second reflection stops** after Chapters 1 and 2, without penalizing users who skip them | reflection action and timer implementation |
| P1 | Private inputs could be over-incentivized | One useful observation is enough for workbook recognition; optional reading notes receive no extra XP/coins; local storage warning | achievement rules and copy |
| P1 | Rewards/notes could be lost from the global workbook export or reset | Integrate learning engagement and coaching notes into JSON export; clear both historical workbook and new gamification ledger on confirmed reset | export/reset regression tests |
| P2 | PWA updates may remain stale offline | A new versioned service worker cache includes both journey assets | asset manifest test |
| P2 | Modal keyboard focus may escape | Support Escape and keyboard focus wrap for reward/rest dialogs | code-level keyboard review |

## Editorial safeguards
- Keep all narrative characters (حمید، نیلوفر، سارا، لیلا) inside the original Persian manuscript; coach prompts are **separately labeled editorial support**, never misattributed book quotations.
- Chapter readings use the original chapter's complete extracted narrative text, source notes, endings and scientific references. Extracted figures, illustrations and detached layout tables in the source Word document have **not** been reproduced here.
- Worksheets remain prompts for reflection and observation, **not validated psychological instruments** or clinical measurements.
- No automatic "correct" judgment on life answers. The user owns interpretation, action and follow-through.
- An achievement is an activity marker only and cannot be purchased or translated into money.
- LocalStorage remains unencrypted and device-specific. Avoid confidential information and export important work.

## Visual system
- Distinct learning surfaces: navy-teal **chapter hero** → sand-toned **book page** → sage-gold **coaching reflection** → mint **activity feedback**.
- On mobile, stage navigation becomes a horizontally scrollable card rail; large touch controls and page counters accompany paging.
- Long Persian lines use ~18 px with generous line-height and right-aligned mobile reading; contrast-sensitive labels and focus indicators are elevated.
- Badge art is generated as vector SVG inside the app and exported as a PNG (SVG fallback) without a network requirement.

## Acceptance & residual risks
- Automated checks must pass before merge: source section counts 4/4/5, all 30 fields, document structure, stage navigation, workbook pagination, earned-once rewards, export and reset, and offline assets.
- GitHub merge is **not** proof of a completed visual-device pass. The Android/iOS live deployment still warrants manual screenshot review for exact mobile viewport and Persian font appearance.
- No cross-device synchronization, authentication, backup restore/import, server ledger, analytics or cloud resilience yet. Local rewards are not tamper-proof.
- A full English translation of the book's manuscript does not exist; English navigation and coach prompts do not imply that the Persian source text has been translated.
- The dedicated AI Life Coach is a future module: the current "learning companion" is curated, pre-authored guidance, **not conversational AI**.

## Contrast spot-check (computed)
Fourteen representative foreground/background pairs from the new UI were calculated with WCAG relative-luminance contrast math. Their ratios ranged from **4.99:1 to 12.47:1** (minimum among those sampled: the teal eyebrow text on the pale sage panel). All fourteen sampled text pairings exceeded 4.5:1. This is a **spot-check**, not an assertion that every possible live element and state has been visually audited.

## Real-browser review gate
The CI workflow now includes Playwright Chromium tests at **390×844 Android-sized mobile** and **1440×900 desktop** viewports. It checks readability, the chapter reader, optional coach note, stage navigation, finite reading rewards, the two-visible-field worksheet pager, persistence across form screens, global progress, unexpected JS errors, and mobile horizontal overflow. Screenshots are saved as a workflow artifact when the job runs. Manual device inspection remains valuable for native Android/iOS browser differences.
