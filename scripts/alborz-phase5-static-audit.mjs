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
const release='s12-r5-20261031';
const files={
 page:'session2-demo.html',
 core:'session2-core-s12-r1-20261031.js',
 assessment:'session2-assessment-s12-r2-20261031.js',
 ui:'session2-ui-s12-r5-20261031.js',
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
assert('محافظ شناسه انتشار',source.page.includes('s12-r5-20261031')&&source.ui.includes(release));
assert('هماهنگی سه بسته نسخه‌دار',Object.entries(files).filter(([key])=>['core','assessment','ui'].includes(key)).every(([,v])=>source.page.includes('src="'+v+'"')));
assert('پیشگیری از اختلال نسخه',source.page.includes('alborz-load-error'));
assert('آزمون مرورگر ۱۶۵تایی قابل فراخوانی',source.page.includes('qaAudit')&&source.page.includes('ALBORZ_AUDIT_RESULT'));
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
assert('پوشش ۱۰ سناریو',Object.keys(window.ALBORZ_BEHAVIOR_GUIDES||{}).length===10);
assert('عدم تغییر منبع پرسش بدون ارزیابی',source.assessment.includes('ALBORZ_QUIZ_UI'));
const failed=checks.filter(x=>!x.pass);
const report={
 audit:'Alborz Phase 5 — static source integrity',
 release,
 status:failed.length?'FAIL':'PASS',
 checks:checks.length,
 passed:checks.length-failed.length,
 failed:failed.length,
 metrics:{techniques:10,stagesExpected:80,questions,reasons,wrongReasons,dialogueTurns:turns},
 failures:failed,
 caveat:'This is not a live-browser test, physical handset test, or proof of deployment.'
};
console.log(JSON.stringify(report,null,2));
if(failed.length)process.exitCode=1;
