
> **Current decision: FREE ONLY (2026-11-03).** The Supabase architecture below is retained as an optional future paid-enterprise architecture, but it is NOT the selected deployment route. Go instead to [Firebase Spark free setup](../firebase/README.md). Nothing in this Supabase directory is deployed.

# TRM Enterprise AI Agent — Deployment & Acceptance
**Status (2026-11-03): code complete for the guarded AI drafting pathway; NOT deployed or production-verified.**

## Decision model
Armin Trost, *Talent Relationship Management* (Springer, 2014; DOI 10.1007/978-3-642-54557-3), used as primary scientific basis. This is an independently authored, limited implementation; not an official publisher product.

- Ch. 3 / Figs. 3.1, 3.3: *talent-first* long-term CRM logic, independent from a current vacancy.
- Ch. 4 / Figs. 4.1, 4.4, 4.5, 4.7: strategic role priorities, bottlenecks, critical incidents, compensable gaps and workforce demand.
- Ch. 5 / Figs. 5.3, 5.6: EVP = real employer strengths × target-group preferences × differentiation from labor market competitors; evidence or Signature Experiences.
- Ch. 6: sourcing through referrals, professional communities, campus and scouting with line involvement.
- Ch. 7 / Fig. 7.1: retention as a continuous documented cycle akin to B2B CRM; no dead-end CV databases.
- Ch. 8: speed, transparency, appreciation.
- Ch. 9: leadership sponsorship, organizational capabilities, IT and monetary benefit.

## Architecture
```
GitHub Pages /trm-workspace/ (public UI; local draft pilot)
  ├─ decision-engine.js              deterministic Trost guidance / offline
  ├─ cloud-agent-client.js           opt-in auth and minimal AI request
  ├─ agent-config.js                 public URL + publishable key ONLY, disabled by default
  └─ app.js                          human-approved task planner and vacancy workflows
                         [user access JWT]
                                  ↓
DEDICATED TRM Supabase project (not My Finance)
  ├─ Supabase Auth + trm_memberships RLS
  ├─ trm_roles, trm_vacancies, trm_evps, trm_talents, trm_activities
  ├─ trm_ai_audit with atomic 12-requests/day/org quota slots
  └─ Edge Function /functions/v1/trm-agent
          └─ server-only OPENAI_API_KEY -> Responses API (store:false, structured JSON)
```

**Trust boundaries**
1. Browser has only a public publishable key and a per-user JWT kept in memory; no OpenAI key or Supabase secret key.
2. Gateway JWT validation stays on. Edge function separately verifies the caller with Supabase Auth and an **active organization membership**, then checks allowed Origin and limits body size.
3. Payload explicitly avoids named candidates, CVs, emails, phone numbers, protected traits and raw relationship notes. Role, EVP and vacancy text still require the user's manual sanitization/consent before sharing.
4. Provider input treats organization data as untrusted, not as instructions. Ch/figure citations are overwritten from a server-side validated reference map.
5. Draft responses create **no** vacancy updates, contacts, emails or hiring decisions. The user must explicitly approve proposed task creation, after which it saves only to the current local pilot workbench.
6. No client is granted permission to create memberships or audit events. Candidate data is visible only to owner/admin/recruiter through RLS, even if a user is signed in.
7. Future cloud synchronization must use explicit import comparison and human approval. Currently no automatic sync.

## Activation — needs owner to select a NEW dedicated project
1. Obtain owner's explicit choice of Supabase organization and confirm any quoted project cost. **Do not deploy into either existing Finance project.**
2. Create `TRM Enterprise` in a suitable supported region (e.g. EU region if governance requires).
3. Run and review SQL in `migrations/20261103_trm_enterprise_schema.sql`; use the actual Supabase CLI/migration tool and record its migration in source control.
4. In Authentication, enable the selected login methods and proper verified sender/SMTP as needed. Avoid bypassing email verification for actual enterprise HR data.
5. Create a verified admin user, then bootstrap a new `trm_orgs` row and `trm_memberships` owner row using the SQL editor with administrative permissions. Memberships must never be client writable.
6. Add function secrets: `OPENAI_API_KEY` (server-only), `OPENAI_MODEL`, `TRM_ALLOWED_ORIGIN=https://hassnboudlaie.github.io`. Supabase URL and project API keys are provisioned by the platform. Set account-level OpenAI spend limits.
7. Deploy `trm-agent` with `verify_jwt=true`; validate no unidentified callers can invoke it.
8. Update `/trm-workspace/agent-config.js` with **the NEW project's** URL and publishable key and change `enabled:true`. Never edit shared Finance config.
9. Login from the UI, choose the accessible organization, run analyses. Verify every suggested action remains uncommitted until user approval.
10. Validate financial/credit usage, source references and audit events. Enable production only after the acceptance gates pass.

```toml
# trm-workspace/agent/supabase/config.toml
[functions.trm-agent]
verify_jwt = true
```

## End-to-end security and use-case acceptance
- [ ] Two independent orgs and two users: cross-tenant reads and writes return 403/zero rows.
- [ ] Signed-out visitor, expired token, mismatched issuer, suspended member, viewer: restricted functions reject.
- [ ] Valid recruiter/manager belonging to org may request AI coaching, but cannot access other org's data.
- [ ] User cannot insert a membership, grant own role, modify audit, or view restricted talent records.
- [ ] Candidate opt-out: no automatic contact; UI and server record and enforce status.
- [ ] 13th AI request in one UTC day for the same org blocked with 429, including concurrent calls.
- [ ] Personal names, emails and phone numbers rejected/removed from AI inputs; no prompts/CVs appear in audit logs.
- [ ] No unsupported EVP claim allowed without evidence; all model citations map to the relevant book chapters/figures.
- [ ] AI draft never sends email, changes vacancy stage, scores or rejects a candidate, or creates a task automatically.
- [ ] User explicitly approves tasks, assigns owners/due dates, and sees their status in CRM workbench.
- [ ] User can export/delete their data as required under the organization's privacy and legal policies.
- [ ] Backup/restore, migration and conflict tests pass in a separate preproduction environment.
- [ ] End-to-end browser acceptance in desktop and mobile: role -> EVP -> sourcing -> talent relationship -> vacancy -> human-approved actions -> candidate experience -> report.

## Known limitations of the current public deployment
- The public TRM app is a **local-first pilot**, with no shared login or cloud database.
- The AI credentials widget can help the owner establish an API key but does not place it in Supabase secrets automatically.
- The Edge Function, schema, Auth and RLS are written but not deployed to a dedicated Supabase project.
- The cloud client only sends a sanitized *snapshot* for coaching; organization collaboration and cloud sync are not enabled.
- It is not safe to use the pilot with confidential real-world candidate records.
- Existing in-browser data is left intact and is not automatically uploaded. Versioned JSON backup remains the supported transfer path for test data.
- GitHub Actions syntax, unit and browser tests are configured; production network tests require the dedicated project and an OpenAI key.

## No-risk local validation
```sh
node --check trm-workspace/app.js
node --check trm-workspace/decision-engine.js
node --check trm-workspace/cloud-agent-client.js
node trm-workspace/tests/decision-engine.test.cjs
node trm-workspace/tests/agent-safety.test.cjs
```
Run the `TRM Workspace regression` GitHub Actions workflow for real Chromium desktop/mobile tests.
