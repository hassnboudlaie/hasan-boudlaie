/* Explore is a projection over existing records, never a second goal store. */
(()=>{'use strict';
const M=window.KishExploreModel,B=window.KishExploreBridge;
const X=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N=v=>v===null||v===undefined?'—':new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(v);
const types={pillar:'رکن راهبردی',objective:'هدف',kr:'نتیجه کلیدی',kpi:'شاخص عملکرد',initiative:'ابتکار'};
const stages={proposed:'پیشنهادی',draft:'پیش‌نویس',active:'فعال',closed:'مختومه',review:'بازبینی',alignment:'هم‌راستایی',planned:'برنامه‌ریزی',done:'تکمیل',blocked:'متوقف','in-progress':'در حال اجرا','on-track':'در مسیر',on_track:'در مسیر','off-track':'خارج از مسیر',off_track:'خارج از مسیر','needs-attention':'نیازمند توجه',needs_attention:'نیازمند توجه','no-status':'بدون وضعیت',no_status:'بدون وضعیت',healthy:'سالم',unhealthy:'ناسالم',at_risk:'در معرض خطر',archived:'بایگانی‌شده'};
const icons={pillar:'◈',objective:'◎',kr:'↗',kpi:'▥',initiative:'◇'};
const sortLabels={title:'عنوان',progress:'پیشرفت',owner:'مسئول',team:'تیم / واحد',timeframe:'بازه زمانی',lastUpdate:'آخرین به‌روزرسانی',createdAt:'تاریخ ایجاد',startDate:'تاریخ شروع',endDate:'موعد پایان',stage:'وضعیت',type:'نوع هدف'};
const defaults=()=>({q:'',types:[],stages:[],teams:[],owners:[],timeframes:[],alignedTo:[],contributors:[],tags:[],createdAfter:'',startAfter:'',dueBefore:'',progressMin:'',progressMax:'',includeSubteams:false,includeSubgoals:false,archived:false,behind:false,outdated:false});
let f=defaults(),view='cascade',sort='title',sortDirection='asc',advancedOpen=false,collapsed=new Set();
const link=r=>'#'+({objective:'goals',kr:'results',kpi:'kpis',initiative:'projects',pillar:'map'}[r.type])+'/'+encodeURIComponent(r.id);
const options=(rows,selected)=>rows.map(([v,n])=>'<option value="'+X(v)+'" title="'+X(n)+'" '+((Array.isArray(selected)?selected:[]).includes(v)?'selected':'')+'>'+X(n)+'</option>').join('');
const pick=(label,key,opts)=>'<label>'+label+'<select multiple data-kx-filter="'+key+'" aria-label="'+label+'">'+options(opts,f[key])+'</select></label>';
const btn=(label,act,id='')=>'<button type="button" data-kx-action="'+act+'" data-id="'+X(id)+'">'+label+'</button>';
function actions(r){return btn('ویرایش','edit',r.id)+(r.type==='kr'?btn('ثبت پیشرفت','update',r.id):'')+(r.type==='objective'&&!r.archived?btn('＋ نتیجه','kr',r.id):'')+'<details class="kx-more"><summary>بیشتر</summary><div class="kx-actions">'+btn('عنوان در جدول','inline-title',r.id)+btn('مسئول در جدول','inline-owner',r.id)+(r.type==='kpi'?btn('هدف برای بهبود شاخص','improve',r.id):'')+(r.type==='objective'?btn('رونوشت پیش‌نویس','clone',r.id)+btn('یادداشت','comment',r.id)+(r.archived?btn('بازیابی','restore',r.id):r.stage==='closed'?btn('بایگانی','archive',r.id):btn('جمع‌بندی هدف','goal-close',r.id)):'')+'</div></details>';}

function flat(d){
 const rows=M.filter(M.normalize(d),f,{units:d.units}),collator=new Intl.Collator('fa',{numeric:true,sensitivity:'base'});
 const value=r=>{
  if(sort==='progress')return r.progress;
  if(sort==='owner')return d.people.find(p=>[p.id,p.name,p.email].includes(r.owner))?.name||r.owner||'';
  if(sort==='team')return d.units.find(t=>t.id===r.teamId)?.name||(r.teamId==='company'?'شرکت':'');
  if(sort==='timeframe')return d.cycles.find(c=>c.id===r.timeframe)?.name||'';
  if(sort==='lastUpdate')return r.lastUpdate||'';
  if(['createdAt','startDate','endDate'].includes(sort))return r[sort]||'';
  if(sort==='stage')return stages[r.stage]||r.stage||'';
  if(sort==='type')return types[r.type]||r.type||'';
  return r.title;
 };
 return rows.sort((a,b)=>{
  const x=value(a),y=value(b),missing=z=>z===null||z===undefined||z==='';
  if(missing(x)!==missing(y))return missing(x)?1:-1;
  const diff=typeof x==='number'&&typeof y==='number'?x-y:collator.compare(String(x??''),String(y??''));
  return (sortDirection==='desc'?-1:1)*diff||collator.compare(a.title,b.title);
 });
}
function metadata(r,d){const unit=d.units.find(t=>t.id===r.teamId)?.name||'شرکت';const owner=d.people.find(p=>[p.id,p.name,p.email].includes(r.owner))?.name||r.owner||'تعیین نشده';const state=String(r.stage||'no-status');const label=stages[state]||state;const category=/^(on-track|on_track|healthy|done)$/.test(state)?'good':/^(off-track|off_track|unhealthy|blocked)$/.test(state)?'bad':/^(needs-attention|needs_attention|at_risk)$/.test(state)?'attention':'neutral';return '<span>'+X(owner)+'</span><span>'+X(unit)+'</span><span class="kx-status kx-status-'+category+'" aria-label="وضعیت: '+X(label)+'">'+X(label)+'</span>';}

const columnLabels={
 goal:'هدف و هم‌راستایی',meta:'مسئول / واحد / وضعیت',progress:'پیشرفت / انتظار',actions:'عملیات',
 lead:'مسئول',team:'تیم',timeframe:'بازه زمانی',stage:'مرحله',expected:'پیشرفت مورد انتظار',
 lastUpdate:'آخرین ثبت',outdated:'به‌روزرسانی عقب‌افتاده',closingNotes:'یادداشت اختتام',
 tags:'برچسب‌ها',type:'نوع هدف',customFields:'فیلدهای سفارشی'
};
const defaultColumns=['goal','meta','progress','actions'];
const columnKey='kish_explore_columns_v3:'+location.pathname+':'+new URLSearchParams(location.search).get('qa');
function loadColumns(){
 try{const raw=JSON.parse(localStorage.getItem(columnKey)||'null');
  if(!raw||!Array.isArray(raw.order))return {order:[...defaultColumns],widths:{}};
  const order=[...new Set(raw.order)].filter(k=>columnLabels[k]);
  if(!order.includes('goal'))order.unshift('goal');
  if(!order.includes('actions'))order.push('actions');
  return {order,widths:raw.widths||{}};
 }catch(_){return {order:[...defaultColumns],widths:{}}}
}
let columns=loadColumns(),columnPanelOpen=false,dragColumn='';
const boardPrefsKey='kish_explore_board_prefs_v3:'+location.pathname+':'+new URLSearchParams(location.search).get('qa');
function readBoardPrefs(){try{const s=JSON.parse(localStorage.getItem(boardPrefsKey)||'null')||{};return {period:['weekly','monthly','quarterly'].includes(s.period)?s.period:'weekly',count:[6,12,26].includes(Number(s.count))?Number(s.count):6,scope:['all','kpi','okr'].includes(s.scope)?s.scope:'all',asOf:/^\\d{4}-\\d{2}-\\d{2}$/.test(s.asOf||'')?s.asOf:''}}catch(_){return {period:'weekly',count:6,scope:'all',asOf:''};}}
let boardPrefs=readBoardPrefs();
function setBoardPrefs(next){boardPrefs={...boardPrefs,...next};try{localStorage.setItem(boardPrefsKey,JSON.stringify(boardPrefs));}catch(_){}}

function saveColumns(){try{localStorage.setItem(columnKey,JSON.stringify(columns));}catch(_){}}
function changeColumns(name,operation){
 if(operation==='reset'){columns={order:[...defaultColumns],widths:{}};saveColumns();return}
 if(!columnLabels[name])return;
 const order=columns.order;
 const at=order.indexOf(name);
 if(operation==='toggle'){
  if(['goal','actions'].includes(name))return;
  if(at>=0)order.splice(at,1);else order.splice(order.indexOf('actions'),0,name);
 }
 if(operation==='up'&&at>0&&name!=='goal'&&order[at-1]!=='goal') [order[at-1],order[at]]=[order[at],order[at-1]];
 if(operation==='down'&&at>=0&&at<order.length-1&&name!=='actions'&&order[at+1]!=='actions') [order[at],order[at+1]]=[order[at+1],order[at]];
 saveColumns();
}
function columnOptions(){
 return '<section class="kx-column-panel" aria-label="تنظیم ستون‌های Cascade">'+
 '<div class="kx-col-options">'+Object.entries(columnLabels).map(([key,label])=>
  '<div class="kx-col-option"><label><input type="checkbox" data-kx-column="'+key+'" '+(columns.order.includes(key)?'checked':'')+
  (['goal','actions'].includes(key)?' disabled':'')+'> '+label+'</label>'+
  (columns.order.includes(key)?'<div class="kx-col-tools">'+
   '<button type="button" data-kx-action="col-up" data-id="'+key+'" aria-label="انتقال '+label+' به راست">↑</button>'+
   '<button type="button" data-kx-action="col-down" data-id="'+key+'" aria-label="انتقال '+label+' به چپ">↓</button>'+
   '<label class="kx-col-width-label">عرض <input type="range" min="100" max="480" step="20" data-kx-width="'+key+'" value="'+(columns.widths[key]||(['goal'].includes(key)?320:180))+'"></label>'+
  '</div>':'')+'</div>').join('')+
 '</div><p class="kx-help">ستون‌ها را فعال یا غیرفعال کنید؛ با کلیدهای جابه‌جایی یا کشیدن عنوان ستون ترتیب را تغییر دهید. عرض ستون قابل تنظیم است. این تنظیمات فقط در همین مرورگر ذخیره می‌شوند.</p>'+
 '<button type="button" data-kx-action="col-reset">بازنشانی ستون‌ها</button></section>';
}
function columnValue(key,r,d,ids,children){
 const team=d.units.find(t=>t.id===r.teamId)?.name||'شرکت';
 const lead=d.people.find(p=>[p.id,p.name,p.email].includes(r.owner))?.name||r.owner||'تعیین نشده';
 if(key==='goal')return '<div class="kx-title" style="padding-inline-start:'+r.depth*18+'px">'+
 (children?'<button data-kx-action="fold" data-id="'+X(r.id)+'" aria-label="باز و بسته کردن زیرهدف‌ها" aria-expanded="'+!collapsed.has(r.id)+'">'+(collapsed.has(r.id)?'＋':'−')+'</button>':'')+
 '<span class="kx-icon '+r.type+'" title="'+types[r.type]+'">'+icons[r.type]+'</span><a href="'+link(r)+'">'+X(r.title)+'</a></div>'+
 '<small>'+types[r.type]+(r.parentId&&!ids.has(r.parentId)?' · بالادست خارج از فیلتر':'')+'</small>';
 if(key==='meta')return '<div class="kx-meta">'+metadata(r,d)+'</div>';
 if(key==='progress')return N(r.progress)+(r.progress===null?'':'٪')+'<small>انتظار: '+N(r.expected)+(r.expected===null?'':'٪')+'</small>'+(r.behind?'<small class="kx-warning">عقب‌تر از انتظار</small>':'')+(r.outdated?'<small class="kx-warning">به‌روزرسانی عقب‌افتاده</small>':'');
 if(key==='actions')return '<div class="kx-actions">'+actions(r)+'</div>';
 if(key==='lead')return X(lead);
 if(key==='team')return X(team);
 if(key==='timeframe')return X(d.cycles.find(c=>c.id===r.timeframe)?.name||'—');
 if(key==='stage')return X(stages[r.stage]||r.stage||'—');
 if(key==='expected')return N(r.expected)+(r.expected===null?'':'٪');
 if(key==='lastUpdate')return X(r.lastUpdate?String(r.lastUpdate).slice(0,10):'—');
 if(key==='outdated')return r.outdated?'بله':'خیر';
 if(key==='closingNotes'){const c=r.record.closingNotes||{};return X([c.wins,c.learnings,c.nextSteps].filter(Boolean).join(' · ')||'—')}
 if(key==='tags')return X((r.tags||[]).join('، ')||'—');
 if(key==='type')return X(types[r.type]||'—');
 if(key==='customFields'){const cf=r.record.customFields||{};return X(Object.entries(cf).map(([k,v])=>k+': '+(typeof v==='object'?JSON.stringify(v):v)).join(' · ')||'—')}
 return '—';
}
function cascade(rows,d){
 const ids=new Set(rows.map(r=>r.id));let blockedDepth=null;
 const header=columns.order.map(k=>'<th scope="col" draggable="true" data-kx-col="'+k+'" style="min-width:'+Number(columns.widths[k]||(['goal'].includes(k)?300:145))+'px"><span class="kx-col-title">'+X(columnLabels[k])+'</span></th>').join('');
 const records=M.tree(rows).map(r=>{
  if(blockedDepth!==null&&r.depth>blockedDepth)return '';
  blockedDepth=null;
  const children=rows.some(x=>x.parentId===r.id);
  if(collapsed.has(r.id))blockedDepth=r.depth;
  return '<tr data-kx-record="'+X(r.id)+'">'+columns.order.map(k=>
   '<td data-kx-cell="'+k+'" style="min-width:'+Number(columns.widths[k]||(['goal'].includes(k)?300:145))+'px">'+columnValue(k,r,d,ids,children)+'</td>').join('')+'</tr>';
 }).join('');
 return '<div class="kx-column-toolbar"><button type="button" data-kx-action="col-toggle" aria-expanded="'+columnPanelOpen+'">⚙ ستون‌ها</button><span>نمایش '+N(columns.order.length)+' ستون</span></div>'+
 (columnPanelOpen?columnOptions():'')+
 '<div class="kx-scroll"><table class="kx-table kx-cascade"><thead><tr>'+header+'</tr></thead><tbody>'+records+'</tbody></table></div>';
}
function goalTree(rows,d){let hiddenDepth=null;const ordered=M.tree(rows).filter(r=>{if(hiddenDepth!==null&&r.depth>hiddenDepth)return false;hiddenDepth=collapsed.has(r.id)?r.depth:null;return true;}),ids=new Set(rows.map(r=>r.id));return '<div class="kx-map" role="list" aria-label="نقشه هم‌راستایی">'+ordered.map(r=>'<article role="listitem" class="kx-node '+r.type+'" style="--depth:'+Math.min(r.depth,6)+'" data-kx-record="'+X(r.id)+'"><div class="kx-node-top"><span class="kx-icon '+r.type+'">'+icons[r.type]+'</span><small>'+types[r.type]+'</small><b>'+N(r.progress)+(r.progress===null?'':'٪')+'</b></div><a class="kx-node-title" href="'+link(r)+'">'+X(r.title)+'</a><p class="kx-parent">'+(r.parentId?'↳ '+X(rows.find(p=>p.id===r.parentId)?.title||'بالادست خارج از فیلتر'):'سطح بالای نقشه')+'</p><div class="kx-meta">'+metadata(r,d)+'</div><div class="kx-actions">'+actions(r)+'</div></article>').join('')+'</div>';}
function map(rows,d){
 const route=location.hash.split('/'),mode=route[2]||'goal',strategy=mode==='strategy',kpiTree=mode==='kpi';
 const chooser='<nav class="kc-tabs" aria-label="نماهای پیش‌فرض Map">'+
 '<a href="#explore/map" '+(!strategy&&!kpiTree?'aria-current="page"':'')+'>درخت همه اهداف</a>'+
 '<a href="#explore/map/strategy" '+(strategy?'aria-current="page"':'')+'>چیدمان راهبرد، سال و فصل</a>'+
 '<a href="#explore/map/kpi" '+(kpiTree?'aria-current="page"':'')+'>درخت KPI</a></nav>';
 if(kpiTree){
  const eligible=rows.filter(r=>r.type==='kpi'),all=M.normalize(d),byId=new Map(all.map(r=>[r.id,r])),included=new Map();
  for(const row of eligible){
   let cur=row,seen=new Set();
   while(cur&&!seen.has(cur.id)){
    included.set(cur.id,cur);seen.add(cur.id);
    cur=byId.get(cur.parentId);
   }
  }
  return chooser+'<p class="kx-help">درخت KPI، شاخص‌های مطابق فیلتر را همراه با زنجیره هم‌راستایی بالادست نشان می‌دهد. فقط رابطه‌هایی که در داده‌های موجود ثبت شده‌اند نمایش داده می‌شوند.</p>'+
   (included.size?goalTree([...included.values()],d):'<p class="kx-empty">شاخص عملکردی مطابق فیلترها وجود ندارد.</p>');
 }
 if(!strategy)return chooser+goalTree(rows,d);
 const ids=new Set(rows.map(r=>r.id));
 const data={...d,alignmentGoals:d.goals,goals:d.goals.filter(g=>ids.has(g.id)),kpis:d.kpis.filter(k=>ids.has(k.id)),initiatives:d.initiatives.filter(i=>ids.has(i.id))};
 return chooser+'<p class="kx-help">چیدمان راهبرد، سال و فصل از همان داده‌های کاوش استفاده می‌کند. نتایج کلیدی و ابتکارات در درخت اهداف قابل مشاهده‌اند.</p>'+
 window.KishMapView.render(data,route[3]?decodeURIComponent(route[3]):'');
}
function board(rows,d){
 const selected=boardPrefs.scope==='kpi'?rows.filter(r=>r.type==='kpi'):boardPrefs.scope==='okr'?rows.filter(r=>['objective','kr'].includes(r.type)):rows;
 const dates=M.boardPeriods(boardPrefs.period,boardPrefs.count,boardPrefs.asOf||new Date());
 const controls='<div class="kx-board-options" aria-label="تنظیم Board">'+
  '<label>نوع هدف <select data-kx-board-option="scope">'+
  [['all','همه اهداف'],['kpi','KPI Board'],['okr','OKR Board']].map(([value,label])=>'<option value="'+value+'" '+(boardPrefs.scope===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
  '<label>تناوب <select data-kx-board-option="period">'+
  [['weekly','هفتگی'],['monthly','ماهانه شمسی'],['quarterly','فصلی شمسی']].map(([value,label])=>'<option value="'+value+'" '+(boardPrefs.period===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
  '<label>تعداد دوره <select data-kx-board-option="count">'+
  [6,12,26].map(value=>'<option value="'+value+'" '+(boardPrefs.count===value?'selected':'')+'>'+N(value)+'</option>').join('')+'</select></label>'+
  '<label>تا تاریخ <input type="date" data-kx-board-option="asOf" value="'+X(boardPrefs.asOf)+'"></label>'+
  '<button type="button" data-kx-action="board-current">امروز</button>'+
 '</div>';
 const body=selected.map(r=>'<tr data-kx-record="'+X(r.id)+'"><td><span class="kx-icon '+r.type+'" title="'+types[r.type]+'">'+icons[r.type]+'</span><a href="'+link(r)+'" title="'+X(r.title)+'">'+X(r.title)+'</a><small>'+types[r.type]+' · '+X(r.record.unit||'')+'</small></td>'+
 dates.map(p=>{const v=M.historicalValue(r,d,p.end),editable=['kr','kpi'].includes(r.type);
 const label=r.type==='kpi'?'ویرایش شاخص':'ثبت پیشرفت';
 return '<td class="kx-board-measure" data-kx-period="'+X(p.key)+'">'+
 (editable?'<button type="button" data-kx-action="board-cell" data-id="'+X(r.id)+'" data-kx-board-cell="'+X(r.id)+'" aria-label="'+label+' '+X(r.title)+' · '+X(p.label)+'" title="'+label+' · '+X(p.label)+'">'+N(v)+'</button>':N(v)+(v!==null&&r.type==='objective'?'٪':''))+
 '</td>';}).join('')+'<td><div class="kx-actions">'+actions(r)+'</div></td></tr>').join('');
 return controls+'<p class="kx-help">Board از تاریخچه ثبت‌شده محاسبه می‌شود. خط تیره به معنی فقدان اندازه‌گیری در آن دوره است. انتخاب سلول نتیجه کلیدی فرم ثبت پیشرفت و انتخاب سلول KPI فرم ویرایش شاخص را باز می‌کند؛ برای داده‌های گذشته مقدار امروز بازنویسی نمی‌شود.</p>'+
 '<div class="kx-scroll"><table class="kx-table kx-board"><thead><tr><th>هدف / شاخص</th>'+dates.map(p=>'<th title="'+X(p.end)+'">'+X(p.label)+'</th>').join('')+'<th>ثبت / ویرایش</th></tr></thead><tbody>'+body+'</tbody></table></div>';
}
function advancedFilters(allRows){
 const unique=key=>[...new Set(allRows.flatMap(r=>r[key]||[]))].sort((a,b)=>a.localeCompare(b,'fa')).map(v=>[v,v]);
 const aligned=allRows.map(r=>[r.id,r.title+' · '+types[r.type]]);
 const date=(key,label)=>'<label>'+label+'<input type="date" data-kx-date="'+key+'" value="'+X(f[key]||'')+'"></label>';
 const number=(key,label)=>'<label>'+label+'<input type="number" min="0" max="100" step="1" data-kx-number="'+key+'" value="'+X(f[key]??'')+'"></label>';
 return '<details class="kx-advanced-filters" '+(advancedOpen?'open':'')+'><summary>فیلترهای پیشرفته Perdoo 3.0</summary><div class="kx-filter-grid">'+
 pick('هم‌راستا با هدف','alignedTo',aligned)+pick('همکاران هدف','contributors',unique('contributors'))+
 pick('برچسب‌ها','tags',unique('tags'))+
 date('createdAfter','ایجاد از تاریخ')+date('startAfter','شروع از تاریخ')+date('dueBefore','پایان تا تاریخ')+
 number('progressMin','پیشرفت از ٪')+number('progressMax','پیشرفت تا ٪')+
 '</div><div class="kx-actions kx-filter-options">'+
 '<label><input type="checkbox" data-kx-flag="includeSubteams" '+(f.includeSubteams?'checked':'')+'> شامل زیرتیم‌ها</label>'+
 '<label><input type="checkbox" data-kx-flag="includeSubgoals" '+(f.includeSubgoals?'checked':'')+'> شامل اهداف زیرمجموعه</label>'+
 '</div><p class="kx-help">فیلترهای تاریخ بر مبنای تاریخ ذخیره‌شده در هدف یا دوره‌اند؛ رکورد فاقد تاریخ هنگام اعمال فیلتر زمانی نمایش داده نمی‌شود. محدوده پیشرفت فقط مقادیر قابل محاسبه را نشان می‌دهد.</p></details>';
}
function render(d){const tab=location.hash.split('/')[1];if(['cascade','map','board'].includes(tab))view=tab;const allRows=M.normalize(d),rows=flat(d),owners=[...new Set(allRows.map(r=>r.owner).filter(Boolean))],unknownStages=[...new Set(allRows.map(r=>r.stage).filter(s=>s&&!Object.prototype.hasOwnProperty.call(stages,s)))],stageOpts=[...Object.entries(stages),...unknownStages.map(s=>[s,s])];return '<section class="kx-app" dir="rtl"><header class="kx-header"><div><small>شرکت توسعه و مدیریت بنادر و فرودگاه‌های کیش</small><h1>کاوش یکپارچه اهداف</h1><p>از راهبرد تا نتیجه؛ سه نما، یک مجموعه داده <span class="kx-local-note" role="note">نسخه نمایشی · داده‌های همین مرورگر</span></p></div><div class="kx-actions">'+btn('＋ هدف','new-objective')+btn('＋ شاخص','new-kpi')+btn('＋ رکن','new-pillar')+btn('خروجی CSV','csv')+btn('گزارش / چاپ PDF','report')+btn('پشتیبان JSON','backup-current')+'</div></header><div class="kx-toolbar"><nav role="tablist" aria-label="نمای کاوش">'+[['cascade','≡ آبشاری'],['map','◈ نقشه'],['board','▥ روند زمانی']].map(([v,label])=>'<button type="button" role="tab" id="kx-tab-'+v+'" aria-controls="kx-panel" aria-selected="'+(view===v)+'" tabindex="'+(view===v?'0':'-1')+'" data-kx-view="'+v+'" aria-pressed="'+(view===v)+'">'+label+'</button>').join('')+'</nav><strong>'+N(rows.length)+' رکورد</strong>'+btn('بازکردن همه','expand-all')+btn('بستن همه','collapse-all')+'<label>مرتب‌سازی <select data-kx-sort><option value="title" '+(sort==='title'?'selected':'')+'>عنوان</option><option value="progress" '+(sort==='progress'?'selected':'')+'>پیشرفت</option><option value="owner" '+(sort==='owner'?'selected':'')+'>مسئول</option><option value="team" '+(sort==='team'?'selected':'')+'>تیم / واحد</option><option value="timeframe" '+(sort==='timeframe'?'selected':'')+'>بازه زمانی</option><option value="lastUpdate" '+(sort==='lastUpdate'?'selected':'')+'>آخرین به‌روزرسانی</option><option value="createdAt" '+(sort==='createdAt'?'selected':'')+'>تاریخ ایجاد</option><option value="startDate" '+(sort==='startDate'?'selected':'')+'>تاریخ شروع</option><option value="endDate" '+(sort==='endDate'?'selected':'')+'>موعد پایان</option><option value="stage" '+(sort==='stage'?'selected':'')+'>وضعیت</option><option value="type" '+(sort==='type'?'selected':'')+'>نوع هدف</option></select></label><label>جهت مرتب‌سازی <select data-kx-sort-direction><option value="asc" '+(sortDirection==='asc'?'selected':'')+'>صعودی</option><option value="desc" '+(sortDirection==='desc'?'selected':'')+'>نزولی</option></select></label></div><details class="kx-filters" '+(Object.values(f).some(x=>Array.isArray(x)?x.length:x)?'open':'')+'><summary>فیلترهای مشترک و نماهای ذخیره‌شده</summary><form data-kx-search><label>جست‌وجو<input name="q" value="'+X(f.q)+'" placeholder="عنوان یا مسئول"></label><button type="submit">جست‌وجو</button></form><div class="kx-presets" aria-label="نماهای پیش‌فرض"><span>نماهای پیش‌فرض:</span>'+btn('اهداف فعال','preset-active')+btn('عقب‌تر از انتظار','preset-off-track')+btn('نزدیک به تکمیل','preset-near-complete')+'</div><div class="kx-filter-grid">'+pick('نوع','types',Object.entries(types))+pick('وضعیت','stages',stageOpts)+pick('واحد','teams',[['company','شرکت'],...d.units.map(t=>[t.id,t.name])])+pick('مسئول','owners',owners.map(o=>[o,d.people.find(p=>p.id===o)?.name||o]))+pick('بازه زمانی','timeframes',(d.cycles||[]).map(c=>[c.id,c.name]))+'</div>'+advancedFilters(allRows)+'<div class="kx-actions">'+btn('پاک کردن فیلترها','reset')+'<label><input type="checkbox" data-kx-flag="behind" '+(f.behind?'checked':'')+'> عقب‌تر از انتظار</label><label><input type="checkbox" data-kx-flag="outdated" '+(f.outdated?'checked':'')+'> به‌روزرسانی عقب‌افتاده</label>'+'<label class="kx-archive-toggle"><input type="checkbox" data-kx-archived '+(f.archived?'checked':'')+'> فقط بایگانی‌شده‌ها</label>'+btn('ذخیره نمای این مرورگر','save-view')+'<label>نمای ذخیره‌شده <select data-kx-saved><option value="">انتخاب کنید</option>'+options((d.views||[]).map(v=>[v.id,v.name]),[])+'</select></label>'+btn('خروجی پشتیبان قبل از ارتقا','backup-old')+'</div></details><div class="kx-body" id="kx-panel" role="tabpanel" aria-labelledby="kx-tab-'+view+'" tabindex="0">'+(rows.length?({cascade,map,board}[view])(rows,d):'<p class="kx-empty">رکوردی مطابق فیلترها پیدا نشد. فیلترها را پاک کنید یا هدف جدید بسازید.</p>')+'</div><p class="kx-help">انتظار، برآورد خطی از شروع تا پایان دوره است؛ وضعیت رسمی هدف را تغییر نمی‌دهد. هفته از شنبه شروع می‌شود. پیش‌فرض پایش به‌روزرسانی ۷ روز است. نسخه عمومی: اطلاعات در همین مرورگر ذخیره می‌شوند. نمای ذخیره‌شده، خصوصیِ این دستگاه است؛ همگام‌سازی سازمانی و دسترسی سروری در این بخش تأیید نشده‌اند.</p></section>';}
function report(d){const rows=flat(d),goals=rows.filter(r=>r.type==='objective'),known=goals.filter(r=>r.progress!==null);const body='<section class="kx-report" dir="rtl"><h1>گزارش پایش اجرای راهبرد کیش</h1><p>'+new Intl.DateTimeFormat('fa-IR',{dateStyle:'full'}).format(new Date())+'</p><p>منبع: داده‌های همین مرورگر، مطابق فیلتر جاری؛ صحت عملکرد عملیاتی نیازمند تأیید مسئول داده است.</p><p>اهداف: '+N(goals.length)+' · قابل محاسبه: '+N(known.length)+' · میانگین اهداف سنجیده: '+N(known.length?known.reduce((a,r)=>a+r.progress,0)/known.length:null)+'٪ · عقب‌تر از انتظار: '+N(goals.filter(r=>r.behind).length)+'</p><table><thead><tr><th>عنوان</th><th>مسئول</th><th>وضعیت</th><th>واقعی</th><th>انتظار</th><th>آموخته‌ها / اقدام بعد</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+X(r.title)+'</td><td>'+X(r.owner)+'</td><td>'+X(stages[r.stage]||r.stage)+'</td><td>'+N(r.progress)+'</td><td>'+N(r.expected)+'</td><td>'+X([r.record.closingNotes?.learnings,r.record.closingNotes?.nextSteps].filter(Boolean).join(' / '))+'</td></tr>').join('')+'</tbody></table><p>انتظار خطی است؛ داده اندازه‌گیری‌نشده با خط تیره مشخص شده است.</p></section>';modal('گزارش مدیریت','<div class="p-dialog-body">'+btn('چاپ / ذخیره PDF','print-report')+body+'</div>');}
 document.addEventListener('click',e=>{if(e.target.closest('[data-kx-action="print-report"]'))window.print();});
function modal(title,content){const dlg=document.getElementById('platformDialog');dlg.innerHTML='<div class="p-dialog-head"><h2>'+X(title)+'</h2>'+btn('×','close')+'</div>'+content;dlg.showModal();}
function pillarForm(r){const d=B.snapshot();modal(r?'ویرایش رکن راهبردی':'رکن راهبردی جدید','<form class="p-dialog-body" data-kx-pillar="'+X(r?.id||'')+'"><div class="p-fields"><label>عنوان رکن<input name="title" required maxlength="500" value="'+X(r?.title||'')+'"></label><label>رکن بالادست<select name="parentId">'+options([['','بدون بالادست'],...d.strategy.pillars.filter(p=>p.id!==r?.id).map(p=>[p.id,p.title])],[r?.parentId||''])+'</select></label><label>توضیحات<textarea name="description">'+X(r?.description||'')+'</textarea></label></div><p data-kx-error role="alert"></p><button type="submit" class="p-btn primary">ذخیره رکن</button></form>');}
document.addEventListener('click',e=>{const v=e.target.closest('[data-kx-view]');if(v){view=v.dataset.kxView;history.pushState(null,'','#explore/'+view);B.refresh();return;}const b=e.target.closest('[data-kx-action]');if(!b)return;const act=b.dataset.kxAction,id=b.dataset.id;try{const d=B.snapshot(),r=M.normalize(d).find(r=>r.id===id);if(act==='close'){document.getElementById('platformDialog').close();return;}if(act==='expand-all'){collapsed.clear();if(location.hash.startsWith('#explore/map/strategy'))window.KishMapView.setExpanded(d,true);B.refresh();}if(act==='collapse-all'){if(location.hash.startsWith('#explore/map/strategy'))window.KishMapView.setExpanded(d,false);collapsed=new Set(M.normalize(d).filter(r=>r.parentId).map(r=>r.parentId));B.refresh();}
 if(act==='report'){report(d);return;}
 if(act==='improve'&&r){B.form('goal','',{improvesKpiId:r.id});const title=document.getElementById('pf-objective');if(title)title.value='بهبود '+r.title;const parent=document.getElementById('pf-parentId');if(parent&&r.parentId)parent.value=r.parentId;return;}
 if(act.startsWith('inline-')&&r){const field=act.slice(7),host=b.closest('[data-kx-record]');if(!host)return;const cell=host.tagName==='TR'?host.querySelector('td'):host;cell.querySelector('[data-kx-inline]')?.remove();cell.insertAdjacentHTML('beforeend','<form data-kx-inline="'+X(id)+'" data-field="'+X(field)+'"><label>'+ (field==='title'?'عنوان':'مسئول')+'<input name="value" required maxlength="500" value="'+X(r[field]||'')+'"></label><button>ثبت</button><button type="button" data-kx-action="cancel-inline">انصراف</button><span role="alert" data-kx-error></span></form>');cell.querySelector('[data-kx-inline] input').focus();return;}
 if(act==='cancel-inline'){b.closest('form').remove();return;}
 if(['clone','restore','archive','goal-close','comment'].includes(act)&&r){const names={clone:'رونوشت پیش‌نویس',restore:'بازیابی هدف',archive:'بایگانی هدف','goal-close':'جمع‌بندی هدف',comment:'یادداشت هدف'};let fields=act==='goal-close'?['wins','learnings','nextSteps'].map((k,i)=>'<label>'+['دستاوردها','آموخته‌ها','اقدام بعد'][i]+'<textarea name="'+k+'" required></textarea></label>').join(''):act==='comment'?'<label>یادداشت<textarea name="text" maxlength="5000" required></textarea></label>':'<p>'+ (act==='clone'?'رونوشت با شناسه‌های جدید و مقادیر اندازه‌گیری خالی ایجاد می‌شود. اصل هدف و سوابق آن حفظ می‌شوند.':act==='archive'?'هدف و نتایج آن از نمای جاری کاوش پنهان می‌شوند. داده و سوابق حفظ می‌شوند.':'هدف دوباره در کاوش نمایش داده می‌شود؛ وضعیت مختومه تغییر نمی‌کند.')+'</p>';modal(names[act],'<form class="p-dialog-body" data-kx-lifecycle="'+act+'" data-id="'+X(id)+'"><h3>'+X(r.title)+'</h3>'+fields+'<p data-kx-error role="alert"></p><button type="submit">تأیید و ذخیره</button></form>');return;}
 if(['preset-active','preset-off-track','preset-near-complete'].includes(act)){f=defaults();if(act==='preset-active')f.stages=['active'];if(act==='preset-off-track')f.behind=true;if(act==='preset-near-complete'){f.progressMin='80';f.progressMax='99';}view='cascade';history.replaceState(null,'','#explore/cascade');B.refresh();return;}
 if(act==='board-current'){setBoardPrefs({asOf:''});B.refresh();return;}
 if(act==='board-cell'&&r){if(r.type==='kr')B.form('checkin',id);else if(r.type==='kpi')B.form('kpi',id);return;}
 if(act==='col-toggle'){columnPanelOpen=!columnPanelOpen;B.refresh();return;}
 if(act==='col-reset'){changeColumns('','reset');B.refresh();return;}
 if(['col-up','col-down'].includes(act)){changeColumns(id,act==='col-up'?'up':'down');B.refresh();return;}
 if(act==='fold'){collapsed.has(id)?collapsed.delete(id):collapsed.add(id);B.refresh();}if(act==='reset'){f=defaults();advancedOpen=false;B.refresh();}if(act==='edit'&&r){if(r.type==='pillar')pillarForm(r.record);else B.form({objective:'goal',kr:'kr',kpi:'kpi',initiative:'project'}[r.type],id);}if(act==='update')B.form('checkin',id);if(act==='kr')B.form('kr','',{objectiveId:id});if(act==='new-objective')B.form('goal');if(act==='new-kpi')B.form('kpi');if(act==='new-pillar')pillarForm();if(act==='backup-current')B.exportData();if(act==='backup-old')B.backup();if(act==='csv')B.exportCsv([['ID','Type','Title','Parent','Owner','Team','Stage','Progress'],...flat(d).map(r=>[r.id,r.type,r.title,r.parentId,r.owner,r.teamId,r.stage,r.progress??''])],'Kish-Explore.csv');if(act==='save-view')modal('ذخیره نمای این مرورگر','<form class="p-dialog-body" data-kx-save><label>نام نما<input name="name" required maxlength="100"></label><p data-kx-error role="alert"></p><button type="submit" class="p-btn primary">ذخیره نما</button></form>');}catch(error){modal('ذخیره یا عملیات انجام نشد','<p class="p-dialog-body" role="alert">'+X(error.message)+'</p>');}});
document.addEventListener('input',e=>{
 const control=e.target.closest('[data-kx-width]');if(!control)return;
 const key=control.dataset.kxWidth;if(!columnLabels[key])return;
 const px=Math.min(480,Math.max(100,Number(control.value)||170));
 columns.widths[key]=px;saveColumns();
 document.querySelectorAll('.kx-cascade [data-kx-col="'+key+'"],.kx-cascade [data-kx-cell="'+key+'"]').forEach(node=>{node.style.minWidth=px+'px';});
});
document.addEventListener('change',e=>{if(e.target.matches('[data-kx-board-option]')){const key=e.target.dataset.kxBoardOption;const val=e.target.value;if(['period','count','scope','asOf'].includes(key)){setBoardPrefs({[key]:key==='count'?Number(val):val});B.refresh();}return;}if(e.target.matches('[data-kx-column]')){changeColumns(e.target.dataset.kxColumn,'toggle');B.refresh();return;}
 if(e.target.matches('[data-kx-width]')){const key=e.target.dataset.kxWidth;if(columnLabels[key]){columns.widths[key]=Math.min(480,Math.max(100,Number(e.target.value)||170));saveColumns();B.refresh();}return;}
 if(e.target.matches('[data-kx-flag]')){f[e.target.dataset.kxFlag]=e.target.checked;B.refresh();}if(e.target.matches('[data-kx-archived]')){f.archived=e.target.checked;B.refresh();}if(e.target.matches('[data-kx-filter]')){f[e.target.dataset.kxFilter]=[...e.target.selectedOptions].map(o=>o.value);B.refresh();}if(e.target.matches('[data-kx-date]')){f[e.target.dataset.kxDate]=e.target.value;B.refresh();}if(e.target.matches('[data-kx-number]')){f[e.target.dataset.kxNumber]=e.target.value;B.refresh();}if(e.target.matches('[data-kx-sort]')){sort=e.target.value;sortDirection=['progress','lastUpdate','createdAt','endDate'].includes(sort)?'desc':'asc';B.refresh();}if(e.target.matches('[data-kx-sort-direction]')){sortDirection=e.target.value==='desc'?'desc':'asc';B.refresh();}if(e.target.matches('[data-kx-saved]')){const saved=B.snapshot().views.find(v=>v.id===e.target.value);if(saved){if(saved.board)setBoardPrefs(saved.board);f={...defaults(),...JSON.parse(JSON.stringify(saved.filters||{}))};advancedOpen=!!(f.tags?.length||f.contributors?.length||f.alignedTo?.length||f.createdAfter||f.startAfter||f.dueBefore||f.progressMin!==''||f.progressMax!=='');view=saved.view;sort=String(saved.sort||'title').split(':')[0];sortDirection=String(saved.sort||'').split(':')[1]||(['progress','lastUpdate','createdAt','endDate'].includes(sort)?'desc':'asc');if(!Object.prototype.hasOwnProperty.call(sortLabels,sort))sort='title';history.replaceState(null,'','#explore/'+view);B.refresh();}}});
document.addEventListener('submit',e=>{const form=e.target;
 if(form.matches('[data-kx-inline],[data-kx-lifecycle]')){e.preventDefault();try{const v=Object.fromEntries(new FormData(form));if(form.matches('[data-kx-inline]'))B.inline(form.dataset.kxInline,form.dataset.field,v.value);else{B.lifecycle(form.dataset.id,form.dataset.kxLifecycle==='goal-close'?'close':form.dataset.kxLifecycle,v);document.getElementById('platformDialog').close();}B.refresh();}catch(error){form.querySelector('[data-kx-error]').textContent=error.message;}return;}
 if(form.matches('[data-kx-search]')){e.preventDefault();f.q=String(new FormData(form).get('q')||'').trim();B.refresh();}if(!form.matches('[data-kx-pillar],[data-kx-save]'))return;e.preventDefault();try{const values=Object.fromEntries(new FormData(form));if(form.matches('[data-kx-pillar]'))B.pillar(values,form.dataset.kxPillar);else B.saveView({name:values.name.trim(),filters:JSON.parse(JSON.stringify(f)),view,sort:sort+':'+sortDirection,board:{...boardPrefs}});document.getElementById('platformDialog').close();B.refresh();}catch(error){form.querySelector('[data-kx-error]').textContent=error.message;}});
document.addEventListener('click',e=>{const summary=e.target.closest('.kx-advanced-filters>summary');if(summary)advancedOpen=!summary.parentElement.open;});
document.addEventListener('keydown',e=>{const t=e.target.closest('[data-kx-view]');if(!t||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=['cascade','map','board'];let next=t.dataset.kxView;if(e.key==='Home')next=tabs[0];else if(e.key==='End')next=tabs[tabs.length-1];else next=tabs[(tabs.indexOf(next)+(e.key==='ArrowLeft'?1:-1)+tabs.length)%tabs.length];view=next;history.replaceState(null,'','#explore/'+view);B.refresh();requestAnimationFrame(()=>document.getElementById('kx-tab-'+next)?.focus());});
document.addEventListener('dragstart',e=>{const th=e.target.closest('th[data-kx-col]');if(!th)return;dragColumn=th.dataset.kxCol;e.dataTransfer?.setData('text/plain',dragColumn);if(e.dataTransfer)e.dataTransfer.effectAllowed='move';});
document.addEventListener('dragover',e=>{if(dragColumn&&e.target.closest('th[data-kx-col]'))e.preventDefault();});
document.addEventListener('drop',e=>{const target=e.target.closest('th[data-kx-col]');if(!target||!dragColumn)return;e.preventDefault();const from=columns.order.indexOf(dragColumn),to=columns.order.indexOf(target.dataset.kxCol);if(from>=0&&to>=0&&from!==to){const [item]=columns.order.splice(from,1);columns.order.splice(to,0,item);saveColumns();B.refresh();}dragColumn='';});
document.addEventListener('dragend',()=>{dragColumn='';});
window.KishExploreView={render};if(location.hash.startsWith('#explore'))B.refresh();
})();
