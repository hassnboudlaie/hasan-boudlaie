# TRM Workspace — نسخه اجرایی آزمایشی 2.1

## مبنای علمی
Armin Trost (2014), *Talent Relationship Management: Competitive Recruiting Strategies in Times of Talent Shortage*, Springer, 10 chapters. All content in the application is an **original practical adaptation** and not the publisher's or author's official application.

## Workflow
1. نقش‌های کلیدی و گلوگاهی: انتخاب ۸ نمونه، استراتژی، سه معیار پرتفوی، برنامه نیروی کار، چالش بحرانی، گروه هدف، شکاف قابل جبران.
2. پیشنهاد ارزش کارفرما (EVP): شش خانواده ارزش، تناسب سه‌گانه، شواهد واقعی و پیام اختصاصی.
3. منبع‌یابی فعال: هفت کانال، مثال، هدف، مالک، موعد، برنامه ثبت‌شونده.
4. بانک استعدادها: اطلاعات پایه، وضعیت رابطه، اولویت A/B/C مبتنی بر شواهد، رضایت و ترجیحات.
5. حفظ رابطه: شش اقدام پیشنهادی، ثبت رابطه و تاریخ پیگیری، گزارش معوق‌ها.
6. تجربه نامزد: ثبت نقاط تماس و تعهد پاسخ، پنج متن پیشنهادی با قابلیت شخصی‌سازی، ثبت بازخورد سرعت/شفافیت/احترام.
7. داشبورد و ROI: سناریوی اختیاری HCVA/ROI و شاخص‌های حاصل از داده‌های ثبت‌شده.
8. برنامه استقرار TRM: ۱۴ اقدام ۸ هفته‌ای با چک‌لیست ذخیره‌شونده.
9. «کتاب در عمل»: نگاشت تمام ده فصل به ابزارها و پرسش‌های تصمیم.

## Delivery and limitations
- PWA GitHub Pages and separate Android WebView pilot package (`org.hb.trmworkspace`) are stand-alone from all other organizational apps.
- This is a **single-device local-first pilot**, not multi-tenant enterprise SaaS. No automatic account synchronization, access controls, remote backups, multi-user collaboration or cloud audit trail.
- The Android APK accesses the online PWA and needs internet to start. Local data within the Android app is isolated from Chrome's PWA localStorage. Backups do not transfer automatically: create a JSON export and import on the destination platform.
- Do not use with real sensitive candidate records until proper enterprise authentication, database encryption, organization isolation and privacy controls are deployed and independently tested.
- A debug-signed pilot APK is installable for testing, but not for Play Store production distribution. For long-term Android updates, a stable production signing key is required.

## Tests
- Headless Chromium multi-step flow: choose role template, save workforce assumptions, create EVP draft, save sourcing plan, register consented test candidate, retention follow-up, candidate experience reply promise, roadmap checklist, finance assumptions, export JSON, and inspect all 10 playbook chapters.
- Native APK build through GitHub Actions must be confirmed separately; do not claim install is verified before the build succeeds.
## Revision 3.0 · 2026-11-03 — Trost × CRM × Decision Support
- CRM-inspired focused home page, four action tiles, clean next-step display, and stable mobile navigation.
- Vacancies stage board: `open / plan / active / filled / closed`; persistent vacancy records linked to role ID, owner, rationale and target date.
- Explainable `decision-engine.js`: four analysis tools (critical-role assessment, evidence-led EVP review, vacancy activation plan and consent-aware relationship next actions).
- EVP wizard now offers an additional "ممیزی EVP" review; missing evidence and signature stories are visible before publication.
- Outputs disclose Trost chapter basis, readiness, missing evidence and suggested next steps; no model-based candidate ranking or automatic contact.
- Analytics results stored locally with a bounded history (40).
- Independent tests and an Actions regression workflow added.
- **Important:** decision engine runs deterministic logic locally; it is *not* a live generative AI Agent. A protected organization backend, verified auth, isolation, privacy controls and server-only model provider integration remain prerequisites.
- Audited roadmap: `docs/TRM-ARCHITECTURE-AUDIT-20261103.md`. Existing browser storage key and legacy records retained. No other application was modified.

## Revision 3.2.1 · secure AI delivery boundary
- Added cloud agent **connection pathway** with Supabase Auth/membership checks and fully server-side OpenAI Responses API design. Public config remains disabled pending dedicated infrastructure.
- Kept the deterministic Trost decision engine usable in offline pilot mode; normalized role Critical Incident, EVP and competence-gap fields.
- Added CRM operational action center, with task owner/status/due date and **explicit approval** gate for suggestions. No auto-mail, no auto-hiring.
- Added dedicated multi-tenant SQL schema, restrictive RLS, atomic daily AI quota and audit-only recording of metadata.
- GitHub Actions workflow includes unit/safety checks, Deno typecheck and real Chromium desktop/mobile end-to-end tests; completion status of CI and enterprise backend deployment must be confirmed independently.
- Clear activation/acceptance guide: `agent/README.md`.

## 2026-11-03 — Cost policy updated: FREE ONLY
- Supabase free project creation failed because the account has already reached its 2 active free project limit. **No existing Supabase project has been modified, paused, upgraded or deleted.**
- **Selected zero-cost path:** Firebase **Spark** (independent) + Firestore/Auth/App Check + Firebase AI Logic with Gemini Developer API Free Tier.
- Implementation committed: `agent/firebase/firestore.rules`, `firebase-free-client.js`, `agent-config.js`, and opt-in structure-only synchronization in the existing TRM app. See `agent/firebase/README.md` for activation steps.
- Public Firebase provider is **disabled** until a dedicated Spark project is created and its App Check config supplied. Cloud sync and generative AI are **not yet live**.
- Only role, EVP, vacancy and action records can be manually synchronized; no candidate profiles, CVs, contact histories or identifying data. Use fictional, nonconfidential inputs for Gemini free tier.
- The prior Supabase Edge Function and SQL migration remain **alternative, undeployed code**, not an active recommendation, and may require a paid plan.
