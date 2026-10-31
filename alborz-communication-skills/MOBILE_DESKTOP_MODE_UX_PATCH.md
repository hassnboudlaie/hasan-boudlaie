# UX Hotfix — Mobile Browser “Desktop Site” Mode

**Project:** Alborz Insurance Communication Academy — Session 2  
**Change type:** Limited adaptive-layout and readability patch, NOT a redesign  
**Implementation date:** 2026-10-31  
**Scope:** Session 2 app shell, goals, and typography/navigation across the ten techniques.

## Problem and evidence

On an Android handset, requesting **Desktop Site** can cause Chromium to use a wide *virtual CSS viewport* and scale the page down to the handset display. A fixed `@media (max-width: 680px)` query can therefore fail even though the viewer is holding a phone. The supplied screenshot also shows an under-used lower area on the session-goals screen.

**Important limitation:** Device capability is not identical to viewport mode. The detection is a best-effort heuristic, not a foolproof identification of every mobile browser.

## Non-regression rules

- Preserve all ten techniques, eight learning stages each, WELCOME, tests, role-play scripts, behavioural feedback, photos and academic enrichment.
- Preserve existing brand palette, bold headings, large-font visual direction and logo.
- Preserve persistent **خانه / جلسه دوم / بازگشت** controls.
- Make no changes to Session 1, other applications or backend data.

## Implemented adaptive strategy

1. Keep `<meta name="viewport" content="width=device-width, initial-scale=1">` for ordinary responsive mode.
2. At document start, classify a *touch-capable*, *portrait-oriented*, *handheld-like* device displaying a virtual CSS layout width of **700px or more**. Toggle `html.touch-desktop-mode`; re-evaluate on resize and orientation changes.
3. Apply high-specificity CSS only under `html.touch-desktop-mode`, independently of `max-width`. This compensates for the virtual canvas being visually shrunk by the phone browser.
4. Enlarge typography, controls and stage cards; stack content-heavy areas; prevent horizontal overflow. Do not use a global CSS `transform: scale()` because it breaks focus, scrolling and hit testing.
5. On the short Goals page, use a `goals-page` flex wrapper with a flex-growing card so objectives and CTA share the available vertical height.
6. Publish with a new stylesheet version query to reduce stale cached styles.

## Expected user-visible behavior

| Context | Expected behavior |
|---|---|
| Smartphone, regular mobile site | Current readable mobile design; taller Goals card; existing actions still work |
| Smartphone, “Desktop Site” in portrait | Adaptive large text, single-column cards, full-width navigation, enlarged hit areas and no unintended horizontal scrolling |
| Desktop laptop, mouse pointer | Existing desktop layout, no special scaling |
| Tablet or unusual touch device | Best-effort adaptation based on viewport + orientation + input capabilities; review in browser if device behavior differs |

## Acceptance checks (QA)

- All 3 navigation controls visible and functional on every learning page.
- Session 2 Goals uses the view height effectively without adding irrelevant content.
- Catalog shows 10 clickable techniques; each opens 8 stages.
- Each script continues to display separate voice/tone, body-language and facial-expression delivery notes.
- Quiz answers, rubrics, filters, back navigation and WELCOME still render.
- No clipping or horizontal scrolling for a 360–430px mobile viewport and for simulated 980px coarse-pointer portrait / Desktop Site.
- Normal desktop rendering unaffected.
- Do not claim all devices have been visually verified until a real mobile Desktop Site screenshot or browser automation confirms it.

## Changed files

- `session2-demo.html`: lightweight adaptive-mode detector and Goals wrapper; stylesheet cache version.
- `session2-extended.css`: touch-desktop-mode overrides, normal-mobile Goals fill.

**Rollback:** Revert these two commits (and the stylesheet URL change); other sessions and the content data files are independent.
