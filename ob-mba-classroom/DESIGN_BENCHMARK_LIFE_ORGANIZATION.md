# مرجع ثابت طراحی اپ MBA علامه — The Life Organization Benchmark

**تصمیم مرجع (۱۳ نوامبر ۲۰۲۶):** اپ «سازمان عالی زندگی من» در `life-organization/`، Best Practice اصلی برای **ساختار، تجربه کاربری و کیفیت بصری** اپ «مدیریت رفتار سازمانی MBA علامه» در `ob-mba-classroom/` است. این تصمیم به **کپی‌کردن هویت برند یا محتوای آموزشی** تعبیر نمی‌شود.

## منابع واقعی مرجع
- `life-organization/styles.css`: Design Tokens، فضای سفید هدفمند، responsive sidebar/mobile bottom navigation، quiet premium palette و hierarchy.
- `life-organization/book1-journey.css` و `book1-journey.js`: stage/page navigation، guided learning، learning feedback، reflection stations و reward components.
- `life-organization/book1-ui.js`, `book1.css`: readable reading surfaces، two-prompts-per-screen workbook، preservation of learner input.
- `life-organization/brand.css`, `icon.svg`: single coherent branded visual language؛ صرفاً principle consistency منتقل شود نه لوگوی کتاب.
- `life-organization/UX_LEARNING_AUDIT_v03.md`: documented P0/P1/P2 UX decisions, 390×844 and 1440×900 Playwright gates, contrast spot-check, real-device review requirement.
- `life-organization/README.md`: product boundaries and local-storage privacy constraints.

## قواعد الزامی قابل انتقال

1. **Page Architecture / Progressive Disclosure:** در هر صفحه یک وظیفه اصلی و یک Primary CTA؛ سایر جزئیات در صفحه بعدی، Accordion یا Tab. برای محتوای بلند از **Step-based Reader** با Previous/Next، شمارنده مرحله و دسترسی آزاد به فهرست استفاده شود. صفحه یک Scroll بسیار بلند نباشد.
2. **Navigation:** Student Dashboard → 16 Sessions → Session Overview → Theory / Presentation / Case / Activity / Reflection / Quiz. مسیر مدرس و پروژکتور بر اساس role مجاز و جداگانه. در موبایل bottom nav محدود به وظایف پرکاربرد، در دسکتاپ نمای مناسب عریض؛ هیچ مسیر خروج ناخواسته به HB Hub.
3. **Visual Tokens:** warm white/cream body؛ deep emerald/teal editorial hero؛ champagne gold فقط accent؛ sage برای Reflection؛ mint برای helpful feedback. Contrast در foreground/background مهم‌تر از زیادکردن سایه یا گرادیان. در علامه هویت **OB و دانشگاه** حفظ شود و نشان Life Organization کپی نشود.
4. **Typography:** عنوان صفحه، تیتر بخش، subheading، متن، source/caption دارای اندازه و وزن متمایز. خطوط فارسی راست‌خوان با spacing مناسب و Bold موضعی. متن بالای صفحه و تکست آموزشی را یک‌دست هم‌قلم و هم‌سایز نمایش ندهید. English فقط برای اصطلاحات تخصصی، اختصارهای علمی و منابع؛ UI پروژکتور فارسی.
5. **Learning Flow:** One concept or one case step at a time. برای تمرین‌های نوشتنی حداکثر ۱–۲ prompt در هر نمای موبایل؛ پاسخ با auto-save، ادامه از آخرین مرحله و export محلی. در کلاس MBA: Content fidelity از Robbins یا منابعی که مدرس برای جلسات ۳–۱۶ می‌دهد حفظ شود.
6. **Feedback:** پس از پاسخ، بازخورد مشخص و محترمانه؛ نقش راهنمای یادگیری، نه قضاوت شخصیت. Promptهای reflection اختیاری و بدون نمره روان‌شناختی.
7. **Assessment vs Engagement:** فقط نمرات رسمی که مدرس تعریف می‌کند در Gradebook. Progress bar به‌صراحت «مطالب منتشرشده/فعالیت تکمیل‌شده» است، نه proficiency واقعی. اگر Gamification بعداً خواسته شد، مکانیزم آن نباید با نمره رسمی مخلوط شود.
8. **Accessibility:** mobile-first at 390×844، 320px narrow، desktop 1440×900؛ no horizontal overflow؛ touch targets ≥44px، focus states، keyboard navigation، reduced-motion، light/dark contrast، مناسب پروژکتور.
9. **Content cleanup:** برچسب‌های انگلیسی زائد، نسخه آزمایشی/راهنمای پیاده‌سازی، تکرار «پرزنتیشن...» و CTAهای موازی حذف شوند. نمایش و دانلود نسخه فارسی/انگلیسی در جای واضح و قابل کشف باشند.
10. **Production integrity:** حضور و غیاب مرکزی، account permissions و privacy با UI نمایشی اشتباه گرفته نشود. داده‌های تمرین روی گوشی دانشجو مجزا از حضور مرکزی است؛ role-view switch صرفاً UI است و authorization واقعی را تأمین نمی‌کند.

## ممیزی وضعیت کنونی علامه (۱۳ نوامبر ۲۰۲۶)

| وضعیت | بررسی قابل اتکا | اولویت بعدی |
|---|---|---|
| Home | hero جلسه جاری، ۴ کارت اصلی و bottom navigation ساخته شده | حفظ مینیمالیسم؛ ناوبری دسکتاپ را با الگوی مرجع بازبینی کنید |
| Session content | جلسه‌های ۱ و ۲ اکنون reader مرحله‌به‌مرحله برای مفاهیم، مثال‌ها، کیس و تمرین دارند | حفظ و تعمیم همین الگو برای محتوای جلسات بعدی |
| Forms | دفتر تمرین و تحلیل کیس مرحله‌ای با حداکثر دو پرسش در هر صفحه، auto-save و بازیابی مرحله آخر اجرا شده‌اند | ادامه QA روی دستگاه واقعی و توسعه Export/Import در صورت نیاز |
| Quiz | سؤال به سؤال و پاسخ تشریحی موجود است | feedback layout و completion state معنادار |
| Teacher dashboard | نمای مدرس در پوستهٔ اصلی با انتخاب role قابل نمایش است | authorization واقعی و جداسازی UI/permissions را در مرحله Production کامل کنید |
| Attendance | API مستقل با منطق زمان سرور ساخته شده | end-to-end تست دو دستگاه واقعی قبل از استفاده رسمی |
| Visual | در `style.css` افزوده‌های متوالی و override زیاد است | token consolidation و پاکسازی CSS پیش از تغییرات بزرگ‌تر |
| QA | `scripts/verify-ob-classroom-ux.cjs` integrity test موجود است | از مرجع Life Org تست مرورگر 390×844 / 1440×900 و screenshot artifact انتقال یابد |

## Definition of Done برای ارتقای آینده
- هیچ تغییر در محتوای علمی تأییدشدهٔ جلسات ۱ و ۲ بدون درخواست صریح.
- ۱۶ جلسه و ظرفیت اضافه‌شدن محتوا توسط مدرس حفظ شود.
- Screenshots واقعی UI موبایل و دسکتاپ، تست navigation، فرم، حضور و غیاب، نمایش PDF/Slides و بدون overflow انجام شود.
- نگاشت عناصر UI به benchmark فوق در PR یا گزارش تغییر درج شود.
- تغییر ظاهر به‌تنهایی «تطبیق با Best Practice» نامیده نشود؛ باید بهبود قابل‌سنجش در **cognitive load، flow و accessibility** حاصل شود.

## Implementation Review — 2026-11-13 (Guided Learning v11)

- **Completed:** Robbins sessions 1–2 render 7 concepts as independent paged steps and 3 examples as independent analytical cards in each chapter.
- **Completed:** Source-backed case moves through original facts → management decision → 2 questions per page → action and evidence reflection; the original source link remains available.
- **Completed:** Group activity has overview, individual staged tasks and a final debrief; role-play has two dialogue turns per stage and a feedback page. Quiz remains a separate selectable activity.
- **Completed:** Reflection workbook displays two answer fields per stage, auto-saves to the existing browser-local studentWork object, resumes the last visited step, retains prior single-field drafts and exports the current lesson's structured notes in UTF-8 TXT.
- **Completed:** Premium editorial treatment with teal/emerald headings, warm paper concept cards, sage example blocks, gold reflection accents, accessible keyboard controls, touch targets, mobile stage rail and dark mode.
- **QA:** Existing integrity suite + Chromium Playwright at 390×844 mobile and 1440×900 desktop. Checks main routes, seven topics, three examples, case facts/citations, answer autosave and refresh, 2-field workbook, role-play, quiz, presentation language choices, contrast-sensitive styles, dark theme and no horizontal overflow. Device screenshot artifacts saved in workflow `OB MBA Guided Browser QA`.
- **Not modified:** Scientific/Robbins source text, the original English/translated Persian decks, 16-session structure, teacher editor, and live attendance server.
- **Remaining boundary:** Official grades, poll and teacher-role selection in the legacy shell are not central multi-user services yet; the guided workbook is intentionally browser-local. This UX completion is not a claim that those modules have production-grade permissions.
