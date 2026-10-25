/* Shared, pure read model. Original records remain authoritative. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KishExploreModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const number=v=>v===null||v===undefined||String(v).trim()===''?null:Number.isFinite(Number(v))?Number(v):null;
function percent(k){const b=number(k.baseline),t=number(k.target),v=number(k.current);return b===null||t===null||v===null||b===t?null:Math.max(0,Math.min(100,(v-b)/(t-b)*100));}
function progress(g){const rows=(g.krs||[]).map(k=>({k,p:percent(k)})).filter(x=>x.p!==null);if(!rows.length)return null;const weighted=['weighted','weighted-krs','weighted_kr'].includes(String(g.progressMode||g.progressMethod||g.progressCalculation||'').toLowerCase())||g.weightedProgress===true;if(!weighted)return Math.round(rows.reduce((a,x)=>a+x.p,0)/rows.length);if(rows.some(x=>number(x.k.weight)===null||number(x.k.weight)<0))return null;const total=rows.reduce((a,x)=>a+number(x.k.weight),0);return total>0?Math.round(rows.reduce((a,x)=>a+x.p*number(x.k.weight),0)/total):null;}
function assertParent(records,id,parentId){const byId=new Map(records.map(x=>[x.id,x]));let cur=parentId;const seen=new Set([id]);while(cur){if(seen.has(cur))throw Error('هم‌راستایی دوری مجاز نیست.');seen.add(cur);const item=byId.get(cur);if(!item)throw Error('رکورد بالادست معتبر نیست.');cur=item.parentId;}}
function normalize(d){const rows=[],cycles=d.cycles||[],goals=d.goals||[],teams=d.teams||[],pillars=d.strategy?.pillars||[];
 const base=(r,type,title,parentId,teamId='company',extra={})=>({id:r.id,type,title:title||'بدون عنوان',parentId:parentId||'',owner:r.owner||'',teamId,stage:r.status||'draft',archived:!!r.archived,timeframe:cycles.find(c=>(c.goalIds||[]).includes(r.id))?.id||'',progress:null,record:r,...extra});
 pillars.forEach(p=>rows.push(base(p,'pillar',p.title,p.parentId,p.teamId,{stage:p.status||'active'})));
 goals.forEach(g=>{const team=teams.find(t=>t.okrs?.some(x=>x.id===g.id))?.id||'company',frame=cycles.find(c=>(c.goalIds||[]).includes(g.id))?.id||'';rows.push(base(g,'objective',g.objective,g.parentId,team,{progress:progress(g),timeframe:frame}));(g.krs||[]).forEach(k=>rows.push(base(k,'kr',k.text,g.id,k.teamId||team,{progress:percent(k),stage:g.status||'draft',timeframe:frame})));});
 (d.kpis||[]).forEach(k=>{const parent=k.parentId||k.pillarId||pillars.find(p=>p.title===k.pillar)?.id||'';rows.push(base(k,'kpi',k.name,parent,k.teamId,{stage:k.status||'active'}));});
 (d.initiatives||[]).forEach(i=>{const g=rows.find(g=>g.type==='objective'&&g.id===i.objectiveId);rows.push(base(i,'initiative',i.title,i.parentId||i.objectiveId||i.kpiId,i.teamId||i.unitId||g?.teamId||'company',{timeframe:i.timeframeId||g?.timeframe||'',progress:i.status==='done'?100:null,stage:i.status||'planned'}));});
 return rows;
}
function filter(rows,f={}){const match=(v,a)=>!a?.length||a.includes(v);return rows.filter(r=>(f.archived?r.archived:!r.archived)&&match(r.type,f.types)&&match(r.stage,f.stages)&&match(r.teamId,f.teams)&&match(r.owner,f.owners)&&match(r.timeframe,f.timeframes)&&(!f.q||[r.title,r.owner].join(' ').toLocaleLowerCase().includes(f.q.toLocaleLowerCase())));}
function tree(rows){const ids=new Set(rows.map(r=>r.id)),seen=new Set(),out=[];function walk(r,depth){if(seen.has(r.id))return;seen.add(r.id);out.push({...r,depth});rows.filter(x=>x.parentId===r.id).forEach(x=>walk(x,Math.min(depth+1,20)));}rows.filter(r=>!ids.has(r.parentId)).forEach(r=>walk(r,0));rows.forEach(r=>walk(r,0));return out;}
function historicalValue(row,d,end){const before=h=>h.at&&h.at.slice(0,10)<=end;
 const history=(row.type==='kpi'?(d.kpiHistory||[]).filter(h=>h.kpiId===row.id):(d.history||[]).filter(h=>h.krId===row.id)).filter(before).sort((a,b)=>a.at.localeCompare(b.at));
 if(row.type==='kpi')return number(history.at(-1)?.value);
 if(row.type==='kr')return number(history.at(-1)?.current);
 if(row.type==='objective'){const krs=(row.record.krs||[]).map(k=>{const h=(d.history||[]).filter(h=>h.krId===k.id&&before(h)).sort((a,b)=>a.at.localeCompare(b.at)).at(-1);return {...k,current:h?.current??null};});return progress({...row.record,krs});}
 return null;
}
return {number,percent,progress,assertParent,normalize,filter,tree,historicalValue};
});
