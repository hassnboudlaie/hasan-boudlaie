# Allameh MBA Organizational Behavior — Visual System

Updated: 2026-11-15. Scope: `ob-mba-classroom/`. Surface mode: **Operate** for student/instructor navigation, **Read** for learning material.

## Product truth and constraints

- 16 × 3-hour MBA Organizational Behavior sessions. Sessions 1 and 2 contain authored content. No academic content is replaced in this design pass.
- Existing server-backed registration/attendance and independent guest approval remain authoritative; client-side view selection is not an authorization boundary.
- This design document does **not** certify production readiness or browser-test performance.
- Do not confuse course-publishing progress, personal gamification, academic grades and tracked activity.

## Design direction

Quiet, readable academic utility rather than a gamified marketing landing page. Preserve the university/class identity, functional screen routes, Persian reading order, and Vazirmatn. Honor the existing session assets and language. One hierarchy: **current learning task → learning paths → syllabus → progress → secondary tools**.

## Implementation tokens

Main delivery stylesheet: `mobile-experience.css` (loaded after `style.css` and `impeccable.css`).
Shared hosted font/focus layer: `impeccable.css`.

| Role | Light | Dark |
| --- | --- | --- |
| Primary navy | `#172e3d` | `#0b2530` |
| Background | `#f5f7f6` | `#10222b` |
| Surface | `#ffffff` | `#18333b` |
| Text | `#1b303c` | `#eef5f2` |
| Secondary text | `#526673` | `#bbd0cf` |
| Border | `#d6e1e0` | `#3e6164` |
| Learning accent | `#176b5d` | context-dependent |

- Cards: 14–16 px radius; single border, no thick categorical stripe or decorative gradient. Use quiet hover and keyboard states.
- Body copy: Vazirmatn, readable line-height, approximately 73ch max for study paragraphs.
- Mobile: stacked learning paths; 2-column session tiles for sufficiently readable labels; fixed bottom nav only where already used.
- Interaction: real buttons and links retain their existing targets. Use focus-visible and 44px+ targets; no invented rewards or metrics.
- The current-session panel alone carries a distinctive deep teal surface, without pseudo-decorative rings.
- Dark appearance inherits the app's existing explicit theme switch.

## QA and provenance

The installed Impeccable 4.3.1 skill and its craft-floor, audit, critique, adapt, typeset, layout, clarify, and harden references were read. The binary `impeccable context` launcher is **not mounted in regular Chat container**, so no command execution/detector result is claimed. This pass implements Impeccable-derived principles manually against inspected source.

Before sign-off: verify deployed CSS bytes, 320/390/768/1440px screenshots, dark mode, Persian wrap, focus and 200% zoom, student/teacher controls, existing stored state, service-worker updates, and CI browser tests. Any visual score before that is preliminary.

PR #165 concurrently implements student device login/analytics and may conflict with main. This stylesheet does not touch auth, backend SQL, academic content, `app.js`, `index.html`, or `sw.js`.
