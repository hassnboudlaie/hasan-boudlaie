# Kish OKR — Perdoo 3.0 Phase 1 Release Verification
**تاریخ:** ۲۵ اکتبر ۲۰۲۶ / ۳ آبان ۱۴۰۵

## وضعیت
- Pull Request #1 به `main` با موفقیت Merge شد.
- Squash commit: `45afa9b7fe3fdc3e7bb1fb4d1833be07d78a2dcc`.
- URL عمومی سامانه: https://hassnboudlaie.github.io/hasan-boudlaie/okr-system/
- Live HTTP fetch از URL اصلی و فایل‌های JS مربوط به Strategy Map و Team Dashboard موفق بود؛ در JS عمومی Team Dashboard نشانه تغییر Weighted Logic مشاهده شد.
- GitHub `main` حاوی Nested Pillar و Weighted Progress در Strategy Map و محاسبه متناظر در Team Dashboard است.
- اجرای GitHub Actions #4: Success؛ JS Parse + Regression + Headless Chromium desktop/mobile + RTL + Zoom + Team Profile: Pass.
- **تأیید نشده:** تست تعاملی مستقیم روی نسخه Public Pages پس از Merge، Persistence چندکاربره، امنیت Backend و End-to-End Roles.

## دقیقاً چه تغییر کرد؟
نمایش زیررکن راهبردی فقط هنگام وجود Parent ID؛ محاسبه وزنی فقط با Weight صریح؛ میانگین ساده برای داده‌های قبلی حفظ شد. ظاهر Nested Map Responsive شده است و درصد Goal در Team Dashboard با Map هماهنگ شده است.

## چه چیزی تغییر نکرد؟
هیچ داده‌ای Migration/Reset/Overwrite نشده؛ `index.html`، `offline.html`، مسیرهای عمومی، مجوزها و Backend بدون تغییر ماندند. این Release **معادل Full Perdoo 3.0 نیست**؛ تنظیم وزن در فرم‌ها، تعریف ارکان تودرتو در Admin، یکپارچه‌سازی Cascade/Board، Persistence سازمانی و همه Permissions هنوز در Backlog هستند.

## Revert Plan
درصورت مشاهده Regression، `45afa9b7fe3fdc3e7bb1fb4d1833be07d78a2dcc` را از طریق GitHub Revert کنید؛ به‌جای حذف داده‌ها فقط کد UI/Calculation را برگردانید.

## شواهد
- PR: https://github.com/hassnboudlaie/hasan-boudlaie/pull/1
- CI: https://github.com/hassnboudlaie/hasan-boudlaie/actions/runs/40176465035
- Implementation Audit: `okr-system/docs/perdoo3-gap-analysis-20261025.md`
