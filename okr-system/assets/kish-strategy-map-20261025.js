/* Kish Strategy Alignment Map v1 — read from live app records only. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const faNum=v=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(v);
const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const state={zoom:1,year:'all',showUnassigned:true,collapsed:new Set(),mapView:'strategy'};
function jParts(s){
 if(!s)return null;
 const d=new Date(String(s).slice(0,10)+'T12:00:00Z');
 if(!Number.isFinite(+d))return null;
 try{const p=new Intl.DateTimeFormat('en-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'}).formatToParts(d);
  const o=Object.fromEntries(p.filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,+x.value]));return o;}catch{return null;}
}
function period(c,cadences){
 const d=jParts(c.start);
 const linked=cadences.find(x=>x.id===c.cadenceId);
 const t=linked?.type||c.goalCadence||'unspecified';
 return {type:t,year:d?.year||null,quarter:d?Math.ceil(d.month/3):null,name:c.name||'بدون عنوان',start:c.start,end:c.end};
}
function krPercent(k){
 const b=Number(k.baseline),c=Number(k.current),t=Number(k.target);
 if([k.baseline,k.current,k.target].some(v=>v===null||v===undefined||String(v).trim()==='')||![b,c,t].every(Number.isFinite)||b===t)return null;
 return Math.max(0,Math.min(100,(c-b)/(t-b)*100));
}
function goalProgress(g){
 const all=g.krs||[],measured=all.map(krPercent).filter(n=>n!==null);
 if(!measured.length)return {n:null,count:0,total:all.length,rows:[]};
 const rows=all.map(k=>({k,p:krPercent(k)}));
 return {n:Math.round(measured.reduce((a,b)=>a+b,0)/measured.length),count:measured.length,total:all.length,rows};
}
function health(g,history){
 if(g.status==='closed')return {name:'مختومه',cls:'closed',last:''};
 let updates=(g.krs||[]).map(k=>{
   const h=history.filter(v=>v.krId===k.id).sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')))[0];
   return {status:h?.confidence||k.confidence,at:k.lastUpdate||h?.at||'',hasEvidence:!!(h||k.lastUpdate)};
 }).filter(x=>x.hasEvidence);
 if(!updates.length)return {name:'بدون وضعیت',cls:'unknown',last:''};
 const statuses=updates.map(x=>x.status);
 let cls=statuses.includes('off-track')?'off':statuses.includes('attention')||statuses.includes('needs-attention')?'attention':statuses.some(x=>x==='on-track')?'on':'unknown';
 const names={off:'خارج از مسیر',attention:'نیازمند توجه',on:'روی مسیر',unknown:'بدون وضعیت'};
 const last=updates.map(x=>x.at).filter(Boolean).sort().at(-1)||'';
 return {name:names[cls],cls,last};
}
function kpiStatus(k){
 const a=k.current,b=k.target;
 if(a===undefined||a===null||a===''||b===undefined||b===null||b===''||!Number.isFinite(Number(a))||!Number.isFinite(Number(b)))return 'unknown';
 return k.direction==='down'?(Number(a)<=Number(b)?'healthy':'unhealthy'):(Number(a)>=Number(b)?'healthy':'unhealthy');
}
function owner(owner,people){
 const person=people.find(p=>p.id===owner||p.email===owner||p.name===owner);
 const name=person?.name||owner||'مسئول تعیین نشده';
 const image=person?.photoUrl||person?.avatarUrl||person?.avatar||person?.photo||'';
 const initials=String(name).trim().slice(0,2)||'؟';
 return '<span class="km-person" title="'+esc(name)+'">'+(image&&/^https:\/\//.test(String(image))?'<img class="km-avatar" src="'+esc(image)+'" alt="" loading="lazy">':'<span class="km-avatar km-initial">'+esc(initials)+'</span>')+'<span class="km-person-name">'+esc(name)+'</span></span>';
}
function unit(g,teams){
 const t=teams.find(t=>t.okrs?.some(o=>o.id===g.id));
 if(!t)return {name:'شرکت',abbr:'ش',id:'company',tone:0};
 const name=t.name||t.label||t.title||'واحد سازمانی';
 return {name,abbr:String(name).replace(/^(معاونت|مدیریت|اداره)\s+/,'').trim().slice(0,1)||'و',id:t.id,tone:Math.abs(String(t.id).split('').reduce((a,x)=>a+x.charCodeAt(0),0))%5};
}
function goalCard(g,source,opts={}){
 const p=goalProgress(g),h=health(g,source.history),u=unit(g,source.teams);
 const descendants=source.goals.filter(x=>x.parentId===g.id).length;
 const status= g.status==='draft'?' · پیش‌نویس':g.status==='review'||g.status==='alignment'?' · در انتظار تأیید':'';
 const date=h.last?jParts(h.last):null;
 const last=date?(' · آخرین ثبت: '+faNum(date.day)+' '+months[date.month-1]):'';
 const projects=source.initiatives.filter(x=>x.objectiveId===g.id);
 const krCount=(g.krs||[]).length;
 const target=encodeURIComponent(g.id);
 return '<article class="km-goal km-'+h.cls+(opts.quarter?' km-quarter':'')+'">'+
  '<div class="km-goal-top"><span class="km-unit km-tone-'+u.tone+'" title="'+esc(u.name)+'">'+esc(u.abbr)+'</span>'+
  '<span class="km-goal-type">'+(opts.quarter?'فصلی':opts.year?'سالانه':'بدون بازه')+'</span>'+
  '<span class="km-status km-'+h.cls+'"><i></i>'+h.name+status+'</span></div>'+
  '<a class="km-goal-name" href="#goals/'+target+'" title="مشاهده و ویرایش هدف">'+esc(g.objective||'هدف بدون عنوان')+'</a>'+
  '<div class="km-meta">'+owner(g.owner,source.people)+'</div>'+
  '<div class="km-goal-bottom"><button type="button" class="km-progress" data-km-action="progress" data-id="'+esc(g.id)+'" title="نمایش مبنای محاسبه پیشرفت">'+(p.n===null?'—':faNum(p.n)+'٪')+'</button>'+
  '<span class="km-submeta">'+faNum(p.count)+' از '+faNum(p.total)+' نتیجه سنجیده</span></div>'+
  (p.n!==null?'<div class="km-progress-track"><i style="width:'+p.n+'%"></i></div>':'')+
  '<div class="km-tail"><a href="#goals/'+target+'">'+faNum(krCount)+' نتیجه کلیدی</a><span>·</span><a href="#projects">'+faNum(projects.length)+' ابتکار</a>'+
  (descendants?'<span class="km-child-count">'+faNum(descendants)+' هدف متصل</span>':'')+'</div>'+
  (last?'<div class="km-last">'+last+'</div>':'')+
  '</article>';
}
function cycleIndex(data){
 const m=new Map();
 for(const c of data.cycles){
  for(const oid of c.goalIds||[]){
   if(!m.has(oid))m.set(oid,period(c,data.cadences));
  }
 }
 return m;
}
function yearOf(cyc,g){
 return cyc?.year||null;
}
function pillarOf(g,goalMap,pillarIds,depth=0){
 if(!g||depth>30)return null;
 if(pillarIds.has(g.parentId))return g.parentId;
 if(goalMap.has(g.parentId))return pillarOf(goalMap.get(g.parentId),goalMap,pillarIds,depth+1);
 return null;
}
function pillarHeader(p,data,goals){
 const kpis=data.kpis.filter(k=>k.pillarId===p.id||k.pillar===p.title);
 const healthy=kpis.filter(k=>kpiStatus(k)==='healthy').length;
 const unhealthy=kpis.filter(k=>kpiStatus(k)==='unhealthy').length;
 const known=healthy+unhealthy,missing=kpis.length-known;
 const healthLabel=!known?'سلامت شاخص‌ها: فاقد داده':unhealthy?faNum(unhealthy)+' نامطلوب از '+faNum(known)+' سنجیده':faNum(healthy)+' از '+faNum(known)+' مطلوب';
 const linked=goals.filter(g=>g.parentId===p.id).length;
 const allGoals=goals.length;
 return '<header class="km-pillar" tabindex="0"><div class="km-pillar-name"><span class="km-pillar-symbol">◆</span><h2 title="'+esc(p.title)+'">'+esc(p.title)+'</h2><a href="#strategy" title="ویرایش ارکان راهبردی" class="km-pillar-more">⋮</a></div>'+
 '<div class="km-pillar-metrics"><span class="km-health '+(unhealthy?'bad':known?'good':'unknown')+'"><i></i>'+healthLabel+'</span>'+
 (missing?'<span title="شاخص‌هایی که مقدار جاری یا آستانه ندارند">'+faNum(missing)+' فاقد داده</span>':'')+'</div>'+
 '<div class="km-pillar-foot"><a href="#kpis">'+faNum(kpis.length)+' KPI</a><span>'+faNum(linked)+' هدف مستقیم · '+faNum(allGoals)+' هدف مرتبط</span></div></header>';
}
function renderLane(p,data,goalMap,cycleMap,pillarIds){
 const all=data.goals.filter(g=>pillarOf(g,goalMap,pillarIds)===p.id);
 const yearSelect=state.year;
 const applicable=all.filter(g=>{
  const y=yearOf(cycleMap.get(g.id),g);
  return yearSelect==='all'||(y&&String(y)===yearSelect)||(!y&&state.showUnassigned);
 });
 const ann=applicable.filter(g=>cycleMap.get(g.id)?.type==='annual');
 const qtrs=applicable.filter(g=>cycleMap.get(g.id)?.type==='quarterly');
 const loose=applicable.filter(g=>!['annual','quarterly'].includes(cycleMap.get(g.id)?.type));
 const used=new Set();
 const annualBlock=ann.map(a=>{
   used.add(a.id);
   const desc=qtrs.filter(g=>g.parentId===a.id);
   desc.forEach(g=>used.add(g.id));
   return '<div class="km-annual-branch"><div class="km-parent">'+goalCard(a,data,{year:true})+'</div>'+
    (desc.length?'<div class="km-branch-line"></div><div class="km-quarter-grid">'+desc.map(g=>goalCard(g,data,{quarter:true})).join('')+'</div>':
    '<p class="km-mini-note">هدف فصلی متصل ثبت نشده است.</p>')+'</div>';
 }).join('');
 const directQ=qtrs.filter(g=>!used.has(g.id));
 directQ.forEach(g=>used.add(g.id));
 const unassigned=loose.filter(g=>!used.has(g.id));
 const noAnnual=ann.length===0;
 return '<section class="km-pillar-lane">'+pillarHeader(p,data,all)+
 '<div class="km-pillar-line"></div>'+
 '<div class="km-lane-body">'+
 (ann.length?'<div class="km-level-label"><i>۳</i> اهداف سالانه</div>'+annualBlock:'<div class="km-empty-year">اهداف سالانه برای این رکن و بازه تعریف نشده‌اند. <a href="#goals">مدیریت اهداف</a></div>')+
 (directQ.length?'<div class="km-level-label"><i>۴</i> اهداف فصلی با ارتباط مستقیم یا خارج از شاخه سالانه</div><div class="km-quarter-grid">'+directQ.map(g=>goalCard(g,data,{quarter:true})).join('')+'</div>':'')+
 (unassigned.length?'<details class="km-unassigned" '+(state.showUnassigned?'open':'')+'><summary>اهداف نیازمند تعیین دوره <b>'+faNum(unassigned.length)+'</b></summary><div class="km-quarter-grid">'+unassigned.map(g=>goalCard(g,data,{})).join('')+'</div></details>':'')+
 (!applicable.length?'<p class="km-mini-note">هدف مرتبطی برای این انتخاب ثبت نشده است.</p>':'')+
 '</div></section>';
}
function helpModal(data,id){
 const g=data.goals.find(x=>x.id===id);if(!g)return;
 const p=goalProgress(g),rows=p.rows.map(({k,p:n})=>'<tr><td>'+esc(k.text)+'</td><td>'+esc(k.baseline??'—')+'</td><td>'+esc(k.current??'—')+'</td><td>'+esc(k.target??'—')+'</td><td>'+(n===null?'فاقد داده':faNum(Math.round(n))+'٪')+'</td></tr>').join('');
 const content='<dialog class="km-dialog" id="kmDetail"><form method="dialog"><div class="km-dialog-head"><h2>مبنای محاسبه پیشرفت</h2><button aria-label="بستن" type="submit">✕</button></div><p><b>'+esc(g.objective)+'</b></p><p>روش فعلی: میانگین ساده نتایج کلیدیِ دارای مبنا، هدف و مقدار جاری معتبر. موارد بدون داده از محاسبه کنار گذاشته می‌شوند؛ این رقم نشانگر سلامت زمانی هدف نیست.</p>'+
 '<div class="km-overflow"><table><thead><tr><th>نتیجه کلیدی</th><th>مبنا</th><th>جاری</th><th>هدف</th><th>پیشرفت</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5">نتیجه قابل اندازه‌گیری موجود نیست.</td></tr>')+'</tbody></table></div>'+
 '<p>پیشرفت کل: <strong>'+(p.n===null?'قابل محاسبه نیست':faNum(p.n)+'٪')+'</strong> · '+faNum(p.count)+' نتیجه قابل سنجش از '+faNum(p.total)+'</p>'+
 '<a class="km-link-btn" href="#goals/'+encodeURIComponent(g.id)+'">مشاهده جزئیات هدف، مسئول و تاریخچه</a></form></dialog>';
 document.getElementById('kmDetail')?.remove();document.body.insertAdjacentHTML('beforeend',content);
 const dlg=$('kmDetail');dlg.showModal();dlg.addEventListener('close',()=>dlg.remove(),{once:true});
}
function render(data,pillarId){
 if(!data?.strategy)return '<p>داده راهبرد هنوز بارگذاری نشده است.</p>';
 const filteredPillars=(data.strategy.pillars||[]).filter(p=>!pillarId||p.id===pillarId);
 const goalMap=new Map(data.goals.map(g=>[g.id,g])),cycleMap=cycleIndex(data);
 const pillarIds=new Set((data.strategy.pillars||[]).map(p=>p.id));
 const years=[...new Set(data.cycles.map(c=>period(c,data.cadences).year).filter(Boolean))].sort((a,b)=>b-a);
 const stray=data.goals.filter(g=>!pillarOf(g,goalMap,pillarIds)).filter(g=>state.year==='all'||String(cycleMap.get(g.id)?.year)===state.year||(!cycleMap.has(g.id)&&state.showUnassigned));
 const totalKpis=data.kpis.length,goalsCount=data.goals.length,cyclesCount=data.cycles.length;
 const options='<option value="all">همه سال‌ها</option>'+years.map(y=>'<option value="'+y+'" '+(state.year===String(y)?'selected':'')+'>'+faNum(y)+'</option>').join('');
 const nav='<div class="km-actions"><div class="km-action-leading"><span>سال شمسی</span><select data-km-year aria-label="فیلتر سال">'+options+'</select>'+
 '<label class="km-checkbox"><input type="checkbox" data-km-unassigned '+(state.showUnassigned?'checked':'')+'> اهداف بدون دوره</label></div>'+
 '<div class="km-action-trailing"><button type="button" data-km-zoom="-1" aria-label="کوچک‌نمایی">−</button><span id="kmZoomValue">'+faNum(Math.round(state.zoom*100))+'٪</span><button type="button" data-km-zoom="1" aria-label="بزرگ‌نمایی">＋</button><button type="button" data-km-zoom="0">بازنشانی</button></div></div>';
 const summary='<div class="km-metrics"><span>◆ '+faNum(filteredPillars.length)+' رکن راهبردی</span><span>🎯 '+faNum(goalsCount)+' هدف ثبت‌شده</span><span>📊 '+faNum(totalKpis)+' شاخص</span><span>🗓️ '+faNum(cyclesCount)+' بازه زمانی</span></div>';
 const ultimate='<div class="km-ultimate-wrap"><a href="#strategy" class="km-ultimate"><span class="km-ultimate-badge">🚀 هدف غایی شرکت</span><strong>'+esc(data.strategy.ultimateGoal||'هدف غایی هنوز ثبت نشده است')+'</strong><span class="km-ultimate-action">مشاهده و ویرایش راهبرد ◀</span></a></div><div class="km-ultimate-line"></div>';
 return '<section class="km-app" dir="rtl">'+
 '<div class="km-header"><div><span class="km-eyebrow">STRATEGY ALIGNMENT · KISH</span><h1>🧭 نقشه هم‌راستایی راهبرد و اهداف</h1><p>از مقصد راهبردی تا اهداف سالانه و فصلی؛ پیوند هر کارت به اطلاعات و فرم‌های اجرایی همان سامانه است.</p></div>'+
 '<div class="km-head-buttons"><a href="#goals">🎯 مدیریت اهداف</a><a href="#program">🗓️ بازه‌های زمانی</a><a href="#kpis">📊 شاخص‌ها</a></div></div>'+
 summary+nav+
 '<div class="km-viewport" id="kmViewport" tabindex="0" aria-label="نقشه راهبرد با قابلیت پیمایش افقی"><div class="km-canvas" id="kmCanvas" style="zoom:'+state.zoom+'">'+ultimate+
 '<div class="km-lanes">'+(filteredPillars.length?filteredPillars.map(p=>renderLane(p,data,goalMap,cycleMap,pillarIds)).join(''):'<div class="km-empty">هیچ رکن راهبردی تعریف نشده است. <a href="#strategy">تعریف ارکان</a></div>')+'</div>'+
 (stray.length?'<section class="km-stray"><h2>⚠️ اهداف فاقد اتصال راهبردی</h2><p>این هدف‌ها به‌صورت خودکار به هیچ رکنی منتسب نشده‌اند. برای اصلاح ارتباط به صفحه هدف بروید.</p><div class="km-quarter-grid">'+stray.map(g=>goalCard(g,data,{})).join('')+'</div></section>':'')+
 '</div></div><div class="km-footnote"><span>● سبز: روی مسیر</span><span>● زرد: نیازمند توجه</span><span>● قرمز: خارج از مسیر</span><span>● خاکستری: بدون وضعیت</span><a href="#goals">ویرایش هدف، نتایج و هم‌راستایی</a></div>'+
 '<p class="km-data-note">🔎 محاسبات صرفاً بر مبنای رکوردهای فعلی است. اهداف بدون دوره و KPIهای فاقد داده مشخص شده‌اند؛ هیچ مقدار فرضی برای تکمیل نقشه تولید نمی‌شود.</p></section>';
}
function updateZoom(n){
 state.zoom=n===0?1:Math.max(.65,Math.min(1.5,Math.round((state.zoom+n*.1)*10)/10));
 const can=$('kmCanvas');if(can)can.style.zoom=state.zoom;
 const t=$('kmZoomValue');if(t)t.textContent=faNum(Math.round(state.zoom*100))+'٪';
}
document.addEventListener('click',e=>{
 const zoom=e.target.closest('[data-km-zoom]');
 if(zoom){e.preventDefault();updateZoom(Number(zoom.dataset.kmZoom));return;}
 const p=e.target.closest('[data-km-action="progress"]');
 if(p&&window.KishMapBridge){e.preventDefault();helpModal(window.KishMapBridge.snapshot(),p.dataset.id);}
 const link=e.target.closest('.km-dialog .km-link-btn');if(link)$('kmDetail')?.close();
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-km-year]')){state.year=e.target.value;window.KishMapBridge?.refresh();}
 if(e.target.matches('[data-km-unassigned]')){state.showUnassigned=e.target.checked;window.KishMapBridge?.refresh();}
});
window.KishMapView={render,refresh(){window.KishMapBridge?.refresh();}};
window.addEventListener('DOMContentLoaded',()=>{if(location.hash.startsWith('#map'))window.KishMapBridge?.refresh();});
})();