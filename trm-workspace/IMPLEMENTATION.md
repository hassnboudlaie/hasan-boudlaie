# TRM Workspace — نسخه اجرایی آزمایشی 2.1

## مبنای علمی
Armin Trost (2014), *Talent Relationship Management: Competitive Recruiting Strategies in Times of Talent Shortage*, Springer, 10 chapters. All content in the application is an **original practical adaptation** and not the publisher's or author's official application.

## Workflow
1. نقش‌های کلیدی و گلوگاهی: انتخاب ۸ نمونه، استراتژی، سه معیار پرتفوی، برنامه نیروی کار، چالش بحرانی، گروه هدف، شکاف قابل جبران.
2. پیشنهاد ارزش کارفرما (EVP): شش خانواده ارزش، تناسب سه‌گانه، شواهد واقعی و پیام اختصاصی.
3. منبع‌یابی فعال: هفت کانال، مثال، هدف، مالک، موعد، برنامه ثبت‌شونده.
4. بانک استعدادها: اطلاعات پایه، وضعیت رابطه، اولویت A/B/C مبتنی بر شواهد، رضایت و ترجیحات.
5. حفظ رابطه: شش اقدام پیشنهادی، ثبت رابطه و تاریخ پیگیری، گزارش معوق‌ها.
6. تجربه نامزد: ثبت نقاط تماس و تعهد پاسخ، پنج متن پیشنهادی با قابلیت شخصی‌سازی، ثبت بازخورد سرعت/شفافیت/احترام.
7. داشبورد و ROI: سناریوی اختیاری HCVA/ROI و شاخص‌های حاصل از داده‌های ثبت‌شده.
8. برنامه استقرار TRM: ۱۴ اقدام ۸ هفته‌ای با چک‌لیست ذخیره‌شونده.
9. «کتاب در عمل»: نگاشت تمام ده فصل به ابزارها و پرسش‌های تصمیم.

## Delivery and limitations
- PWA GitHub Pages and separate Android WebView pilot package (`org.hb.trmworkspace`) are stand-alone from all other organizational apps.
- This is a **single-device local-first pilot**, not multi-tenant enterprise SaaS. No automatic account synchronization, access controls, remote backups, multi-user collaboration or cloud audit trail.
- The Android APK accesses the online PWA and needs internet to start. Local data within the Android app is isolated from Chrome's PWA localStorage. Backups do not transfer automatically: create a JSON export and import on the destination platform.
- Do not use with real sensitive candidate records until proper enterprise authentication, database encryption, organization isolation and privacy controls are deployed and independently tested.
- A debug-signed pilot APK is installable for testing, but not for Play Store production distribution. For long-term Android updates, a stable production signing key is required.

## Tests
- Headless Chromium multi-step flow: choose role template, save workforce assumptions, create EVP draft, save sourcing plan, register consented test candidate, retention follow-up, candidate experience reply promise, roadmap checklist, finance assumptions, export JSON, and inspect all 10 playbook chapters.
- Native APK build through GitHub Actions must be confirmed separately; do not claim install is verified before the build succeeds.