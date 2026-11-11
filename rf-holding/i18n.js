(function(){
"use strict";
const STORAGE="rf_holding_language_v2";
const rows=[
["کسب‌وکارهای من","My Businesses"],["رضا فخرایی","Reza Fakhraei"],["مدیریت مجموعه","Group Owner"],["فضای مدیریت","Management Workspace"],["مرکز مدیریت","Command Center"],["خدمات مشترک","Shared Services"],["واحدهای کسب‌وکار","Business Units"],
["داشبورد مجموعه","Group Dashboard"],["کسب‌وکارها","Businesses"],["کسب‌وکار","Business"],["امور مالی مشترک","Shared Finance"],["خدمات مالی مشترک هلدینگ","Group Financial Services"],["مشتریان","Customers"],["مشتری","Customer"],["کارها و پیگیری‌ها","Tasks & Follow-ups"],["کارها","Tasks"],["مالی","Finance"],["خانه","Home"],["بیشتر","More"],["گزارش‌های مدیریتی","Management Reports"],["گزارش‌ها و تحلیل مدیریتی","Management Insights"],["تنظیمات و توسعه","Settings & Expansion"],["تنظیمات و توسعه مجموعه","Workspace Settings & Expansion"],["ثبت جدید","New Entry"],["ثبت عملیات جدید","Add Record"],["باز کردن منو","Open navigation"],["بستن منو","Close navigation"],["جست‌وجوی کسب‌وکار، مشتری، کار...","Search businesses, customers, tasks..."],["تمام کسب‌وکارها","All Businesses"],["کسب‌وکارهای فعال","Business Units"],["واحدهای تعریف‌شده در گروه","Units in the group"],["کسب‌وکارهای من","My Businesses"],
["سلام، به RF Holding خوش آمدید","Welcome to RF Holding"],["تمام کسب‌وکارهای شما در یک فضای یکپارچه، با عملیات مستقل و خدمات مشترک.","One unified workspace for your businesses, with independent operations and shared services."],["دید کامل به مجموعه،","Group-wide visibility,"],["مدیریت دقیق هر کسب‌وکار.","Focused control of every business."],["مدیریت یکپارچه کسب‌وکارها","One Group. Complete Visibility."],["از رستوران و طلا و جواهر تا گردشگری؛ همه زیر یک سقف مدیریتی، بدون از بین رفتن استقلال هر واحد.","Restaurant, jewelry and travel operations in one executive workspace, without sacrificing business autonomy."],["رستوران، طلا و جواهر و گردشگری؛ با عملیات مستقل و خدمات مشترک در یک فضای واحد.","Restaurant, jewelry and travel businesses: independent operations, shared capabilities, one workspace."],["مشاهده کسب‌وکارها","Explore Businesses"],["هر واحد محیط، ابزارها و داده‌های مستقل خودش را دارد.","Each business has its own workflows, tools and data."],["مشاهده همه","View All"],["کسب‌وکار جدید","New Business"],["افزودن کسب‌وکار","Add Business"],["افزودن کسب‌وکار جدید","Add a Business"],["با ساختار و اطلاعات مستقل","With its own workflow and records"],["ورود به مدیریت","Open Workspace"],["مورد عملیاتی ثبت‌شده","operational records"],["مورد عملیاتی","operational records"],
["دریافتی ثبت‌شده","Recorded Income"],["جمع کل واحدها · داده واقعی واردشده","Across units · entered transactions"],["پرداختی ثبت‌شده","Recorded Expenses"],["تمام هزینه‌های ثبت‌شده","All recorded expenses"],["کارهای باز","Open Tasks"],["نیازمند پیگیری","Awaiting action"],["مشتریان ثبت‌شده","Registered Customers"],["مخاطبان ثبت‌شده","Contacts in the workspace"],["آخرین گردش‌های مالی","Recent Transactions"],["مدیریت مالی","Open Finance"],["هنوز تراکنشی ثبت نشده است","No transactions yet"],["ثبت دریافت و پرداخت از همین‌جا آغاز می‌شود.","Start by recording a payment or receipt."],["ثبت تراکنش","Add Transaction"],["پیگیری‌های نزدیک","Upcoming Follow-ups"],["همه کارها","All Tasks"],["موردی در انتظار پیگیری نیست","No pending follow-ups"],["کارهای واحدها و کارهای مشترک را ثبت کنید.","Keep business-specific and group-wide tasks organized here."],["افزودن کار","Add Task"],["درباره این نسخه:","About This Preview:"],
["رستوران و کافه","Restaurant & Café"],["رستوران","Restaurant"],["طلا و جواهر","Jewelry & Gold"],["گردشگری و سفر","Travel & Tourism"],["دفتر گردشگری","Travel Agency"],["سایر کسب‌وکارها","Other Industries"],["عملیات سالن، سفارش‌ها، رزرو میز و مدیریت منو","Dining room, orders, table reservations and menu management"],["کالکشن، موجودی، فروش و درخواست مشتریان","Collections, inventory, sales and customer enquiries"],["تورهای مسافرتی، رزروها و پرونده مسافران","Travel packages, bookings and passenger records"],["فضای مدیریت مستقل برای این کسب‌وکار","A dedicated workspace for this business"],
["مدیریت مستقل هر واحد در کنار خدمات تجمیعی هلدینگ.","Independent business operations with centralized group services."],["یک نقطه کنترل مالی، با تفکیک دقیق درآمد و هزینه هر کسب‌وکار.","A single financial control center with clear income and expense attribution by business."],["دریافتی","Income"],["پرداختی","Expenses"],["مانده","Balance"],["تراکنش‌های ثبت‌شده","Recorded transactions"],["هزینه‌های ثبت‌شده","Recorded expenses"],["دریافتی منهای پرداختی","Income less expenses"],["تعداد تراکنش","Transaction Count"],["در محدوده انتخاب‌شده","Within selected scope"],["دریافت خروجی CSV","Export CSV"],["دفتر گردش‌های مالی","Transaction Ledger"],["دفتر مالی هنوز خالی است","The ledger is empty"],["دریافت و پرداخت هر واحد را ثبت کنید؛ گزارش کل هلدینگ به‌صورت خودکار به‌روز می‌شود.","Record income and expenses by unit to update the consolidated group overview."],["ثبت اولین تراکنش","Record First Transaction"],["شرح","Description"],["نوع","Type"],["مبلغ","Amount"],["تاریخ","Date"],["دسته‌بندی","Category"],["دریافتی / درآمد","Income / Receipt"],["پرداختی / هزینه","Expense / Payment"],["ثبت دریافت / پرداخت","Record Income / Expense"],
["مشتریان و ارتباطات","Customers & Relationships"],["یک دفتر مشترک مشتریان، با امکان اتصال هر مخاطب به کسب‌وکار مربوطه.","A unified CRM where each contact is linked to the relevant business."],["افزودن مشتری","Add Customer"],["در تمام واحدها","Across all units"],["مشتریان رستوران","Restaurant Customers"],["مخاطبان این واحد","Contacts in this unit"],["گردشگری","Travel"],["فهرست مخاطبان","Contact Directory"],["هنوز مشتری ثبت نشده است","No customers added yet"],["می‌توانید مشتری هر واحد را در همین دفتر مشترک ثبت و پیگیری کنید.","Add and manage customers from every business in one shared directory."],["مشتری جدید","New Customer"],["نام","Name"],["تلفن","Phone"],["یادداشت","Note"],
["اقدامات مشترک هلدینگ و پیگیری‌های اختصاصی هر کسب‌وکار.","Group-wide actions and business-specific follow-ups in one place."],["کار جدید","New Task"],["کل کارها","All Tasks"],["تمام موارد ثبت‌شده","All recorded items"],["در انتظار","Pending"],["انجام‌شده","Completed"],["تکمیل‌شده","Completed"],["فرصت سررسید گذشته","Overdue Tasks"],["فهرست اقدام‌ها","Action List"],["فهرست کارها خالی است","No tasks on the board"],["اقدام‌ها و مسئولیت‌های هر واحد را در این صفحه متمرکز کنید.","Organize ownership and follow-up responsibilities across your businesses."],["جزئیات","Details"],["بدون تاریخ","No date"],
["مقایسه واحدها بر پایه اطلاعاتی که واقعاً در سامانه ثبت شده‌اند.","Compare business performance using recorded data—not estimates."],["چاپ گزارش","Print Report"],["کل دریافتی","Total Income"],["کل پرداختی","Total Expenses"],["مانده تجمیعی","Consolidated Balance"],["گزارش داخلی","Internal report"],["پرونده‌های عملیاتی","Operational Records"],["ثبت‌شده در تمام واحدها","Across all units"],["مقایسه دریافتی کسب‌وکارها","Income by Business"],["مقایسه فعالیت عملیاتی","Operational Activity by Business"],["پس از ثبت تراکنش، نمودار مقایسه نمایش داده می‌شود.","The comparison chart will appear once transactions are recorded."],["نمای مقایسه‌ای واحدها","Business Comparison"],["هر واحد، داده‌های اختصاصی دارد؛ هلدینگ فقط آنها را تجمیع می‌کند.","Business data stays separate; the group dashboard consolidates the results."],["واحد","Unit"],["فعالیت","Activity"],["این گزارش فقط ثبت‌های دستی در نسخه اولیه را نمایش می‌دهد؛ اتصال به صندوق رستوران، حسابداری، موجودی واقعی و سامانه‌های گردشگری هنوز راه‌اندازی نشده است.","This preview reports manually entered records only. POS, accounting, inventory and travel systems are not yet connected."],
["مدیریت ساختار کسب‌وکارها، نگهداری داده‌ها و برنامه توسعه سامانه.","Manage business structure, local data and future platform capabilities."],["تعریف کسب‌وکار","Create Business"],["ساختار گروه","Group Structure"],["برای هر کسب‌وکار هویت و ماژول‌های جداگانه تعریف می‌شود.","Each business has its own identity and specialized modules."],["ویرایش","Edit"],["ثبت","record"],["ماژول‌های اختصاصی","Custom Modules"],["برای هر کسب‌وکار می‌توانید ماژول‌های جدید تعریف کنید.","Create custom modules for any business."],["هنوز ماژول سفارشی تعریف نشده است","No custom modules yet"],["داخل هر کسب‌وکار، از دکمه «ماژول جدید» استفاده کنید.","Use “New Module” in a business workspace to create one."],["نسخه پشتیبان و نگهداری اطلاعات","Backup & Data Maintenance"],["برای جلوگیری از از دست رفتن اطلاعات مرورگر، مرتب فایل پشتیبان بگیرید.","Export backups regularly to avoid losing browser-stored data."],["دریافت پشتیبان","Download Backup"],["دریافت همه کسب‌وکارها، تراکنش‌ها، مشتریان و کارها در یک فایل JSON.","Export all businesses, transactions, customers and tasks as JSON."],["بازیابی پشتیبان","Restore Backup"],["بارگذاری فایل خروجی قبلی؛ پس از تأیید جایگزین داده‌های مرورگر می‌شود.","Restore a previous export after confirming replacement of local data."],["بازنشانی فضای آزمایشی","Reset Preview Workspace"],["پاک کردن داده‌های واردشده و بازگشت به سه کسب‌وکار اولیه.","Remove entered data and restore the three original businesses."],["نقشه توسعه محصول","Product Roadmap"],["قابلیت‌های زیر برای فاز عملیاتی به زیرساخت اختصاصی نیاز دارند.","The capabilities below require a production-grade infrastructure."],
["حساب کاربری و نقش‌ها","User Accounts & Roles"],["ورود امن رضا فخرایی و مدیران هر واحد با سطح دسترسی مستقل.","Secure access for the owner and business managers with role-based permissions."],["پایگاه داده مرکزی","Central Database"],["داده‌های مشترک بین دستگاه‌ها، پشتیبان‌گیری خودکار و ثبت سوابق تغییرات.","Cross-device synchronization, automated backups and audit trails."],["یکپارچگی با سیستم‌های موجود","System Integrations"],["صندوق رستوران، حسابداری، موجودی طلا، رزروهای سفر و درگاه‌های مالی.","Restaurant POS, accounting, jewelry stock, travel bookings and financial services."],["تحلیل پیشرفته","Advanced Analytics"],["گزارش‌های لحظه‌ای، KPIهای اختصاصی و تصمیم‌سازی مدیریتی.","Live reporting, vertical KPIs and executive decision support."],
["نمای کلی","Overview"],["ثبت در واحد","Add Business Record"],["ویرایش مشخصات","Edit Details"],["فرایندهای ثبت‌شده","Recorded Operations"],["سفارش‌ها، درخواست‌ها و عملیات","Orders, enquiries and operations"],["دریافتی واحد","Unit Income"],["تراکنش‌های واحد","Unit transactions"],["هزینه‌های واحد","Unit Expenses"],["پرداخت‌های واحد","Unit payments"],["مانده ثبت‌شده","Recorded Balance"],["آخرین فعالیت‌های این کسب‌وکار","Recent Business Activity"],["مشاهده فعالیت‌ها","View Activity"],["هنوز فعالیتی ثبت نشده است","No activities yet"],["با یکی از ابزارهای تخصصی این کسب‌وکار شروع کنید.","Start with a business-specific operation."],["شروع ثبت","Get Started"],["دسترسی سریع","Quick Actions"],["ثبت و پیگیری در این واحد","Record and track in this unit"],["در حساب مشترک مالی","In the shared finance ledger"],
["سفارش‌ها","Orders"],["سفارش","Order"],["سفارش جدید","New Order"],["رزرو میز","Table Reservations"],["رزرو جدید","New Reservation"],["میزها و سالن","Tables & Floor"],["تعریف میز","Add Table"],["آیتم منو","Menu Item"],["منو و اقلام","Menu & Items"],["منو","Menu"],["نقشه میزهای رستوران","Restaurant Floor Plan"],["وضعیت و ظرفیت میزها؛ برای ویرایش روی هر میز بزنید.","Manage table capacity and availability. Select a table to edit."],["هنوز میزی تعریف نشده است","No tables defined"],["برای هر میز، عنوان، ظرفیت و وضعیت ثبت کنید.","Add a table name, capacity and status."],["تعریف اولین میز","Add First Table"],["سالن اصلی","Main Hall"],["ظرفیت","Capacity"],["نفر","guests"],
["موجودی طلا","Gold Inventory"],["فروش و سفارش","Sales & Orders"],["درخواست مشتری","Customer Enquiry"],["درخواست‌ها","Enquiries"],["محصول جدید","New Product"],["ثبت فروش","Record Sale"],["ویترین موجودی طلا و جواهر","Jewelry Inventory Gallery"],["کد محصول، وزن، عیار، تعداد و قیمت ثبت‌شده.","View recorded SKU, weight, karat, quantity and price."],["هنوز موجودی ثبت نشده است","No jewelry inventory yet"],["محصول جدید با عیار، وزن، تعداد و تصویر واقعی ثبت کنید.","Add products with karat, weight, quantity and a real product photo."],["ثبت اولین محصول","Add First Product"],
["تور و خدمات","Tours & Services"],["تور جدید","New Tour"],["تور و خدمات سفر","Travel Products & Packages"],["رزرو سفر","Travel Bookings"],["درخواست سفر","Travel Enquiry"],["مقصد، تاریخ حرکت و ظرفیت هر تور در یک نما.","Track destinations, departure dates and capacity in one view."],["تور / خدمت","Tour / Service"],["هنوز تور یا خدمتی تعریف نشده است","No travel products yet"],["مقصد، زمان‌بندی، ظرفیت و قیمت خدمات سفر را ثبت کنید.","Add destinations, schedules, capacity and pricing."],["ثبت تور جدید","Add First Tour"],["تاریخ حرکت","Departure Date"],["مقصد تعیین نشده","Destination not set"],
["اطلاعات مستقل این واحد؛ برای ویرایش روی هر ردیف کلیک کنید.","Dedicated records for this unit. Select a row to edit."],["برای ایجاد اولین مورد، از دکمه بالا استفاده کنید.","Use the Add button to create your first record."],["موردی در بخش","No records in"],["افزودن","Add"],["در این بخش متناسب با ماهیت","Tailored to"],["این بخش متناسب با ماهیت","This workspace is tailored to"],["طراحی شده است. گردش‌های مالی واقعی را در قسمت «امور مالی مشترک» ثبت کنید تا گزارش تجمیعی هلدینگ به‌روز شود.","Record transactions in Shared Finance to keep consolidated reports up to date."],
["تعریف کسب‌وکار جدید","Create a Business"],["ویرایش کسب‌وکار","Edit Business"],["نام کسب‌وکار","Business Name"],["حوزه فعالیت","Industry"],["آدرس تصویر (اختیاری)","Image URL (optional)"],["شرح کوتاه فعالیت","Short Description"],["انصراف","Cancel"],["ذخیره کسب‌وکار","Save Business"],["حذف کسب‌وکار","Delete Business"],
["شرح تراکنش","Transaction Description"],["نوع تراکنش","Transaction Type"],["کسب‌وکار مرتبط","Related Business"],["مبلغ (تومان)","Amount (Toman)"],["دسته‌بندی","Category"],["توضیحات","Notes"],["توضیحات تکمیلی (اختیاری)","Additional notes (optional)"],["ذخیره تراکنش","Save Transaction"],["ویرایش تراکنش","Edit Transaction"],["حذف تراکنش","Delete Transaction"],
["نام مشتری","Customer Name"],["شماره تماس","Phone Number"],["یادداشت ارتباط","Relationship Notes"],["ذخیره مشتری","Save Customer"],["ویرایش مشتری","Edit Customer"],["حذف مشتری","Delete Customer"],
["کار و پیگیری جدید","New Task & Follow-up"],["عنوان اقدام","Task Title"],["مشترک · کل مجموعه","Shared · Entire Group"],["سررسید","Due Date"],["اولویت","Priority"],["عادی","Normal"],["بالا","High"],["فوری","Urgent"],["شرح کار","Task Details"],["ذخیره کار","Save Task"],["ویرایش کار","Edit Task"],["حذف کار","Delete Task"],
["ثبت سریع در RF Holding","Quick Entry · RF Holding"],["چه چیزی می‌خواهید ثبت کنید؟","What would you like to record?"],["کار و پیگیری","Task & Follow-up"],["بستن","Close"],
["ثبت سفارش","Create Order"],["شماره یا عنوان سفارش","Order Number / Title"],["مشتری / میز","Customer / Table"],["مبلغ سفارش (تومان)","Order Amount (Toman)"],["وضعیت","Status"],["جدید","New"],["در جریان","In Progress"],["تسویه‌شده","Settled"],["لغوشده","Cancelled"],["توضیحات / جزئیات","Notes / Details"],["اقلام سفارش","Order Items"],["ذخیره سفارش","Save Order"],
["ثبت رزرو میز","Create Table Reservation"],["نام رزرو یا میز","Reservation / Table Name"],["نام مشتری / شماره میز","Customer / Table Number"],["بیعانه (تومان)","Deposit (Toman)"],["تعداد نفرات","Party Size"],["ساعت رزرو","Reservation Time"],["ذخیره رزرو میز","Save Reservation"],
["ثبت میز سالن","Add Dining Table"],["شماره یا نام میز","Table Number / Name"],["بخش سالن / موقعیت میز","Floor Section / Table Location"],["ظرفیت میز (نفر)","Seating Capacity"],["آزاد","Available"],["رزروشده","Reserved"],["اشغال","Occupied"],["غیرفعال","Inactive"],["ذخیره میز سالن","Save Table"],
["ثبت آیتم منو","Add Menu Item"],["نام غذا / نوشیدنی","Food / Drink Name"],["دسته‌بندی منو","Menu Category"],["قیمت فروش (تومان)","Selling Price (Toman)"],["ذخیره آیتم منو","Save Menu Item"],
["ثبت محصول طلا و جواهر","Add Jewelry Product"],["نام محصول","Product Name"],["کد / عیار / وزن","SKU / Karat / Weight"],["ارزش / قیمت (تومان)","Value / Price (Toman)"],["کد محصول / SKU","Product SKU"],["وزن (گرم)","Weight (g)"],["عیار","Karat"],["۱۸ عیار","18K"],["۲۱ عیار","21K"],["۲۴ عیار","24K"],["سایر","Other"],["تعداد موجودی","Stock Quantity"],["لینک تصویر واقعی محصول","Real Product Photo URL"],["ذخیره محصول طلا و جواهر","Save Jewelry Product"],
["ثبت فروش / فرصت","Record Sale / Opportunity"],["عنوان فروش","Sale Title"],["مشتری / شرح","Customer / Description"],["مبلغ فروش (تومان)","Sales Amount (Toman)"],["ذخیره فروش / فرصت","Save Sale / Opportunity"],["فروش / فرصت","Sale / Opportunity"],
["ثبت درخواست مشتری","Add Customer Enquiry"],["عنوان درخواست","Enquiry Subject"],["مشتری / توضیح","Customer / Description"],["برآورد (تومان)","Estimate (Toman)"],["ذخیره درخواست مشتری","Save Enquiry"],
["ثبت تور / خدمت سفر","Add Travel Product"],["نام تور / خدمت","Tour / Service Name"],["مقصد / مدت","Destination / Duration"],["قیمت تور (تومان)","Tour Price (Toman)"],["مقصد","Destination"],["ظرفیت (نفر)","Capacity (persons)"],["لینک تصویر تور / مقصد","Destination Photo URL"],["ذخیره تور / خدمت سفر","Save Travel Product"],
["ثبت رزرو سفر","Add Travel Booking"],["عنوان رزرو / مسافر","Booking / Passenger"],["مقصد / نام مسافر","Destination / Passenger"],["مبلغ رزرو (تومان)","Booking Amount (Toman)"],["تعداد مسافران","Passenger Count"],["ذخیره رزرو سفر","Save Booking"],
["افزودن ماژول به","Add module to"],["عنوان ماژول","Module Name"],["نشانه ماژول","Module Icon"],["توضیح کاربرد","Purpose / Description"],["ذخیره ماژول","Save Module"],["ماژول جدید","New Module"],["ماژول","Module"],["ویرایش ماژول","Edit Module"],["حذف ماژول","Delete Module"],["عمومی","General"],["موجودی","Inventory"],["فرایند","Workflow"],["فروش","Sales"],["برنامه‌ریزی","Planning"],["قراردادها","Contracts"],["عملکرد","Performance"],["منابع انسانی","Human Resources"],
["ثبت‌شده","Recorded"],["در انتظار تأیید","Pending Approval"],["مشترک","Shared"],["گزارش","Report"],["عنوان","Title"],["نام غذا و تعداد","Food items and quantities"],["مثلاً خرید مواد اولیه","e.g., ingredient purchases"],["مثلاً مدیریت قراردادها","e.g., contract management"],["توضیحات کوتاه","Brief details"],["توضیحات تکمیلی","Additional Details"],["فضای ذخیره‌سازی مرورگر کافی نیست؛ خروجی پشتیبان تهیه کنید.","Browser storage is full. Download a backup."],["نام کسب‌وکار را وارد کنید.","Enter a business name."],["مشخصات کسب‌وکار به‌روزرسانی شد.","Business details updated."],["کسب‌وکار جدید ساخته شد.","Business created."],["مبلغ نامعتبر است.","Invalid amount."],["تراکنش مالی ذخیره شد.","Transaction saved."],["اطلاعات مشتری ذخیره شد.","Customer saved."],["کار ثبت شد.","Task saved."],["مورد انتخاب‌شده حذف شد.","Selected item deleted."],["ماژول اختصاصی ذخیره شد.","Custom module saved."],["ماژول حذف شد.","Module deleted."],["کار تکمیل شد.","Task completed."],["کار به فهرست پیگیری بازگشت.","Task reopened."],["فایل CSV آماده شد.","CSV export downloaded."],["فایل پشتیبان دریافت شد.","Backup downloaded."],["اطلاعات پشتیبان بازیابی شدند.","Backup restored."],["فضای اولیه بازنشانی شد.","Workspace reset."],["موردی پیدا نشد.","No results found."],["موردی پیدا نشد","No results found"],
["این فضای اولیه برای طراحی و ثبت اطلاعات ساخته شده است.","This is an interactive preview for planning and recording initial data."],["داده‌ها فقط در مرورگر همین دستگاه نگهداری می‌شوند.","Data is stored only in this browser."],["تا راه‌اندازی ورود امن و پایگاه داده مرکزی، اطلاعات مالی یا مشخصات محرمانه مشتریان واقعی را در این نسخه آزمایشی وارد نکنید.","Do not enter sensitive financial or personal customer data until secure access and a central database are deployed."],["همگام‌سازی چندکاربره و اتصال بانکی و فروشگاهی هنوز فعال نیست.","Multi-user sync, banking and POS integrations are not enabled."],
["این فضای اولیه برای طراحی و ثبت اطلاعات ساخته شده است. داده‌ها فقط در مرورگر همین دستگاه نگهداری می‌شوند. تا راه‌اندازی ورود امن و پایگاه داده مرکزی، اطلاعات مالی یا مشخصات محرمانه مشتریان واقعی را در این نسخه آزمایشی وارد نکنید. همگام‌سازی چندکاربره و اتصال بانکی و فروشگاهی هنوز فعال نیست.","This is a preview workspace. Data remains in this browser only. Do not enter confidential customer or financial information until secure access and a central database are deployed. Multi-user synchronization and external integrations are not yet available."],
["این گزارش فقط ثبت‌های دستی در نسخه اولیه را نمایش می‌دهد؛ اتصال به صندوق رستوران، حسابداری، موجودی واقعی و سامانه‌های گردشگری هنوز راه‌اندازی نشده است.","These reports reflect manual entries only. No POS, accounting, inventory or booking integrations are connected."],
["نسخه اولیه","Preview"],["داده‌ها صرفاً روی همین دستگاه ذخیره می‌شوند","Data is stored on this device only"],["عکس: ساحل کیش","Photo: Kish Island"],["تصویر: ساحل کیش","Photo: Kish Island"],["عکس ساحل کیش: Mehrraz","Kish photo: Mehrraz"],
["ریال","Rial"],["تومان","Toman"],["گرم","g"],["تعداد","Qty"],["بدون کد","No SKU"],["سالن","Hall"],["خالی","Empty"],["ساعت","Time"],["قبل","Previous"],["بعد","Next"],["ثبت اولین مورد","Add First Record"],["پیش‌نمایش","Preview"],
["مدیریت سامانه","Platform Management"],
["مدیریت یکپارچه کسب‌وکارها","One Group. Complete Visibility."],
["مالی، مشتریان، پیگیری و گزارش‌های مدیریتی؛ یکپارچه در سطح مجموعه.","One set of shared capabilities for finance, CRM, workflows and reporting."],
["درآمد و هزینه تفکیکی هر کسب‌وکار","Income and expenses by business"],
["دفتر مشترک با تفکیک واحدهای کسب‌وکار","One contact directory, segmented by business"],
["وظایف مشترک و عملیاتی","Shared and operational responsibilities"],
["تصویر تجمیعی و مقایسه عملکرد","Consolidated insights and performance comparisons"],
["این مورد به‌صورت دائمی از همین مرورگر حذف شود؟","Permanently delete this record from this browser?"],
["داده‌های موجود این دستگاه با فایل انتخاب‌شده جایگزین شوند؟","Replace local data with the selected backup file?"],
["ماژول حذف شود؟","Delete this custom module?"],
["تمام داده‌های ثبت‌شده در این مرورگر حذف شود؟ ابتدا نسخه پشتیبان بگیرید.","Delete all locally recorded data? Please download a backup first."],
["بازیابی ناموفق: ","Restore failed: "],
["این مورد","This record"],
["شماره میز","Table Number"],
["میزهای سالن","Dining Room Tables"],
["نام یا عنوان","Name / Title"],
["پاسخ‌دهنده","Respondent"],
["داده واقعی واردشده","Entered records"],
["کسب‌وکار جدید ساخته شد.","New business created."],
["پرسش‌وپاسخ","Questions & Answers"],
["نامشخص","Unknown"],
["این بخش","This section"],
["مدیریت یکپارچه","Unified Management"],
["ثبت اطلاعات","Record Entry"],
["راهنما","Guide"],["خدمات مشترک هلدینگ","Group Shared Services"],["در همه واحدها","Across All Units"],["دریافت / پرداخت","Income / Expense"],["ثبت نشده","Not Recorded"],["درآمد و هزینه","Income and Expenses"]
];
const exact=new Map(rows);
const sorted=rows.filter(r=>r[0].length>=4).sort((a,b)=>b[0].length-a[0].length);
const originals=new WeakMap(),attributes=new WeakMap();
let lang="fa";
try{const x=localStorage.getItem(STORAGE);if(x==="en")lang="en";}catch(e){}
function digits(s){return s.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));}
function translate(str){
 if(str===null||str===undefined)return "";
 let s=String(str);if(lang!=="en")return s;
 const leading=s.match(/^\s*/)?.[0]||"", trailing=s.match(/\s*$/)?.[0]||"";
 let x=s.trim();
 if(!x)return s;
 if(exact.has(x))return leading+exact.get(x)+trailing;
 x=digits(x);
 if(exact.has(x))return leading+exact.get(x)+trailing;
 // Translate combined labels and counts without changing stored data.
 for(const [fa,en] of sorted){if(x.includes(fa))x=x.split(fa).join(en);}
 x=x.replace(/(\d+)\s+ثبت/g,"$1 records");
 x=x.replace(/[\u200c]/g," ").replace(/\s+←/g," ←");
 x=x.replace(/«/g,"“").replace(/»/g,"”");
 return leading+x+trailing;
}
function apply(root){
 if(!root)return;
 const tree=document.createTreeWalker?document.createTreeWalker(root,NodeFilter.SHOW_TEXT):null;
 if(tree){
  let node;
  while((node=tree.nextNode())){
   if(["SCRIPT","STYLE","NOSCRIPT"].includes(node.parentElement?.tagName))continue;
   if(!originals.has(node))originals.set(node,node.nodeValue);
   const source=originals.get(node);
   node.nodeValue=lang==="en"?translate(source):source;
  }
 }
 if(!root.querySelectorAll)return;
 const all=[root,...root.querySelectorAll("[placeholder],[title],[aria-label],[alt]")];
 for(const el of all){
  for(const a of ["placeholder","title","aria-label","alt"]){
   if(!el.hasAttribute?.(a))continue;
   let m=attributes.get(el);if(!m){m={};attributes.set(el,m);}
   if(m[a]===undefined)m[a]=el.getAttribute(a);
   el.setAttribute(a,lang==="en"?translate(m[a]):m[a]);
  }
 }
}
function syncControls(){
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==="en"?"ltr":"rtl";
 document.body.classList.toggle("is-english",lang==="en");
 document.querySelectorAll("[data-rf-lang]").forEach(btn=>{
  const chosen=btn.dataset.rfLang===lang;
  btn.setAttribute("aria-pressed",chosen?"true":"false");
  btn.classList.toggle("selected",chosen);
 });
 document.title=lang==="en"?"RF Holding | My Businesses":"RF Holding | کسب‌وکارهای من";
}
function setLanguage(value){
 if(!["fa","en"].includes(value))return;
 lang=value;
 try{localStorage.setItem(STORAGE,lang);}catch(e){}
 syncControls();
 if(typeof window.RF_RENDER==="function")window.RF_RENDER();
 apply(document.body);
}
function getLanguage(){return lang;}
window.RF_I18N={apply,translate,setLanguage,getLanguage};
document.addEventListener("click",function(e){
 const btn=e.target.closest?.("[data-rf-lang]");
 if(btn){e.preventDefault();setLanguage(btn.dataset.rfLang);}
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{syncControls();apply(document.body);});
else {syncControls();apply(document.body);}
})();