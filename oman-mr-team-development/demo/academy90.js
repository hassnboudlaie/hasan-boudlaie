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
let showCalendar=false;
let step=null;
let draft;
const sources=[
 ['HubSpot Academy · Inbound Sales','https://academy.hubspot.com/courses/inbound-sales','مسیر شناسایی، ارتباط، کشف و پیشنهاد برای قیف فروش'],
 ['NAR · Accredited Buyer’s Representative','https://www.nar.realtor/education/designations-and-certifications/accredited-buyers-representative-abr','نمایندگی و کشف نیاز خریدار'],
 ['NAR · Certified International Property Specialist','https://www.nar.realtor/designations-and-certifications/cips-designation/overview-of-cips-courses','کار با مشتری بین‌المللی و حساسیت به تفاوت بازارها'],
 ['Harvard Program on Negotiation · Getting to Yes','https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value/','منافع، گزینه جایگزین و معیار عینی'],
 ['Huthwaite · SPIN Selling','https://www.huthwaiteinternational.com/sales-training/spin-selling','چهار نوع پرسش برای کشف نیاز'],
 ['RICS · Comparable Evidence','https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/valuation-standards/comparable-evidence-in-real-estate-valuation','ارزیابی کیفیت شواهد مقایسه‌ای']
];
function metrics(records,seconds){
 return '<div class="academy-stats"><span>'+n(records.filter(r=>r.read_at).length)+' درس خوانده‌شده</span><span>'+n(records.filter(r=>r.task).length)+' تکلیف</span><span>'+n(records.filter(r=>r.quiz_score!=null).length)+' آزمون</span><span>'+duration(seconds)+' فعالیت تقریبی در اپ</span></div>';
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
 const record=records.find(r=>r.day===d.number)||{};
 const labelsForDay=d.summary?['مرور','کیس هفته','آزمون','پایان']:['مطالعه','تمرین','پایان'];
 const end=labelsForDay.length-1;
 if(step===null)step=!record.read_at?0:!record.task?1:d.summary&&record.quiz_score==null?2:end;
 const panel=(i,html)=>'<section class="almas-step" '+(step===i?'':'hidden')+'>'+html+'</section>';
 const back=step>0?'<button class="mp-btn mp-btn-light" type="button" data-academy-step="'+(step-1)+'">گام قبل</button>':'';
 const advance=i=>'<button class="mp-btn" type="button" data-academy-step="'+i+'">ادامه ←</button>';
 const taskLabel=d.summary?'پاسخ پرونده هفته':'نتیجه تمرین';

 const calendar=weeks.map((week,i)=>'<details class="academy-week" '+(i===index?'open':'')+'><summary>هفته '+n(i+1)+' · '+esc(week.title)+'</summary><div class="academy-days">'+week.days.map((_,slot)=>{
  const day=i*7+slot+1;
  const row=records.find(r=>r.day===day);
  return '<button type="button" data-academy-day="'+day+'" aria-pressed="'+(day===selected)+'"><strong>روز '+n(day)+'</strong>'+(start?'<small>'+dayDate(start,day)+'</small>':'')+'<small>'+(row?.task?'تکلیف ثبت شد':row?.read_at?'مطالعه شد':day>=85?'پروژه پایانی':labels[slot])+'</small></button>';
 }).join('')+'</div></details>').join('');
 const weekly=records.filter(r=>r.day>d.number-w.days.length&&r.day<=d.number);
 const review=d.summary?'<section class="academy-review"><h4>مرور عملکرد هفته</h4><p>'+n(weekly.filter(r=>r.read_at).length)+' مطالعه و '+n(weekly.filter(r=>r.task).length)+' تکلیف ثبت شده است.</p><ol><li>یک رفتار که کیفیت تصمیم مشتری را بهتر کرد.</li><li>یک پرونده که نشان داد کدام مرحله قیف گیر می‌کند.</li><li>اقدام هفته بعد، مسئول و موعد مرور.</li></ol></section>':'';
 const quiz=d.summary?'<fieldset><legend>سؤال‌های هفته · ۲ سؤال</legend>'+w.quiz.map(([question,...options],i)=>
 '<div class="academy-question"><strong>'+esc(question)+'</strong>'+options.slice(0,3).map((text,j)=>'<label><input type="radio" name="answer'+i+'" value="'+j+'" '+(record.quiz_answers?.[i]===j?'checked':'')+'> '+esc(text)+'</label>').join('')+(record.quiz_score!=null?'<small>پاسخ پیشنهادی '+esc(options[options[3]])+'</small>':'')+'</div>').join('')+'<button class="mp-btn" data-academy-save="quiz">ثبت آزمون</button>'+(record.quiz_score!=null?'<p>نمره ثبت‌شده: '+n(record.quiz_score)+' از ۲</p>':'')+'</fieldset>':'';
 const roleplay='<details '+(d.roleplay?'open':'')+'><summary>تمرین گفت‌وگو در سه نوبت</summary><p>'+esc(w.scenario)+'</p><ol>'+w.roles.map(role=>'<li>'+esc(role)+'</li>').join('')+'</ol><p>برای هر نفر بنویس چه کاری خوب بود و چه کاری می‌تواند بهتر شود. بخش سخت گفت‌وگو را دوباره اجرا کنید. به سه کار از صفر تا دو نمره بده: فهمیدن مشکل، جواب روشن و تعیین قدم بعدی.</p></details>';
 const caseSection=d.summary?'<section class="academy-casefile" tabindex="-1"><h4>'+esc(caseFile[0])+'</h4><p>'+esc(caseFile[1])+'</p><p><strong>کاری که باید انجام بدهی</strong> '+esc(caseFile[2])+'</p></section>':'';
 const points=reviewWeek(records,index).score;
 return '<div class="academy almas-course">'+(error?'<p role="alert">'+esc(error)+'</p>':'')+
  (showCalendar?'<details id="academyCalendar" class="academy-calendar" open><summary>انتخاب روز از تقویم</summary>'+calendar+'</details>':'')+
  '<article class="academy-lesson" id="academyLesson" tabindex="-1"><div class="almas-day-heading"><span>روز '+n(d.number)+' از ۹۰</span><span>تا ۲۰ دقیقه</span></div>'+
  '<h3>'+esc(w.title)+'</h3><div class="almas-progress" role="progressbar" aria-label="پیشرفت درس" aria-valuemin="0" aria-valuemax="'+end+'" aria-valuenow="'+step+'"><span style="width:'+(step/end*100)+'%"></span></div><p class="almas-step-counter">گام '+n(step+1)+' از '+n(end+1)+' · '+labelsForDay[step]+'</p>'+
  panel(0,'<h4>'+labelsForDay[0]+'</h4><p dir="ltr" class="academy-technique">'+esc(w.skill)+'</p><p>'+esc(w.theory)+'</p>'+
   (record.read_at?advance(1):'<button class="mp-btn" data-academy-save="read">خواندم، برو به تمرین ←</button>'))+
  panel(1,'<h4>'+labelsForDay[1]+'</h4><p>'+esc(d.task)+'</p>'+caseSection+roleplay+
   '<label for="academyTask">'+taskLabel+'</label><textarea id="academyTask" maxlength="3000" rows="4" placeholder="در چند خط بنویس چه گفتی یا چه کردی. نام و شماره مشتری را ننویس.">'+esc(draft??record.task)+'</textarea>'+
   '<button class="mp-btn" data-academy-save="task">ذخیره پاسخ و ادامه ←</button>')+
  (d.summary?panel(2,review+quiz):'')+
  panel(end,'<h4>✓ برنامه این روز تکمیل شد</h4><p>'+n(points)+' امتیاز در این هفته ثبت کرده‌ای.</p>'+
   (record.quiz_score!=null?'<p>نمره آزمون: '+n(record.quiz_score)+' از ۲</p>':'')+
   (d.number<90?'<button type="button" class="mp-btn" data-academy-day="'+(d.number+1)+'">روز بعد ←</button>':'<button type="button" class="mp-btn" data-mp="open-record">مشاهده کارنامه</button>'))+
  '<div class="academy-day-nav">'+back+'</div></article></div>';
}
function selection(day,calendar=false){selected=day;showCalendar=calendar;step=null;draft=undefined;}
function moveStep(next,value){step=next;draft=value;}
function resumeDay(records,start){
 const limit=start?currentDay(start):90;
 return days.slice(0,limit).find(d=>{
  const row=records.find(r=>r.day===d.number);
  return !row?.read_at||!row.task||(d.summary&&row.quiz_score==null);
 })?.number||limit;
}

function weekEnd(day){return Math.min(90,Math.ceil(day/7)*7);}
function patch(action,root){
 const day=days[selected-1];
 if(action==='read')return {day:selected,read_at:new Date().toISOString()};
 if(action==='task'){
  const task=root.querySelector('#academyTask').value.trim();
  if(task.length<(day.summary?60:10))throw Error(day.summary?'پاسخت را در چند جمله کامل کن. بگو چه تصمیمی می‌گیری، چرا و بعد چه می‌کنی.':'برای ثبت تمرین، دست‌کم یک جمله کوتاه بنویس.');
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
window.MasirCourse={render,history,metrics,selection,patch,currentDay,weekEnd,moveStep,resumeDay};
})();
