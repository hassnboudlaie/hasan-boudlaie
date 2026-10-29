/* Custom dashboards project the same authoritative records as Explore. */
(()=>{'use strict';
const B=window.KishExploreBridge,M=window.KishExploreModel;
const X=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N=v=>v==null?'—':new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(v);
const labels={goal:'هدف و روند پیشرفت',list:'فهرست اهداف',count:'تعداد اهداف',text:'متن و توضیح'};
const status={'on-track':'در مسیر','needs-attention':'نیازمند توجه','off-track':'خارج از مسیر','no-status':'بدون وضعیت'};
const link=r=>'#'+({objective:'goals',kr:'results',kpi:'kpis',initiative:'projects',pillar:'map'}[r.type])+'/'+encodeURIComponent(r.id);
const button=(label,action,id='')=>'<button type="button" class="p-btn" data-kd-action="'+action+'" data-kd-id="'+X(id)+'">'+label+'</button>';
function trend(r,d){
 const points=M.boardPeriods('weekly',12,new Date()).map(p=>({date:p.end,value:M.historicalValue(r,d,p.end)}));
 const known=points.filter(p=>p.value!==null);if(!known.length)return '<p class="p-muted">تاریخچه‌ای برای نمایش روند ثبت نشده است.</p>';
 const min=Math.min(...known.map(p=>p.value)),max=Math.max(...known.map(p=>p.value)),span=max-min||1;
 const segments=[];let current=[];points.forEach((p,i)=>{if(p.value===null){if(current.length)segments.push(current);current=[];}else current.push([i*300/11,70-(p.value-min)*60/span,p]);});if(current.length)segments.push(current);
 return '<svg class="kd-trend" viewBox="-4 -4 310 84" role="img" aria-label="روند ۱۲ هفته؛ از '+X(points[0].date)+' تا '+X(points.at(-1).date)+'">'+segments.map(seg=>'<polyline fill="none" stroke="currentColor" stroke-width="2" points="'+seg.map(p=>p[0]+','+p[1]).join(' ')+'"/>'+seg.map(p=>'<circle r="3" cx="'+p[0]+'" cy="'+p[1]+'"><title>'+X(p[2].date)+' : '+X(p[2].value)+'</title></circle>').join('')).join('')+'</svg><small>۱۲ هفتهٔ اخیر · کمینه '+N(min)+' · بیشینه '+N(max)+'</small>';
}
function widget(w,d,rows){
 if(w.type==='text')return '<p class="kd-text">'+X(w.text||'')+'</p>';
 if(w.type==='goal'){
  const r=rows.find(r=>r.id===w.recordId);if(!r)return '<p>هدف این ویجت دیگر موجود نیست.</p>';
  const value=r.type==='kpi'?M.number(r.record.current):r.progress,unit=r.type==='kpi'?(r.record.unit||''):r.progress!==null?'٪':'';
  return '<a class="kd-goal-link" href="'+link(r)+'">'+X(r.title)+'</a><div class="kd-value">'+N(value)+' <small>'+X(unit)+'</small></div><p>'+X(status[r.progressStatus]||'')+'</p>'+trend(r,d)+button('ثبت / ویرایش','update',r.id);
 }
 const saved=w.viewId?(d.views||[]).find(v=>v.id===w.viewId):null;
 if(w.viewId&&!saved)return '<p>نمای ذخیره‌شده حذف شده است؛ تنظیمات ویجت را اصلاح کنید.</p>';
 const selected=M.filter(rows,saved?.filters||{},{units:d.units}).filter(r=>['objective','kr','kpi','initiative'].includes(r.type));
 if(w.type==='count')return '<div class="kd-value">'+N(selected.length)+'</div><p>هدف مطابق '+X(saved?.name||'همه اهداف فعال و پیش‌نویس')+'</p>';
 return '<p>'+X(saved?.name||'همه اهداف')+' · '+N(selected.length)+' مورد</p><div class="kd-list">'+(selected.length?selected.map(r=>'<a class="p-row" href="'+link(r)+'"><span class="p-row-main">'+X(r.title)+'<small>'+X(r.owner||'بدون مسئول')+' · '+X(status[r.progressStatus])+'</small></span><b>'+N(r.type==='kpi'?M.number(r.record.current):r.progress)+'</b></a>').join(''):'<p>هدفی مطابق این نما نیست.</p>')+'</div>';
}
function render(id){const dashboards=B.dashboards(),d=B.snapshot(),dash=dashboards.find(x=>x.id===id)||dashboards[0],rows=M.normalize(d);
 return '<section class="kd-app p-page" dir="rtl"><header class="p-head"><div><h1>داشبوردهای سفارشی</h1><p>اهداف، نماهای ذخیره‌شده و تاریخچهٔ همان فضای کاری</p></div>'+button('داشبورد جدید','create')+'</header><nav class="kc-tabs" aria-label="داشبوردها">'+dashboards.map(x=>'<a href="#dashboards/custom/'+X(x.id)+'" '+(x.id===dash?.id?'aria-current="page"':'')+'>'+X(x.title)+'</a>').join('')+'</nav>'+(dash?'<div class="p-card-head"><h2>'+X(dash.title)+'</h2><div class="p-actions">'+button('افزودن ویجت','add',dash.id)+button('تغییر نام','rename',dash.id)+button('چاپ / PDF','print')+button('حذف داشبورد','delete',dash.id)+'</div></div><div class="kd-grid">'+dash.widgets.map(w=>'<article class="p-card kd-widget '+(w.width==='full'?'kd-full':'')+'" data-kd-widget="'+X(w.id)+'"><header><h3>'+X(w.title||labels[w.type])+'</h3><details><summary>عملیات ویجت</summary><div class="p-actions">'+button('ویرایش','edit',w.id)+button('بالا','up',w.id)+button('پایین','down',w.id)+button('حذف','remove',w.id)+'</div></details></header>'+widget(w,d,rows)+'</article>').join('')+'</div>'+(dash.widgets.length?'':'<p class="p-empty">هنوز ویجتی اضافه نشده است. یک هدف یا نمای ذخیره‌شده انتخاب کنید.</p>'):'<p class="p-empty">برای شروع، یک داشبورد بسازید.</p>')+'</section>';
}
function modal(title,body){const dlg=document.getElementById('platformDialog');dlg.innerHTML='<div class="p-dialog-head"><h2>'+X(title)+'</h2>'+button('بستن','close')+'</div>'+body;dlg.showModal();}
const option=(value,label,current)=>'<option value="'+X(value)+'" '+(value===current?'selected':'')+'>'+X(label)+'</option>';
function editor(dash,w={}){const d=B.snapshot(),rows=M.normalize(d);modal(w.id?'ویرایش ویجت':'افزودن ویجت','<form class="p-dialog-body" data-kd-form="widget" data-dashboard-id="'+X(dash.id)+'" data-widget-id="'+X(w.id||'')+'"><label>نوع ویجت<select name="type">'+Object.entries(labels).map(([v,t])=>option(v,t,w.type||'goal')).join('')+'</select></label><label>عنوان<input name="title" maxlength="120" value="'+X(w.title||'')+'"></label><label data-kd-field="goal">هدف<select name="recordId">'+rows.filter(r=>['objective','kr','kpi','initiative'].includes(r.type)).map(r=>option(r.id,r.title,w.recordId)).join('')+'</select></label><label data-kd-field="list count">نمای ذخیره‌شده<select name="viewId">'+option('','همه اهداف',w.viewId)+(d.views||[]).map(v=>option(v.id,v.name,w.viewId)).join('')+'</select></label><label data-kd-field="text">متن<textarea name="text" maxlength="10000">'+X(w.text||'')+'</textarea></label><label>عرض<select name="width">'+option('half','نصف عرض',w.width||'half')+option('full','تمام عرض',w.width)+'</select></label><p data-kd-error role="alert"></p><button class="p-btn primary" type="submit">ذخیره ویجت</button></form>');fields();}
function fields(){const form=document.querySelector('[data-kd-form="widget"]');if(form)form.querySelectorAll('[data-kd-field]').forEach(el=>el.hidden=!el.dataset.kdField.split(' ').includes(form.elements.type.value));}
document.addEventListener('change',e=>{if(e.target.matches('[data-kd-form] [name=type]'))fields();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-kd-action]');if(!b)return;const action=b.dataset.kdAction,id=b.dataset.kdId,dash=B.dashboards().find(x=>x.id===location.hash.split('/')[2])||B.dashboards()[0];
 try{
  if(action==='close')return document.getElementById('platformDialog').close();
  if(action==='print')return window.print();
  if(action==='update'){const r=M.normalize(B.snapshot()).find(x=>x.id===id);return B.form({objective:'goal',kr:'checkin',kpi:'kpi',initiative:'project'}[r.type],id);}
  if(['create','rename','delete'].includes(action)){modal({create:'داشبورد جدید',rename:'تغییر نام',delete:'حذف داشبورد'}[action],'<form class="p-dialog-body" data-kd-form="'+action+'" data-dashboard-id="'+X(id)+'">'+(action==='delete'?'<p>فقط چیدمان این داشبورد حذف می‌شود؛ اهداف و تاریخچه حفظ می‌شوند.</p>':'<label>عنوان<input name="title" required maxlength="120" value="'+X(action==='rename'?dash.title:'')+'"></label>')+'<p data-kd-error role="alert"></p><button class="p-btn primary" type="submit">تأیید</button></form>');return;}
  if(action==='add')return editor(dash);if(action==='edit')return editor(dash,dash.widgets.find(w=>w.id===id));
  if(action==='remove'){B.dashboard('remove',{dashboardId:dash.id,widgetId:id});B.refresh();return;}
  if(['up','down'].includes(action)){B.dashboard('move',{dashboardId:dash.id,widgetId:id,delta:action==='up'?-1:1});B.refresh();}
 }catch(error){modal('عملیات انجام نشد','<p role="alert">'+X(error.message)+'</p>');}
});
document.addEventListener('submit',e=>{const form=e.target.closest('[data-kd-form]');if(!form)return;e.preventDefault();try{const action=form.dataset.kdForm,result=B.dashboard(action,{...Object.fromEntries(new FormData(form)),dashboardId:form.dataset.dashboardId,widgetId:form.dataset.widgetId});document.getElementById('platformDialog').close();if(action==='create')location.hash='#dashboards/custom/'+result;else if(action==='delete')location.hash='#dashboards/custom';else B.refresh();}catch(err){form.querySelector('[data-kd-error]').textContent=err.message;}});
window.KishDashboardView={render};if(location.hash.startsWith('#dashboards/custom'))B.refresh();
})();
