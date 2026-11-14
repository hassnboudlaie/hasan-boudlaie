# Impeccable UI / Vazirmatn update — 14 Nov 2026

Product: **مدیریت رفتار سازمانی MBA دانشگاه علامه طباطبایی**, `ob-mba-classroom/` in the original `hassnboudlaie/hasan-boudlaie` repository. This is **not** Saba Naft.

## Evidence-based baseline
- The classroom stylesheet had a named `Vazirmatn` font stack but no `@font-face` declaration or font file in its own PWA scope, so devices without the font fell back to other faces.
- `attendance.css` still used Tahoma/Arial as the main face. `install.css` referenced Vazirmatn without loading it.
- SPA bottom navigation had a visual active state but did not expose `aria-current`, and navigation did not consistently move keyboard focus to the new main view.
- Existing app already contained 16 sessions, a session-level guided journey, private assignments, source-backed course materials, quiz APIs, and a server-backed access gate. These have been preserved deliberately.
- Existing browser QA covers a mobile 390px and desktop 1440px student journey; it uses a synthetic backend. It is not evidence of real multi-device login or teacher approval.

## Implemented scope
- Reused the project's already-versioned Vazirmatn WOFF2 blob and its SIL OFL license, self-hosted within `ob-mba-classroom/assets/fonts/`.
- Added one `impeccable.css` layer shared by classroom, attendance and installation; includes font-loading, mobile typography, focus, text wrapping, touch-target and motion refinements without altering course content.
- Preloaded font in the three HTML entry points, added both CSS and WOFF2 to versioned PWA shell cache.
- Exposed `aria-current="page"` on active bottom navigation and moved keyboard focus to the main landmark after route/history changes. Kept local storage key, session schema and backend endpoints unchanged.
- Added deterministic contract tests to the existing OB Classroom UX workflow.

## Risks, verification and explicit exclusions
- Impeccable design criteria were applied by reviewing source and verified PRs #26–29 of Behparvar; the native CLI context launcher and detector could not be run in this environment.
- The GitHub Pages production website was not directly browser-inspected in the editing environment. Confirm CI/browser results and deployed assets before declaring Release sign-off.
- Public GitHub Pages assets are not confidential; authorization must remain enforced at Supabase. Online server verification is still required for login and formal attendance.
- No competitive scoring, coins, badges or 60-minute timer was transplanted from a separate leadership product into an MBA academic course. No 16-session curriculum, answers, academic marks, private learner data or server functions were changed.

## Release acceptance gate
`node scripts/verify-ob-classroom-ux.cjs` and `node scripts/verify-ob-impeccable.cjs`, existing guided Playwright workflow, plus real-device/teacher-access validation before classroom sign-off. Accessibility scanner results must be reported separately; a source-level check is not WCAG certification.
