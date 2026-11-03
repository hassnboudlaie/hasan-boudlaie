# My Finance — ChatGPT bridge (November 2026)

## Current status

Implemented and deployed:
- Two separate Supabase tables with per-user RLS: `finance_chatgpt_connections` and `finance_chatgpt_drafts`.
- An authenticated Supabase Edge endpoint: `finance-chatgpt-api` (JWT verification enabled).
- Per-user permission switches in the PWA (summary vs. create-review-draft).
- A private review inbox and signed-in deep link `#chatgpt-draft=<uuid>`. Saving still requires human confirmation in the existing transaction/receivable editor.
- OAuth consent page `/my-finance/oauth-consent.html` and a machine-readable OpenAPI schema at `/my-finance/chatgpt/openapi.json`.

## IMPORTANT: Connection status

**A native personal ChatGPT account is NOT connected yet.** These are backend and frontend preparations, not proof of working ChatGPT account linking.

ChatGPT custom full-MCP write connections are currently limited by ChatGPT plan/workspace permissions. Personal Free/Go/Plus/Pro users cannot universally attach this new API to ordinary ChatGPT chats; new personal custom-GPT creation is also unavailable. Avoid representing “Open ChatGPT” as an authenticated connection.

**Do not enable the Supabase OAuth Server on the shared project yet.** Existing RLS on `finance_entries`, `finance_objects`, `finance_profiles` and other app tables generally recognizes the user's Supabase JWT, not the OAuth client. As a result, enabling an OAuth client against the shared Auth issuer could let its token call the raw Supabase REST APIs outside the narrowly scoped finance bridge. An independent OAuth issuer or a thoroughly audited, least-privilege RLS model across all shared apps is a prerequisite for safe production ChatGPT OAuth.

No secret keys or passwords must be entered in public GitHub Pages. Keep the new bridge disabled by default. Do not ask other testers to use OAuth until the isolation audit is complete.

## Safe API contract (for a later approved client)

- `GET /status`: reports the user's server-side opt-in.
- `GET /summary?days=30`: returns grouped totals, not raw transaction details.
- `POST /draft`: supports `expense`, `income`, `loan_given`; creates a reviewable draft only. `loan_given` is a receivable, never an expense.
- Every call requires a verified Supabase Auth token, an active My Finance account, server-side permission, and a client ID matching the user's consented OAuth client.
- There is no endpoint that commits financial entries.

## Verification required before declaring a full connection

1. Separate or fully scope OAuth permissions in the shared Supabase project.
2. Enable and configure Supabase OAuth 2.1 safely, with exact redirect URI and the current hosted consent path.
3. Register an approved ChatGPT client in an eligible workspace/product. Provide the OpenAPI schema or approved MCP tools.
4. Test two different accounts (A/B): valid credentials, declined consent, revoked consent, cross-user draft URL, repeat request idempotency, and reading only the intended user's financial data.
5. Confirm a draft opened from ChatGPT in the installed PWA is **not** a transaction until the user presses confirm.
6. Recheck GitHub Pages and mobile PWA regressions.

This bridge is separate from the older manual ChatGPT copy/paste fallback and the existing finance voice pairing mechanism.
