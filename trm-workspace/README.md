# TRM Workspace · مدیریت روابط با استعداد

An independent Persian-first, RTL, installable Progressive Web App based conceptually on Armin Trost's **Talent Relationship Management** (Springer, 2014). This is not an official Armin Trost or Springer product. The implementation, explanatory text, and artwork are original.

## Real operational scope

- **Multi-tenant organizations:** create an organization, owner login, email-bound invitations, role-based access, tenant-scoped candidates, tasks and reports.
- **Talent Pool:** create, edit, view and delete candidates; contact, career information, priority A/B/C + supporting evidence, opt-out, future interest, stages, filters, CSV import/export.
- **Relationship actions:** personal contact activities, due dates, outcomes, a living timeline, reminders, ownership and completion.
- **Strategic roles:** key/bottleneck positions, score-based portfolio, future demand, workforce-planning inputs and skill gap analysis.
- **EVP Studio:** authentic strengths, target-group preferences, competitive differentiation, supporting stories and outreach messages.
- **Active sourcing:** source tracking and employee referrals, not auto-scraping.
- **Candidate Experience:** speed, transparency, personal appreciation; survey aggregation only with sample size >= 3.
- **Manager reporting:** real counts, follow-ups, role risks, stage/source distribution and editable illustrative HCVA calculation.
- **PWA installation:** unique identity, cache namespace, responsive phone/desktop UI, offline cache of public shell assets only (never candidate API responses).

## Quick start

Python 3.11+ recommended.

```sh
pip install -r requirements.txt
python icon_gen.py
uvicorn main:app --reload
```

Open http://127.0.0.1:8000 in your browser. The default SQLite file stores pilot data locally, ideal for functional tests. Real multi-user deployment should use a **persistent PostgreSQL database**, TLS/HTTPS, backups and a documented privacy/retention policy.

## Production environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Dedicated PostgreSQL connection string; required for durable production deployment |
| `COOKIE_SECURE` | Set `true` behind HTTPS |
| `PORT` | Assigned by hosting platform; run server with `--port ${PORT:-8000}` |

Example start command:

`uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`

Use a process supervisor with persistent database. This service must have its own hostname and authentication. Do **not** deploy under another app's PWA scope or share its candidate database.

## Checks

`pytest -q tests/test_app.py`

The included tests verify creation/login, real persistence, candidate CRUD, team role permissions and **two-organization cross-tenant isolation**. Deployment should also complete manual security/privacy acceptance, browser installability checks on actual Android/iPhone, backups, load tests, and a data-processing agreement before an enterprise-wide rollout.

## Important limitations

- This is a **pilot implementation**, not an audited, certified enterprise HR product. Some enterprise controls (SSO, data subject self-service requests, email delivery, enterprise activity monitoring, fine-grained row permissions, comprehensive import deduplication, breach response and DR, password recovery) require future work.
- Invitations create links for an admin to share privately; no email is actually sent without an email integration.
- Candidate surveys are recorded by HR users; a public anonymous questionnaire is not built yet.
- ROI reports must not substitute observed business impacts for user-specified assumptions.
- For security, avoid real employee or applicant PII in public staging environments until GDPR/other applicable privacy controls have been validated.

## Reference

Trost, A. (2014). *Talent Relationship Management: Competitive Recruiting Strategies in Times of Talent Shortage.* Springer. ISBN 978-3-642-54557-3. This app interprets core concepts from chapters 3–9; it does not reproduce the original book.