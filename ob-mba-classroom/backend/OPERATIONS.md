# OB MBA — ورود دانشجو با کد دانشجویی و تأیید مدرس

این سند، **ورود فعلی (Identity & Approval v2)** را ثبت می‌کند. توضیحات دعوت‌نامه‌های قدیمی پایین این فایل صرفاً برای تاریخچه نگهداری شده و دیگر مسیر فعال ثبت‌نام نیستند.

## دانشجو

1. دانشجو از لینک اصلی اپ علامه، **کد دانشجویی ۶ تا ۱۶ رقم** و **نام و نام خانوادگی** را وارد می‌کند.
2. سرور برای این کد، یک درخواست یکتا با وضعیت `pending` ثبت می‌کند و یک شناسه دستگاه غیرقابل‌حدس ایجاد می‌کند. کد دانشجویی به‌تنهایی، از دستگاه دیگر مجوز ورود ایجاد نمی‌کند.
3. صفحه اپ تا پیش از تأیید، **در انتظار تأیید مدرس** باقی می‌ماند. با «بررسی وضعیت»، پس از تأیید، درس‌ها و ابزارهای همان کلاس باز می‌شوند.
4. مدرس در سامانه حضور و غیاب می‌تواند نام/کد دانشجویی را بازبینی و **تأیید یا رد** کند. دانشجوی تأییدنشده نمی‌تواند حضور ثبت کند.
5. ورود بعدی از همان مرورگر با توکن اختصاصی همان دستگاه است؛ در صورت حذف اطلاعات مرورگر، بازیابی حساب نیازمند فرآیند دستی مدرس خواهد بود.
6. ثبت حضور جلسه، مکانیزم مستقل زمان‌دار با کد شش‌رقمی کلاس است؛ تأیید عضویت به‌معنای حضور خودکار نیست.

## مدرس

1. در اولین ورود روی دستگاه جدید: **کد ملی ده‌رقمی معتبر + رمز مدیریت فعلی** را وارد می‌کند. کد ملی فقط به‌صورت bcrypt hash روی سرور ذخیره می‌شود.
2. سپس شناسه تصادفی اعتماد دستگاه ثبت می‌شود. روی همان دستگاه، ورودهای بعدی با **کد ملی** انجام می‌شود؛ عامل دوم، کلید دستگاه ذخیره‌شده است.
3. روی یک دستگاه جدید، رمز مدیریت فعلی نیز لازم است. کد ملی به‌تنهایی برای کسب دسترسی مدیریتی در اینترنت کافی نیست.
4. انتخاب نقش «مدرس» یا «پروژکتور» در UI برای دانشجو مسدود است. **مرجع اجازه نهایی همیشه API سمت سرور است**.
5. کد ملی را در گفت‌وگو، فایل عمومی GitHub یا کد JavaScript ذخیره نکنید؛ از فرم امن اپ وارد شود.

## محدودیت‌های صریح

- صفحه اپ روی GitHub Pages در سطح UI پس از کنترل سرور باز می‌شود، اما assetهای استاتیک PDF/JS از طریق URL مستقیم همچنان عمومی هستند. این معماری برای **محرمانگی کامل محتوا** کافی نیست؛ برای محافظت فایل‌ها باید منابع به Storage خصوصی با Signed URL منتقل شوند.
- احراز هویت دانشجو بر اساس کد دانشجویی + توکن دستگاه + تأیید مدرس است؛ مالکیت واقعی کد دانشجویی تنها از طریق بررسی مدرس احراز می‌شود. هرگز درخواست ناشناس را بدون مطابقت با فهرست رسمی تأیید نکنید.
- همه رکوردهای دانشجویی و نشانه‌های دسترسی روی سرور با RLS محدودند؛ فرم‌های درسی همچنان روی همان مرورگر ذخیره می‌شوند و فایل‌های درسی بین دستگاه‌ها همگام نمی‌شوند.
- فضای رایگان Supabase محدودیت مصرف و امکان توقف بعد از دوره بی‌فعالیتی دارد.

---

## مستندات قدیمی دعوت‌نامه‌ها (غیرفعال)
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

## تکلیف رسمی تحلیل کیس — Sessions 1–2

- هر دو کیس **ساختگی و داده‌محور** هستند و صرفاً برای تمرین رابینز طراحی شده‌اند؛ جلسه اول: بهره‌وری، کیفیت، غیبت و ترک خدمت / سه سطح OB و TQM؛ جلسه دوم: ادراک، اسناد، نگرش، ناهماهنگی شناختی و یادگیری.
- پاسخ‌های تکلیف در **شش بخش ثابت** نوشته می‌شوند: Problem Definition, Evidence, Levels/Concepts, Explanation, Intervention, Measurement. Rubric به‌ترتیب **۳+۳+۴+۳+۴+۳ = ۲۰** است.
- پیش‌نویس هر دانشجو روی همان دستگاه ذخیره می‌شود. **تنها با انتخاب «ثبت نهایی و ارسال برای استاد»** شش بخش در `public.mba_ob_case_submissions` نوشته می‌شوند. اگر عضویت تأیید نشده باشد یا یکی از بخش‌ها خالی باشد، سرور رد می‌کند.
- تکلیف ثبت‌شده قابل تغییر نیست؛ مدرس می‌تواند از بخش «تکالیف و ارزیابی کیس» نمره ۰ تا ۲۰ و بازخورد ثبت کند یا `Revision Request` بدهد.
- هر ارزیابی به‌صورت **append-only** در `mba_ob_case_reviews` نگهداری می‌شود. در صورت درخواست اصلاح، دانشجو نسخه بعدی را ارسال می‌کند؛ سوابق نمره و بازخورد قبلی حذف نمی‌شوند.
- مدرس می‌تواند پاسخ‌های ثبت‌شده را با کد دانشجویی ببیند، بر مبنای Rubric ارزیابی کند، بازخورد بدهد و CSV صادر کند. دانشجو فقط تکلیف و نتیجه خود را از طریق توکن معتبر خود می‌بیند.
- جدول‌ها RLS deny-all برای `anon` و `authenticated` دارند؛ Edge Function فقط با service-role سمت سرور عمل می‌کند. **هیچ کلید service-role در JavaScript عمومی وجود ندارد**.
- QR کد `join-qr.svg` روی صفحه اول مدرس و نمای پروژکتور، لینک مستقیم فرم ثبت‌نام دانشجویان علامه را نمایش می‌دهد؛ QR هیچ امکان دورزدن Approval نمی‌دهد.
- ستون‌های سایر Gradebook محلی در پوسته قدیمی، نمرات رسمی بین‌دستگاهی نیستند و از این ارزیابی مرکزی جدا شده‌اند. اتصال محاسبه نمره نهایی کل درس به سامانه رسمی دانشگاه نیازمند تصمیم مستقل مدرس است.
- محتوای عمومی PDF/PPTX هنوز روی GitHub Pages قابل دسترسی مستقیم است و مخفی‌سازی کامل منابع با این User Interface ممکن نیست.
