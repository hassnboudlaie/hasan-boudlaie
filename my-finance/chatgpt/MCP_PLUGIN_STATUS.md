# My Finance ChatGPT plugin — implementation status

## Exactly what this builds

This is the **actual ChatGPT-facing service**, not a "click to open ChatGPT" button.

Endpoint: https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/finance-chatgpt-mcp/mcp

Four MCP tools:
1. \`get_my_finance_summary\` — read 1–90-day income and expense aggregates for this user, with consent.
2. \`list_my_finance_accounts\` — only display names and currencies of this user's accounts.
3. \`propose_my_finance_entry\` — create a private finance draft. Types: expense, income and loan_given.
4. \`confirm_my_finance_entry\` — after **separate, explicit confirmation** in ChatGPT (Voice may require on-screen approval), record the transaction **directly into the private Supabase-backed My Finance account**, without changing applications. A loan is booked as a receivable, not an ordinary expense. The SQL confirmation function is atomic and retry-safe.

Other files:
- \`mcp-server/index.ts\` — deployed Deno/Supabase Edge Function, \`verify_jwt: false\` so OAuth metadata is reachable; financial tools independently verify JWT, user and approved OAuth client.
- \`mcp-commit-migration.sql\` — \`SECURITY INVOKER\` SQL with RLS, per-user client permission, and idempotent financial transaction persistence.
- \`plugin/\` — OpenAI Agent Plugins package: \`plugin.json\`, \`mcp.json\`, and a voice workflow skill.
- \`qa/mcp-smoke.mjs\` — live smoke test. Verifies health, OAuth metadata, initialize, four tools, and that unauthenticated reads **and writes** fail (HTTP 401).

## IMPORTANT: This is not yet a consumer-ready / installed connection

The endpoint and plugin package exist, but the plugin has **not** yet been installed or published in the user's ChatGPT account, so natural language/voice calls cannot yet reach this server.

**Do not prematurely enable the Supabase OAuth server on project hxcjkewlaniahvuqwwbb.** This Auth instance is shared among the My Finance, Kish and other apps. The raw Supabase API currently grants RLS ownership access for ordinary authenticated tokens; an OAuth access token issued by the same issuer may inherit those permissions for all app tables belonging to that identity. Financial tool permission checks do not automatically constrain direct REST access. OAuth scopes such as \`openid\` and \`email\` do not restrict table access.

Before enabling OAuth for ChatGPT:
- Either isolate the OAuth/identity boundary in a separate, audited issuer, or apply and test an explicit least-privilege policy for **all** the tables/storage/other APIs reachable by OAuth JWTs, without affecting normal app users.
- Check OAuth 2.1 is enabled, use asymmetric JWT signing if \`openid\` is requested, register OAuth clients or enable DCR, and map the consent path precisely to \`/my-finance/oauth-consent.html\` under the currently configured Supabase Site URL.
- The consent page must read the OAuth client ID, show the actual requesting client and scopes, require explicit grant, and bind \`finance_chatgpt_connections.oauth_client_id\`. The owner must enable \`allow_drafts\` and/or \`allow_summary\` in My Finance.
- Before pilot rollout test with **two independent test users**: sign-in and consent; no approval; rejected/expired/revoked tokens; inaccessible other user's finance drafts, transactions, profile, assets and all other apps; approve one voice transaction and verify it appears in My Finance once; deny/retry; loan received vs loan given; toman/rial conversion.
- Register via ChatGPT Plugins > + > Add custom MCP server with the deployed HTTPS URL and supported OAuth. Test in text first, then the user's Voice experience. Voice support depends on ChatGPT feature availability, account and app policy.
- Public distribution additionally requires the OpenAI plugin submission portal's domain verification, privacy policy, reviewer test credentials, account/organization verification and review approval. There is no automatic publication via this repository.

Security: do not distribute credentials or real customer data through GitHub files, prompts or tests. Existing app code still works independently.

Official docs:
- https://developers.openai.com/api/docs/guides/custom-mcp-server
- https://developers.openai.com/plugins/build/plugins
- https://supabase.com/docs/guides/auth/oauth-server/token-security
- https://supabase.com/docs/guides/ai-tools/byo-mcp
