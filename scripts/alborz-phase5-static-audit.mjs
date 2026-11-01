// Alborz Insurance / Session 2 — dependency-free static release audit.
// Intentionally does NOT claim real-device visual QA or live browser QA.
// Run: node scripts/alborz-phase5-static-audit.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'alborz-communication-skills');
const load=name=>fs.readFileSync(path.join(dir,name),'utf8');
const release='s12-r8-20261101';
const files={
 page:'session2-demo.html',
 core:'session2-core-s12-r1-20261031.js',
 assessment:'session2-assessment-s12-r2-20261031.js',
 ui:'session2-ui-s12-r5-20261031.js',
 flow:'session2-learning-flow-20261101.js',
 overlay:'session2-five-stage-r6-20261101.js',
 insights:'session2-key-collection-r7-20261101.js',
 capstoneA:'session2-capstone-questions-a-r7-20261101.js',
 capstoneB:'session2-capstone-questions-b-r7-20261101.js',
 six:'session2-six-stage-r7-20261101.js',
 dialogue:'session2-dialogue-refinement-r8-20261101.js',
 acceptance:'session2-phase5-acceptance.html'
};
const source=Object.fromEntries(Object.entries(files).map(([k,v])=>[k,load(v)]));
const checks=[];
function assert(name,ok,detail=''){
 checks.push({name,pass:!!ok,detail});
}
function jsonFollowing(text,needle){
 const p=text.indexOf(needle);
 if(p<0)throw Error('JSON prefix not found: '+needle);
 const st=p+needle.length;
 if(!['[','{'].includes(text[st]))throw Error('JSON token malformed: '+needle);
 const stack=[];let quoted=false,escaped=false;
 for(let i=st;i<text.length;i++){
  const c=text[i];
  if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
  if(c==='"'){quoted=true;continue;}
  if(c==='['||c==='{')stack.push(c);
  if(c===']'||c==='}'){
   if(!stack.length||(c===']'&&stack.at(-1)!=='[')||(c==='}'&&stack.at(-1)!=='{'))throw Error('Mismatched JSON brackets');
   stack.pop();
   if(stack.length===0)return JSON.parse(text.slice(st,i+1));
  }
 }
 throw Error('Unterminated JSON: '+needle);
}

assert('روت فارسی و RTL',/<html[^>]*lang="fa"[^>]*dir="rtl"/.test(source.page));
assert('متاتگ موبایل',/<meta\s+name="viewport"/.test(source.page));
assert('محافظ شناسه انتشار',source.page.includes(release)&&source.six.includes(release));
assert('هماهنگی نسخه‌دار نه بسته',Object.entries(files).filter(([key])=>['core','assessment','ui','flow','overlay','insights','capstoneA','capstoneB','six','dialogue'].includes(key)).every(([key,v])=>source.page.includes('src="'+v) ));
assert('پیشگیری از اختلال نسخه',source.page.includes('alborz-load-error'));
assert('آزمون مرورگر پنج‌بخشی قابل فراخوانی',source.page.includes('qaAudit')&&source.page.includes('ALBORZ_AUDIT_RESULT'));
assert('حالت Android Desktop Site',source.page.includes('touch-desktop-mode'));
assert('ابزار مستقل Final Acceptance',source.acceptance.includes('qaAudit=all')&&source.acceptance.includes('deviceTestSelfAttested'));
assert('مسیردهی جلسه ۲ از صفحه اصلی',load('index.html').includes('session2-demo.html'));
const originalQ=jsonFollowing(source.page,',Q=');
const bank={};
const marker='Object.assign(window.ALBORZ_TECH_DATA,';
let offset=0;
while(true){
 const idx=source.core.indexOf(marker,offset);
 if(idx<0)break;
 Object.assign(bank,jsonFollowing(source.core.slice(idx),marker));
 offset=idx+marker.length;
}
assert('بانک اولیه پرسش تکنیک اول',originalQ.length===3);
assert('۹ تکنیک تکمیلی',Object.keys(bank).length===9&&Array.from({length:9},(_,i)=>String(i+2)).every(k=>bank[k]));
const window={ALBORZ_TECH_DATA:bank};
try {
 vm.runInNewContext(source.assessment,{window,Q:originalQ},{filename:files.assessment,timeout:5000});
 vm.runInNewContext(source.flow,{window,Q:originalQ},{filename:files.flow,timeout:5000});
 vm.runInNewContext(source.insights,{window},{filename:files.insights,timeout:5000});
 vm.runInNewContext(source.capstoneA,{window},{filename:files.capstoneA,timeout:5000});
 vm.runInNewContext(source.capstoneB,{window},{filename:files.capstoneB,timeout:5000});
 assert('اجرای بانک نهایی ارزیابی',window.ALBORZ_ASSESSMENT_READY===true);
} catch(e) {
 assert('اجرای بانک نهایی ارزیابی',false,String(e?.message||e));
}
let questions=0,reasons=0,wrongReasons=0,turns=0;
for(let t=1;t<=10;t++){
 const data=t===1?{quiz:originalQ,dialogue:Array(20)}:bank[String(t)];
 const qs=data?.quiz||[];
 const optionKey=t===1?'opts':'options',correctKey=t===1?'right':'correct';
 assert('تکنیک '+t+' — سه سؤال',qs.length===3);
 questions+=qs.length;
 for(let q=0;q<qs.length;q++){
  const item=qs[q],opts=item[optionKey]||[],r=item.optionReasons||[];
  const correct=item[correctKey];
  assert('تکنیک '+t+' سؤال '+(q+1)+' — گزینه و کلید صحیح',opts.length===3&&new Set(opts).size===3&&Number.isInteger(correct)&&correct>=0&&correct<3);
  const distinct=r.length===3&&new Set(r.map(x=>x.trim())).size===3&&r.every(x=>typeof x==='string'&&x.trim().length>=14);
  assert('تکنیک '+t+' سؤال '+(q+1)+' — سه دلیل مستقل',distinct);
  reasons+=r.length;
  wrongReasons+=r.filter((_,i)=>i!==correct).length;
 }
 turns+=(data?.dialogue||[]).length;
 assert('تکنیک '+t+' — گفت‌وگوی نمونه',t===1||Array.isArray(data?.dialogue)&&data.dialogue.length>=20);
}
assert('جمع سؤالات = ۳۰',questions===30,String(questions));
assert('دلایل مستقل = ۹۰',reasons===90,String(reasons));
assert('دلایل مختص گزینه‌های غلط = ۶۰',wrongReasons===60,String(wrongReasons));
assert('نوبت گفت‌وگو = ۲۴۸',turns===248,String(turns));
assert('ده پیام کلیدی متفاوت',Object.keys(window.ALBORZ_KEY_MESSAGES||{}).length===10&&new Set(Object.values(window.ALBORZ_KEY_MESSAGES).map(x=>x.message)).size===10);
assert('مسیر پنج‌بخشی ۱۰ تکنیک',source.overlay.includes('allStages=[0,1,2,4,7]'));
assert('حذف مسیرهای اضافی از UI',source.overlay.includes('card.remove()')&&source.overlay.includes('makeKeyCard'));
assert('پوشش ۱۰ سناریو',Object.keys(window.ALBORZ_BEHAVIOR_GUIDES||{}).length===10);
assert('عدم تغییر منبع پرسش بدون ارزیابی',source.assessment.includes('ALBORZ_QUIZ_UI'));
let keyMessages=0,capstones=0,capstoneReasons=0,capstoneWrong=0,habitCases=0;
const caps=Object.assign({},window.ALBORZ_CAPSTONE_PART_A||{},window.ALBORZ_CAPSTONE_PART_B||{});
const insightBank=window.ALBORZ_KEY_COLLECTION||{};
const correctPositions=[0,0,0];
for(let t=1;t<=10;t++){
 const keys=insightBank[t]||[],qs=caps[t]||[];
 assert('تکنیک '+t+' ـ ۴ پیام کلیدی مستقل',keys.length===4&&new Set(keys.map(k=>k.title)).size===4&&keys.every(k=>k.explanation.length>35&&k.example.length>40&&k.transfer.length>25));
 keyMessages+=keys.length;
 assert('تکنیک '+t+' ـ ۴ سؤال غیرمستقیم',qs.length===4&&qs.every(q=>q.scenario.length>=65&&q.options.length===3));
 capstones+=qs.length;
 qs.forEach((q,i)=>{
  const valid=q.options.length===3&&new Set(q.options).size===3&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=2&&q.reasons.length===3&&new Set(q.reasons).size===3&&q.reasons.every(reason=>reason.length>=45);
  assert('تکنیک '+t+' کوییز '+(i+1)+' ـ سه پاسخ و سه دلیل مستقل',valid);
  assert('تکنیک '+t+' کوییز '+(i+1)+' ـ خطای عرفی تشریح‌شده',Number.isInteger(q.habit)&&q.habit!==q.correct&&q.habit>=0&&q.habit<=2&&q.habitWhy.length>=45);
  capstoneReasons+=q.reasons.length;capstoneWrong+=q.reasons.length-1;habitCases++;
  correctPositions[q.correct]++;
 });
}
assert('جمع پیام‌ها = ۴۰',keyMessages===40,String(keyMessages));
assert('جمع کوییزهای پایانی = ۴۰',capstones===40,String(capstones));
assert('جمع تحلیل گزینه‌های پایانی = ۱۲۰',capstoneReasons===120,String(capstoneReasons));
assert('دلایل خطای پاسخ‌های ظاهراً منطقی = ۸۰',capstoneWrong===80,String(capstoneWrong));
assert('دام‌های رفتار سازمانی = ۴۰',habitCases===40,String(habitCases));
assert('توزیع غیرقابل‌حدس کلید صحیح',correctPositions.every(n=>n>=8),JSON.stringify(correctPositions));
assert('دسترسی به مرحله ۶ از انتشار جدید',source.six.includes('go(\\\'stage\\\',5)')||source.six.includes("index===5||index===6"));
assert('بارگذاری اصلاحات نقش‌آفرینی',source.page.includes('session2-dialogue-refinement-r8-20261101.js'));
assert('وجود راهنمای اختصاصی لحظه‌های حساس',source.ui.includes('cue.focus')&&source.page.includes('cue.focus')&&source.dialogue.includes('highlights'));
assert('حذف کپی متن از هر دو مسیر نمایش',!source.page.includes('کپی متن کامل</button>')&&!source.ui.includes('کپی متن</button>'));
assert('حذف توضیح سؤالات برای تفکر',!source.overlay.includes('این سؤال‌ها ادامه تکراری'));
assert('حذف مقدمه‌های توضیحی گفتگو و کوییز',!source.six.includes('قرار نیست عبارت‌های جلسه را حفظ کنید')&&!source.overlay.includes('هدف حفظ‌کردن جملات نیست'));
assert('حذف اعلان‌های نسخه‌سازی از صفحه اصلی',!load('index.html').includes('نسخه پایه و قابل توسعه')&&!load('index.html').includes('محتوای تفصیلی آن‌ها هنوز تکمیل نشده'));
assert('تغییر محدود گفتگوها',source.dialogue.includes('rewritten=0')&&source.dialogue.includes('highlights=0'));
const failed=checks.filter(x=>!x.pass);
const report={
 audit:'Alborz Phase 5 — static source integrity',
 release,
 status:failed.length?'FAIL':'PASS',
 checks:checks.length,
 passed:checks.length-failed.length,
 failed:failed.length,
 metrics:{techniques:10,stagesExpected:60,questions,reasons,wrongReasons,dialogueTurns:turns,keyMessages,capstones,capstoneReasons,capstoneWrong,correctPositions},
 failures:failed,
 caveat:'This is not a live-browser test, physical handset test, or proof of deployment.'
};
console.log(JSON.stringify(report,null,2));
if(failed.length)process.exitCode=1;
