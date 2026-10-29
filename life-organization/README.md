# The Life Organization — Super App Shell (Preview v0.1)

A separate modular, FA/EN, RTL/LTR, mobile-first and installable PWA in the life-organization/ directory. Nothing in my-finance/ or okr-system/ is modified.

## Scope of this first release
- Six independently navigable modules corresponding to the six-book series.
- Restrained home dashboard; responsive desktop sidebar/mobile bottom navigation.
- One interactive reflection note per module, stored locally on this device.
- Workbook index with JSON export of local notes.
- Usage-only journey view, explicitly not a life score.
- Personal name, language and theme settings, plus PWA/offline shell.
- Accessibility basics: headings, focus states, semantic navigation, contrast and reduced-motion handling.

## Important limitations
This is **not** a digitization of all 57 chapters, a validated assessment, or a production/commercial system.
There is **no authentication, backend, synchronization, encrypted storage, payment or shared multi-user isolation**.
LocalStorage on a shared device is not private; do **not** enter confidential personal information.
Full research-based chapter content and assessments will be mapped to modules after the locked book source is reviewed.
Do not infer scientific assessment scores from app usage. Data ownership and explicit consent must precede backend integrations.

## Development
Static files, no build tooling. Open index.html from a local HTTP server or GitHub Pages.
Main entry points: app.js (UI logic/translations), styles.css (responsive design), manifest.webmanifest and sw.js (install/offline).
Deployment: https://hassnboudlaie.github.io/hasan-boudlaie/life-organization/

## Editorial model
Book series > module > tool/experience > reflection > action > review.
Guiding principles: Tool-First, Profile over Score, Fit rather than universal best practice, and Current State → Suitable State → Gap → Fit/Misfit → Readiness → Action.
