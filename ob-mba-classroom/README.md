# OB | MBA Classroom — Allameh Tabataba’i University

Independent GitHub Pages PWA in the main HB Hub repository.

## Scope
- RTL, mobile-first Executive Premium design; optional dark theme.
- An approved-instructor 48-hour MBA **course syllabus** is published in the app (16 three-hour sessions, three analytical levels, learning outcomes, teaching methods, proposed assessment, and references). Individual session teaching materials are managed separately: sessions 1–2 currently have lesson materials; sessions 3–16 remain placeholders.
- Local classroom prototype: lesson authoring and publish toggle, slides, case, quiz, poll, attendance code with teacher confirmation, group cards, weights/grades, projector display, student feedback tracking.
- Classroom projector uses Persian-only interface copy; academic English terminology may be present in teacher-supplied content.
- Standalone PWA manifest and scope-limited service worker.
- Indexed under HB Hub and the applications catalog.


## November 14, 2026 — Robbins book cover + downloadable 29-page handout
- Session 1 now includes two separate, accurately labeled supplementary items: the original Stephen P. Robbins book *The Truth About Managing People ... and Nothing But the Truth* with a verified first-edition-cover photo and publisher/editorial listing; and the instructor-supplied **29-page Persian summary** titled «کلیدهای طلایی مدیریت منابع انسانی» (not the full book).
- The uploaded source PDF bytes are published unchanged under `materials/readings/robbins-truth-about-managing-people-persian-summary.pdf`. Its Git blob SHA is `02ba7a535ebee57669acd1babee598ea37d8adf9` and original size is 1,343,727 bytes.
- The session 1 PDF card provides "دانلود خلاصه PDF" via a same-origin GitHub Pages file URL and HTML `download` attribute, plus preview and copy-link options. No Google Drive permission request is needed for the published repository copy.
- The source file's first page credits Robbins as author, Gholamhossein Khaneqai as Persian translator of the referred book, Mahsa Almoeinnejad as summarizer, and Mehrab Partovi Deylami as compiler (Placabi).
- The app's PWA shell cache was updated to `v26` with the PDF for offline use. Public live-browser acceptance testing was not performed; JS render and resource controls should be tested against a student login after GitHub Pages deployment.

## November 14, 2026 — verified resource links & Denhardt book covers
- Active **Open Link** and **Copy Link** controls appear in student resource cards, instructor resource lists, and directly under URL fields in each editable resource form. YouTube watch URLs remain ordinary HTTPS links and open in a new tab. Copy uses the browser Clipboard API with an on-page fallback.
- Session 2: Armin Trost, *Don't change Culture by changing the Culture*, verified watch URL https://www.youtube.com/watch?v=ceud2z_HziU.
- Session 1: *مدیریت رفتار سازمانی در سازمان‌های دولتی و غیرانتفاعی — جلد اول: سطح فردی* (Denhardt et al.; Persian translation: Hassan Boudlaie, Mohammad Hossein Kenarroudi, Mohammad Mahdi Ranjbar Fardoei; Negah-e Modiran, 1401) is included as a recommended supplementary book, with an explanation tied to organizational behavior foundations and public/nonprofit context.
- **Both verified covers** are hosted locally as \`materials/book-covers/denhardt-persian-cover.jpg\` (published translation cover spread, from its public LinkedIn announcement) and \`materials/book-covers/denhardt-original-cover.jpg\` (fifth-edition original from SAGE publisher). Visual assets were retrieved from actual publication sources, not generated or substituted with unrelated books.
- Reference links: English publisher https://www.sagepub.com/shop/buy-a-book/managing-human-behavior-in-public-and-nonprofit-organizations-5-257430; Persian release announcement https://www.linkedin.com/posts/mohammad-mahdi-ranjbar-fordoei-742784154_%DA%A9%D8%AA%D8%A7%D8%A8-%D9%85%D8%AF%DB%8C%D8%B1%DB%8C%D8%AA-%D8%B1%D9%81%D8%AA%D8%A7%D8%B1-%D8%B3%D8%A7%D8%B2%D9%85%D8%A7%D9%86%DB%8C-%D8%AF%D8%B1-%D8%B3%D8%A7%D8%B2%D9%85%D8%A7%D9%86-%D9%87%D8%A7%DB%8C-%D8%AF%D9%88%D9%84%D8%AA%DB%8C-activity-7044650110139420672-w2iz.
- Demo migration version 5 merges the new official book into locally saved student/teacher states and preserves a single copy of the Trost resource.
- Local instructor edits are still not synchronized across devices: published seed sources are repository-backed; ad hoc form changes remain browser-local pending a central resource publisher.

## Session-level additional resources — November 2026
- All 16 sessions now support a dedicated **منابع تکمیلی | Additional Resources** learning section with contextual notes linked to specific class topics.
- The instructor-side session editor includes a seventh section for resource management. A separate form supports adding, editing, and deleting books, journal articles, videos, podcasts and web links; URL is optional for books and restricted to HTTP(S).
- **Session 2 ships with an official, publicly versioned reference:** Armin Trost (2019), “Don't change Culture by changing the Culture” (4:43), https://www.youtube.com/watch?v=ceud2z_HziU. This supplements the attitude–behavior relationship, including how organizational conditions and changed behavior can precede attitude change. Cross-reference to session 15 culture.
- Shareable deep link after approved sign-in: `?session=2&tab=resources`. Instructor sees management view; students and approved guests see published resources.
- **Publishing limitation:** Teacher-created resource edits inside the existing classroom editor still persist *only to that device's browser*. They are not shared with other devices/students automatically. To distribute new items to everyone, commit them to the published course content or implement a properly authenticated central content backend. This avoids falsely implying live shared resource publishing.

## Private assignment portal — November 2026
- **Student:** In each session, open "کیس مدیریتی" for a free-form case analysis (write-up + up to 3 uploaded attachments), or "تکلیف فردی" for independent homework. The form appears before long guided exercises. Accepted upload types: PDF, DOCX, TXT, PNG, JPEG, each up to 8 MiB.
- **Server-backed:** A new \`mba-ob-assignments\` Supabase Edge Function authenticates the existing approved student/teacher session tokens. Assignments and assessments are stored in isolated \`mba_ob_assignments\` and \`mba_ob_assignment_reviews\` tables with RLS enabled and no public policies. Files are held in the **private** \`mba-ob-assignments\` Storage bucket and downloaded via short-lived signed URLs after per-file ownership/teacher checks. Existing six-step case workflows remain intact and labelled as a separate structured assignment track.
- **Teacher:** In "تکالیف، فایل‌ها و ارزیابی", filter submissions by any of 16 sessions, read answer text, download attachments, assign a score out of 20, return feedback, request revision, and export CSV. Revision permission is enforced by the database.
- **Email:** The connected account's verified Gmail recipient is \`hasanboudlaie@gmail.com\`. After a successful server submission, the student may open a prefilled Gmail compose window containing the submission receipt; the student must explicitly send the email and attach files again if desired. **There is no automated email dispatch or copying of private attachments into Gmail.** That requires a separately configured transactional email sender.
- **Operational verification:** schema migration applied and private bucket created, Edge Function deployed, invalid token rejected with HTTP 401, PWA assets available, and form DOM rendering checked. **No end-to-end upload with a real enrolled student token was conducted**; validate a sample submission and teacher review before class rollout.
- This feature does not modify My Finance tables or financial functions.

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
4. Develop and publish session-specific teaching materials aligned to the now-documented 16-session syllabus; keep existing lesson work and access controls intact.
