# OB | MBA Classroom — Allameh Tabataba’i University

Independent GitHub Pages PWA in the main HB Hub repository.

## Scope
- RTL, mobile-first Executive Premium design; optional dark theme.
- 16 blank 3-hour sessions. **No course syllabus is pre-populated.** The instructor supplies content later.
- Local classroom prototype: lesson authoring and publish toggle, slides, case, quiz, poll, attendance code with teacher confirmation, group cards, weights/grades, projector display, student feedback tracking.
- Classroom projector uses Persian-only interface copy; academic English terminology may be present in teacher-supplied content.
- Standalone PWA manifest and scope-limited service worker.
- Indexed under HB Hub and the applications catalog.

## Guest access — November 2026

The entrance provides a Guest role with two fields (first name and family name), no guest code or invitation. Submission creates a server-backed pending request on the visitor device; the authenticated instructor can approve, reject or revoke access from the attendance dashboard, across devices. Only approved guests can preview published educational content; they cannot submit official attendance, access student grades or private submissions, or use instructor tools. Guest sessions expire after 30 days. Requests are rate-limited and legacy guest-code records are retained only for historical compatibility.

The guest registration and approval system is server-backed; the lesson editor, local quiz experiments and other demo features still run in the browser. Public GitHub Pages assets are not private course content.

## Important security & capability boundary
This is a browser-local demonstration shell, **not a production LMS**.
Student entry and attendance now use a separate server-backed enrollment/approval service. Guest registration and approval are also server-backed. Other components remain demo-only: no shared realtime poll, no central content authoring or secure full LMS gradebook, and no protected anonymous feedback.
The role switcher is for preview only and is not access control. Local data is not safe for real student data. Never enter identifying student names, credentials, or real grades in this public demo.
Do not use a public GitHub static page to store secrets or student data.
A separate authenticated backend with robust access control and RLS must be provisioned and tested before admitting real students.

## Next steps
1. Confirm the standalone frontend and Hub card work.
2. Provision a **new, isolated** backend (do not modify My Finance or unrelated Supabase projects); securely configure authenticated invitations, course-specific roles and roster, row-level policies and access logs.
3. Test live collaboration, attendance and grades on separate devices before real use.
4. Instructor supplies the exact session content incrementally; do not auto-generate 16 weekly topics.
