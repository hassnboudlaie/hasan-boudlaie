/* The Life Organization · Book I, Part I · Interactive reading and workbook.
   Source text lives in book1-content.js. No AI life scoring, no backend.
   Answers stay on this device unless the reader explicitly exports them. */
(function(){
"use strict";
const SOURCE=window.LifeBookContent;
if(!SOURCE||!Array.isArray(SOURCE.chapters))return;
const STORAGE="tlo-book1-part1-workbook-v1";
const TITLES=[
 "سازمانی که همین حالا اداره می‌کنید",
 "سازمان عالی زندگی چیست؟",
 "چگونه وضع موجود و وضع مناسب را ببینیم؟"
];
const BOOK_FIELDS=[
 [
  ["domains","حوزه‌ها و تعهدات فعلی","Current domains and commitments","۵ تا ۱۰ مورد واقعی را ثبت کنید؛ قرار نیست فهرست آرزوها باشد.","List five to ten actual commitments, not aspirations."],
  ["roles","نقش‌های موجود","Roles you currently carry","کدام نقش‌ها مسئولیت واقعی ایجاد می‌کنند؟","Which roles create real responsibilities?"],
  ["resources","منابع درگیر","Resources under pressure","زمان، انرژی، توجه، پول و ظرفیت جسمی و ذهنی بیشتر کجا مصرف می‌شوند؟","Where are your time, attention, energy, money and capacity being used?"],
  ["patterns","الگوهای تکرارشونده","Recurring patterns","چه چیزهایی معمولاً هفته‌به‌هفته تکرار می‌شوند؟","Which situations recur week after week?"],
  ["environment","شرایط محیطی مؤثر","Relevant external conditions","کدام عوامل بیرونی انتخاب‌های شما را محدود یا ممکن می‌کنند؟","Which outside conditions shape your choices?"],
  ["frictions","اصطکاک‌ها و وابستگی‌ها","Friction and dependencies","کدام تعهدها برای منابع مشترک با یکدیگر برخورد می‌کنند؟","Which commitments compete for the same limited resources?"],
  ["strengths","چیزهایی که خوب کار می‌کنند","What already works","چه رابطه‌ها، عادت‌ها و حمایت‌هایی ارزش حفظ‌کردن دارند؟","Which relationships, habits and supports should you preserve?"],
  ["observations","دو مشاهده اصلی","Two most important observations","فقط دو جمله دقیق و مبتنی بر مشاهده بنویسید.","Record two precise observations, rather than labels or judgments."]
 ],
 [
  ["criterion1","معیار اول؛ چه چیزی مهم است؟","Criterion 1 · What matters?","یک معیار مرتبط با شرایط واقعی خود انتخاب کنید.","Choose a criterion that fits your real situation."],
  ["reason1","چرا معیار اول مهم است؟","Why criterion 1 matters","اهمیت آن را برای زندگی فعلی خود روشن کنید.","Explain why it matters in your present circumstances."],
  ["evidence1","شاهد یا مجهول معیار اول","Evidence or unknown for criterion 1","چه شاهدی دارید؟ اگر ندارید، «نمی‌دانم» بنویسید.","State the evidence, or explicitly say what is unknown."],
  ["criterion2","معیار دوم","Criterion 2","معیار دیگری انتخاب کنید؛ الزاماً بیشترشدن یک عدد نیست.","Choose another criterion, not necessarily a number to maximize."],
  ["reason2","چرا معیار دوم مهم است؟","Why criterion 2 matters","دلیل متناسب با نقش‌ها و منابع خود را بنویسید.","Tie the rationale to your roles and resources."],
  ["evidence2","شاهد یا مجهول معیار دوم","Evidence or unknown for criterion 2","نتیجه را از کیفیت اداره آن جدا ببینید.","Distinguish the outcome from how you achieved it."],
  ["criterion3","معیار سوم (اختیاری)","Criterion 3 (optional)","اگر لازم است، یک معیار سوم اضافه کنید.","Add a third criterion only if useful."],
  ["reason3","چرا معیار سوم مهم است؟","Why criterion 3 matters","اهمیتش را مشخص کنید، نه اینکه از دیگران تقلید کنید.","Describe its importance without copying others."],
  ["evidence3","شاهد یا مجهول معیار سوم","Evidence or unknown for criterion 3","شاهد، برداشت و مجهول را از هم جدا نگه دارید.","Separate evidence, interpretations and unknowns."],
  ["focus","موضوع منتخب برای بررسی فصل سوم","Focus for Chapter 3","یک موضوع روشن انتخاب کنید تا در فصل سوم همان را بررسی کنید.","Choose one bounded topic to examine in Chapter 3."]
 ],
 [
  ["topic","موضوع مشخص بررسی","Defined topic","به‌جای «کل زندگی»، یک موضوع قابل مشاهده را نام ببرید.","Choose one observable topic, not your whole life."],
  ["boundary","مرز بررسی و شرایط مؤثر","Scope and relevant conditions","کدام نقش، فعالیت یا موقعیت را بررسی می‌کنید؟","State exactly which role, activity or situation is in scope."],
  ["period","بازه زمانی مشاهده","Observation period","بازه مشخص و قابل مقایسه تعیین کنید.","Set a clear and comparable time window."],
  ["criterion","معیار مناسب‌بودن و دلیل آن","Fit criterion and rationale","همان معیار تعریف‌شده در فصل دوم را دقیق‌تر کنید.","Refine a criterion established in Chapter 2."],
  ["current","وضع موجود با شاهد و واحد","Current state with evidence and unit","واقعیت مشاهده‌شده، منشأ آن و واحد سنجش را مشخص کنید.","Describe observations, their source and their unit."],
  ["baseline","مقدار آغازین و تاریخ (اگر موجود است)","Baseline and date (if available)","اگر شاهدی وجود ندارد، مقدار نسازید.","Do not invent a baseline where none exists."],
  ["suitable","وضع مناسب اولیه، دلیل و زمان مرجع","Initial suitable state, rationale and timing","وضع مناسب را متناسب با شرایط خود و قابل بازنگری بنویسید.","Define a suitable, revisable state for your own circumstances."],
  ["gap","فاصله قابل مشاهده","Observable gap","فاصله را فقط در صورت وجود شاهد، دقیق توصیف کنید.","Describe the gap without turning it into a judgment of yourself."],
  ["unknown","آنچه هنوز نمی‌دانم","What I still do not know","شاهدِ گمشده را مشخص کنید؛ شکاف را با علت اشتباه نگیرید.","List missing evidence; a gap is not a diagnosis."],
  ["preserve","چیزهایی که ارزش حفظ‌کردن دارند","What is worth preserving","حتی وقتی فاصله‌ای می‌بینید، نقاط قوت موجود را ثبت کنید.","Note existing strengths even when there is a gap."],
  ["next","مشاهده بعدی","Next observation","در گام بعد، چه چیزی را دقیق‌تر مشاهده خواهید کرد؟","What will you observe next?"],
  ["review","زمان بازبینی","Review date or time","زمانی واقع‌بینانه برای مراجعه دوباره تعیین کنید.","Set a realistic point to review the evidence."]
 ]
];
/* Chapter-specific authorial workbooks: learning tools, not validated assessments. */
BOOK_FIELDS.push(...[[["situation","موضوع، روش و بازه","Method and period","یک روش و شرط واقعی را نام ببرید.","Describe one real method and condition."],["assumption","فرض و ارزش پشت آن","Assumption and underlying value","فرض خود را دقیق بیان کنید.","State the assumption precisely."],["event","رویداد و شاهد مشخص","Actual event and evidence","مشاهده را از برداشت جدا کنید.","Separate observation from interpretation."],["stability","ثبات یا چابکی همان روش","Stability or agility of the method","چه چیزی حفظ یا تغییر کرده است؟","What remained or changed?"],["formality","قاعده قبلی یا هماهنگی موقعیتی","Prior rule or situational coordination","توافق مکتوب، شفاهی یا فرض شخصی؟","Written, verbal or assumed?"],["counterevidence","مثال نقض یا توضیح رقیب","Counterexample or alternative","کدام برداشت هنوز قطعی نیست؟","What interpretation remains uncertain?"],["preserve","نقطه قوت قابل حفظ","Strength to preserve","چه چیزی را نمی‌خواهید از دست بدهید؟","What deserves preservation?"],["stance","موضع اولیه و پرسش باز","Provisional stance and question","اطمینان یا ابهام را صادقانه ثبت کنید.","Acknowledge uncertainty."]],[["scope","حوزه، بازه و شرایط","Area, period and conditions","موضوع فصل سوم را مرور کنید.","Reuse a topic from Chapter 3."],["criterion","معیار نتیجه و موفقیت","Success criterion","قرار بود چه نتیجه‌ای حاصل شود؟","What outcome was expected?"],["outcomeEvidence","نتیجه و شاهد واقعی","Outcome evidence","از معیار خود شاهد بیاورید.","Document an observable result."],["experience","تجربه شادی همان بازه","Happiness experience","دو یا سه تجربه واقعی بنویسید.","Recall two or three experiences."],["contrast","تجربه متفاوت یا مختلط","Contrasting experience","تفاوت‌ها را پنهان نکنید.","Include mixed experiences."],["current","دلیل جایگاه فعلی","Current position and rationale","دو محور را جدا توضیح دهید.","Explain both axes."],["suitable","وضع مناسب و آنچه حفظ می‌شود","Suitable position and strengths","با ظرفیت و تعهدهای واقعی بسنجید.","Respect actual capacity."],["gap","فاصله فعلی تا مناسب","Current-to-suitable gap","شکاف را با ارزش خود اشتباه نگیرید.","Avoid self-judgment."],["unknown","شاهد کم و پرسش باز","Missing evidence and question","چه چیزی هنوز مبهم است؟","What is still unknown?"]],[["scope","حوزه و بازه مشترک","Comparable scope and period","از موضوع فصل پنجم شروع کنید.","Connect to Chapter 5."],["event1","موقعیت اول و نخستین عمل","Situation one and first action","چه رخ داد و اول چه کردید؟","Record what actually happened."],["evidence1","شاهد رفتار اول","Evidence for situation one","رفتار مشاهده‌شده را بنویسید.","Describe observable behavior."],["event2","موقعیت دوم و نخستین عمل","Situation two and first action","موقعیت مشابه انتخاب کنید.","Choose a comparable context."],["evidence2","شاهد رفتار دوم","Evidence for situation two","رفتار دوم را مشخص کنید.","Describe the second observed action."],["pace","آهنگ رفتار و شاهد","Pace/directness evidence","صریح یا سنجیده؛ یا ترکیبی؟","Direct, measured, or mixed?"],["orientation","جهت تعامل و شاهد","Interaction orientation evidence","پرسشگر یا پذیرا؛ یا ترکیبی؟","Questioning, accepting, or mixed?"],["pattern","الگوی مشروط رفتاری","Conditional pattern","وقتی ... معمولاً ...","When ... I usually ..."],["counter","استثنا یا توضیح رقیب","Exception or alternative","یک مورد متفاوت را ببینید.","Identify a counterexample."],["suitable","رفتار مناسب در همین وضعیت","Suitable behavior in context","چه رفتار را حفظ یا تعدیل می‌کنید؟","Preserve, add or adapt a behavior."],["unknown","سؤال باز یا کمبود شاهد","Open question","مشاهده ناکافی را به تیپ قطعی تبدیل نکنید.","Do not overinfer from limited evidence."]]]);
BOOK_FIELDS.push(...[[["scope","موضوع، بازه و شرایط","Topic, period and context","یک گام مهم و بازه مشخص انتخاب کنید.","Choose one meaningful step and defined period."],["actionCriterion","گام و شاهد انجام آن","Action criterion and evidence","از کجا معلوم می‌شود این گام انجام شده است؟","What observable event would count as doing it?"],["knowledge","دانستن و زمان آن","Knowledge and when it was available","آیا می‌توانستم گام مناسب و دلیلش را در همان زمان توضیح دهم؟","Could I explain the suitable action at that point?"],["action","عمل‌کردن و شاهد واقعی","Action and observed evidence","چه کاری در زمان مقرر واقعاً انجام شد؟","What did I actually do at the relevant time?"],["intention","قصد من در برابر اقدام","Intention versus action","تصمیم یا قصد را با انجام‌دادن یکی نگیرید.","Do not confuse intention with action."],["barrier","فاصله و مانع محتمل","Gap and possible barrier","توان، فرصت و انگیزش را فقط به اندازه شاهد بررسی کنید.","Explore capability, opportunity and motivation with evidence."],["suitable","وضع مناسب و گام شدنی","Suitable state and feasible step","چه اقدامی با شرایط و مسئولیت‌ها تناسب دارد؟","What action fits the actual conditions?"],["next","شاهد بعدی و زمان بازبینی","Next evidence and review point","چگونه دفعه بعد انجام این گام را بررسی می‌کنید؟","How will you verify the next action?"]],[["scope","حوزه، بازه و شرایط مقایسه","Scope, period and comparable conditions","از یک موضوع مشخص و سفارش/رویداد واقعی شروع کنید.","Start from one real situation."],["resultCriterion","نتیجه مهم و معیار اثربخشی","Desired outcome and effectiveness","چه نتیجه‌ای قرار بود حاصل شود؟","What result mattered?"],["resultEvidence","نتیجه واقعی و شاهد","Observed outcome evidence","نتیجه را با شاهد مستقل از تلاش ثبت کنید.","Record observed outcomes."],["resources","مصرف وقت، انرژی و هزینه","Use of time, energy and cost","در قیاس با کدام روش مشابه یا بازه؟","Compared with which reference?"],["efficiency","کارایی و مبنای مقایسه","Efficiency and comparison","آیا مصرف منابع قابل قبول بود؟ چرا؟","Was resource use acceptable, and why?"],["current","خانه فعلی و اطلاعات مجهول","Current position and missing data","به‌جای برچسب، نتیجه و منابع را جدا توضیح دهید.","Explain results and resource use separately."],["preserve","چیزهایی که باید حفظ شوند","What must be preserved","کدام مسئولیت، نتیجه یا کیفیت مهم است؟","Which outcomes or commitments are worth keeping?"],["context","کار تکراری یا متغیر؟","Routine, variable or both?","کدام بخش روال ثابت و کدام بخش نیازمند بازنگری است؟","What should be stable versus adapted?"],["impact","اثر این روش بر دیگر حوزه‌های زندگی","Impact on other life domains","چه نقش یا تعهدی از این شیوه سود می‌برد یا زیر فشار می‌رود؟","What other commitment benefits or suffers?"],["readiness","منابع و امکان اقدام","Resources and readiness","چه اختیار، کمک یا زمان واقعی در دسترس است؟","Which capacity and support can you actually use?"],["suitable","خانه مناسب و تغییر شدنی","Suitable position and feasible adjustment","یک وضعیت متناسب پیشنهاد کنید، نه خانه برتر همگانی.","Choose a context-sensitive adjustment."],["experiment","آزمون کوچک و زمان بازبینی","Small test and review date","شاهد نتیجه و مصرف منابع را در آزمون ثبت کنید.","Track both outcome and resource use."]],[["scope","موضوع و بازه مشخص","Defined topic and period","همان موضوع فصل قبل را تا حد امکان ثابت نگه دارید.","Keep the unit of analysis consistent."],["behavior","رفتار واقعی و مدرک آن","Actual behavior and evidence","چه کاری انجام شد و چه چیزی آن را نشان می‌دهد؟","What exactly did you do?"],["fit","تناسب رفتار با نیاز یا توافق","Behavioral fit to context","مبنای قضاوت درباره مناسب‌بودن رفتار چیست؟","What made this behavior fitting or not?"],["outcome","نتیجه و معیار آن","Outcome and success criterion","نتیجه را از رفتار و قصد جدا بنویسید.","Separate results from actions and intentions."],["current","جایگاه فعلی و مجهولات","Current position and unknowns","هر محور را جدا با شاهد بسنجید.","Examine behavior and result separately."],["suitable","رفتار و نتیجه مناسب","Suitable behavior and result","چه رفتاری را می‌خواهید حفظ یا عوض کنید؟","What action would be suitable next?"],["comparison","مقایسه منصفانه و عامل رقیب","Fair comparison and confounder","آیا دو موقعیت واقعاً قابل مقایسه‌اند؟","Are both situations comparable?"],["spillover","اثر رفتار بر زمان و تعهدهای دیگر","Spillover to other commitments","چه مسئولیت دیگری ممکن است زیر فشار برود؟","What else could be affected?"],["experiment","آزمون کوچک رفتار تازه","Small behavioral experiment","دفعه بعد دقیقاً چه کار می‌کنید؟","What will you do differently next time?"],["review","شاهد انجام، نتیجه و زمان بازبینی","Evidence and review date","رفتار، نتیجه و فشار تازه را جدا ثبت کنید.","Record actions, outcomes and new pressure."]],[["scope","کار، بازه و شرایط","Work, period and conditions","یک فعالیت مشخص، نه تمام شغل یا زندگی، انتخاب کنید.","Choose one actual activity."],["effort","میزان زحمت و مقایسه","Effort and comparison","وقت، توجه، انرژی و دشواری واقعی این کار چه‌قدر است؟","What actual effort did the work require?"],["yield","نتیجه و بازده واقعی","Outcome and value of results","چه چیزی به دست آمد و چرا برای شما ارزش دارد؟","What valuable result emerged?"],["necessary","زحمت لازم و زحمت قابل کاهش","Necessary versus avoidable effort","زحمت ذاتی کار را با دوباره‌کاری قاطی نکنید.","Separate intrinsic effort from avoidable rework."],["current","وضع فعلی و شاهد آن","Current position and evidence","خانه را با شواهد زحمت و بازده مشخص کنید.","Locate the current position with evidence."],["optionA","گزینه شدنی اول","Feasible option A","ادامه یک روش مشخص با نتیجه مورد انتظار.","Specify a feasible first option."],["optionB","گزینه شدنی دوم","Feasible option B","یک روش جایگزین واقعاً در دسترس.","Specify a realistic alternative."],["constraints","مهارت، تعهد و حداقل‌های لازم","Constraints and minimum needs","تخصص، درآمد مورد نیاز و تعهدهای واقعی را لحاظ کنید.","Consider constraints and real obligations."],["opportunityCost","بهترین گزینه ازدست‌رفته","Best forgone alternative","با این انتخاب، بهترین استفاده دیگری که کنار می‌رود چیست؟","What is the best forgone alternative?"],["suitable","خانه مناسب و نتیجه‌ای که باید حفظ شود","Suitable position and preserved result","خانه مناسب را متناسب با شرایط خود توضیح دهید.","Explain contextual fit, not universal ranking."],["test","آزمون، شاهد و بازبینی","Experiment, evidence and review","زحمت، نتیجه و اثر بر تعهدهای دیگر را در بازه بعدی ثبت کنید.","Review effort, outcomes and spillovers."]]]);
BOOK_FIELDS.push([["scope","تصمیم، حوزه و بازه","Decision, context and time window","یک تصمیم واقعی با مرز و زمان مشخص ثبت کنید.","Define one actual decision and review period."],["currentStart","نقطه شروع فعلی و شاهد آن","Current starting point and evidence","از معنای مطلوب شروع کردم یا از شواهد و امکانات؟ ترکیبی و نامعلوم هم مجاز است.","Did you start with meaning and vision or with evidence and resources?"],["currentMethod","روش فعلی و شواهد آن","Current progress method and evidence","روال موجود را بهبود دادم یا منطق کار را بازطراحی کردم؟","Did you improve the routine or change the underlying method?"],["currentEvidence","چیزی که واقعاً اتفاق افتاد","What actually happened","قصد و آرزو را با تصمیم یا اقدام انجام‌شده یکی نگیرید.","Separate intention from observed events."],["suitableStart","نقطه شروع مناسب در این تصمیم","Suitable starting point","با توجه به این موقعیت، معنا و چشم‌انداز مناسب‌تر است یا شواهد و امکانات؟","What starting point better fits this decision?"],["suitableMethod","مسیر مناسب پیشنهادی","Suitable progress method","بهبود گام‌به‌گام یا بازطراحی روش؟ دلیل و وضعیت مجهول را بنویسید.","Would incremental improvement or redesign fit better, and why?"],["preserve","آنچه باید حفظ شود","What must be preserved","کدام نتیجه، کیفیت یا تعهد در تغییر مسیر باید باقی بماند؟","What commitment or quality must remain intact?"],["gap","فاصله مشخص و داده گمشده","Specific gap and missing evidence","فاصله وضع موجود و مناسب چیست و چه چیزی هنوز روشن نیست؟","What differs between current and suitable positions?"],["readiness","تناسب، آمادگی و اثر بر زندگی","Fit, readiness and spillover","وقت، اختیار، مهارت و همراهی لازم؛ چه تعهد دیگری زیر فشار می‌رود؟","What capacity, support and other affected obligations matter?"],["review","آزمون کوچک و زمان بازبینی","Small test and review date","گام قابل اجرا و شاهدی که نتیجه‌اش را نشان دهد ثبت کنید.","Specify a feasible test and observable evidence."]]);
BOOK_FIELDS.push([["scope","حوزه یا تصمیم مشخص","Decision or domain","یک موضوع قابل مشاهده انتخاب کنید؛ نه تمام زندگی.","Select one bounded situation."],["period","بازه و شرایط","Period and context","زمان و شرایط این تصمیم را روشن کنید.","Specify the timeframe and circumstances."],["choiceA","انتخاب اول و فصل مرتبط","First choice and source chapter","شاهد این انتخاب از کدام فصل است؟","Which chapter and evidence support this choice?"],["choiceB","انتخاب دوم و فصل مرتبط","Second choice and source chapter","این انتخاب چگونه با اولی ارتباط دارد؟","How does this choice interact with the first?"],["fit","همسویی یا مغایرت و دلیل","Alignment or conflict with evidence","کدام وقت، منبع، اختیار یا قول مشترک میان دو انتخاب است؟","Identify the shared time, resource, authority or promise."],["preserve","آنچه ارزش حفظ‌کردن دارد","What to preserve","کدام نتیجه، کیفیت یا رابطه را باید حفظ کرد؟","What outcome or relationship must stay intact?"],["unknown","شاهد ناکافی و سؤال باز","Uncertainty and missing evidence","چه فرضی هنوز بررسی نشده است؟","Which assumption still needs testing?"],["next","تغییر اولویت‌دار قابل‌انجام","One feasible next change","کوچک‌ترین اقدام در محدوده اختیار و شرایط واقعی چیست؟","Identify one feasible adjustment."],["readiness","شرط آمادگی و هماهنگی","Readiness and coordination","چه زمان، اختیار، مهارت یا توافقی لازم است؟","What support and agreement are needed?"],["review","زمان و معیار بازبینی","Review date and observation","کی و با چه شاهدی تصمیم بعدی را می‌گیرید؟","When and how will you review?"]]);
const WORKSHEET_TITLES_FA=["نمای فوری سازمان زندگی من","معیارهای اولیه زندگی من","برگه وضع موجود و وضع مناسب","فرض‌ها و منطق اداره زندگی","نقشه شادی و موفقیت من","دو موقعیت و یک الگوی رفتاری","برگه دانستن و عمل‌کردن","نقشه مدیرعاملی و بهره‌وری زندگی","کاربرگ رفتار و نتیجه من","کاربرگ زحمت، بازده و گزینه ازدست‌رفته","کاربرگ فلسفه پیشرفت من","نمایه و ممیزی بنیادین من"];
const WORKSHEET_TITLES_EN=["My Life Organization Snapshot","My Initial Fit Criteria","Current and Suitable States","Assumptions and Ways of Organizing","My Happiness–Success Map","Two Situations and One Behavior Pattern","Knowing and Acting","Managing Life and Productivity","Behavior and Outcomes","Effort, Yield and Opportunity Cost","My Philosophy of Progress Workbook","My Foundational Life Profile"];
let state=readState();
function readState(){
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE)||"null");
  if(raw&&typeof raw==="object"&&!Array.isArray(raw))return {
   fields:raw.fields&&typeof raw.fields==="object"?raw.fields:{},
   checked:raw.checked&&typeof raw.checked==="object"?raw.checked:{}
  };
 }catch(e){}
 return {fields:{},checked:{}};
}
function persist(){
 try{localStorage.setItem(STORAGE,JSON.stringify(state));return true}
 catch(e){return false}
}
const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const T=(lang,fa,en)=>lang==="en"?en:fa;
const cnum=n=>String(n).padStart(2,"0");
const sectionsMemo={};
function parse(n){
 if(sectionsMemo[n])return sectionsMemo[n];
 const book=SOURCE.chapters[n-1];
 if(!book)return [];
 const lines=book.sourceText.split(/\r?\n/);
 const parts=[{heading:"آغاز فصل",type:"intro",lines:[]}];
 for(const line of lines.slice(2)){
  if(/^(گفتار (اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم)|ابزار فصل|کاربرگ|پایان فصل|پایان جلد اول|راهنمای اپ|یادداشت فصل|یادداشت‌ها و منابع فصل|پایان بخش اول)/.test(line)){
   const kind=line.startsWith("گفتار ")?"talk":(line.startsWith("ابزار فصل")||line.startsWith("کاربرگ"))?"original-tool":(line.startsWith("پایان فصل")||line.startsWith("پایان جلد اول"))?"ending":(line.startsWith("یادداشت‌ها")||line.startsWith("یادداشت فصل"))?"references":"part-end";
   parts.push({heading:line,type:kind,lines:[]});
  }else parts[parts.length-1].lines.push(line);
 }
 sectionsMemo[n]=parts;
 return parts;
}
function talks(n){return parse(n).filter(x=>x.type==="talk")}
function completed(n){
 return parse(n).filter((section,i)=>section.type==="talk"&&state.checked[n+"-"+i]).length;
}
function totalTalks(n){return talks(n).length}
function question(n){
 const x=SOURCE.chapters[n-1].sourceText.split("\n");
 const i=x.indexOf("سؤال بزرگ فصل");
 return i>=0?x[i+1]:(SOURCE.chapters[n-1].leadQuestion||"");
}
function formatLine(s){
 const x=s.trim();
 if(window.LifeBookAssets?.[x])return window.LifeBookAssets[x].replace(/data-book-image="([^"]+)"/g,(_,id)=>'src="'+window.LifeBookImages[id]+'"');
 if(!x)return "";
 if(/^https:\/\//.test(x)){
  try{
   const url=new URL(x);
   if(url.protocol==="https:")return '<p class="lb-source-link"><a href="'+E(url.href)+'" rel="noopener noreferrer" target="_blank" dir="ltr">'+E(x)+'</a></p>';
  }catch(e){}
 }
 const list=/^[•●▪]\s*/.test(x);
 if(list)return '<p class="lb-manuscript-bullet"><span aria-hidden="true">•</span>'+E(x.replace(/^[•●▪]\s*/,""))+'</p>';
 return '<p class="lb-manuscript-line">'+E(x)+'</p>';
}
function progressText(n,lang){
 return T(lang,"مرور "+completed(n)+" از "+totalTalks(n)+" گفتار","Reviewed "+completed(n)+" of "+totalTalks(n)+" sections");
}
function masthead(lang,chapter=0){
 return '<div class="lb-topline"><span>'+T(lang,chapter===0?"جلد اول / ساختار دوازده‌فصلی":chapter===12?"جلد اول / بخش سوم":chapter>3?"جلد اول / بخش دوم":"جلد اول / بخش اول",chapter===0?"Book One / Twelve-Chapter Architecture":chapter===12?"Book One / Part Three":chapter>3?"Book One / Part Two":"Book One / Part One")+'</span><span class="lb-brand-signature"><img src="./brand-symbol.svg" alt="" width="29" height="29"><span dir="ltr">THE LIFE ORGANIZATION</span></span></div>';
}
function progressTrack(n){
 return '<div class="lb-track" aria-hidden="true"><div style="width:'+Math.round(100*completed(n)/totalTalks(n))+'%"></div></div>';
}
function ribbon(lang,chapter){
 return '<div class="lb-ribbon"><button class="lb-text-button" type="button" data-route="module/1">'+T(lang,"نمای کلی جلد اول","Book One overview")+'</button>'+
 '<span class="lb-ribbon-split" aria-hidden="true">/</span><span>'+T(lang,"فصل "+chapter,"Chapter "+chapter)+'</span></div>';
}
function landing(lang){
 const content=SOURCE.chapters.map((ch,i)=>{
  const n=i+1;
  const descriptions=[
   T(lang,"دیدن اجزا، نقش‌ها، منابع و الگوهای واقعی زندگی","Observe roles, resources and the actual patterns of your life"),
   T(lang,"معیارهای متناسب با خود را از نتایج ظاهری جدا کنیم","Clarify criteria that fit you, beyond apparent results"),
   T(lang,"توصیف شاهددار وضع موجود، وضع مناسب و فاصله آنها","Compare present and suitable states using evidence"),
   T(lang,"ثبت فرض و جایگاه ثبات/چابکی و قواعد","Explore assumptions, agility and formality"),
   T(lang,"نقشه شادی و موفقیت یک حوزه مشخص","Map happiness and success in one context"),
   T(lang,"دو موقعیت و الگوی رفتار مبتنی بر DiSC","Observe two situations with the DiSC axes"),
   T(lang,"دانستن و عمل‌کردن را با شواهد جدا بررسی کنید","Compare knowing and acting through evidence"),
   T(lang,"اثربخشی نتیجه و کارایی مصرف منابع را جدا ببینید","Compare effectiveness and resource efficiency"),
   T(lang,"رفتار مناسب و حاصل‌شدن نتیجه را یکسان نگیرید","Separate appropriate behavior from its outcomes"),
   T(lang,"زحمت، بازده و بهترین گزینه ازدست‌رفته را بررسی کنید","Examine effort, yield and opportunity cost"),
   T(lang,"نقطه شروع و شیوه پیشرفت را با شواهد و امکانات خود بررسی کنید","Explore where to begin and how to progress, with evidence"),
   T(lang,"هشت موضع بنیادین را به یک نمایه پیوسته و تصمیم قابل‌بازبینی تبدیل کنید","Connect eight perspectives into one reviewable life profile")
  ];
  return '<article class="lb-chapter-tile"><div class="lb-tile-top"><span class="lb-chapter-number">'+cnum(n)+'</span><span class="lb-tile-status">'+progressText(n,lang)+'</span></div>'+
   '<h3>'+E(T(lang,ch.title,ch.englishTitle))+'</h3><p>'+descriptions[i]+'</p>'+
   progressTrack(n)+'<div class="lb-tile-actions"><button class="lb-button lb-button-primary" type="button" data-route="book1/'+n+'">'+T(lang,"مطالعه فصل","Read chapter")+'</button>'+
   '<button class="lb-button lb-button-quiet" type="button" data-route="book1/'+n+'/workbook">'+T(lang,"ابزار فصل","Worksheet")+'</button></div></article>';
 }).join("");
 return '<div class="lb-root lb-landing">'+masthead(lang)+
 '<section class="lb-cover"><img class="lb-cover-brand" src="./brand-symbol.svg" alt="" loading="lazy"><div class="lb-cover-orbit" aria-hidden="true"><span>01</span><i></i><i></i><i></i></div><div class="lb-cover-copy"><p class="lb-eyebrow">BOOK I · THE FOUNDATION</p>'+
 '<h1>'+T(lang,"من کجای زندگی ایستاده‌ام؟","Where do I stand in my life?")+'</h1>'+
 '<p class="lb-cover-intro">'+T(lang,"این جلد سه بخش و دوازدوازده فصل دارد: دیدن سازمان زندگی، شناخت هشت موضع بنیادین و ساختن نمایه نهایی. دوازدوازده فصل تألیف‌شده اکنون برای مطالعه و کاربست در دسترس‌اند.","Book One has three parts and twelve planned chapters: observing life, exploring eight foundational orientations and building an integrated profile. All twelve authored chapters are ready to explore.")+'</p>'+
 '<div class="lb-cover-buttons"><button class="lb-button lb-button-light" type="button" data-route="book1/1">'+T(lang,"شروع فصل اول","Start Chapter 1")+'</button>'+
 '<button class="lb-button lb-button-outline-light" type="button" data-route="book1/workbook">'+T(lang,"دفتر کار دوازدوازده فصل","Twelve-chapter workbook")+'</button></div></div></section>'+
 '<div class="lb-intro-statement"><span>01</span><p>'+T(lang,"ببینیم چه چیزی هست","Observe what is")+'</p><span class="lb-chevron">›</span><span>02</span><p>'+T(lang,"روشن کنیم چه چیزی مهم است","Clarify what matters")+'</p><span class="lb-chevron">›</span><span>03</span><p>'+T(lang,"شاهد و فاصله را مقایسه کنیم","Compare evidence and gaps")+'</p></div>'+
 '<div class="lb-section-header"><div><p class="lb-eyebrow">BOOK ONE · 12-CHAPTER PLAN</p><h2>'+T(lang,"مسیر مطالعه و تمرین","Your reading and practice journey")+'</h2></div><span class="lb-muted">'+T(lang,"بدون نمره‌دهی به زندگی","No life score")+'</span></div>'+
 '<div class="lb-tiles">'+content+SOURCE.plannedChapters.slice(12,12).map((title,i)=>'<article class="lb-chapter-tile lo-upcoming"><div class="lb-tile-top"><span class="lb-chapter-number">'+cnum(i+12)+'</span><span class="lb-tile-status">'+T(lang,"در انتظار تألیف","Not yet authored")+'</span></div><h3>'+E(title)+'</h3><p>'+T(lang,"عنوان طبق فهرست مطالب مصوب؛ بدون متن یا ابزار ساختگی.","Approved chapter title only; no fabricated manuscript or assessment.")+'</p></article>').join("")+'</div>'+
 '<section class="lb-journal-teaser"><div><h2>'+T(lang,"دفتر کار یکپارچه من","My connected workbook")+'</h2><p>'+T(lang,"خروجی‌های دوازدوازده فصل به هم متصل‌اند: نمای فوری، معیارهای اولیه و برگه وضع موجود/مناسب. یادداشت‌ها فقط در همین مرورگر ذخیره می‌شوند.","Your snapshot, initial criteria and current/suitable-state sheet form one coherent workbook. Notes are stored only in this browser.")+'</p></div>'+
 '<button type="button" class="lb-button lb-button-primary" data-route="book1/workbook">'+T(lang,"مشاهده دفتر کار","Open workbook")+'</button></section>'+
 '<p class="lb-privacy">'+T(lang,"این نسخه ابزار تأمل آموزشی است، نه آزمون روان‌شناختی یا ارزیابی استاندارد. اطلاعات محرمانه وارد نکنید؛ ذخیره‌سازی Local و رمزنگاری‌نشده است.","These are learning and reflection tools, not validated psychometric assessments. Avoid sensitive information; local storage is unencrypted.")+'</p></div>';
}
function chapterPage(n,lang){
 const ch=SOURCE.chapters[n-1];
 if(!ch)return landing(lang);
 const parts=parse(n);
 const isEn=lang==="en";
 const tabs=SOURCE.chapters.map((x,i)=>{
  const id=i+1;
  return '<button type="button" data-route="book1/'+id+'" class="lb-chapter-tab'+(id===n?" current":"")+'" '+(id===n?'aria-current="page"':"")+'><span>'+cnum(id)+'</span>'+E(T(lang,x.title,x.englishTitle))+'</button>';
 }).join("");
 const content=parts.map((part,i)=>{
  const talk=part.type==="talk",done=!!state.checked[n+"-"+i];
  const heading=i===0?T(lang,"آغاز فصل و اهداف یادگیری","Chapter opening and learning goals"):part.heading;
  const original=part.lines.map(formatLine).join("");
  const badge=part.type==="references"?"REFERENCE NOTES":part.type==="original-tool"?"SOURCE WORKSHEET":part.type==="part-end"?"PART ONE COMPLETE":talk?"READING":"REFLECTION";
  const btn=talk?'<button type="button" class="lb-mark'+(done?" is-done":"")+'" data-lb-action="mark" data-chapter="'+n+'" data-section="'+i+'" aria-pressed="'+done+'">'+(done?T(lang,"✓ مرور شد","✓ Reviewed"):T(lang,"علامت‌گذاری: مطالعه شد","Mark as reviewed"))+'</button>':"";
  return '<details id="lb-sec-'+n+'-'+i+'" class="lb-reading-panel lb-reading-'+part.type+'" '+(i===0||i===1?"open":"")+'>'+
    '<summary><div><span class="lb-panel-label">'+badge+'</span><h3>'+E(heading)+'</h3></div><span class="lb-expand-icon" aria-hidden="true">⌄</span></summary>'+
    '<div class="lb-panel-body" lang="fa" dir="rtl">'+original+btn+'</div></details>';
 }).join("");
 const jump=parts.filter(p=>p.type==="talk").map(p=>{const index=parts.indexOf(p);return '<button type="button" data-lb-action="jump" data-target="lb-sec-'+n+'-'+index+'">'+E(p.heading.replace(/^گفتار (اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم)\s+/,""))+'</button>';}).join("");
 const next=n<12?'<button type="button" class="lb-button lb-button-primary" data-route="book1/'+(n+1)+'">'+T(lang,"فصل بعدی","Next chapter")+'</button>':'<button type="button" class="lb-button lb-button-primary" data-route="book1/workbook">'+T(lang,"مرور خروجی دوازدوازده فصل","Review complete profile")+'</button>';
 return '<div class="lb-root lb-reader">'+ribbon(lang,n)+masthead(lang,n)+
 '<section class="lb-chapter-hero"><div class="lb-hero-meta"><span>'+T(lang,"فصل "+n+" از ۱۲","Chapter "+n+" of 12")+'</span><span dir="ltr">BOOK ONE · PART '+(n===12?"III":n>3?"II":"I")+'</span></div>'+
 '<h1>'+E(T(lang,ch.title,ch.englishTitle))+'</h1><p class="lb-original-title">'+T(lang,ch.editionStatus==="editorial-review"?"نسخه تألیفی در بازبینی":"متن کامل تألیفی فارسی",ch.editionStatus==="editorial-review"?"Editorial review manuscript":"Complete authored Persian manuscript")+'</p>'+
 '<div class="lb-big-question"><small>'+T(lang,"سؤال بزرگ فصل","Core chapter question")+'</small><strong lang="fa" dir="rtl">'+E(question(n))+'</strong></div>'+
 '<div class="lb-read-meta"><span data-lb-progress="'+n+'">'+progressText(n,lang)+'</span><span>'+T(lang,"مطالعه در گفتارهای قابل‌بازشدن","Expandable reading sections")+'</span></div>'+progressTrack(n)+'</section>'+
 '<nav class="lb-chapter-tabs" aria-label="Book One chapters">'+tabs+'</nav>'+
 '<div class="lb-reader-toolbar"><div><h2>'+T(lang,"متن فصل و منابع","Chapter text and references")+'</h2><p>'+T(lang,"برای مطالعه، هر گفتار را باز کنید. متن اصلی بدون تلخیص آمده است.","Open each section to read. The Persian manuscript is presented without summarization.")+'</p></div>'+
 '<button type="button" class="lb-button lb-button-primary" data-route="book1/'+n+'/workbook">'+T(lang,"ورود به ابزار فصل","Open chapter worksheet")+'</button></div>'+
 '<div class="lb-jump-list" aria-label="Chapter section navigation">'+jump+'</div>'+
 '<div class="lb-reading-stack">'+content+'</div>'+
 '<section class="lb-reflection-prompt"><span class="lb-eyebrow">REFLECT · APPLY · LEARN</span><h2>'+T(lang,"از مطالعه به مشاهده","From reading to observation")+'</h2>'+
 '<p>'+T(lang,"قرار نیست خودتان را با دیگران مقایسه کنید. این فصل را به یک مشاهده روشن و قابل استفاده در دفتر کار تبدیل کنید.","The point is not comparison with other people. Turn the chapter into an observation you can use in your workbook.")+'</p>'+
 '<button type="button" class="lb-button lb-button-primary" data-route="book1/'+n+'/workbook">'+T(lang,"ثبت خروجی فصل "+n,"Capture Chapter "+n+" output")+'</button></section>'+
 '<div class="lb-page-bottom"><button class="lb-button lb-button-quiet" type="button" data-route="module/1">'+T(lang,"بازگشت به مسیر دوازدوازده فصل","Back to chapters")+'</button>'+next+'</div>'+
 '<p class="lb-manuscript-note">'+T(lang,"منبع: اسناد تألیفی جلد اول. روایت‌ها و شخصیت‌ها آموزشی و فرضی‌اند. منابع علمی در انتهای هر فصل درج شده‌اند.","Source: Book One authored manuscripts. Characters and situations are fictional teaching examples; references are included at each chapter’s end.")+' <a href="'+E(ch.sourceUrl||SOURCE.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+T(lang,"مشاهده فایل اصلی در Google Drive","View original manuscript on Google Drive")+'</a></p></div>';
}
function fieldValue(n,key){
 const group=state.fields[n];
 return group&&typeof group[key]==="string"?group[key]:"";
}
function fieldsFilled(n){return BOOK_FIELDS[n-1].filter(x=>fieldValue(n,x[0]).trim()).length}
function worksheetPage(n,lang){
 if(!(n>=1&&n<=12))return workbookOverview(lang);
 const ch=SOURCE.chapters[n-1],fs=BOOK_FIELDS[n-1];
 const total=fs.length;
 const title=T(lang,WORKSHEET_TITLES_FA[n-1],WORKSHEET_TITLES_EN[n-1]);
 const fields=fs.map((f,i)=>{
  const id="lb-input-"+n+"-"+f[0];
  return '<div class="lb-form-field '+(n===3&&["current","suitable","gap"].includes(f[0])?"lb-field-major":"")+'">'+
   '<label for="'+id+'"><span class="lb-field-number">'+cnum(i+1)+'</span>'+E(T(lang,f[1],f[2]))+'</label>'+
   '<p>'+E(T(lang,f[3],f[4]))+'</p>'+
   '<textarea id="'+id+'" data-lb-field="'+E(f[0])+'" data-chapter="'+n+'" rows="4" maxlength="1800" placeholder="'+E(T(lang,"مشاهده خود را بنویسید؛ «نمی‌دانم» هم یک پاسخ معتبر است.","Write your observation. Saying “I don’t know yet” is valid."))+'">'+E(fieldValue(n,f[0]))+'</textarea></div>';
 }).join("");
 const next=n<12?'<button class="lb-button lb-button-primary" data-route="book1/'+(n+1)+'/workbook">'+T(lang,"ابزار فصل بعدی","Next worksheet")+'</button>':'<button class="lb-button lb-button-primary" data-route="book1/workbook">'+T(lang,"نمایه نهایی جلد اول","Review all chapters")+'</button>';
 return '<div class="lb-root lb-workbook-page">'+ribbon(lang,n)+masthead(lang,n)+
 '<section class="lb-worksheet-hero"><div class="lb-eyebrow">'+T(lang,"WORKBOOK · فصل "+cnum(n),"WORKBOOK · CHAPTER "+cnum(n))+'</div><h1>'+title+'</h1>'+
 '<p>'+T(lang,"این یک برگه مشاهده و بازاندیشی است، نه آزمون یا نمره زندگی. پاسخ‌ها فقط در دستگاه شما ذخیره می‌شوند.","This is a learning and reflection worksheet, not a diagnostic test or life score. Answers remain on this device.")+'</p>'+
 '<div class="lb-worksheet-meta"><strong>'+T(lang,fieldsFilled(n)+" از "+total+" بخش دارای یادداشت",fieldsFilled(n)+" of "+total+" prompts filled")+'</strong><span id="lb-save-status" role="status">'+T(lang,"ذخیره محلی خودکار","Auto-saved locally")+'</span></div></section>'+
 '<div class="lb-workbook-nav"><button class="lb-button lb-button-quiet" data-route="book1/'+n+'">'+T(lang,"مطالعه متن اصلی","Read original chapter")+'</button><button class="lb-button lb-button-quiet" data-route="book1/workbook">'+T(lang,"نمای کلی دفتر کار","Workbook overview")+'</button></div>'+
 '<form class="lb-workbook-form" autocomplete="off">'+fields+'</form>'+
 '<div class="lb-workbook-actions"><button class="lb-button lb-button-quiet" type="button" data-lb-action="download-text">'+T(lang,"دریافت نسخه متنی دوازده فصل","Export readable workbook")+'</button>'+
 '<button class="lb-button lb-button-quiet" type="button" data-lb-action="download-json">'+T(lang,"پشتیبان داده‌ها JSON","Backup JSON")+'</button>'+
 '<button class="lb-button lb-button-danger" type="button" data-lb-action="clear-chapter" data-chapter="'+n+'">'+T(lang,"پاک‌کردن پاسخ‌های این فصل","Clear this chapter’s answers")+'</button></div>'+
 '<div class="lb-page-bottom"><button class="lb-button lb-button-outline" data-route="module/1">'+T(lang,"مسیر دوازدوازده فصل","All twelve chapters")+'</button>'+next+'</div>'+
 '<p class="lb-privacy">'+T(lang,"هشدار حریم خصوصی: ذخیره‌سازی این نسخه از نوع LocalStorage و رمزنگاری‌نشده است. برای حفظ اطلاعات مهم، Export بگیرید؛ پاک‌کردن داده مرورگر می‌تواند پاسخ‌ها را حذف کند.","Privacy notice: This version uses unencrypted browser storage. Export important notes; clearing browser data can remove them.")+'</p></div>';
}
function workbookOverview(lang){
 const tiles=SOURCE.chapters.map((ch,i)=>{
  const n=i+1,num=fieldsFilled(n),fs=BOOK_FIELDS[i];
  const previews=fs.filter(f=>fieldValue(n,f[0]).trim()).slice(0,2).map(f=>
   '<p class="lb-workbook-preview"><strong>'+E(T(lang,f[1],f[2]))+': </strong>'+E(fieldValue(n,f[0]).trim().slice(0,155))+'</p>').join("");
  return '<article class="lb-summary-card"><div class="lb-summary-top"><span class="lb-chapter-number">'+cnum(n)+'</span><span>'+T(lang,num+" از "+fs.length+" یادداشت",num+" of "+fs.length+" prompts")+'</span></div>'+
  '<h2>'+E(T(lang,ch.title,ch.englishTitle))+'</h2>'+(previews||'<p class="lb-empty">'+T(lang,"هنوز یادداشتی ثبت نشده است.","No notes captured yet.")+'</p>')+
  '<button class="lb-button lb-button-primary" data-route="book1/'+n+'/workbook">'+T(lang,"بازکردن برگه","Open worksheet")+'</button></article>';
 }).join("");
 return '<div class="lb-root lb-summary">'+masthead(lang)+
 '<div class="lb-ribbon"><button class="lb-text-button" type="button" data-route="module/1">'+T(lang,"بازگشت به جلد اول","Back to Book One")+'</button></div>'+
 '<section class="lb-worksheet-hero"><div class="lb-eyebrow">THE CONNECTED WORKBOOK</div><h1>'+T(lang,"دفتر کار یکپارچه جلد اول","Your connected ten-chapter workbook")+'</h1>'+
 '<p>'+T(lang,"شش خروجی به هم پیوسته‌اند: تصویر واقعی زندگی، معیارهای مناسب‌بودن و نخستین مقایسه وضع موجود و مناسب. جای خالی و «نمی‌دانم» هم بخشی از یادگیری‌اند.","Your snapshot, fit criteria and initial current/suitable-state comparison build on one another. Unanswered questions are part of the learning process.")+'</p></section>'+
 '<div class="lb-summary-flow"><span>'+T(lang,"مشاهده","Observe")+'</span><b>→</b><span>'+T(lang,"معیار","Criteria")+'</span><b>→</b><span>'+T(lang,"مقایسه","Compare")+'</span></div>'+
 '<div class="lb-summary-grid">'+tiles+'</div>'+
 '<section class="lb-download-card"><div><h2>'+T(lang,"پشتیبان و خروجی شخصی","Back up and export your work")+'</h2><p>'+T(lang,"خروجی متنی قابل مطالعه یا فایل JSON قابل بازیابی دریافت کنید. هیچ داده‌ای به سرور ارسال نمی‌شود.","Download a readable text report or JSON backup. No data is transmitted to a server.")+'</p></div>'+
 '<div class="lb-download-actions"><button class="lb-button lb-button-primary" data-lb-action="download-text">'+T(lang,"دریافت دفتر کار TXT","Download TXT")+'</button>'+
 '<button class="lb-button lb-button-outline" data-lb-action="download-json">'+T(lang,"دریافت پشتیبان JSON","Download JSON")+'</button></div></section>'+
 '<p class="lb-privacy">'+T(lang,"تعداد یادداشت‌ها نشان‌دهنده میزان تکمیل فرم است، نه کیفیت زندگی، مهارت یا رشد فردی شما.","The number of filled prompts reflects form completion only, not personal capability or quality of life.")+'</p></div>';
}
function homeFeature(lang){
 return '<section class="lb-home-feature"><div class="lb-home-emblem" aria-hidden="true">01</div><div><p class="lb-eyebrow">BOOK ONE · AVAILABLE NOW</p>'+
 '<h2>'+T(lang,"دوازدوازده فصل برای مطالعه و تمرین","Twelve chapters to read and practice")+'</h2><p>'+T(lang,"متن کامل نسخه نهایی، روایت‌ها، منابع علمی و شش ابزار متصل در Workbook.","Full source text, narratives, references and a connected six-part workbook.")+'</p></div>'+
 '<button class="lb-button lb-button-primary" type="button" data-route="module/1">'+T(lang,"ورود به جلد اول","Open Book One")+'</button></section>';
}
function download(filename,text,kind){
 const url=URL.createObjectURL(new Blob([text],{type:kind+";charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportData(){
 return {format:"tlo-book1-workbook-v1",manuscript:SOURCE.version,exportedAt:new Date().toISOString(),
  completedReadingSections:state.checked,worksheetResponses:state.fields};
}
function downloadText(){
 const out=["سازمان عالی زندگی من — دفتر کار بخش اول","منبع: "+SOURCE.version,"تاریخ خروجی: "+new Date().toLocaleString("fa-IR"),""];
 SOURCE.chapters.forEach((ch,i)=>{
  const n=i+1;
  out.push("════════════════════════════════","فصل "+n+" — "+ch.title,"");
  BOOK_FIELDS[i].forEach(f=>{out.push(f[1]);out.push(fieldValue(n,f[0]).trim()||"—");out.push("");});
 });
 download("life-organization-book1-workbook.txt",out.join("\n"),"text/plain");
}
function updateProgress(n){
 const el=document.querySelector('[data-lb-progress="'+n+'"]');
 if(el)el.textContent=progressText(n,document.documentElement.lang);
 const track=document.querySelector(".lb-chapter-hero .lb-track>div");
 if(track)track.style.width=Math.round(100*completed(n)/totalTalks(n))+"%";
}
document.addEventListener("submit",function(e){if(e.target.matches(".lb-workbook-form"))e.preventDefault();});
document.addEventListener("input",function(e){
 const field=e.target.closest("[data-lb-field]");
 if(!field)return;
 const n=Number(field.dataset.chapter),key=field.dataset.lbField;
 if(!(n>=1&&n<=12)||!BOOK_FIELDS[n-1].some(f=>f[0]===key))return;
 if(!state.fields[n]||typeof state.fields[n]!=="object")state.fields[n]={};
 state.fields[n][key]=field.value.slice(0,1800);
 const status=document.getElementById("lb-save-status");
 const saved=persist();
 if(status)status.textContent=saved?"ذخیره شد · Saved locally":"ذخیره ممکن نشد · Export now";
});
document.addEventListener("click",function(e){
 const el=e.target.closest("[data-lb-action]");
 if(!el)return;
 const action=el.dataset.lbAction;
 if(action==="mark"){
  const n=Number(el.dataset.chapter),i=Number(el.dataset.section);
  if(!(n>=1&&n<=12)||!parse(n)[i]||parse(n)[i].type!=="talk")return;
  const key=n+"-"+i;state.checked[key]=!state.checked[key];persist();
  const yes=!!state.checked[key],lang=document.documentElement.lang;
  el.classList.toggle("is-done",yes);el.setAttribute("aria-pressed",String(yes));
  el.textContent=yes?T(lang,"✓ مرور شد","✓ Reviewed"):T(lang,"علامت‌گذاری: مطالعه شد","Mark as reviewed");
  updateProgress(n);
 }
 if(action==="jump"){
  const target=document.getElementById(el.dataset.target);
  if(target){target.open=true;target.scrollIntoView({behavior:"smooth",block:"start"});}
 }
 if(action==="download-json")download("life-organization-book1-backup.json",JSON.stringify(exportData(),null,2),"application/json");
 if(action==="download-text")downloadText();
 if(action==="clear-chapter"){
  const n=Number(el.dataset.chapter);
  if(n>=1&&n<=12&&confirm(T(document.documentElement.lang,"پاسخ‌های این فصل از این مرورگر پاک شوند؟","Delete this chapter’s answers from this browser?"))){
   delete state.fields[n];persist();window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
 }
});
function resetAll(){state={fields:{},checked:{}};try{localStorage.removeItem(STORAGE)}catch(e){}}
window.LifeBook={
 landing:landing,chapter:chapterPage,worksheet:worksheetPage,workbook:workbookOverview,homeFeature:homeFeature,
 progress:function(){return SOURCE.chapters.map(ch=>({chapter:ch.id,reviewed:completed(ch.id),sections:totalTalks(ch.id),filled:fieldsFilled(ch.id),fields:BOOK_FIELDS[ch.id-1].length}))},
 exportData:exportData,resetAll:resetAll
};
})();