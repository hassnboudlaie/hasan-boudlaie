# ممیزی و ارتقای مرحله‌ای سامانه OKR کیش مطابق Perdoo 3.0
**تاریخ:** ۳ آبان ۱۴۰۵ / ۲۵ اکتبر ۲۰۲۶  
**وضعیت:** Implementation Candidate در Branch مجزا؛ **Production Release تأیید نشده است**.

## ۱. محدوده واقعی بررسی
- Repository: `hassnboudlaie/hasan-boudlaie`؛ مسیر اصلی `okr-system/`.
- سند مبنای کسب‌وکار: «سند راهبردی تحول و پیشرفت» (۱۳ هدف راهبردی، Ultimate Goal، Strategic Pillars، Health KPIs و نظام پایش در فصل چهارم و پیوست آن).
- فایل اصلی `okr-system/index.html` تقریباً ۲٫۶ مگابایت، فایل `offline.html` تقریباً ۳ مگابایت است؛ احتمال Coupling بالای منطق رابط با داده، نیاز به Regression Test را بالا می‌برد.
- کدهای افزوده امروز برای Strategy Map، Team Goals، Visual Design و Operational Navigation مستقل از فایل HTML اصلی وجود دارند.
- بررسی عمومی URL نشان داد صفحه و Hash Routes در دسترس‌اند. استخراج متن صفحه حاوی بخش‌های آموزشی قدیمی است، **اما وجود متن در DOM به‌تنهایی ثابت نمی‌کند این بخش‌ها در رابط نمایشی دیده می‌شوند**.
- گزارش قبلی پروژه `strategy-map-implementation-audit-20261025.md` تصریح می‌کند `PRACTICE_MODE=true` است؛ Persistence چندکاربره، RBAC سمت سرور و تست E2E ثابت نشده‌اند. توصیف رابط درباره «ذخیره مرکزی» بدون تأیید Backend کافی نیست.

## ۲. Benchmark واقعی Perdoo 3.0
طبق Release Notes رسمی در ۱۲ اوت ۲۰۲۶، قابلیت‌های Nested Pillars، Weighted Average، Weekly/Binary KPI، Standalone Initiatives و Goal Details جدید عرضه شدند. Explore سه نمای Cascade، Map و Board را از Data Model مشترک می‌گیرد و دارای Saved Views و فیلترهای چندانتخابی است. در یادداشت ژوئن ۲۰۲۶، Perdoo اعلام کرده بخش قدیمی Goals کنار گذاشته شده و Saved Reports به Explore منتقل شده‌اند؛ بنابراین باید تصویر منوی مدنظر با مستندات جدید تطبیق داده شود، **نه اینکه یک Goals مستقل تکراری الزاماً بازتولید شود**.
- https://support.perdoo.com/en/articles/12656021-explore
- https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon
- https://support.perdoo.com/en/articles/5391069-aligning-okrs
- https://support.perdoo.com/en/articles/4515060-cadences-and-timeframes

## ۳. Gap Analysis (وضعیت بر اساس کد و مدارک، نه ادعای QA در مرورگر)
| قابلیت | وضع موجود / تغییر این Branch | شکاف با Perdoo 3.0 |
|---|---|---|
| Ultimate Goal و Strategic Pillars | Map فعلی، در Branch نمایش ارکان تودرتو با `parentId` | فرم Create/Edit ارکان تودرتو، کنترل چرخه‌ها و مجوزها |
| Objective/KR | کارت اهداف و پیشرفت ساده موجود؛ محاسبه وزنی صریح به شکل opt-in افزوده شد | UI تعریف وزن، روش Roll-up و تفسیر Progress Driver |
| Explore | Map و Team Dashboard موجود | سه View یکپارچه، Saved Views، Shared Filters، Bulk Editing، Export |
| Alignment | اتصال Parent به Pillar/Objective موجود | روابط با KPI/KR/Initiative و جلوگیری از Cycle در Backend |
| KPI | نمایش سلامت شاخص و مقدار جاری در ماژول‌های موجود | Time-Series واقعی، Weekly/Binary، Board و تاریخچه ویرایش |
| Profiles | ساختار تیم و برخی آمار اهداف | Users/Members/Reviews و مجوز سطوح دسترسی |
| Configure | Cadence و Timeframe تا حدی موجود | Superadmin سروری، Calendar Jalali و Dependency Guard |
| Meetings/Reviews | رابط‌های فعلی و صفحات تاریخی | گردش کار واقعی، ذخیره امن، Permission برای داده HR |
| Persistence/Security | GitHub Pages + Practice Mode طبق گزارش موجود | دیتابیس مرکزی، AuthN/AuthZ سروری، Backup/Restore و Audit Log |

## ۴. تغییرات واقعی این Branch
1. `assets/kish-strategy-map-20261025.js` — اجرای نمایش زیرارکان راهبردی، تشخیص Cycle/Depth غیرمجاز در Render، بدون تکرار کارت‌های اهداف.
2. همان فایل — محاسبه `weighted` فقط با درخواست صریح `progressMode`/`progressMethod`/`progressCalculation` یا `weightedProgress=true`؛ داده‌های قبلی به محاسبه ساده ادامه می‌دهند.
3. پنل توضیح پیشرفت — ستون وزن، روش محاسبه و توضیح وزن نامعتبر.
4. `assets/kish-strategy-map-20261025.css` — طراحی واکنش‌گرای Nested Pillar، بدون حذف استایل‌های فعلی.
5. `tests/perdoo3-map-regression.cjs` — آزمون خودکار برای Nested Structure، محاسبه وزنی و ساده، Missing Values، Escape و Cyclic Structure.

**هیچ دیتایی Migration نشده؛ هیچ فیلد قدیمی حذف نشده؛ تنظیمات Authentication و مسیرهای منتشرشده تغییر نکرده‌اند.** این تغییرات هنوز شامل UI ثبت رابطه و وزن و Persistence نیستند.

## ۵. Zero Data Loss / Rollback
- مبنای Branch: `main` در لحظه ایجاد Branch؛ `main` هنوز بدون این تغییرات مانده است.
- پیش از Merge: تهیه Export از هر Workspace متصل، آزمون Reload، Sync در دو مرورگر، بررسی تضاد نسخه‌ها، Snapshot دقیق و Test روی داده واقعی.
- بازگشت: Revert Commitهای تغییر JS/CSS. از Delete/Overwrite داده سروری یا LocalStorage استفاده نشود.
- Perdoo رسماً هشدار می‌دهد حذف Timeframe ممکن است اهداف و ابتکارات آن را حذف کند. در سامانه کیش **Archive به‌جای Delete** و Confirmation همراه Impact Analysis ضروری است.

## ۶. Definition of Done برای Release
- `node okr-system/tests/perdoo3-map-regression.cjs` با Exit Code صفر.
- E2E مرورگر Desktop/Mobile در `#map` و سایر Routeها، با RTL، Collapse، Zoom و Modal.
- Export/Import واقعی و ماندگاری داده در Refresh؛ دو کاربر مستقل روی همان Workspace.
- Role Test: Viewer/Editor/Manager/Superadmin، و تمایز Performance Review محرمانه از اهداف عمومی.
- عدم تکرار هدف در Cascade/Map/Board و تطبیق پیشرفت/وضعیت/Owner یک رکورد در همه نماها.
- بررسی ۱۳ هدف سند راهبردی بدون ساخت مقدار Target/Actual فرضی.
- Approval نهایی قبل از Merge؛ سپس Verification مستقل Published URL.

## ۷. اولویت بعدی
۱) Backend/Persistence & permissions؛ ۲) Goal schema و رابط مدیریت وزن/ارکان/Alignment؛ ۳) Explore یکپارچه روی داده واحد؛ ۴) Timeframe شمسی و کنترل Dependencies؛ ۵) E2E و انتشار کنترل‌شده. نمای ظاهری به‌تنهایی Definition of Done نیست.
