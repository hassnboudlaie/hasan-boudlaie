# My Finance Supabase integration

This branch contains an opt-in authenticated Supabase transaction sync module in `supabase-sync.js`.

Integration into the PWA requires adding a settings section with IDs: `supabase-sync`, `supabase-status`, `supabase-email`, `supabase-login`, `supabase-actions`, `supabase-send`, `supabase-logout`, `supabase-pull`, `supabase-push`, then loading `<script type="module" src="./supabase-sync.js"></script>` after the existing inline script.

Before deployment, test email magic-link redirect settings in Supabase Auth, ensure HTTPS site URL and allowed redirect URL, test RLS with two different user accounts, and ensure accounts and currency mapping cannot silently misattribute transactions. Do not merge or deploy without testing. The module does not enable ChatGPT voice-triggered automatic writes; that requires a separately authenticated backend action. Never publish private financial data or service-role keys.
