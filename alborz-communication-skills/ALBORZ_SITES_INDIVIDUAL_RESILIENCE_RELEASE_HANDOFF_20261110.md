# Alborz Insurance — Individual Resilience Hotfix Handoff
**Date:** 2026-11-10  
**Deployment state:** NOT DEPLOYED TO CHATGPT SITES  
**Authoritative owner-private site:** `appgprj_6ad75d10095c8191bdf2cdacb2bdfccd`  
**Live:** https://hasan-private-apps.hasanboudlaie.chatgpt.site/apps/alborz-communication-academy/  
**Target source:** `private-src/alborz-communication-academy/`  
**Module:** `resilience-workshop`

## Scope and baseline

This branch is an implementation-ready **reference patch against the accessible historical public source** in `alborz-communication-skills/classroom-flow.js`. It does **not** claim byte-for-byte equivalence to current private Sites source. Do not merge this branch into the public default branch as a substitute for Sites deployment.

The 11-step class sequencing and existing field keys, IDs, teacher actions, role checks, saved group records, capacity logic, and multi-device synchronization were not replaced. The patch operates only on the loaded workshop catalog and classroom UI in the historical module.

## Implemented

1. Aligned camel, salmon, chameleon, octopus to individual adaptation; distinguished changing the core personal method from an independent new learning path.
2. Four scenario-specific incidents, facts, available actions, recovery techniques, action cards, critical events, and short dialogues. All focused on claims adjusters.
3. Three oral discussion questions on step four, each with an expandable summary titled exactly **پاسخ پیشنهادی**; no compulsory written answers.
4. Preserved step three group consensus and representative-submitted mission choice, and step four one-tap **این گام را انجام دادیم**.
5. Replaced 10 classroom test prompts with individual-level decision scenarios and per-option explanations.
6. Kept the scientific caveat: this is an educational individual-level analogy of Kurt Verweire's organizational framework, NOT a validated resilience psychometric model.
7. Updated classroom self-assessment wording and role-play analysis in this classroom flow. English-only technical notes are not displayed as user-facing training text.

## Not implemented / release blockers

- No authenticated edit, rebuild, or deployment of owner-private Sites is available in this conversation.
- No live browser test against the protected Site was possible.
- Separate standalone **anger management** and **assertiveness** course modules outside this classroom JS have NOT been modified. Their content still needs a scoped individual-resilience review inside the private Site.
- National-ID registration route is present in connected Supabase `cymatyfnwuxikrghydrn`, Edge Function `alborz-workshop-sync` version 18. At audit: 0 national registrations and 0 national sessions, 50 legacy PIN entries. Do not delete the PIN fallback until two distinct legitimate users and the instructor have completed a live test.
- No national IDs, session keys, or private claims data are included in this patch or in GitHub.
- Do NOT edit My Finance, Behparvar, the communication skills course, or other applications.

## Exact private Sites execution

1. Open the owner-private source under `private-src/alborz-communication-academy/`. Locate the current equivalent of `classroom-flow.js` and inspect the **current** diff and stage map.
2. First backup/version the production code and the operational data. Reconcile only the *scoped* changes from this branch; never wholesale overwrite a newer private file.
3. Recheck that the existing `AlborzWorkshop.catalog`, `AlborzLive`, step IDs, DB field keys, and all 11 phase transitions remain compatible. If not, adapt the catalog/UI changes and reject incompatible pieces.
4. Review and align separate anger/assertiveness lessons: `Pressure -> Action within worker authority -> Recovery`. Keep their existing navigation and any working interactions.
5. Build using the private Sites project's supported build route (historical repository mentions `scripts/bundle-apps.mjs`); publish to the **same** project and URL, not GitHub Pages.
6. Clear/update the application cache as appropriate. Perform mobile tests in two user sessions and an instructor session. Do not create test attendees in production unless controlled and deletable without losing real attendance.

## Acceptance / QA matrix

| Check | Required evidence |
|---|---|
| Participant entry | Valid national ID grants stable unique seat; same ID reentry restores same seat; invalid input rejected |
| Allocation | 50 seats distributed into 10 x 5, never exceeded; concurrent enrollment safely serialized |
| Teacher | Teacher authorization recognized, sees each group's actual state; no impersonation by participant |
| Step 3 | Any group can freely select one of four missions; only one representative commits choice; no forced global order |
| Step 4 | The group's selected mission appears on each member's device; three oral questions and all three expandable **پاسخ پیشنهادی** render; a single ready button records completion |
| Progress | Teacher sees readiness and advances stage; participants advance on refresh/sync; prior answers persist |
| Content | All four strategies are individual-focused and scientifically qualified; scenarios cover pressure/action/recovery; anger/assertiveness are supportive |
| Accessibility | RTL, readable mobile type, touch targets, Read-Aloud fluency; no unnecessary method labels |
| Isolation | Communication skills, Finance, Behparvar untouched |
| Live acceptance | Actual private Sites URL shows changed texts after a verified Site deployment/version; source commit alone does **not** pass |

## Emergency rule

When class is about to begin, **preserve the working live version** if authentication or source compatibility cannot be confirmed. Use the existing PIN access path temporarily rather than disabling all access. Never display or distribute raw national IDs, hashed identities or the 50 legacy PINs in public content.

## Small sample for the standalone anger/assertiveness modules

**Anger management:** A caller says the adjuster is incompetent. Adversity: accusation and rising tension. Action: notice bodily tension, pause, keep voice steady, state verified status and a realistic next step; do not promise approval. Recovery: one minute of grounding and task reset before next case.

**Assertiveness:** A colleague pressures the adjuster to skip a required document. Adversity: interpersonal pressure and fear of conflict. Action: say “I cannot approve the file without required evidence; I can tell you exactly which document is missing and the next permissible step.” Recovery: release the defensive tension, record the action, and return attention to the following claim.

Each discussion item should use a small expandable **پاسخ پیشنهادی** and retain any existing role play and accessibility settings.
