/* Calendar and learner/admin views. Persistence uses the existing authenticated portal. */
(function(){
'use strict';
const weeks=window.MasirAcademy90;
const days=weeks.flatMap((week,index)=>week.days.map((task,slot)=>({
 week, number:index*7+slot+1, slot, summary:slot===week.days.length-1,
 roleplay:slot===(index===12?2:4), task
})));
const labels=['درس و طراحی','تمرین مهارتی','کاربرد در قیف','آمادگی','رول‌پلی','تمرین میدانی','جمع‌بندی و آزمون'];
const digit=new Intl.NumberFormat('fa-IR');
const date=new Intl.DateTimeFormat('fa-IR-u-ca-gregory',{month:'short',day:'numeric',timeZone:'UTC'});
const muscat=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Muscat',year:'numeric',month:'2-digit',day:'2-digit'});
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=value=>digit.format(value);
const asDate=start=>Date.parse(start+'T00:00:00Z');
const dayDate=(start,number)=>date.format(new Date(asDate(start)+(number-1)*86400000));
const currentDay=start=>Math.min(90,Math.max(1,Math.floor((asDate(muscat.format(new Date()))-asDate(start))/86400000)+1));
const duration=seconds=>n(Math.floor((seconds||0)/60))+' دقیقه';
let selected=0;
const sources=[
 ['HubSpot Academy · Inbound Sales','https://academy.hubspot.com/courses/inbound-sales','مسیر شناسایی، ارتباط، کشف و پیشنهاد برای قیف فروش'],
 ['NAR · Accredited Buyer’s Representative','https://www.nar.realtor/education/designations-and-certifications/accredited-buyers-representative-abr','نمایندگی و کشف نیاز خریدار'],
 ['NAR · Certified International Property Specialist','https://www.nar.realtor/designations-and-certifications/cips-designation/overview-of-cips-courses','کار با مشتری بین‌المللی و حساسیت به تفاوت بازارها'],
 ['Harvard Program on Negotiation · Getting to Yes','https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value/','منافع، گزینه جایگزین و معیار عینی'],
 ['Huthwaite · SPIN Selling','https://www.huthwaiteinternational.com/sales-training/spin-selling','چهار نوع پرسش برای کشف نیاز'],
 ['RICS · Comparable Evidence','https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/valuation-standards/comparable-evidence-in-real-estate-valuation','ارزیابی کیفیت شواهد مقایسه‌ای']
];
function metrics(records,seconds){
 return '<div class="academy-stats"><span>'+n(records.filter(r=>r.read_at).length)+' مطالعه تأییدشده</span><span>'+n(records.filter(r=>r.task).length)+' تکلیف</span><span>'+n(records.filter(r=>r.quiz_score!=null).length)+' آزمون</span><span>'+duration(seconds)+' فعالیت برآوردی در وب‌اپ</span></div>';
}
const weeklyCase=window.MasirWeeklyCases;
function reviewWeek(records,index){
 const first=index*7+1,end=Math.min(90,first+6);
 const rows=records.filter(r=>r.day>=first&&r.day<=end);
 const last=rows.find(r=>r.day===end);
 const score=rows.reduce((sum,r)=>sum+(r.read_at?2:0)+(r.task?(r.day===end?8:5):0)+(r.day===end?(r.quiz_score||0)*3:0),0);
 const badges=[];
 if(rows.filter(r=>r.read_at&&r.task).length===end-first+1)badges.push(['⌂','کلید تکمیل هفته']);
 if(last?.task)badges.push(['▤','پرونده هفتگی']);
 if(last?.quiz_score===2)badges.push(['★','نشان آزمون کامل']);
 return {rows,last,score,badges,end};
}
function history(records,seconds,rewards=[],admin=false,start=null){
 const overview=weeks.map((week,index)=>{
  const {rows,last,score,badges,end}=reviewWeek(records,index);
  const award=rewards.find(r=>r.week===index+1);
  const ended=start&&asDate(muscat.format(new Date()))>=asDate(start)+end*86400000;
  const buttons=admin&&award&&!award.issued_at?
   '<button class="mp-btn" type="button" data-academy-issue="'+(index+1)+'">ثبت تحویل مشوق</button>':
   admin&&!award&&score&&ended?'<form class="academy-reward-form" data-academy-reward="'+(index+1)+'"><label>ارزش هر امتیاز (ریال)<input type="number" name="rate" min="1" max="100000000" step="1" required></label><button class="mp-btn">تأیید مشوق هفته</button></form>':'';
  const status=award?'<p class="academy-award">'+n(award.points)+' امتیاز تأییدشده × '+n(award.rate_irr)+' ریال = <strong>'+n(award.amount_irr)+' ریال</strong> · '+(award.issued_at?'تحویل ثبت شد':'در انتظار تحویل')+'</p>':
   admin&&score&&!ended?'<p>تأیید مشوق پس از پایان هفته و تنظیم تاریخ شروع ممکن است.</p>':'';
  return '<details class="academy-week-report"><summary>هفته '+n(index+1)+' · '+esc(week.title)+' · '+n(score)+' امتیاز</summary>'+
   '<p>'+n(rows.filter(r=>r.read_at).length)+' مطالعه · '+n(rows.filter(r=>r.task).length)+' تکلیف · '+(last?.quiz_score==null?'آزمون ثبت نشده':'آزمون '+n(last.quiz_score)+' از ۲')+'</p>'+
   (badges.length?'<div class="academy-badges">'+badges.map(([icon,title])=>'<span><b aria-hidden="true">'+icon+'</b> '+title+'</span>').join('')+'</div>':'')+
   status+buttons+rows.map(r=>{
    const d=days[r.day-1];
    return '<details><summary>روز '+n(r.day)+' · '+esc(d.summary?'کیس و آزمون هفته':labels[d.slot])+'</summary><p>'+esc(d.task)+'</p><p>'+(r.read_at?'مطالعه تأیید شد':'مطالعه ثبت نشده')+'</p>'+
     (r.task?'<p class="academy-submission">'+esc(r.task)+'</p>':'')+
     (r.quiz_score!=null?'<p>نمره '+n(r.quiz_score)+' از ۲</p><ol>'+(r.quiz_answers||[]).map((choice,i)=>'<li>'+esc(d.week.quiz[i]?.[choice+1]||'')+'</li>').join('')+'</ol>':'')+'</details>';
   }).join('')+'</details>';
 }).join('');
 return metrics(records,seconds)+'<section class="academy-history"><h4>کارنامه روزانه و هفتگی</h4><p>مطالعه ۲، تمرین روزانه ۵، کیس هفتگی ۸ و هر پاسخ درست ۳ امتیاز دارد.</p>'+overview+'</section>';
}
function render(state){
 const {records,seconds,start,error}=state;
 if(!selected)selected=start?currentDay(start):1;
 const d=days[selected-1], w=d.week;
 const index=Math.floor((d.number-1)/7);
 const caseFile=weeklyCase[index];
 const timePlan=d.summary?[['مطالعه و مرور',3],['حل کیس هفته',13],['آزمون',4]]:
  d.roleplay?[['آماده‌سازی',3],['رول‌پلی و اجرای دوباره',12],['ثبت بازخورد',5]]:
  [['مطالعه',5],['تمرین',10],['ثبت نتیجه',5]];
 const record=records.find(r=>r.day===d.number)||{};
 const calendar=weeks.map((week,i)=>'<section class="academy-week"><h4>هفته '+n(i+1)+' · '+esc(week.title)+'</h4><div class="academy-days">'+week.days.map((_,slot)=>{
  const day=i*7+slot+1;
  const row=records.find(r=>r.day===day);
  return '<button type="button" data-academy-day="'+day+'" aria-pressed="'+(day===selected)+'"><strong>روز '+n(day)+'</strong>'+(start?'<small>'+dayDate(start,day)+'</small>':'')+'<small>'+(row?.task?'تکلیف ثبت شد':row?.read_at?'مطالعه شد':day>=85?'پروژه پایانی':labels[slot])+'</small></button>';
 }).join('')+'</div></section>').join('');
 const weekly=records.filter(r=>r.day>d.number-w.days.length&&r.day<=d.number);
 const review=d.summary?'<section class="academy-review"><h4>مرور عملکرد هفته</h4><p>'+n(weekly.filter(r=>r.read_at).length)+' مطالعه و '+n(weekly.filter(r=>r.task).length)+' تکلیف ثبت شده است.</p><ol><li>یک رفتار که کیفیت تصمیم مشتری را بهتر کرد.</li><li>یک پرونده که نشان داد کدام مرحله قیف گیر می‌کند.</li><li>اقدام هفته بعد، مسئول و موعد مرور.</li></ol></section>':'';
 const quiz=d.summary?'<fieldset><legend>آزمون جمع‌بندی · ۲ سؤال</legend>'+w.quiz.map(([question,...options],i)=>
 '<div class="academy-question"><strong>'+esc(question)+'</strong>'+options.slice(0,3).map((text,j)=>'<label><input type="radio" name="answer'+i+'" value="'+j+'" '+(record.quiz_answers?.[i]===j?'checked':'')+'> '+esc(text)+'</label>').join('')+(record.quiz_score!=null?'<small>پاسخ پیشنهادی: '+esc(options[options[3]])+'</small>':'')+'</div>').join('')+'<button class="mp-btn" data-academy-save="quiz">ثبت آزمون</button>'+(record.quiz_score!=null?'<p>آخرین نمره: '+n(record.quiz_score)+' از ۲</p>':'')+'</fieldset>':'';
 return '<div class="academy"><h3>تقویم ۹۰ روزه فروش املاک عمان</h3><p>'+ (start?'تاریخ‌ها بر اساس برنامه شروع گروه نمایش داده می‌شوند.':'تاریخ شروع گروه هنوز تنظیم نشده است. روزها به ترتیب دوره قابل انتخاب‌اند.')+'</p>'+
 (error?'<p role="alert">'+esc(error)+'</p>':'')+metrics(records,seconds)+
 '<div class="academy-shortcuts"><button class="mp-btn mp-btn-light" data-mp="open-record">کارنامه و نشان‌های من</button><button class="mp-btn mp-btn-light" data-academy-today>رفتن به '+(start?'روز جاری':'روز اول')+'</button></div>'+
 '<details class="academy-calendar"><summary>تقویم هفتگی · همه ۹۰ روز</summary>'+calendar+'</details>'+
 '<article class="academy-lesson" id="academyLesson" tabindex="-1"><div class="academy-listing"><span>⌂ دفتر معاملات عمان</span><b>حداکثر ۲۰ دقیقه</b></div><div class="academy-time">'+timePlan.map(([title,mins])=>'<span>'+title+' · '+n(mins)+' دقیقه</span>').join('')+'</div><h3>روز '+n(d.number)+' · '+esc(w.title)+'</h3><p dir="ltr" class="academy-technique">'+esc(w.skill)+'</p><p>'+esc(w.theory)+'</p><h4>فعالیت امروز</h4><p>'+esc(d.task)+'</p>'+
 '<button class="mp-btn mp-btn-light" data-academy-save="read" '+(record.read_at?'disabled':'')+'>'+(record.read_at?'مطالعه تأیید شد':'تأیید مطالعه')+'</button>'+
 '<details '+(d.roleplay?'open':'')+'><summary>کیس و رول‌پلی سه‌دور</summary><p>'+esc(w.scenario)+'</p><ol>'+w.roles.map(role=>'<li>'+esc(role)+'</li>').join('')+'</ol><p>مشاهده‌گر از هر نقش یک رفتار مؤثر و یک رفتار قابل اصلاح ثبت کند. دور حساس را دوباره اجرا کنید و شواهد تغییر را بنویسید.</p><p>سه معیار مشاهده: کشف مسئله، شفافیت پاسخ و توافق بر اقدام. هر معیار ۰ تا ۲ امتیاز دارد. ۰ یعنی دیده نشد، ۱ یعنی ناقص، ۲ یعنی مستقل و روشن. امتیاز هر دو اجرا و شاهد رفتاری را در تکلیف ثبت کنید.</p></details>'+
 (d.summary?'<section class="academy-casefile"><p>پرونده هفته · '+n(index+1)+'</p><h4>'+esc(caseFile[0])+'</h4><p>'+esc(caseFile[1])+'</p><p><strong>مأموریت</strong> '+esc(caseFile[2])+'</p><p>پاسخ را در چهار بخش کوتاه بنویس. تصمیم، شاهد، پیام یا اقدام، و مسئول و موعد. از نام یا اطلاعات شناسایی مشتری استفاده نکن.</p></section>':'')+
 '<label for="academyTask">'+(d.summary?'پاسخ کیس هفته':'تکلیف و شواهد تمرین')+'</label><textarea id="academyTask" minlength="10" maxlength="3000" rows="5" placeholder="موقعیت بی‌نام، اقدام، نتیجه و قدم بعدی">'+esc(record.task)+'</textarea><button class="mp-btn" data-academy-save="task">ثبت تکلیف</button>'+review+quiz+'</article>'+
 '<details><summary>منابع و چارچوب‌های طراحی</summary><ul>'+sources.map(([title,url,use])=>'<li>'+esc(use)+' · <a target="_blank" rel="noopener noreferrer" href="'+url+'">'+esc(title)+'</a></li>').join('')+'</ul><p>کیس‌ها تألیفی و شبیه‌سازی‌شده‌اند. برای تکالیف میدانی نام و مشخصات مشتری را ثبت نکنید.</p></details></div>';
}
function selection(day){selected=day;}
function patch(action,root){
 const day=days[selected-1];
 if(action==='read')return {day:selected,read_at:new Date().toISOString()};
 if(action==='task'){
  const task=root.querySelector('#academyTask').value.trim();
  if(task.length<(day.summary?60:10))throw Error(day.summary?'پاسخ کیس را با تصمیم، دلیل و اقدام بعدی کامل کنید (حداقل ۶۰ نویسه).':'برای ثبت تکلیف دست‌کم ۱۰ نویسه وارد کنید.');
  return {day:selected,task};
 }
 if(action==='quiz'&&day.summary){
  const quiz_answers=day.week.quiz.map((_,i)=>root.querySelector('input[name="answer'+i+'"]:checked')?.value);
  if(quiz_answers.some(answer=>answer===undefined))throw Error('به هر دو سؤال پاسخ بدهید.');
  const answers=quiz_answers.map(Number);
  return {day:selected,quiz_answers:answers,quiz_score:answers.filter((answer,i)=>answer===day.week.quiz[i][4]).length};
 }
 throw Error('فعالیت معتبر نیست.');
}
window.MasirCourse={render,history,metrics,selection,patch,currentDay};
})();
