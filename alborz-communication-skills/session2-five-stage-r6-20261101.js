/* Alborz Session 2 r6 — global five-step learning pathway across all 10 techniques */
(function(){
'use strict';
const oldRender=window.render, oldGo=window.go, allStages=[0,1,2,4,7];
if(typeof oldRender!=='function'||typeof oldGo!=='function')throw Error('Alborz UI shell unavailable');
const titles=['موقعیت تمرینی','اصول و تکنیک‌های کاربردی','سؤالات برای تفکر','گفت‌وگوی نمونه','پیام کلیدی'];
const subtitles=['یک مسئله واقعی برای تصمیم اولیه','مهارت‌ها، اصول و رفتارهای قابل تعمیم','انتخاب بهترین پاسخ','گفت‌وگو در شعبه','نکات کاربردی'];
const icons=['🎯','🧩','❓','🗣️','💡'];
const root=document.getElementById('root'),escapeHtml=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function makeKeyCard(tech){
 const msg=window.ALBORZ_KEY_MESSAGES?.[tech]||window.ALBORZ_KEY_MESSAGES?.[1];
 if(!msg)throw Error('Key message absent for '+tech);
 const text=escapeHtml;
 return '<section class="single-stage lab-page alborz-five-stage"><div class="section-header enhanced-header"><h1>💡 ۵. پیام کلیدی</h1></div><section class="contentcard lab-card"><div class="lab-key-message"><p class="lab-key-headline">'+text(msg.message)+'</p><div class="lab-key-example"><strong>مثال از موقعیتی دیگر</strong><p>'+text(msg.example)+'</p></div><p class="lab-key-decision"><b>در محیط کار به خاطر بسپارید:</b> '+text(msg.takeaway)+'</p></div></section><div class="floatingnav lab-actions"><button class="navbtn" onclick="go(\'tech\')">→ فهرست ۵ مرحله</button><button class="navbtn next" onclick="go(\'catalog\')">فهرست تکنیک‌ها ←</button></div></section>';
}
function fixCurrentScreen(){
 if(!root)return;
 if(current?.page==='tech'){
  const cards=[...root.querySelectorAll('.stage-grid .stage-card')];
  if(cards.length>5)cards.forEach((card,i)=>{
   const position=allStages.indexOf(i);
   if(position===-1){card.remove();return;}
   card.setAttribute('onclick',"go('stage',"+i+")");
   card.setAttribute('aria-label','ورود به مرحله '+(position+1));
   const digit=card.querySelector('.badge-digit'),emoji=card.querySelector('.badge-emoji');
   const title=card.querySelector('.body b'),subtitle=card.querySelector('.body small');
   if(digit)digit.textContent=String(position+1);
   if(emoji)emoji.textContent=icons[position];
   if(title)title.textContent=titles[position];
   if(subtitle)subtitle.textContent=subtitles[position];
  });
 }
 if(current?.page!=='stage')return;
 const stage=current.index, position=allStages.indexOf(stage);
 if(position<0)return;
 if(stage===7){
   const tech=Number(window.__alborzActiveTech)||1;
   root.innerHTML=makeKeyCard(tech);
   return;
 }
 const head=root.querySelector('.single-stage .section-header h1');
 if(head){
  const tail=head.textContent.includes(' — ')?' — '+head.textContent.split(' — ').slice(1).join(' — '):'';
  head.textContent=icons[position]+' '+(position+1)+'. '+titles[position]+tail;
 }
 if(stage===4)root.querySelectorAll('.lab-short-context').forEach(x=>x.remove());
 const nav=root.querySelector('.single-stage .floatingnav');
 if(nav){
  nav.querySelectorAll('button').forEach(b=>b.textContent=b.textContent.replace(/فهرست ۸ مرحله/g,'فهرست ۵ مرحله'));
  const forward=nav.querySelector('button.navbtn.next');
  const next=allStages[position+1];
  if(next!==undefined){
   if(forward){forward.setAttribute('onclick',"go('stage',"+next+")");forward.textContent='مرحله بعد ←';}
  }else if(forward){forward.setAttribute('onclick',"go('catalog')");forward.textContent='فهرست تکنیک‌ها ←';}
 }
}
window.render=function(){const result=oldRender.apply(this,arguments);fixCurrentScreen();return result;};
window.go=function(page,index){
 if(page==='stage'&&!allStages.includes(index)){
  if(index===3)index=4;else if(index===5||index===6)index=7;else index=0;
 }
 return oldGo.call(this,page,index);
};
const oldOpen=window.openAdvancedTech;
if(typeof oldOpen==='function')window.openAdvancedTech=function(i){window.__alborzActiveTech=i+1;return oldOpen(i);};
const oldSession=window.goSession;
if(typeof oldSession==='function')window.goSession=function(){window.__alborzActiveTech=1;return oldSession();};
window.__alborzActiveTech=1;
window.ALBORZ_FIVE_STAGE={release:'s12-r6-20261101',stageIndices:allStages.slice(),techniques:10,keyMessages:Object.keys(window.ALBORZ_KEY_MESSAGES||{}).length};
window.ALBORZ_RELEASE={...window.ALBORZ_RELEASE,id:'s12-r6-20261101',stages:50};
document.documentElement.dataset.alborzRelease='s12-r6-20261101';
fixCurrentScreen();
})();