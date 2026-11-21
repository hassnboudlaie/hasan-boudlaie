/* Life Organization · reflective choice game (not a personality assessment). */
(function(){
"use strict";
const cats=window.LifeFunCategories;
const engine=window.LifeFunPatterns;
if(!Array.isArray(cats)||cats.length!==8)return;
const KEY="tlo-fun-strategic-choices-v3";
const LEGACY_KEY="tlo-fun-strategic-choices-v2";
const OLDEST_KEY="tlo-fun-strategic-choices-v1";
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const T=(l,f,e)=>l==="en"?e:f;
const byId=id=>cats.find(x=>x.id===id);
function read(){
 try{
  const x=JSON.parse(localStorage.getItem(KEY)||"null");
  if(x&&typeof x==="object"&&!Array.isArray(x))return {answers:x.answers&&typeof x.answers==="object"?x.answers:{},cursor:x.cursor&&typeof x.cursor==="object"?x.cursor:{},started:x.started&&typeof x.started==="object"?x.started:{}};
 }catch(e){}
 return {answers:{},cursor:{},started:{}};
}
let state=read();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){return false}}
function answers(c){return c.items.map(p=>state.answers[p.id]).filter(v=>v===0||v===1).length}
function done(c){return answers(c)===c.items.length}
function pattern(c){return done(c)&&engine?engine.classify(c,state.answers):null}
function count(){return cats.reduce((n,c)=>n+answers(c),0)}
function hasLegacyAnswers(){try{return [LEGACY_KEY,OLDEST_KEY].some(key=>{const x=JSON.parse(localStorage.getItem(key)||"null");return !!(x&&x.answers&&Object.keys(x.answers).length)})}catch(e){return false}}
function num(n,l){return l==="en"?String(n):String(n).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[Number(d)])}
function catIndex(c){return cats.findIndex(x=>x.id===c.id)}
function next(c){return cats[catIndex(c)+1]||null}
const scenes={
 values:['<circle cx="100" cy="90" r="59" fill="#ffffff22"/>','<path d="M57 113 81 61 105 101 132 48 153 116" fill="none" stroke="#fff4dc" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>','<circle cx="132" cy="48" r="11" fill="#ffdab2"/>'],
 direction:['<path d="M34 158 Q123 135 80 100 T155 28" fill="none" stroke="#ffffff33" stroke-width="30" stroke-linecap="round"/>','<circle cx="106" cy="88" r="61" fill="none" stroke="#fff1d7" stroke-width="4"/>','<path d="m106 40 19 49-19 49-19-49z" fill="#f4ce9e"/><path d="m106 40 0 98" stroke="#174e56" stroke-width="3"/>'],
 growth:['<path d="M103 157 V79" stroke="#ffefd3" stroke-width="6" stroke-linecap="round"/>','<path d="M100 95 C52 99 54 43 77 48 C94 48 105 80 100 95Z" fill="#bedfc7"/><path d="M107 83 C163 87 161 35 139 40 C122 43 103 69 107 83Z" fill="#e9f2d3"/>','<path d="M46 159h116" stroke="#ffffff77" stroke-width="3" stroke-linecap="round"/>'],
 work:['<circle cx="64" cy="80" r="19" fill="#e5f3d8"/><circle cx="145" cy="80" r="19" fill="#ffdbbc"/>','<path d="M35 149 Q63 106 91 149 M117 149 Q145 106 172 149" fill="none" stroke="#fff3e2" stroke-width="11" stroke-linecap="round"/>','<path d="M81 77h47m-12-12 12 12-12 12" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'],
 money:['<path d="M36 89h137M58 89l-23 41h46L58 89zm93 0-23 41h46l-23-41z" fill="none" stroke="#fff2d5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>','<circle cx="103" cy="61" r="20" fill="#edcf97"/><path d="M103 81v75H65h76" fill="none" stroke="#fff2d5" stroke-width="6" stroke-linecap="round"/>'],
 relations:['<circle cx="105" cy="89" r="22" fill="#fff0dc"/><circle cx="48" cy="89" r="13" fill="#c9e6d7"/><circle cx="163" cy="89" r="13" fill="#f5cb9e"/>','<path d="M104 111V151M47 104 66 138M164 104 145 138M84 145 105 151 127 145" stroke="#fff3e7" stroke-width="8" stroke-linecap="round" fill="none"/>'],
 wellbeing:['<circle cx="110" cy="80" r="48" fill="#f9ead8"/>','<circle cx="132" cy="66" r="46" fill="#285a64"/>','<path d="M49 150q20-14 40 0t40 0t40 0" stroke="#ffffffaa" fill="none" stroke-width="5" stroke-linecap="round"/>'],
 character:['<path d="M105 30 158 50v45q0 37-53 66-53-29-53-66V50z" fill="#ffffff22" stroke="#fcebd4" stroke-width="4"/>','<path d="M82 95 100 111 130 76" fill="none" stroke="#fff4db" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>']
};
function art(c){
 const source=window.LifeFunImages&&window.LifeFunImages[c.id];
 if(source)return '<div class="fun-art fun-art-'+c.id+'" aria-hidden="true"><img class="fun-original-img" loading="lazy" decoding="async" src="'+source+'" alt=""></div>';
 return '<div class="fun-art fun-art-'+c.id+'" aria-hidden="true"><svg viewBox="0 0 210 190" role="presentation" focusable="false">'+(scenes[c.id]||[]).join("")+'</svg></div>';
}
function heading(l,small,title,lead){
 return '<div class="fun-heading"><span class="fun-eyebrow">'+E(small)+'</span><h1>'+E(title)+'</h1><p>'+E(lead)+'</p></div>';
}
function bar(value,max,l){return '<div class="fun-progress" role="progressbar" aria-label="'+T(l,"میزان تکمیل","Progress")+'" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+value+'"><span style="width:'+Math.round(value/max*100)+'%"></span></div>';}
function home(l){
 const completed=cats.filter(done).length;
 const top=heading(l,T(l,"سرگرمی · انتخاب‌های کوچک، پرسش‌های بزرگ","FUN · SMALL CHOICES, BIG QUESTIONS"),
   T(l,"اگر مجبور باشی یکی را انتخاب کنی…","What would you choose?"),
   T(l,"هشت مسیر و پنجاه‌وهشت دوراهی واقعی. در هر موقعیت وقت یا منابع کافی برای هر دو راه نداری؛ فقط یکی را انتخاب کن و ببین چه چیزی برایت مهم‌تر است.",
   "Eight themes, 58 genuine trade-offs. In each situation, you cannot do both; choose one and explore what matters most to you."));
 return '<section class="fun-root">'+top+(hasLegacyAnswers()&&count()===0?'<div class="fun-migration-notice" role="note">'+T(l,"سؤال‌ها حالا کوتاه‌تر و تصمیم‌ها روشن‌ترند. چون صورت انتخاب‌ها تغییر کرده، پاسخ‌های قبلی به این نسخه منتقل نشده‌اند؛ آن‌ها همچنان در همین دستگاه باقی‌اند.","Questions now show clearer either/or trade-offs. Previous responses are not mapped to the revised choices but remain on this device.")+'</div>':'')+'<div class="fun-overview"><div><strong>'+num(count(),l)+' <small>/ '+num(58,l)+'</small></strong><span>'+T(l,"انتخاب ثبت‌شده","choices made")+'</span></div><div><strong>'+num(completed,l)+' <small>/ '+num(8,l)+'</small></strong><span>'+T(l,"دسته تکمیل‌شده","themes completed")+'</span></div><div class="fun-overview-progress">'+bar(count(),58,l)+'</div></div>'+
 '<div class="fun-grid">'+cats.map((c,i)=>{
 const a=answers(c),full=done(c),p=full?pattern(c):null;
 return '<button class="fun-category" type="button" data-route="fun/'+c.id+'">'+art(c)+'<span class="fun-category-content"><small>'+T(l,"مسیر ","Theme ")+num(i+1,l)+' / '+num(8,l)+'</small><strong>'+E(T(l,c.fa,c.en))+'</strong><span>'+E(T(l,c.desc,c.descEn))+'</span>'+(p?'<span class="fun-pattern-mini">'+T(l,"الگوی تو: ","Your pattern: ")+E(T(l,p.fa,p.en))+'</span>':'')+'<span class="fun-category-foot">'+(full?T(l,"تکمیل شده · دیدن روایت انتخاب‌ها","Complete · view your story"):a?T(l,"ادامه انتخاب‌ها","Continue choosing"):T(l,"شروع این مسیر","Start this theme"))+' · '+num(a,l)+'/'+num(c.items.length,l)+'</span></span></button>';
 }).join("")+'</div>'+
 (completed===8?'<div class="fun-all-done"><strong>'+T(l,"هشت مسیر را طی کردی!","All eight themes completed!")+'</strong><p>'+T(l,"قرار نیست همه انتخاب‌هایت با هم سازگار باشند. مهم این است که پرسش‌های تازه‌تری پیدا کرده‌ای.","Different choices may pull in different directions. That is worth exploring.")+'</p><button data-fun-action="download" type="button">'+T(l,"دریافت خلاصه انتخاب‌های من","Export my choices")+'</button></div>':'')+
 '<p class="fun-caveat">'+T(l,"این تجربه اختیاری و سرگرم‌کننده است. پاسخ‌ها فقط در مرورگر همین دستگاه ذخیره می‌شوند. نتیجه تشخیص شخصیت، سنجش روان‌شناختی یا نمره موفقیت در زندگی نیست.","Optional reflective entertainment. Responses stay in this browser only. No psychometric diagnosis or life-success score.")+'</p></section>';
}
function outcome(c,l){
 const p=pattern(c);if(!p)return "";
 const axisHtml=p.axes.map(axis=>{
   const direction=axis.trend==="p"?T(l,axis.positiveFa,axis.positiveEn):axis.trend==="n"?T(l,axis.negativeFa,axis.negativeEn):T(l,"ترکیبی","Mixed");
   return '<div class="fun-pattern-axis"><small>'+E(T(l,axis.labelFa,axis.labelEn))+'</small><strong>'+E(direction)+'</strong></div>';
 }).join("");
 const evidenceHtml=p.examples.map(e=>
  '<li><span>'+E(T(l,e.axisFa,e.axisEn))+'</span><div><small>'+E(T(l,e.qFa,e.qEn))+'</small><strong>'+E(T(l,e.choiceFa,e.choiceEn))+'</strong></div></li>').join("");
 const nuance=p.nuance?'<div class="fun-pattern-nuance"><strong>'+T(l,"یک انتخاب متفاوت هم داری","An important variation")+'</strong><p>'+
 T(l,"در سؤال «","On “")+E(T(l,p.nuance.qFa,p.nuance.qEn))+T(l,"»، گزینه «","”, you selected “")+E(T(l,p.nuance.choiceFa,p.nuance.choiceEn))+T(l,"» را انتخاب کردی. این لزوماً تناقض نیست؛ ممکن است موقعیت، مرز یا اولویت متفاوتی در کار باشد.","”. That is not necessarily a contradiction; context and trade-offs matter.")+'</p></div>':'';
 return '<section class="fun-pattern-card" aria-label="'+T(l,"الگوی انتخاب‌های این دسته","Pattern for this theme")+'">'+
 '<span class="fun-eyebrow">'+T(l,"نام الگوی انتخاب‌های تو","YOUR CHOICE PATTERN")+'</span>'+
 '<h2 class="fun-pattern-name">'+E(T(l,p.fa,p.en))+'</h2>'+
 '<p class="fun-pattern-intro">'+E(T(l,p.descFa,p.descEn))+'</p>'+
 '<div class="fun-pattern-axes">'+axisHtml+'</div></section>'+
 '<section class="fun-result"><span class="fun-eyebrow">'+T(l,"این عنوان از کجا آمده؟","HOW WAS THIS PATTERN NAMED?")+'</span>'+
 '<h2>'+T(l,"ردّ انتخاب‌هایت در این الگو","The choices behind your pattern")+'</h2>'+
 '<p>'+T(l,"برای هر محور، چند انتخاب مرتبط کنار هم خوانده شده‌اند؛ نام الگو از ترکیب همین دو محور به دست آمده است. این نام یک برچسب ثابت برای تو نیست.","Each theme combines related answers into two editorial directions. The name describes these choices, not a fixed trait.")+'</p>'+
 '<ol class="fun-pattern-evidence">'+evidenceHtml+'</ol>'+
 nuance+
 '<p class="fun-result-question">'+E(T(l,p.reflectionFa,p.reflectionEn))+'</p>'+
 '<small>'+T(l,"الگو صرفاً یک دسته‌بندی تأملی از پاسخ‌های فرضی این بخش است؛ نه آزمون استاندارد، نه تشخیص شخصیت و نه داوری درباره خوب یا بد بودن تو. می‌توانی انتخاب‌ها را تغییر بدهی و نتیجه را دوباره ببینی.","This is a reflective grouping of hypothetical choices, not a validated assessment or a judgment. You can edit answers and revisit the result.")+'</small></section>';
}
function summary(c,l){
 const n=next(c);
 return '<section class="fun-root">'+heading(l,T(l,"یک مسیر کامل شد · آفرین که تا پایان آمدی","THEME COMPLETE"),T(l,"انتخاب‌های تو در «"+c.fa+"»", "Your choices · "+c.en),T(l,"این‌ها پاسخ‌های امروز تو هستند، نه برچسب‌های همیشگی.","These are today's choices, not permanent labels."))+
 '<div class="fun-complete-banner">'+art(c)+'<div><strong>'+T(l,"همه "+num(c.items.length,l)+" انتخاب این بخش ثبت شد.","All "+c.items.length+" choices saved.")+'</strong><p>'+T(l,"مسیر را به پایان رساندی؛ حالا یک‌بار از بالا به انتخاب‌هایت نگاه کن.","You finished this theme. Now look back at your choices.")+'</p></div></div>'+
 outcome(c,l)+'<h2 class="fun-list-title">'+T(l,"مرور انتخاب‌هایم","Review my choices")+'</h2>'+
 '<div class="fun-review-list">'+c.items.map((p,i)=>'<div class="fun-review"><span>'+num(i+1,l)+'</span><div><small>'+E(T(l,p.q,p.qe))+'</small><strong>'+E(T(l,state.answers[p.id]===0?p.a:p.b,state.answers[p.id]===0?p.ae:p.be))+'</strong></div><button type="button" data-fun-action="edit" data-cat="'+c.id+'" data-index="'+i+'">'+T(l,"تغییر","Edit")+'</button></div>').join("")+'</div>'+
 '<div class="fun-actions"><button class="fun-button-secondary" data-route="fun">'+T(l,"هشت دسته","All themes")+'</button>'+
 (n?'<button class="fun-button-primary" data-route="fun/'+n.id+'">'+T(l,"بریم سراغ «"+n.fa+"»","Next: "+n.en)+'</button>':'<button class="fun-button-primary" data-fun-action="download">'+T(l,"دریافت انتخاب‌ها","Export choices")+'</button>')+'</div></section>';
}
function category(c,l){
 if(done(c)&&state.cursor[c.id]===undefined)return summary(c,l);
 const cursor=Number(state.cursor[c.id]);
 const index=Number.isInteger(cursor)&&cursor>=0&&cursor<c.items.length?cursor:c.items.findIndex(p=>state.answers[p.id]===undefined);
 if(index<0)return summary(c,l);
 const p=c.items[index],v=state.answers[p.id],made=answers(c),prev=index>0;
 return '<section class="fun-root fun-play"><div class="fun-play-top"><button class="fun-back" data-route="fun">'+T(l,"همه دسته‌ها","All themes")+'</button><span>'+E(T(l,c.fa,c.en))+'</span></div>'+
 '<div class="fun-play-progress"><span>'+T(l,"انتخاب "+num(index+1,l)+" از "+num(c.items.length,l),"Choice "+(index+1)+" of "+c.items.length)+'</span><span>'+num(made,l)+'/'+num(c.items.length,l)+' '+T(l,"پاسخ ثبت‌شده","saved")+'</span></div>'+bar(made,c.items.length,l)+
 '<article class="fun-question">'+art(c)+'<div class="fun-question-content"><span class="fun-eyebrow">'+T(l,"موقعیت انتخاب","THE SITUATION")+'</span>'+
 '<p class="fun-scenario">'+E(T(l,p.sceneFa||p.q,p.sceneEn||p.qe))+'</p>'+
 '<div class="fun-decision-heading"><span class="fun-decision-rule">'+T(l,"فقط یکی ممکن است","ONLY ONE IS POSSIBLE")+'</span><h1>'+E(T(l,p.q,p.qe))+'</h1></div>'+
 '<div class="fun-choice-options"><button type="button" class="fun-choice'+(v===0?" is-selected":"")+'" data-fun-action="choose" data-cat="'+c.id+'" data-index="'+index+'" data-choice="0"><small>'+T(l,"انتخاب اول","OPTION ONE")+'</small><strong>'+E(T(l,p.a,p.ae))+'</strong></button>'+
 '<div class="fun-or">'+T(l,"یا","OR")+'</div>'+
 '<button type="button" class="fun-choice'+(v===1?" is-selected":"")+'" data-fun-action="choose" data-cat="'+c.id+'" data-index="'+index+'" data-choice="1"><small>'+T(l,"انتخاب دوم","OPTION TWO")+'</small><strong>'+E(T(l,p.b,p.be))+'</strong></button></div>'+
 '<p class="fun-choice-note">'+T(l,p.choiceConstraintFa||"در همین موقعیت فقط یکی از این دو کار را می‌توانی انجام دهی. کدام را واقعاً انتخاب می‌کنی؟","You can only take one of these two paths in this situation.")+'</p></div></article>'+
 '<div class="fun-actions">'+(prev?'<button class="fun-button-secondary" type="button" data-fun-action="prev" data-cat="'+c.id+'" data-index="'+index+'">'+T(l,"انتخاب قبلی","Previous")+'</button>':'')+
 (v===0||v===1?'<button class="fun-button-primary" type="button" data-fun-action="advance" data-cat="'+c.id+'" data-index="'+index+'">'+(index===c.items.length-1?T(l,"دیدن روایت انتخاب‌ها","See my story"):T(l,"انتخاب بعدی","Next choice"))+'</button>':'')+'</div>'+
 '<p class="fun-origin">'+(p.origin==="interpretive"?T(l,"این پرسش از تصویرِ فایل مرجع الهام گرفته و متن اصیل دوگانه نیست.","This pairing is interpreted from a slide image."):"")+'</p></section>';
}
function page(l,id){
 const c=byId(id);
 if(!c)return home(l);
 if(done(c)&&state.cursor[c.id]===undefined)return summary(c,l);
 return category(c,l);
}
function rerender(){
 const id=decodeURIComponent(location.hash.slice(1)).split("/")[1];
 const el=document.getElementById("page");if(!el)return;
 el.innerHTML=page(document.documentElement.lang,id);
 window.scrollTo({top:0,behavior:"instant"});
}
function download(){
 const payload={app:"The Life Organization",feature:"Strategic Life Choices",version:3,catalogVersion:3,exportedAt:new Date().toISOString(),source:"User-supplied strategic-choice deck; 58 balanced editorial trade-off adaptations, not verbatim pairs",choices:cats.map(c=>({category:c.fa,pattern:pattern(c)?{nameFa:pattern(c).fa,nameEn:pattern(c).en,key:pattern(c).key,axes:pattern(c).basisFa}:null,items:c.items.map(p=>({id:p.id,question:p.q,selected:state.answers[p.id]===0?p.a:state.answers[p.id]===1?p.b:null,origin:p.origin}))}))};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="life-organization-fun-choices.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener("click",function(e){
 const b=e.target.closest?.("[data-fun-action]");if(!b)return;
 const action=b.dataset.funAction,c=byId(b.dataset.cat),idx=Number(b.dataset.index);
 if(action==="download"){download();return;}
 if(!c||!Number.isInteger(idx)||idx<0||idx>=c.items.length)return;
 if(action==="choose"){
   const v=Number(b.dataset.choice);if(v!==0&&v!==1)return;
   state.answers[c.items[idx].id]=v;
   if(idx+1<c.items.length)state.cursor[c.id]=idx+1;
   else delete state.cursor[c.id];
   state.started[c.id]=true;save();rerender();return;
 }
 if(action==="prev"){state.cursor[c.id]=idx-1;save();rerender();return;}
 if(action==="advance"){if(idx+1<c.items.length)state.cursor[c.id]=idx+1;else delete state.cursor[c.id];save();rerender();return;}
 if(action==="edit"){state.cursor[c.id]=idx;save();rerender();}
});
window.LifeFun={page,count,done,pattern,reset(){state={answers:{},cursor:{},started:{}};try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY);localStorage.removeItem(OLDEST_KEY)}catch(e){}},exportData(){return {answers:{...state.answers},completed:cats.filter(done).map(x=>x.id),patterns:cats.filter(done).map(c=>({categoryId:c.id,nameFa:pattern(c).fa,nameEn:pattern(c).en,key:pattern(c).key,basisFa:pattern(c).basisFa}))}}};
})();