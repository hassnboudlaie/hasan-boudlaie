'use strict';
const repository='hassnboudlaie/hasan-boudlaie';
const contentEndpoint='https://api.github.com/repos/'+repository+'/contents/content.json';
let data=null,token='',sha='',dirty=false,busy=false,baseContent='',pendingFile=null;
const $=id=>document.getElementById(id);
function status(message,kind='info'){const el=$('status');el.textContent=message;el.dataset.kind=kind}
function clone(d){return JSON.parse(JSON.stringify(d))}
function getAt(path){return path.split('.').reduce((v,k)=>v?.[k],data)}
function putAt(path,value){const parts=path.split('.');let obj=data;parts.slice(0,-1).forEach(k=>{if(!obj[k]||typeof obj[k]!=='object')obj[k]={};obj=obj[k]});obj[parts.at(-1)]=value}
function changed(){dirty=true;$('saveHint').textContent='تغییرات منتشر نشده‌اند.';syncRaw()}
function syncRaw(){if(data)$('rawContent').value=JSON.stringify(data,null,2)}
function validURL(value){try{const u=new URL(String(value||''),location.href);return ['https:','http:'].includes(u.protocol)}catch(e){return false}}
function externalURL(value){return /^https?:\/\//i.test(value||'')&&validURL(value)}
function validEmail(value){return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value||'')}
function validateContent(d){
 if(!d||typeof d!=='object'||Array.isArray(d))throw new Error('ساختار اصلی محتوا باید یک object باشد.');
 function paired(v,label){if(!v||typeof v.en!=='string'||typeof v.fa!=='string'||!v.en.trim()||!v.fa.trim())throw new Error('متن فارسی و انگلیسی '+label+' را تکمیل کنید.')}
 paired(d.brand,'نام');paired(d.hero?.title,'عنوان صفحهٔ اول');paired(d.hero?.description,'معرفی صفحهٔ اول');paired(d.productsIntro?.title,'عنوان اپلیکیشن‌ها');paired(d.advisory?.title,'عنوان مشاوره');paired(d.about?.title,'عنوان دربارهٔ من');
 if(!validEmail(d.contact?.email))throw new Error('ایمیل معتبر وارد کنید.');
 for(const key of ['scholar','linkedin'])if(d.contact?.[key]&&!externalURL(d.contact[key]))throw new Error('لینک '+key+' معتبر نیست.');
 if(d.profile?.photoUrl&&!validURL(d.profile.photoUrl)&&!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d.profile.photoUrl))throw new Error('تصویر باید مسیر فایل، آدرس HTTP/HTTPS یا دادهٔ معتبر JPEG/PNG/WebP باشد.');
 if(!Array.isArray(d.products)||d.products.length>100)throw new Error('فهرست اپلیکیشن‌ها باید آرایه‌ای با حداکثر ۱۰۰ مورد باشد.');
 d.products.forEach((p,i)=>{paired(p.title,'اپلیکیشن '+(i+1));paired(p.org,'سازمان '+(i+1));paired(p.type,'نوع '+(i+1));if(!/^https?:\/\//i.test(p.url||'')||!validURL(p.url))throw new Error('لینک کامل و معتبر اپلیکیشن '+(i+1)+' را وارد کنید.');for(const key of ['description','stage'])if(p[key])paired(p[key],key+' '+(i+1))});
 if(!Array.isArray(d.advisory.services))throw new Error('حوزه‌های مشاوره باید آرایه باشند.');
 d.advisory.services.forEach((s,i)=>{paired(s,'حوزهٔ '+(i+1));for(const key of ['description','outcome'])if(s[key])paired(s[key],key+' حوزهٔ '+(i+1))});
 for(const [items,label] of [[d.about.credentials,'پیشینه'],[d.research?.topics,'حوزه‌های پژوهشی']])if(items!==undefined){if(!Array.isArray(items))throw new Error(label+' باید آرایه باشد.');items.forEach(v=>paired(v,label))}
 if(d.research?.publications!==undefined){if(!Array.isArray(d.research.publications))throw new Error('مقالات باید آرایه باشند.');d.research.publications.forEach(p=>{paired(p.title,'عنوان مقاله');if(!externalURL(p.url))throw new Error('لینک مقاله معتبر نیست.');for(const key of ['meta','description'])if(p[key])paired(p[key],key+' مقاله')})}
 if(JSON.stringify(d).length>1000000)throw new Error('حجم محتوا بیش از حد مجاز است.');return d;
}
const fieldGroups=[
 ['صفحهٔ اول و هویت',[['brand','نام'],['hero.eyebrow','حوزهٔ فعالیت'],['hero.title','عنوان اصلی'],['hero.description','معرفی کوتاه','textarea'],['hero.credentials','خط پیشینه و تجربه'],['profile.photoUrl','آدرس تصویر','url']]],
 ['معرفی اپلیکیشن‌ها',[['productsIntro.eyebrow','عنوان کوچک'],['productsIntro.title','عنوان صفحه'],['productsIntro.text','توضیح صفحه','textarea']]],
 ['معرفی مشاوره',[['advisory.eyebrow','عنوان کوچک'],['advisory.title','عنوان صفحه'],['advisory.text','معرفی','textarea'],['advisory.principleTitle','عنوان مسیر همکاری'],['advisory.principleText','توضیح مسیر همکاری','textarea']]],
 ['دربارهٔ من',[['about.title','عنوان صفحه'],['about.p1','پاراگراف اول','textarea'],['about.p2','پاراگراف دوم','textarea'],['about.signature','معرفی حرفه‌ای']]],
 ['معرفی پژوهش',[['research.eyebrow','عنوان کوچک'],['research.title','عنوان صفحه'],['research.text','معرفی پژوهش','textarea']]],
 ['تماس',[['contactPage.eyebrow','عنوان کوچک'],['contactPage.title','عنوان صفحه'],['contactPage.text','معرفی','textarea'],['contact.email','ایمیل','email'],['contact.scholar','Google Scholar','url'],['contact.linkedin','LinkedIn','url']]]
];
function makeField(path,label,type='text',lang){
 const wrap=document.createElement('div');wrap.className='field';const l=document.createElement('label');const id='field-'+path.replace(/\./g,'-');l.htmlFor=id;l.textContent=label+(lang==='en'?' — English':lang==='fa'?' — فارسی':'');
 const input=document.createElement(type==='textarea'?'textarea':'input');input.id=id;if(type!=='textarea')input.type=type==='email'?'email':'text';input.dir=lang==='en'||['url','email'].includes(type)?'ltr':'rtl';input.lang=lang||'fa';input.value=getAt(path)||'';if(type==='url')input.spellcheck=false;
 input.addEventListener('input',()=>{putAt(path,input.value);changed()});wrap.append(l,input);return wrap;
}
function addPairFields(grid,base,label,type='text'){for(const lang of ['fa','en'])grid.append(makeField(base+'.'+lang,label,type,lang))}
function fillForm(){
 const box=$('fieldGroups');box.replaceChildren();for(const [title,fields] of fieldGroups){const panel=document.createElement('section');panel.className='admin-panel';const h=document.createElement('h2');h.textContent=title;panel.append(h);const grid=document.createElement('div');grid.className='editor-grid';for(const [path,label,type='text'] of fields){if(['url','email'].includes(type)){const f=makeField(path,label,type);f.classList.add('full');grid.append(f)}else addPairFields(grid,path,label,type)}panel.append(grid);box.append(panel)}renderArrayEditors();syncRaw();$('editor').hidden=false;
}
function renderArrayEditors(){
 renderArray('productsEditor','products',[
  ['title','عنوان'],['org','سازمان'],['type','نوع'],['stage','محدودهٔ نسخه'],['description','توضیح کوتاه','textarea'],['url','لینک اپلیکیشن','url']]);
 renderArray('servicesEditor','advisory.services',[
  ['', 'عنوان'],['description','توضیح','textarea'],['outcome','نمونهٔ خروجی','textarea']]);
}
function renderArray(id,path,fields){
 const box=$(id);box.replaceChildren();const items=getAt(path)||[];
 items.forEach((item,i)=>{const details=document.createElement('details');details.className='editor-item';const summary=document.createElement('summary');summary.textContent=(i+1)+' · '+(item.title?.fa||item.fa||'مورد جدید');details.append(summary);const body=document.createElement('div');body.className='item-body';const toolbar=document.createElement('div');toolbar.className='item-toolbar';
  for(const [name,delta] of [['انتقال به بالا',-1],['انتقال به پایین',1]]){const b=document.createElement('button');b.type='button';b.textContent=name;b.disabled=(i+delta<0||i+delta>=items.length);b.addEventListener('click',()=>{[items[i],items[i+delta]]=[items[i+delta],items[i]];changed();renderArrayEditors()});toolbar.append(b)}
  const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='حذف از فهرست';remove.addEventListener('click',()=>{if(confirm('این مورد از فهرست پیش‌نویس حذف شود؟ تا زمان انتشار، سایت تغییر نمی‌کند.')){items.splice(i,1);changed();renderArrayEditors()}});toolbar.append(remove);body.append(toolbar);
  const grid=document.createElement('div');grid.className='editor-grid';for(const [key,label,type='text'] of fields){const base=path+'.'+i+(key?'.'+key:'');if(type==='url'){const f=makeField(base,label,type);f.classList.add('full');grid.append(f)}else addPairFields(grid,base,label,type)}body.append(grid);details.append(body);box.append(details);
 });
}
function githubHeaders(){return {Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}}
function decodeContent(value){const bytes=Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
function utf8base64(value){let binary='';for(const byte of new TextEncoder().encode(value))binary+=String.fromCharCode(byte);return btoa(binary)}
async function readGitHub(){const response=await fetch(contentEndpoint+'?ref=main',{headers:githubHeaders(),cache:'no-store'});if(!response.ok){const e=new Error(response.status===401?'توکن معتبر نیست.':response.status===403?'دسترسی نوشتن یا خواندن این مخزن برقرار نیست.':'دریافت محتوا از GitHub انجام نشد ('+response.status+').');e.status=response.status;throw e}const file=await response.json();return {sha:file.sha,data:validateContent(JSON.parse(decodeContent(file.content)))}}
function connectionStatus(){const connected=!!token&&!!sha;$('connectionHint').textContent=connected?'متصل به GitHub؛ آمادهٔ انتشار.':'اتصال GitHub برقرار نیست.';$('disconnectBtn').hidden=!connected;$('connectBtn').textContent=connected?'بارگذاری آخرین نسخهٔ GitHub':'اتصال به GitHub'}
async function connectGitHub(){
 if(busy)return;const entered=$('token').value.trim();if(entered)token=entered;if(!token){status('برای انتشار، توکن این مخزن را در قسمت اتصال وارد کنید.','error');$('token').focus();return}busy=true;$('connectBtn').disabled=true;status('در حال دریافت آخرین نسخهٔ GitHub…');
 try{const file=await readGitHub();$('token').value='';if(dirty&&baseContent!==JSON.stringify(file.data)){pendingFile=file;sha='';$('loadLatestBtn').hidden=false;connectionStatus();status('نسخهٔ GitHub با مبنای این پیش‌نویس فرق دارد. ابتدا پیش‌نویس را دانلود کنید؛ سپس نسخهٔ جدید را بارگذاری و تغییرات را تطبیق دهید.','error');return}sha=file.sha;if(!dirty){data=file.data;baseContent=JSON.stringify(data);fillForm()}connectionStatus();status(dirty?'اتصال برقرار شد. پیش‌نویس فعلی شما حفظ شده است.':'اتصال برقرار شد؛ آخرین محتوا بارگذاری شد.')}catch(e){token='';sha='';connectionStatus();status(e.message,'error')}finally{busy=false;$('connectBtn').disabled=false}
}
function disconnect(){token='';sha='';pendingFile=null;$('token').value='';$('loadLatestBtn').hidden=true;try{sessionStorage.removeItem('hb-admin-token')}catch(e){}connectionStatus();status('اتصال قطع شد. پیش‌نویس شما در این صفحه باقی است.')}
function applyRaw(){try{const parsed=validateContent(JSON.parse($('rawContent').value));data=parsed;fillForm();changed();status('محتوای کامل در پیش‌نویس اعمال شد؛ برای بررسی، پیش‌نمایش را باز کنید.')}catch(e){status('اعمال انجام نشد: '+e.message,'error')}}
function previewContent(){try{validateContent(data);sessionStorage.setItem('hb-site-preview',JSON.stringify(data));const tab=window.open('index.html?preview=1','hb-site-preview');if(!tab)throw new Error('مرورگر پنجرهٔ پیش‌نمایش را مسدود کرده است. باز شدن پنجره را برای این سایت مجاز کنید.');status('پیش‌نمایش باز شد؛ تغییرات هنوز منتشر نشده‌اند.')}catch(e){status(e.message,'error')}}
function downloadBackup(){try{validateContent(data);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='hasan-boudlaie-content-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('نسخهٔ پشتیبان برای دانلود آماده شد.')}catch(e){status(e.message,'error')}}
async function saveContent(){
 if(busy)return;if(!token||!sha){status('برای انتشار نهایی، ابتدا به GitHub متصل شوید. ویرایش و پیش‌نمایش بدون اتصال هم قابل استفاده است.','error');$('token').focus();return}
 let snapshot;try{snapshot=clone(validateContent(data))}catch(e){status(e.message,'error');return}busy=true;$('saveBtn').disabled=true;status('در حال بررسی نسخه و ثبت تغییرات…');
 try{
  const latest=await readGitHub();if(latest.sha!==sha)throw new Error('محتوا در GitHub تغییر کرده است. ابتدا نسخهٔ پشتیبان پیش‌نویس را دانلود کنید و آخرین نسخه را با تغییرات خود تطبیق دهید. این پیش‌نویس هنوز حفظ شده است.');
  const response=await fetch(contentEndpoint,{method:'PUT',headers:{...githubHeaders(),'Content-Type':'application/json'},body:JSON.stringify({message:'Update website content from content editor',content:utf8base64(JSON.stringify(snapshot,null,2)+'\n'),sha,branch:'main'})});const result=await response.json();
  if(!response.ok)throw new Error(response.status===409?'نسخه هم‌زمان تغییر کرده است. پیش‌نویس را دانلود و آخرین محتوا را بررسی کنید.':'ذخیره در GitHub انجام نشد ('+response.status+'). دسترسی Contents: Read & Write را بررسی کنید.');
  sha=result.content.sha;baseContent=JSON.stringify(snapshot);dirty=JSON.stringify(data)!==JSON.stringify(snapshot);$('saveHint').textContent=dirty?'تغییرات جدیدتر هنوز منتشر نشده‌اند.':'تغییرات در GitHub ثبت شدند.';status('ثبت شد. نسخهٔ عمومی پس از پایان انتشار GitHub Pages به‌روزرسانی می‌شود.');
  if(result.commit?.html_url){const link=document.createElement('a');link.href=result.commit.html_url;link.target='_blank';link.rel='noopener';link.textContent=' مشاهدهٔ ثبت تغییرات';$('status').append(link)}
 }catch(e){status(e.message,'error')}finally{busy=false;$('saveBtn').disabled=false}
}
async function loadPublic(){try{const r=await fetch('content.json?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('بارگذاری محتوای سایت انجام نشد.');data=validateContent(await r.json());baseContent=JSON.stringify(data);fillForm();status('محتوا آمادهٔ ویرایش است. برای انتشار نهایی، اتصال GitHub لازم است.')}catch(e){status(e.message+' صفحه را تازه‌سازی کنید.','error')}}
document.addEventListener('DOMContentLoaded',()=>{
 $('connectBtn').addEventListener('click',connectGitHub);$('disconnectBtn').addEventListener('click',disconnect);$('saveBtn').addEventListener('click',saveContent);$('previewBtn').addEventListener('click',previewContent);$('downloadBtn').addEventListener('click',downloadBackup);$('applyRaw').addEventListener('click',applyRaw);
 $('loadLatestBtn').addEventListener('click',()=>{if(!pendingFile)return;if(dirty&&!confirm('پیش‌نویس فعلی با نسخهٔ جدید جایگزین شود؟ برای حفظ تغییرات خود، قبل از این کار نسخهٔ پشتیبان را دانلود کنید.'))return;data=pendingFile.data;sha=pendingFile.sha;baseContent=JSON.stringify(data);pendingFile=null;dirty=false;fillForm();$('saveHint').textContent='آخرین نسخه بارگذاری شد.';$('loadLatestBtn').hidden=true;connectionStatus();status('نسخهٔ جدید بارگذاری شد؛ می‌توانید تغییرات خود را دوباره اعمال کنید.')});
 $('addProduct').addEventListener('click',()=>{data.products.push({title:{en:'New application',fa:'اپلیکیشن جدید'},org:{en:'Organization',fa:'سازمان'},type:{en:'Application',fa:'اپلیکیشن'},stage:{en:'Preview',fa:'پیش‌نمایش'},description:{en:'Describe the purpose and scope.',fa:'کاربرد و محدودهٔ نسخه را توضیح دهید.'},url:''});changed();renderArrayEditors();$('productsEditor').lastElementChild.open=true});
 $('addService').addEventListener('click',()=>{data.advisory.services.push({en:'New advisory area',fa:'حوزهٔ مشاورهٔ جدید',description:{en:'Describe the work.',fa:'محدودهٔ کار را توضیح دهید.'},outcome:{en:'Describe an example deliverable.',fa:'نمونهٔ خروجی را توضیح دهید.'}});changed();renderArrayEditors();$('servicesEditor').lastElementChild.open=true});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});connectionStatus();loadPublic();
});
