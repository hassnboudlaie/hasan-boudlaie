// This adapter is used only by the public free Pages edition.
// The existing authenticated Workers/D1 application is left unchanged.
function validPracticeState(s){
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const objective=o=>object(o)&&typeof o.objective==='string'&&Array.isArray(o.krs)&&o.krs.every(object);
 return object(s)&&object(s.meta)&&object(s.strategy)&&Array.isArray(s.strategy.pillars)&&Array.isArray(s.strategy.kpis)&&Array.isArray(s.companyOkrs)&&s.companyOkrs.every(objective)&&Array.isArray(s.teams)&&s.teams.every(t=>object(t)&&Array.isArray(t.okrs)&&t.okrs.every(objective));
}
function loadPractice(){
 try{const raw=localStorage.getItem(PRACTICE_KEY)||'null',p=JSON.parse(raw);if(p?.version===1&&validPracticeState(p.state)){practiceSnapshot=p;if(p.state.orgChartVersion!==ORG_CHART_VERSION){try{if(!localStorage.getItem('kish_okr_before_org_chart_v1'))localStorage.setItem('kish_okr_before_org_chart_v1',raw);}catch{}}return ensureOrganizationUnits(mergeDefaults(clone(emptyState),p.state));}}
 catch{}
 return makeDemoState();
}
function savePractice(silent,action='Practice updated'){
 if(!cloudReady)return false;
 if(conflict)return false;
 try{const current=JSON.parse(localStorage.getItem(PRACTICE_KEY)||'null');if(current?.version===1&&validPracticeState(current.state)&&current.revision>cloudRevision){dirty=true;conflict=true;document.getElementById('conflictBox').classList.remove('hidden');syncLabel(txt('تمرین در تب دیگری تغییر کرده؛ ورودی شما حفظ شده است.','Another tab changed this practice; your input is preserved.'));return false;}}catch{}
 const previous=practiceSnapshot;
 const next={version:1,revision:cloudRevision+1,name:auth.name,state:clone(state),audit:[...(previous?.audit||[]),{id:id(),created:new Date().toISOString(),action,actor:auth.name,revision:cloudRevision+1,details:'[]'}].slice(-50)};
 try{localStorage.setItem(PRACTICE_KEY,JSON.stringify(next));practiceSnapshot=next;cloudRevision=next.revision;dirty=false;syncLabel(txt('ذخیره در همین مرورگر · نسخه ','Saved in this browser · v')+cloudRevision);if(!silent)toast(txt('در همین مرورگر ذخیره شد.','Saved in this browser.'));updateHeader();renderDashboard();renderReview();return true;}
 catch{dirty=true;syncLabel(txt('ذخیره مرورگر در دسترس نیست؛ فایل خروجی بگیرید.','Browser storage unavailable; export your work.'));toast(txt('تمرین شما باز است؛ برای نگهداری آن Export JSON را بزنید.','Your work is still open; use Export JSON to keep it.'));return false;}
}
async function practiceApi(action,method,body){
 if(action==='me')return auth;
 if(action==='audit'&&method==='GET')return practiceSnapshot?.audit||[];
 if(action==='state'&&method==='GET'){try{const p=JSON.parse(localStorage.getItem(PRACTICE_KEY)||'null');if(p?.version===1&&validPracticeState(p.state)){practiceSnapshot=p;return {state:clone(p.state),revision:p.revision};}}catch{}return {state:clone(state),revision:cloudRevision};}
 if(action==='profile'&&method==='POST'&&typeof body?.name==='string'&&!body.newPassword){auth.name=body.name.trim().slice(0,120)||txt('کاربر تمرینی','Practice participant');savePractice(true,'Practice name updated');return auth;}
 throw new Error(txt('این قابلیت به حساب سازمانی و سرور مرکزی نیاز دارد؛ نسخه رایگان برای نمایش و تمرین مستقل است.','This feature needs an organization account and central server. The free edition is for independent demonstration and practice.'));
}
function practiceCopy(el,faText,enText){if(!el)return;el.dataset.fa=faText;el.dataset.en=enText;el.textContent=txt(faText,enText);}
function initializePractice(){
 auth={id:'practice-user',name:practiceSnapshot?.name||txt('کاربر تمرینی','Practice participant'),email:'participant@example.invalid',role:'admin',accessRole:'super_admin'};
 cloudRevision=practiceSnapshot?.revision||0;cloudReady=true;dirty=false;
 state.history ||= [];state.initiatives ||= [];state.archives ||= [];state.exercises ||= {};workDefaults();
 ensureOrganizationUnits(state);
 practiceCopy(document.querySelector('.execution-choice h2'),'میز کار رایگان OKR','Free OKR workspace');
 practiceCopy(document.getElementById('entryExecBtn'),'باز کردن اپ و تمرین ←','Open app & practice →');
 practiceCopy(document.querySelector('.execution-choice > small:last-of-type'),'بدون ثبت‌نام · ذخیره در همین مرورگر','No sign-up · Saved in this browser');
 practiceCopy(document.querySelector('.training-side-note'),'جزوه، مثال فرضی و تمرین همه مراحل در دسترس است؛ پاسخ‌های شما در همین مرورگر ذخیره می‌شوند.','Learning notes, fictional examples and every exercise are available; your answers stay in this browser.');
 practiceCopy(document.getElementById('profileBtn'),'نام من در تمرین','My practice name');
 practiceCopy(document.getElementById('logoutBtn'),'بازگشت به صفحه اول','Back to home');
 document.getElementById('logoutBtn').onclick=()=>document.getElementById('homePortalBtn').click();
 document.getElementById('changePasswordBtn').classList.add('hidden');
 document.getElementById('loginPanel').classList.add('hidden');
 document.getElementById('accountForm').inert=true;
 renderAll();bindStatic();renderExtras();renderNewSurfaces();applyLanguage();
 syncLabel(txt('نسخه رایگان · ذخیره در همین مرورگر','Free edition · Saved in this browser'));
 if(practiceSnapshot&&practiceSnapshot.state.orgChartVersion!==ORG_CHART_VERSION)savePractice(true,'Company organization chart added; existing data preserved');
 if(location.hash&&!location.hash.startsWith('#activate')&&!location.hash.startsWith('#guide')){document.getElementById('authScreen').classList.add('hidden');document.getElementById('executionApp').inert=false;document.body.style.overflow='';route();}
 else if(location.hash.startsWith('#guide'))stageHelp(location.hash.split('/')[1]);
}
function renderPracticeAccess(box){
 box.innerHTML='<article class="card"><h2>'+txt('دسترسی در نسخه رایگان','Access in the free edition')+'</h2><p>'+txt('همه می‌توانند همین اپ، جزوه‌ها، داشبورد و ابزارهای OKR را بدون ثبت‌نام باز و تمرین کنند. هر مرورگر فضای تمرین جداگانه دارد؛ تغییرات افراد برای دیگران فرستاده نمی‌شود.','Anyone can open and practice with this app, learning notes, dashboard and OKR tools without signing up. Each browser has its own practice workspace; edits are not sent to other people.')+'</p><p>'+txt('ورود امن، دعوت همکار و مجوزهای واقعی سازمان در نسخه سرور مرکزی باقی است؛ این صفحه برای مشاهده طراحی نقش‌هاست.','Secure sign-in, invitations and real organization permissions remain in the central-server edition. This page presents the role design.')+'</p><div class="table-wrap"><table><thead><tr><th>'+txt('نقش','Role')+'</th><th>'+txt('دامنه اختیار در نسخه سازمانی','Authority in the organization edition')+'</th></tr></thead><tbody>'+[['super_admin','مالکیت و مدیریت کامل سیستم','System ownership and full administration'],['org_admin','مدیریت کاربران و محتوای سازمان','Organization users and content'],['department_manager','مدیریت OKRهای واحد مربوط','The assigned department’s OKRs'],['employee','مشاهده و تکمیل کارهای مجاز خود','Own permitted work'],['viewer','مشاهده بخش‌های مجاز','Read permitted content']].map(([role,a,b])=>'<tr><td>'+esc(roleText(role))+'</td><td>'+txt(a,b)+'</td></tr>').join('')+'</tbody></table></div><h3>'+txt('ادامه تمرین در دستگاه دیگر','Continue practice on another device')+'</h3><p>'+txt('از منوی سه‌نقطه Export JSON را بزنید؛ فایل را به دستگاه دیگر بفرستید و در همان منو Import JSON را انتخاب کنید. این انتقال دستی است و همگام‌سازی خودکار نیست.','Choose Export JSON from the three-dot menu, send the file to the other device, then choose Import JSON there. This is a manual transfer, not automatic synchronization.')+'</p><button class="btn" data-practice-sample>'+txt('بازگرداندن مثال آموزشی اولیه','Restore the initial learning example')+'</button></article>';
}
document.addEventListener('click',e=>{
 if(!e.target.closest('[data-practice-sample]'))return;
 if(!confirm(txt('تمرین فعلی با مثال اولیه جایگزین شود؟ ابتدا فایل خروجی بگیرید.','Replace current practice with the initial example? Export your work first.')))return;
 state=makeDemoState();workDefaults();save(false,'Learning example restored');renderAll();bindStatic();renderExtras();renderNewSurfaces();route();
});
