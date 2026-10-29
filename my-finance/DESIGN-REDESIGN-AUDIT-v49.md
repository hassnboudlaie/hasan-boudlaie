# My Finance · UX/UI Benchmark & Redesign Record
**Version:** 1.0 · 29 October 2026 · **Release:** design-v49
**Product:** Persian-first personal-finance PWA · mobile-first · RTL · Light/Dark

## Executive assessment
The previous home dashboard had a working financial data model but a fragmented visual hierarchy: a large chart sat above the primary manual-entry task; explanatory voice-entry copy competed with financial figures; multiple generations of CSS (inline / premium / dashboard) accumulated; bottom navigation did not expose loans despite rising importance of scheduled payments; action types and card styles were inconsistent.

This release optimizes **presentation and discoverability only**. It does not alter authentication, Supabase schema, user ownership, balances, transaction interpretation, or the single-deduction accounting rule.

## Benchmark evidence and adaptation
| Reference | Official source | Adapted principle | Deliberately not copied |
|---|---|---|---|
| Copilot Money | https://help.copilot.money/en/articles/6045480-dashboard-tab-overview | One salient financial metric, nearby-to-review items, recurring payments and quick action | US banking integrations and “free to spend” unless a real budget has been configured |
| Monarch Money | https://www.monarch.com/features/tracking | Coherent account, liability, cash-flow and transaction views; editable dashboard philosophy | Brand visuals, financial-provider claims or unsupported market feeds |
| YNAB | https://www.ynab.com/whats-new/the-great-ynab-remodel | Home as an action-oriented command center with important alerts | YNAB's proprietary budgeting concepts, data or visual assets |

## New information architecture
**Home:** concise brand/header → upcoming installments / contextual notice → reporting period → real cash balance → income / expense / monthly net → receivables → **Quick Entry** → 6-month cash-flow → category spending and recent transactions → assets and contracts.

**Primary mobile navigation (5 targets):** خانه · تراکنش‌ها · حساب‌ها · اقساط · بیشتر. All other modules remain accessible from the More sheet or desktop sidebar. Icons are consistent inline SVG, without icon font or network dependency.

## Design tokens and UX rules
- Neutral paper-like canvas, high contrast navy primary figures, restrained teal actions, soft borders, neutral cards.
- Orange/Red are reserved for installment urgency. A neutral status appears before the warning window.
- 8 px rhythm, rounded cards ≈ 18–23 px, compact eyebrow labels, tabular numerals where relevant.
- Clear focused states, touch targets of roughly 44 px or more, dark-mode tokens, reduced motion, responsive breakpoints.
- Quick entry is a short form; long speech-browser instructions are a collapsed accessible disclosure, while live voice status remains visible.
- Every primary summary card continues to open its actual detail route. Do not invent data or balance estimates.

## Implementation
- New `design-v49.css` loaded last to define final visual behavior without deleting legacy styles.
- Updated `index.html`: reordered Home DOM; simplified quick-entry copy; revised mobile nav icons/priority; kept verified IDs and data bindings.
- Updated `sw.js`: bumped cache and precached new stylesheet so PWA refresh can retrieve the release.
- Additional polish for loans, accounts, profile and transaction-detail cards.
- Scope isolation: **only files inside `my-finance/`**. Kish OKR, Life Organization and the public website's other applications are not modified.

## Acceptance / quality gates
**Automated static gates:** parse all inline scripts; parse loan script; validate key IDs, unique navigation targets, external stylesheet reference, Service Worker cache manifest, and balanced CSS braces. **Functional smoke:** installment alert orange at T−4 and red at T−1 (performed on earlier loan alert code). **Deployment gate:** check GitHub Pages build and public HTML/assets after publication.

**Device QA still needed:** 360/390/430 px Android and iOS Safari, tablets, desktop ≥1024 px; light and dark, text scaling, Persian numerals, narrow multi-line amounts, keyboard open, logged-out/logged-in/offline states, PWA refresh, user isolation, screen reader and color contrast.

## Next iterative design priorities (not claimed implemented)
1. Consolidate older CSS layers after screenshots/regression tests; avoid perpetual overrides.
2. Make dashboard cards user-selectable/hideable and support layout preferences per user without altering metrics.
3. Improve recurring-bills and installment calendars, user-configurable reminders and paid-state UX.
4. Test voice-entry states across Android Chrome and iOS Safari; do not obscure browser limitations.
5. Strengthen keyboard accessibility and WCAG 2.2 AA validation on actual devices.

**Security principle:** A visual redesign must never expose financial values publicly, change Supabase tenant ownership, reset browser financial data or auto-post financial transactions.
