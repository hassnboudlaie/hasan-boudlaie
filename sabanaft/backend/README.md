# Saba Naft — secure AI integration (source only; not deployed)

This directory is an implementation-ready **separate-service foundation**. The public GitHub Pages pilot has no authenticated backend and **cannot safely hold an OpenAI API key**. The source in this directory is not a live AI service.

## Required before activation

1. Obtain approval for costs and create a **dedicated Saba Naft Supabase project**. Do not add this schema/function to My Finance or another app's existing Supabase project.
2. Enable invite-only authenticated users and a documented privacy notice, deletion/retention process, and appropriate contracts for any real company data. Do not allow confidential real cases in the public demo.
3. Apply \`leadership-ai-quota.sql\` to the dedicated project, verify RLS, RPC grants, rate limit and anonymous denial. Run Security Advisors.
4. Deploy \`functions/leadership-coach/index.ts\` with JWT verification **enabled**, set \`OPENAI_API_KEY\` as a server-side function secret, optionally set \`OPENAI_MODEL\`. Never commit a secret.
5. Wire the new app-only auth session layer so the browser obtains a *user* access token. Keep an allowlisted function URL in public config. Do not store user tokens in URL or transmit them to ChatGPT.
6. Validate CORS, JWT expiration, rate limit, no user cross-access, zero key leakage, no confidential content in logs, inability to bypass security via client code, and answer quality with unsafe/uncertain prompts.
7. Only after E2E passed, enable the in-app AI Coach button. If any gate fails, leave it disabled and show the rule-based guidance or optional copy-to-ChatGPT flow.

## Backend contract

POST \`/functions/v1/leadership-coach\`, with \`Authorization: Bearer <signed-in-user-jwt>\`, \`apikey: <publishable-key>\`, JSON:

\`\`\`json
{"situation":"فرضی و بدون اطلاعات محرمانه","context":"project","urgency":"normal","issue":"clarity","consent":true}
\`\`\`

Successful JSON: \`{"answer":"...","source":"AI-generated coaching guidance; user decision required"}\`.

Never expose a service-role/secret key in browser code. Responses are generated with \`store:false\`. Quota is 12 user calls/hour (cost-control starting point; admin can adjust after testing). Genuine booking, calendar slots, payment, company reporting, and secure user data persistence are **separate** requirements, not delivered by this endpoint.
