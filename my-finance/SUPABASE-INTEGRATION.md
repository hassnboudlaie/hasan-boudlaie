# My Finance — Supabase integration, release notes and safety

## Architecture
- Public GitHub Pages PWA under `my-finance/`; **never** commit user finance data or secret credentials.
- Browser-only Supabase **publishable** key; private data requires Supabase Auth session.
- `public.finance_entries`: expenses, income and other ledger items; `metadata` carries account association and payment attributes.
- `public.finance_objects`: accounts, transfers, receivables and recurring commitments, each associated with an authenticated `user_id`.
- RLS policies restrict rows to `auth.uid() = user_id`. Authenticated table permissions have been granted; anonymous access to `finance_objects` revoked.
- New user-specific browser storage keys `my-finance-user-<auth-user-id>`. Legacy local data are imported only with explicit one-time confirmation.

## User experience
1. Open Settings in the installed PWA and send a Supabase sign-in magic link to your own email.
2. Open that link on the same phone. Supabase Auth must allow the production GitHub Pages URL as a redirect.
3. App then automatically synchronizes authenticated data when opened, resumed, modified, and approximately every 15 seconds while open.
4. Quick-entry supports Persian-number phrases (including «یک میلیون و چهارصد هزار») and in-app voice recognition when supported by the browser.
5. Unassigned transactions are preserved and shown in totals; they do not arbitrarily change a bank balance.
6. Recurring commitments create Pending expenses on their due dates; payment confirmation is needed before deducting from an account. In-app reminders default to 7/3/1/0 days and are individually configurable.
7. Reminder notifications **when the app is closed** are not implemented without a push service.

## ChatGPT voice → database
This app cannot silently read messages from arbitrary ChatGPT conversations. An authorized ChatGPT session equipped with the **connected Supabase action** may write to `finance_entries` on the user's explicit instruction, provided the user's signed-in Supabase account is identified and verified. The PWA will then retrieve that row automatically. This exact end-to-end ChatGPT write has **not yet been tested**, because no Supabase Auth user has signed in as of initial deployment.

Do not claim this connection is live merely because Supabase login and polling work.

## QA evidence (synthetic data)
- Browser preview renders on mobile (RTL, Settings, cards, navigation, dark mode).
- Persian natural-language amount parse: 1,400,000 IRT, category «خوراک و رستوران».
- Saving a local transaction without defining an account works; balance remains unchanged; reload restores the local transaction.
- Recurring pending expense of 500,000 IRT does not change a 10,000,000 IRT account until payment is confirmed; after confirmation expense is 500,000 IRT.
- Supabase security advisor: no active findings as of 2026-10-28.
- New table authenticated SELECT/INSERT/UPDATE granted; anonymous SELECT denied; four owner-RLS policies present.

## Remaining release gates
- User completes their one-time Supabase email sign-in.
- Confirm email magic-link redirect allowlist works.
- Perform live two-user RLS isolation and user-authenticated write/read tests.
- Verify a real ChatGPT-originated financial entry appears on the same user's installed Android PWA.
- True background push notifications require a separate opt-in service.

All existing unrelated GitHub applications must remain unchanged.
