# مدیریت رفتار سازمانی MBA — Free attendance operations

## Deployment
- Frontend: GitHub Pages `ob-mba-classroom/attendance.html`.
- Isolated server backend: Supabase project `hxcjkewlaniahvuqwwbb`, Edge Function `mba-ob-attendance`.
- All attendance tables start with `mba_ob_`. None of the Finance, Alborz, Kish or Mentoring tables or functions were edited.
- Project is on an existing free Supabase organization: there is no new paid project. Shared plan quota and automatic pause risk remain.
- SQL sources: `backend/mba_ob_attendance.sql`, `mba_ob_redeem.sql`, `mba_ob_named_invites.sql`, `mba_ob_password_rotation.sql`.
- Edge source: `backend/edge-index.ts`. Private service credentials never reside in GitHub Pages.

## Instructor
1. Open the attendance page, switch to **مدرس**, enter the private one-time teacher password. Change it under **تنظیمات** after first sign-in; this revokes all prior teacher sessions.
2. Paste the roster (one full name per line) into **دعوت دانشجویان** and generate one unique 128-bit hexadecimal invitation per student. Copy or securely distribute codes; raw invitation tokens are displayed only at creation.
3. At class opening, choose the session (1–16) and duration (5/10/15/20/30 minutes). The server creates a random six-digit check-in code and stores opening/closing times in UTC.
4. Show only the six-digit attendance code in the room; only students previously enrolled with an individual code may claim attendance.
5. The server clock is authoritative. Late claims and wrong codes are rejected. Repeated valid requests return existing attendance rather than duplicating it.
6. Inspect pending requests and approve or reject them. Export the session roster as UTF-8 CSV with BOM (Excel-compatible).
7. Optional **بستن فوری ثبت حضور** closes the attendance window before its deadline.

## Student
1. Enter first and last name and individual invitation code **once** on the device.
2. When teacher opens attendance, submit the six-digit code during the server-timed window. The claim is **pending** until instructor approval.
3. The identity token persists on this device for up to 365 days. Closing/reopening the app does not require repeating check-in. Lessons/slides remain accessible when attendance is closed.
4. Do **not** clear browser site data or use **خروج** unless a new invitation will be issued. Learning activities remain browser-local; switching devices does not transfer drafts.

## Honest limitations
- A valid code proves a device entered the correct code in the window; it **does not prove physical presence**. Instructor review provides a second check.
- Only attendance/roster is now central. Live poll, grades and instructor-authored drafts on the legacy local shell are **not** real-time cross-device modules yet.
- Private English original slides in Google Drive still require access permission; Persian lessons and downloadable adaptations are public.
- Free plan can pause during inactivity and has usage limits. Check Supabase project usage before classes. This is a shared free project, though namespaced and RLS-protected.
- No SMS/paid email login is needed. Privacy: centrally stored fields are student full name, invitation association, attendance timestamps and status; no national ID, addresses or location.
- Back up attendance exports after each session. There is no paid managed-backup guarantee on the Free plan.

## Security controls
- Each `mba_ob_*` table has RLS with no public/authenticated policies; privileges are revoked from `anon` and `authenticated`.
- Only server-side service-role API reads tables; Edge Function uses opaque, hashed student/teacher bearer tokens.
- Student invitation redemption is transactional with row locking. One invitation per enrolled student.
- Attendance RPC uses `clock_timestamp()` and enforces window, code, one registration per lesson and 8 wrong-code attempts per student/session.
- Teacher password hash stored with bcrypt; initial password must never be committed to source code. Password rotation revokes teacher bearer sessions.
- Only requests from the GitHub Pages app origin are allowed from browsers.
- Supabase Security Advisor informational `rls_enabled_no_policy` results for this feature are **intentional deny-all**. Do not loosen RLS to silence them.

## Recovery
- If a student loses the local credential, instructor issues a new invitation for a fresh account. The old attendance record persists and is not silently transferred; reconcile manually.
- If the free Supabase project pauses, restore it in the Supabase dashboard; student lesson content on GitHub Pages remains readable independently.
- Do not paste the teacher password into a public issue, repository file or student chat.
