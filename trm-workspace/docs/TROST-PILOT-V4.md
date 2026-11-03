# TRM Workspace V4 — Trost Practical Pilot

## Purpose
One full fictional hiring case, not a full enterprise multi-tenant ATS. User can define a role, create evidence-backed EVP, select active sourcing (including social media and communities), save a fictional talent, plan Candidate Retention contact, document human assessment, keep Candidate Experience response promises, and record a human decision/report. All records stored in the **existing** localStorage workspace; the user can download backups.

## Book coverage
A new operational catalogue covers **all ten chapters and 41 chapter/subsection tools**. This is an original practical adaptation of Trost (2014), not reproduced book text. Each tool provides decision choices, example, evidence capture, owner, due date, KPI, caution and local next-step coach. There is a link from the 8-step pilot to the catalogue and the existing TRM Decision Coach.

## AI status
The existing local deterministic decision coach works. The optional Gemini cloud AI route remains **off**, because no authenticated Firebase project is configured. We do not call the local rules engine generative AI, and we do not send candidate data to any provider.

## Scope and safety
- No new backend, logins, payments or third-party integrations.
- Uses current TRM PWA ID, scope, brand icon, storage key, and independent app folder.
- Existing saved records untouched; new keys are additive (`hirePilot`, `bookPractice`).
- Pilot is **not safe for confidential real candidate files**; use fictional records.
- No automatic candidate screening, ranking, messages, or hiring.

## Smoke tests
`node trm-workspace/tests/single-hire.test.cjs` and `node trm-workspace/tests/book-workflows.test.cjs`; independent workflow `.github/workflows/trm-pilot-tests.yml`.