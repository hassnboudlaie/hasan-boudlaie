# TRM Enterprise — independent $0 Firebase Spark pilot

**Status:** implementation committed in this repository; **not yet activated**. Independent Firebase project creation, Firestore Rules deployment and App Check activation require the project owner's Firebase connection. No Supabase project was paused or modified and no paid plan was purchased.

## Why Firebase for the zero-cost requirement?
- Spark Plan supports Auth (email/password under free quota), Cloud Firestore and the Firebase AI Logic Gemini Developer API **free tier**.
- No credit card/payment method needed for ordinary Spark setup. The project must remain on Spark, *not* Blaze.
- Default quota caps cause services to stop or return limits instead of silently purchasing additional capacity. Free tier availability/model/rates may change.
- Free-tier Gemini Developer API inputs **may be used to improve Google products**. Never send real candidate data, CVs, names, sensitive HR records, confidential company strategy or client data to Gemini.

## Free deployment setup
1. Open https://console.firebase.google.com/ or connect the Firebase plugin and create a **new Firebase project**, e.g. `TRM Enterprise Free`. Choose **Spark (free)**, **no billing account**, and keep it separate from My Finance.
2. Register a **Web App**, with authorized Auth domain `hassnboudlaie.github.io`.
3. Enable **Authentication > Email/Password**, create the intended owner user, verify the address, and set relevant Auth protections.
4. Enable **Cloud Firestore** in a suitable European region if the project's privacy requirements call for EU residency. Paste and publish `agent/firebase/firestore.rules`. The security rules intentionally allow no client-side creation of organizations/memberships.
5. In Firestore Console (trusted admin UI, never client), create:
   `trm_orgs/demo-org` → `{ name: "TRM Sandbox", createdAt: <timestamp> }`
   `trm_user_orgs/<actual_firebase_auth_uid>/orgs/demo-org` → `{ role: "owner", status: "active" }`
   Only test accounts should be added before a privacy/compliance audit. Avoid putting real candidates in the app.
6. Open **AI Services > AI Logic**, choose **Gemini Developer API**, accept the setup. Keep the project on Spark and select a model with Free-tier support (e.g. `gemini-2.5-flash-lite`, subject to provider availability).
7. Configure **App Check** for Web production with reCAPTCHA v3, register `hassnboudlaie.github.io` as an allowed domain and add a site key. Enforce App Check on AI Logic (provider setup may enforce it automatically). **Do not use a debug App Check token in production.**
8. In public `trm-workspace/agent-config.js`, set `enabled:true`, the exact Web App `firebase` config fields and the **public reCAPTCHA site key**. Firebase web config is not an admin secret. Never include Gemini raw API key or service-account credentials in the website.
9. In the TRM app's **Decision Coach** log in with the Firebase email/password; membership must load. Go to Settings to opt in to role/EVP/vacancy/task sync, and verify the uploaded records using Firestore Console.
10. Perform the full security acceptance tests below before inviting other users.

## Architecture
```
Public GitHub Pages PWA: /hasan-boudlaie/trm-workspace/
  ├─ deterministic offline Trost engine
  ├─ Firebase Auth + App Check, enabled only after owner setup
  ├─ Firebase Firestore: per-org structural records
  │    ├─ trm_orgs/{orgId}/{roles|vacancies|evps|tasks}/{recordId}
  │    └─ trm_user_orgs/{userId}/orgs/{orgId} [admin bootstrap only]
  ├─ Firebase AI Logic client SDK -> protected Firebase proxy -> Gemini Free Tier
  └─ Human approval -> Next Best Actions (local task planner)
```
**Candidate PII, interaction histories, talent exports and person profiles are deliberately excluded from both AI and cloud sync.** The existing local pilot still holds these on the device. For actual enterprise candidate workflows, governance/retention/DSAR and security work is required; this architecture is **not production-ready for personal HR records**.

### Workflow in current UI
- Roles -> Trost-based strategic and bottleneck roles, critical incidents, target groups
- EVP -> real employer strengths, verified preferences, competitor evidence, signature experience
- Vacancies -> pipeline and activation
- Decision Coach -> deterministic answer anytime; optional Gemini analysis only after Firebase login
- Action Center -> explicit human approval for turning suggested actions into tasks
- Settings -> explicit cloud sync of structural records only, no automatic upload and no candidate PII

## Security acceptance gates
- [ ] Two test organizations and two test users; signed-out reads/writes fail.
- [ ] Suspended user and another-org user cannot access either org's documents, by direct Firestore SDK and REST.
- [ ] Viewer/manager cannot write. Owner/admin/recruiter can write ONLY allowed structural collections.
- [ ] Client cannot create or modify own membership, organization document or other user's membership.
- [ ] App Check rejects requests not from an attested allowed domain; Firebase Auth domain restricted.
- [ ] No candidate records/contacts/talent lists or email addresses are sent to AI.
- [ ] No auto-hiring or any AI-based suitability ranking.
- [ ] Zero billing account attached; no upgrade to Blaze; over-quota behaviour shown as non-destructive failure.
- [ ] Cloud import merges new records and never overwrites local records with matching IDs.
- [ ] One privacy/retention assessment and E2E tests passed before real personal HR records.

## Important limitations
- Spark project **has not been created/connected** (Firebase plugin/Console owner action needed).
- App Check and Firestore security rules not deployed, so cloud sync and Gemini are disabled.
- Free AI service may use data to improve Google's products; use **synthetic, non-confidential role scenarios** only.
- The browser's localStorage remains local, per-device. Cloud syncing is opt-in for structural records, not full multi-user HR.
- Role/EVP/vacancy/task sync uses *upsert*: last-writer wins on a shared record. Do not use for simultaneous production team edits without conflict handling.
- Models, free quotas and hosting conditions can change; reverify before provisioning.

Official docs:
- https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- https://firebase.google.com/docs/ai-logic/pricing?api=dev
- https://firebase.google.com/docs/ai-logic/get-started?platform=web
- https://firebase.google.com/docs/ai-logic/app-check
- https://ai.google.dev/gemini-api/docs/pricing
