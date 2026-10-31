# بیمه البرز — گزارش اجرای فازهای ۱ و ۲ و کنترل کیفیت

**Release:** `s12-r2-20261031`  
**Scope:** جلسه دوم، ده تکنیک؛ جلسه اول و سایر اپلیکیشن‌ها بدون تغییر  
**Release status:** Published / Code QA PASS / Real-device visual sign-off pending

## فاز ۱ — Version Consistency و Cache Stability

- در ورودی جلسه دوم، ۱۵ فایل JavaScript مستقل به سه بسته اجرایی pinned تبدیل شد.
- چهار stylesheet جدا به یک فایل version-locked تبدیل شد.
- URLهای فایل‌های جدید نام یکتا دارند تا Cache نسخه قبل نتواند ترکیب غیرهمسانی از کد و محتوا را بسازد.
- مسیر `index.html?m=2` فقط برای جلسه دوم به `session2-demo.html?release=s12-r2-20261031` هدایت می‌شود.
- اگر یکی از بسته‌های حیاتی لود نشود، پیام بازیابی و دکمه دریافت مجدد نسخه نمایش داده می‌شود.
- `document.documentElement.dataset.alborzRelease` و `meta[name="alborz-build"]` برای تشخیص Release فراهم است.

### فایل‌های live pinned
- `session2-core-s12-r1-20261031.js` — Core course data, reuse unchanged.
- `session2-assessment-s12-r2-20261031.js` — Quiz data, 90 rationales, single assessment renderer.
- `session2-ui-s12-r2-20261031.js` — All lesson views, live interaction and release metadata.
- `session2-styles-s12-r1-20261031.css` — Full responsive CSS including red/green state differentiation.

## فاز ۲ — Quality of Questions & Feedback

- ۳۰ سؤال بازنویسی‌شده در ۱۰ تکنیک، متناسب با وضعیت واقعی رؤسای شعب.
- ۳ گزینه واقعی‌نما در هر سؤال؛ یک گزینه مناسب و دو اشتباه محتمل، بدون گزینه‌های کم‌ارزش یا آشکارا مضحک.
- ۹۰ دلیل یکتا، برای هر گزینه یک Explanation مستقل (۶۰ توضیح درباره غلط‌ها و ۳۰ توضیح درباره صحیح‌ها).
- موتور بازخورد یکسان برای تکنیک ۱ و تکنیک‌های ۲–۱۰.
- بعد از انتخاب، تحلیل خودِ گزینه انتخابی و دو گزینه دیگر جداگانه نمایش داده می‌شود.
- پاسخ درست با `selected-correct` و پاسخ غلط با `selected-incorrect` تفکیک می‌شود.
- `aria-pressed` و `role="status"` در بازخورد برای دسترس‌پذیری وجود دارند.

## ماتریس QA

| Gate | Result | Basis |
| --- | --- | --- |
| ۱۰ تکنیک فعال | PASS | Automated JS render |
| ۸۰ مرحله حفظ‌شده | 80/80 PASS | Navigation through all stages |
| ۲۴۸ نوبت گفت‌وگو | 248/248 PASS | Existing delivery cues preserved |
| ۳۰ سؤال با ۹۰ دلیل متفاوت | PASS | Full dataset inspection |
| انتخاب همه ۹۰ گزینه | 90/90 PASS | Render + state + three rationales per selection |
| مدل بازخورد تکنیک ۳ | PASS | Select wrong and correct answers in test harness |
| مدل بازخورد تکنیک ۷ | PASS | Assertive communication pilot |
| استایل درست و غلط | PASS (CSS) | Separate classes and styling |
| فایل‌های نسخه r2 روی GitHub Pages | PASS | Live public asset fetch |
| مرورگر زنده (تکنیک ۳، گزینه غلط) | PASS for r1 | Firecrawl rendered page showed selected wrong reason + two independent other reasons |
| مرورگر زنده (r2) | NOT VERIFIED | Browser Interaction credits unavailable; r2 only changes wording of one follow-up prompt |
| نمایش بصری روی گوشی واقعی در حالت عادی و Desktop Site | PENDING | Requires real-device visual inspection |

**Automated code-run result:** 147/147 checks passed on r2. Count includes navigation, per-option behavior and pilot checks. Not equivalent to 147 browser/device tests.

## لینک‌های آزمون دستی

- نسخه اصلی: `session2-demo.html?release=s12-r2-20261031`
- سؤال ۳ تکنیک ۳، انتخاب نادرست: `session2-demo.html?release=s12-r2-20261031&qaTech=3&qaStage=2&qaQuestion=2&qaAnswer=0`
- سؤال ۳ تکنیک ۳، انتخاب درست: `session2-demo.html?release=s12-r2-20261031&qaTech=3&qaStage=2&qaQuestion=2&qaAnswer=2`
- سؤال ۱ تکنیک ۷، انتخاب نادرست: `session2-demo.html?release=s12-r2-20261031&qaTech=7&qaStage=2&qaQuestion=0&qaAnswer=0`

این لینک‌های QA صرفاً همان UI واقعی را در صفحه موردنظر باز می‌کنند و داده‌ای در Backend ثبت نمی‌کنند.

## Acceptance decision

**Phase 1: PASS (release and public asset availability).**  
**Phase 2: PASS (content and deterministic UI behavior).**  
**Full mobile QA sign-off: pending.**

تنها بخش باقیمانده برای تأیید نمایش نهایی، بررسی عینی روی گوشی در حالت Mobile و Desktop Site است. تا آن زمان نباید تأیید کاملِ تجربه موبایل اعلام شود.
