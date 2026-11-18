# Saba Naft — AI Coach Backend Selection

**Preferred Free Pilot (Cloudflare):** See [Cloudflare Workers AI + D1 deployment and security runbook](cloudflare/README.md). That path needs no OpenAI API key and leaves all existing Supabase projects untouched. The same original GitHub Pages app is used. The public endpoint remains deliberately BLANK until a real Worker is deployed and E2E-tested.

**Alternative future Supabase backend:** The archived instructions below describe the original isolated Supabase + OpenAI path; they are not the chosen pilot and have NOT been deployed. No old Supabase projects have been migrated or deleted.

---

# صبا نفت — Live Leadership AI Coach (secure activation)

**Status: source ready / NOT DEPLOYED.** The sole canonical production app remains
https://hassnboudlaie.github.io/hasan-boudlaie/sabanaft/app/

## Architecture

- Public GitHub Pages PWA: `app/leadership-ai-coach.js`, `leadership-ai-coach.css`, and `ai-config.js`.
- A companion is visible across Home, nine learning sessions, lesson reader, 10-step Journey, Leadership Studio (within the app), reflection/context and Passport.
- When no backend is available, only **clearly labeled rule-based educational guidance** is returned. It does not pretend to evaluate writing with a model.
- Authenticated HTTP POST to a **dedicated Supabase project**, `/functions/v1/leadership-coach`, with signed-in user JWT.
- Edge Function verifies user via Auth, requires `app_metadata.saba_naft_approved=true`, reserves database quota and calls OpenAI **Responses API** with `store:false`. Prompts and answers are not persisted in the Saba database.
- Server returns context-aware guidance, writing feedback, reflective questions and next actions. Every AI call requires an explicit request and processing consent.
- In competitive Journey, the AI is not given correct choices, points or answer rationales. It must never reveal a correct answer before completion.
- AI is *not* an official performance evaluation, psychometric instrument or supervisor approval.

## Remaining secure activation (requires admin setup)

1. Choose the Supabase organization, approve any quoted project charge and **create a new project** (not My Finance, Behparvar or any other client's project).
2. In Authentication: disable public sign-ups, enable invite-only employee accounts (email/password or enterprise SSO if implemented separately). Set a documented privacy and retention policy; use fictitious/de-identified cases until organization approval.
3. Apply `supabase/leadership-ai-quota.sql` in the **new** project. Check RLS, RPC 12 requests/hour and 50/day, anonymous denial and Security Advisors.
4. For each approved employee, administrator must set `app_metadata.saba_naft_approved=true` using the Supabase Admin API. `user_metadata` is not sufficient for authorization. Do not approve all registered accounts automatically.
5. Deploy `supabase/functions/leadership-coach/index.ts` as Edge Function `leadership-coach` with **JWT verification enabled**.
6. Set **`OPENAI_API_KEY` only in Supabase Edge Function Secrets**, never in GitHub, browser code or chat. Optionally set `SABA_AI_MODEL=gpt-6.1-sol` (availability and billing should be verified for your API project).
7. Edit public `app/ai-config.js` to the dedicated `https://<project-ref>.supabase.co/functions/v1/leadership-coach` and a **publishable** client key. These are public configuration; service-role and OpenAI secrets remain server-only.
8. End-to-end verify email/password login, refresh, 401/403 denial, cost and quota enforcement, CORS, mobile interaction, writing review quality, cross-route context and response latency. Only then merge/release as an authenticated Live service.

## API request

```json
{
  "mode":"review",
  "question":"آیا این متن با معیارهای مرحله سازگار است؟",
  "draft":"متن غیرمحرمانه کاربر",
  "context":{"area":"journey","stageNumber":3,"title":"...","framework":"...","assessmentMode":"competitive_locked","criteria":["..."]},
  "history":[],
  "consent":true
}
```

Request headers: `Authorization: Bearer <user-jwt>`, `apikey: <publishable-key>`, `Content-Type: application/json`.

Response: `{"answer":"...","source":"ai" }`.

## Security / limitations

- The browser's login token is held in `sessionStorage` only (clears when browser session ends); do not show passwords or tokens in logs.
- Server enforces an allowlisted origin but **CORS is not an authentication mechanism**. User JWT verification + admin app_metadata and quota are mandatory.
- Prompt inputs are untrusted. Treat AI judgments as formative feedback only, and apply human review to organizational risk decisions.
- `store:false` disables provider-side response storage for the request but is not a blanket claim about all service-provider retention terms. Validate organizational data policy and vendor terms.
- No voice Realtime API, no model fine-tuning, no autonomous HR decision and no multi-device transcript sync in this release.
- No AI secret exists in this repository. **Do not mark Live AI operational until the endpoint is deployed, the model responds and the user login succeeds.**

## Regression

`node sabanaft/verify-ai-companion.cjs` (needs jsdom@26.1.0, same as existing Saba regression workflow).
The code is versioned in the existing Saba repo; no duplicate standalone app.
