# Saba Naft — Cloudflare Free-Tier Live AI Pilot

**Status: CODE READY / NOT LIVE** until a Cloudflare account owner creates D1 and deploys the Worker. Never represent mock tests as successful live AI responses.

## Architecture

The ONLY frontend remains https://hassnboudlaie.github.io/hasan-boudlaie/sabanaft/app/ — this backend does not create a second application.

- Cloudflare Workers API with strict allowed GitHub Pages Origin and HTTPS.
- D1 Free: stores only SHA-256 digests of individually issued, random pilot codes, user labels, expiry, revocation and quota counters; NEVER exercise text or model responses.
- Workers AI binding: Gemma 4 model @cf/google/gemma-4-26b-a4b-it. No separate OpenAI/Gemini API key.
- Each bearer code is 256 bits, individually revocable and expires in 7 days; 12 requests/hour and 50/day per user.
- Explicit per-request consent before the app sends any text. Browser sessionStorage (not persistent localStorage) holds the code during a session.
- No real organizational or sensitive data allowed in the initial test without organizational privacy and processing approval.
- Temporary bearer codes are NOT enterprise SSO; replace with formal IAM for wider deployment.

## Setup — action required from Cloudflare account owner

1. Register or sign in to https://dash.cloudflare.com/sign-up and confirm Free Workers, D1 and Workers AI are enabled. Review organizational data processing terms first.
2. On a trusted device with Node 22+ run: npx wrangler login
3. Change directory to: sabanaft/backend/cloudflare
4. Create dedicated DB: npx wrangler d1 create saba-leadership-coach-pilot
5. Replace REPLACE_WITH_D1_DATABASE_ID in wrangler.toml with the returned D1 database_id (a non-secret identifier).
6. Apply schema: npx wrangler d1 execute saba-leadership-coach-pilot --remote --file=./schema.sql
7. On a trusted machine, generate a unique private code for one participant:
   node scripts/issue-pilot-code.mjs pilot-1 "Pilot Manager" > /tmp/saba-pilot-1.sql
   The private snp_... code is printed ONCE to stderr. Share only privately with that participant. No code in GitHub, issue threads or chat.
8. Upload hashed SQL only:
   npx wrangler d1 execute saba-leadership-coach-pilot --remote --file=/tmp/saba-pilot-1.sql
   Delete the temporary SQL file. Repeat with a distinct code for each person. Revocation SQL is printed by the issue script.
9. Deploy: npx wrangler deploy
   The real URL should be similar to https://saba-leadership-coach-pilot.YOUR-SUBDOMAIN.workers.dev
10. Confirm GET /health is 200, GET /v1/session without code is 401, real code verifies, D1 and AI bindings are active.
11. ONLY AFTER the actual URL works, change the existing public frontend file sabanaft/app/ai-config.js:
   provider: "cloudflare", endpoint: "https://saba-leadership-coach-pilot.YOUR-SUBDOMAIN.workers.dev/v1/coach", publishableKey: ""
   Commit/deploy to the SAME original GitHub Pages PWA. No fictitious URL.
12. Perform real E2E tests on mobile and desktop: consent-off, wrong/expired/revoked token, context-aware response, Persian writing critique, 12/hour quota, refusal to reveal competitive answer keys, CORS and stability. Do not declare Live ready until complete.

For GitHub Actions deployment instead of local Wrangler: add secrets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the repository's Actions settings and trigger the manual workflow. Never commit tokens.

## Free tier and data protection

As of 2026-11-18, Cloudflare Workers AI Free includes 10,000 Neurons/day. Model availability and quotas may change; consult Cloudflare's live Dashboard. On Workers Free, requests stop/fail after quota, without automatically upgrading to paid services.

Cloudflare documentation states Workers AI does not use customer content for model training and standard stateless inferences have zero data retention subject to exceptions. This application deliberately disables observability and does not persist prompts/responses. Operational metadata can still exist. The organization must approve data use, supplier terms and relevant compliance before entering confidential management material.

The model is formative leadership coaching, not formal HR evaluation, psychological assessment or legal/medical guidance. The system message remains on the server; participant content is untrusted. Competitive response keys must not be exposed.

## API

GET /health — public health probe.
GET /v1/session — Bearer snp_<64 hex> in Authorization; approved, active, unexpired user.
POST /v1/coach — same Bearer and Content-Type: application/json; input fields mode, question, draft, context, history, consent:true. Source is AI, not a simulated rule engine. D1 stores no answers.

## Testing

Run with Node 22 and jsdom: node sabanaft/verify-cloudflare-coach.cjs.
CI runs mocked auth, expiry, quota, origin, consent, AI binding and browser flow. Mock tests alone DO NOT constitute Cloudflare deployment or a real AI answer.

The old Supabase scaffold is retained as a fallback, but neither personal finance project nor Alborz/Allameh project is modified.
