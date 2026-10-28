/* Shared, pure read model. Original records remain authoritative. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KishExploreModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const number=v=>v===null||v===undefined||String(v).trim()===''?null:Number.isFinite(Number(v))?Number(v):null;
function percent(k){const b=number(k.baseline),t=number(k.target),v=number(k.current);return b===null||t===null||v===null||b===t?null:Math.max(0,Math.min(100,(v-b)/(t-b)*100));}
function progress(g){const rows=(g.krs||[]).map(k=>({k,p:percent(k)})).filter(x=>x.p!==null);if(!rows.length)return null;const weighted=['weighted','weighted-krs','weighted_kr'].includes(String(g.progressMode||g.progressMethod||g.progressCalculation||'').toLowerCase())||g.weightedProgress===true;if(!weighted)return Math.round(rows.reduce((a,x)=>a+x.p,0)/rows.length);if(rows.some(x=>number(x.k.weight)===null||number(x.k.weight)<0))return null;const total=rows.reduce((a,x)=>a+number(x.k.weight),0);return total>0?Math.round(rows.reduce((a,x)=>a+x.p*number(x.k.weight),0)/total):null;}
function assertParent(records,id,parentId){const byId=new Map(records.map(x=>[x.id,x]));let cur=parentId;const seen=new Set([id]);while(cur){if(seen.has(cur))throw Error('هم‌راستایی دوری مجاز نیست.');seen.add(cur);const item=byId.get(cur);if(!item)throw Error('رکورد بالادست معتبر نیست.');cur=item.parentId;}}
function normalize(d,now=new Date()){const rows=[],cycles=d.cycles||[],goals=d.goals||[],teams=d.teams||[],pillars=d.strategy?.pillars||[];
 const base=(r,type,title,parentId,teamId='company',extra={})=>({id:r.id,type,title:title||'بدون عنوان',parentId:parentId||'',owner:r.owner||'',teamId,stage:r.status||'draft',archived:!!r.archived,timeframe:cycles.find(c=>(c.goalIds||[]).includes(r.id))?.id||'',progress:null,record:r,...extra});
 pillars.forEach(p=>rows.push(base(p,'pillar',p.title,p.parentId,p.teamId,{stage:p.status||'active'})));
 goals.forEach(g=>{const team=teams.find(t=>t.okrs?.some(x=>x.id===g.id))?.id||'company',frame=cycles.find(c=>(c.goalIds||[]).includes(g.id))?.id||'';rows.push(base(g,'objective',g.objective,g.parentId,team,{progress:progress(g),timeframe:frame}));(g.krs||[]).forEach(k=>rows.push(base(k,'kr',k.text,g.id,k.teamId||team,{progress:percent(k),stage:g.status||'draft',timeframe:frame})));});
 (d.kpis||[]).forEach(k=>{const parent=k.parentId||k.pillarId||pillars.find(p=>p.title===k.pillar)?.id||'';rows.push(base(k,'kpi',k.name,parent,k.teamId,{stage:k.status||'active'}));});
 (d.initiatives||[]).forEach(i=>{const g=rows.find(g=>g.type==='objective'&&g.id===i.objectiveId);rows.push(base(i,'initiative',i.title,i.parentId||i.objectiveId||i.kpiId,i.teamId||i.unitId||g?.teamId||'company',{timeframe:i.timeframeId||g?.timeframe||'',progress:i.status==='done'?100:null,stage:i.status||'planned'}));});
 const asItems=value=>(Array.isArray(value)?value:(typeof value==='string'&&value.trim()?value.split(','):[])).map(v=>typeof v==='object'&&v!==null?String(v.id??v.email??v.name??v.label??v.title??'').trim():String(v??'').trim()).filter(Boolean);
 const byId=new Map(rows.map(r=>[r.id,r]));
 rows.forEach(r=>{
  const original=r.record||{},cycle=cycles.find(c=>c.id===r.timeframe);
  r.createdAt=original.createdAt||original.created_at||original.created||'';
  r.startDate=original.startDate||original.start||cycle?.start||'';
  r.endDate=original.endDate||original.dueDate||original.due||original.end||cycle?.end||'';
  r.contributors=asItems(original.contributors||original.contributorIds||original.contributor_ids);
  r.tags=asItems(original.tags||original.tagIds||original.tag_ids);
 });
 rows.forEach(r=>{const seen=new Set([r.id]);let parent=byId.get(r.parentId);while(parent&&!seen.has(parent.id)){seen.add(parent.id);if(parent.archived)r.archived=true;parent=byId.get(parent.parentId);}
 const cycle=cycles.find(c=>c.id===r.timeframe);
 r.expected=['objective','kr'].includes(r.type)?expected(cycle?.start,cycle?.end,now):null;
 r.behind=r.progress!==null&&r.expected!==null&&r.progress<r.expected;
 const history=r.type==='kpi'?(d.kpiHistory||[]).filter(h=>h.kpiId===r.id):r.type==='kr'?(d.history||[]).filter(h=>h.krId===r.id):r.type==='objective'?(d.history||[]).filter(h=>(r.record.krs||[]).some(k=>k.id===h.krId)):[];
 r.lastUpdate=history.map(h=>h.at).filter(Boolean).sort().at(-1)||r.record.lastUpdate||'';
 const cadence=number(r.record.updateEveryDays)??7;
 const stamp=day(r.lastUpdate),today=day(now);
 r.outdated=['objective','kr','kpi'].includes(r.type)&&!['draft','closed'].includes(r.stage)&&!r.archived&&(stamp===null||today-stamp>cadence*86400000);
 });
 return rows;
}
function filter(rows,f={},context={}){
 const match=(v,a)=>!Array.isArray(a)||!a.length||a.includes(v);
 const matchesAny=(values,selected)=>!Array.isArray(selected)||!selected.length||(values||[]).some(v=>selected.includes(v));
 const after=(v,bound)=>!bound||(day(v)!==null&&day(v)>=day(bound)&&day(bound)!==null);
 const before=(v,bound)=>!bound||(day(v)!==null&&day(v)<=day(bound)&&day(bound)!==null);
 const numberBound=(v,min,max)=>(min===''||min===undefined||min===null)&&(max===''||max===undefined||max===null)||v!==null&&v!==undefined&&(min===''||min===undefined||min===null||v>=Number(min))&&(max===''||max===undefined||max===null||v<=Number(max));
 const byId=new Map(rows.map(r=>[r.id,r])),units=new Map((context.units||[]).map(t=>[t.id,t]));
 const ancestry=(id,selected,collection)=>{const seen=new Set();let current=id;while(current&&!seen.has(current)){if(selected.includes(current))return true;seen.add(current);const next=collection.get(current);current=next?.parentId||next?.parentUnitId||next?.parentTeamId||'';}return false;};
 const aligns=r=>!f.alignedTo?.length||f.alignedTo.includes(r.parentId)||(f.includeSubgoals&&ancestry(r.parentId,f.alignedTo,byId));
 const teamMatch=r=>match(r.teamId,f.teams)||(f.includeSubteams&&f.teams?.length&&ancestry(r.teamId,f.teams,units));
 return rows.filter(r=>
 (f.archived?r.archived:!r.archived)&&match(r.type,f.types)&&match(r.stage,f.stages)&&
 teamMatch(r)&&match(r.owner,f.owners)&&match(r.timeframe,f.timeframes)&&
 matchesAny(r.tags,f.tags)&&matchesAny(r.contributors,f.contributors)&&aligns(r)&&
 after(r.createdAt,f.createdAfter)&&after(r.startDate,f.startAfter)&&before(r.endDate,f.dueBefore)&&
 numberBound(r.progress,f.progressMin,f.progressMax)&&
 (!f.behind||r.behind)&&(!f.outdated||r.outdated)&&
 (!f.q||[r.title,r.owner].join(' ').toLocaleLowerCase().includes(String(f.q).toLocaleLowerCase())));
}
function tree(rows){const ids=new Set(rows.map(r=>r.id)),seen=new Set(),out=[];function walk(r,depth){if(seen.has(r.id))return;seen.add(r.id);out.push({...r,depth});rows.filter(x=>x.parentId===r.id).forEach(x=>walk(x,Math.min(depth+1,20)));}rows.filter(r=>!ids.has(r.parentId)).forEach(r=>walk(r,0));rows.forEach(r=>walk(r,0));return out;}
function historicalValue(row,d,end){const before=h=>h.at&&h.at.slice(0,10)<=end;
 const history=(row.type==='kpi'?(d.kpiHistory||[]).filter(h=>h.kpiId===row.id):(d.history||[]).filter(h=>h.krId===row.id)).filter(before).sort((a,b)=>a.at.localeCompare(b.at));
 if(row.type==='kpi')return number(history.at(-1)?.value);
 if(row.type==='kr')return number(history.at(-1)?.current);
 if(row.type==='objective'){const krs=(row.record.krs||[]).map(k=>{const h=(d.history||[]).filter(h=>h.krId===k.id&&before(h)).sort((a,b)=>a.at.localeCompare(b.at)).at(-1);return {...k,current:h?.current??null};});return progress({...row.record,krs});}
 return null;
}
function day(v){if(!v)return null;const s=v instanceof Date?v.toISOString().slice(0,10):String(v).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;const n=Date.parse(s+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===s?n:null;}
function expected(start,end,now=new Date()){const a=day(start),b=day(end),t=day(now);if(a===null||b===null||t===null||b<a)return null;if(a===b)return t>=b?100:0;return Math.max(0,Math.min(100,(t-a)/(b-a)*100));}
function weekStart(value){const n=day(value);if(n===null)return null;const d=new Date(n);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+1)%7);return d.toISOString().slice(0,10);}
function boardPeriods(mode='weekly',count=6,asOf=new Date()){
 const last=day(asOf);if(last===null)throw Error('تاریخ مرجع Board معتبر نیست.');
 const length=[6,12,26].includes(Number(count))?Number(count):6;
 const type=['weekly','monthly','quarterly'].includes(mode)?mode:'weekly';
 const dateLabel=v=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(v+'T00:00:00Z'));
 if(type==='weekly'){
  const current=weekStart(last),first=day(current);
  return Array.from({length},(_,i)=>{
   const offset=length-1-i;
   const end=offset===0?last:new Date(first-86400000-(offset-1)*604800000).toISOString().slice(0,10);
   return {key:'week-'+weekStart(end),end,label:dateLabel(end)};
  });
 }
 const parts=new Intl.DateTimeFormat('en-US-u-ca-persian',{year:'numeric',month:'numeric',timeZone:'UTC'});
 const results=[],seen=new Set();
 for(let i=0;i<Math.max(1600,length*110)&&results.length<length;i++){
  const at=new Date(day(last)-i*86400000).toISOString().slice(0,10);
  const data=parts.formatToParts(new Date(at+'T00:00:00Z'));
  const year=Number(data.find(x=>x.type==='year')?.value),month=Number(data.find(x=>x.type==='month')?.value);
  const quarter=Math.ceil(month/3),key=type==='monthly'?year+'-'+month:year+'-Q'+quarter;
  if(seen.has(key))continue;
  seen.add(key);
  const label=type==='monthly'?new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'long',timeZone:'UTC'}).format(new Date(at+'T00:00:00Z')):'سه‌ماهه '+new Intl.NumberFormat('fa-IR').format(quarter)+' · '+new Intl.NumberFormat('fa-IR').format(year);
  results.push({key,end:at,label});
 }
 return results.reverse();
}
function cloneGoal(g,makeId){const c=JSON.parse(JSON.stringify(g));c.id=makeId();c.objective=g.objective+' — رونوشت';c.status='draft';c.archived=false;c.dependencies=[];c.krs=(c.krs||[]).map(k=>{const n={...k,id:makeId(),current:'',lastUpdate:'',confidence:''};delete n.lastNote;return n;});for(const key of ['sourceId','sourcePage','closedAt','closingNotes','closureHistory','clonedFrom','comments','createdAt','updatedAt'])delete c[key];c.clonedFrom=g.id;return c;}
return {number,percent,progress,assertParent,normalize,filter,tree,historicalValue,day,expected,weekStart,boardPeriods,cloneGoal};
});
