/* Public OKR workspace: independent, browser-local, inspired by Perdoo 3 concepts.
   No affiliation with Perdoo. No shared state with Kish or any other PWA.
   Pure model exports also work in Node regression tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PublicOKRModel=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const clamp=n=>Math.min(100,Math.max(0,n));
const num=x=>x===null||x===undefined||x===''?NaN:Number(x);
const finite=n=>Number.isFinite(n);
const uid=()=>('o'+Date.now().toString(36)+Math.random().toString(36).slice(2,9));
const text=(v,max=260)=>String(v==null?'':v).trim().slice(0,max);
function blank(){return {schema:3,revision:0,updatedAt:'',ultimateGoal:'',pillars:[],objectives:[],kpis:[],initiatives:[],checkins:[]};}
function progress(start,current,target,type='number'){
 if(type==='binary')return current===true||current===1||current==='1'||current==='true'?100:0;
 const a=num(start),c=num(current),t=num(target);
 if(![a,c,t].every(finite)||a===t)return null;
 return Math.round(clamp((c-a)/(t-a)*100)*10)/10;
}
function objectiveProgress(o){
 if(!o||!Array.isArray(o.results))return null;
 const results=o.results.filter(r=>r&&r.status!=='archived').map(r=>({score:progress(r.start,r.current,r.target,r.type),weight:num(r.weight)})).filter(r=>r.score!==null);
 if(!results.length)return null;
 const w=results.map(r=>finite(r.weight)&&r.weight>0?r.weight:1),sum=w.reduce((a,b)=>a+b,0);
 return Math.round(results.reduce((n,r,i)=>n+r.score*w[i],0)/sum*10)/10;
}
function pillarAncestors(pillars,id){const visited=new Set();let cur=pillars.find(x=>x.id===id);
 while(cur){if(visited.has(cur.id))return {loop:true,ids:[...visited]};visited.add(cur.id);cur=pillars.find(x=>x.id===cur.parentId);}
 return {loop:false,ids:[...visited]};}
function validParent(pillars,id,parentId){if(!parentId)return true;if(id===parentId)return false;
 const chain=pillarAncestors(pillars,parentId);return !chain.loop&&!chain.ids.includes(id);
}
function objectiveParentCycle(objectives,id,parentId){if(!parentId)return false;let p=parentId,seen=new Set([id]);
 while(p){if(seen.has(p))return true;seen.add(p);const o=objectives.find(x=>x.id===p);p=o&&o.align&&o.align.type==='objective'?o.align.id:'';}return false;}
function validAlignment(db,forId,align){
 if(!align||!align.type||!align.id)return true;
 if(!['pillar','objective','kpi'].includes(align.type))return false;
 if(align.type==='pillar')return db.pillars.some(p=>p.id===align.id);
 if(align.type==='kpi')return db.kpis.some(p=>p.id===align.id);
 return db.objectives.some(o=>o.id===align.id)&&!objectiveParentCycle(db.objectives,forId,align.id);
}
function KPIHealth(k){if(!k)return null;if(k.type==='binary')return k.current===true?'good':'risk';const n=num(k.current),target=num(k.target);if(!finite(n)||!finite(target))return null;return k.direction==='down'?(n<=target?'good':'risk'):(n>=target?'good':'risk');}
function normalize(raw){
 if(!raw||typeof raw!=='object'||raw.schema!==3)throw Error('INVALID_SCHEMA');
 const out=blank();out.revision=Math.max(0,Math.floor(Number(raw.revision)||0));out.updatedAt=text(raw.updatedAt,50);
 out.ultimateGoal=text(raw.ultimateGoal,700);
 const list=(v,limit)=>Array.isArray(v)?v.slice(0,limit).filter(x=>x&&typeof x==='object'):[];
 out.pillars=list(raw.pillars,100).map(p=>({id:text(p.id,60)||uid(),name:text(p.name,240),parentId:text(p.parentId,60)}));
 out.objectives=list(raw.objectives,400).map(o=>({
 id:text(o.id,60)||uid(),name:text(o.name,240),team:text(o.team,100),lead:text(o.lead,100),
 timeframe:text(o.timeframe,70),status:['draft','active','closed'].includes(o.status)?o.status:'draft',
 align:o.align&&typeof o.align==='object'?{type:text(o.align.type,30),id:text(o.align.id,60)}:null,
 results:list(o.results,15).map(r=>({id:text(r.id,60)||uid(),name:text(r.name,240),type:r.type==='binary'?'binary':'number',
 start:r.type==='binary'?0:num(r.start),current:r.type==='binary'?Boolean(r.current):num(r.current),
 target:r.type==='binary'?1:num(r.target),unit:text(r.unit,32),weight:num(r.weight)||1})),
 createdAt:text(o.createdAt,50),closedNote:text(o.closedNote,700)
 }));
 out.kpis=list(raw.kpis,200).map(k=>({id:text(k.id,60)||uid(),name:text(k.name,240),type:['number','weekly','binary'].includes(k.type)?k.type:'number',
 direction:k.direction==='down'?'down':'up',current:k.type==='binary'?Boolean(k.current):num(k.current),target:k.type==='binary'?1:num(k.target),unit:text(k.unit,32),
 owner:text(k.owner,100),history:list(k.history,500).map(h=>({date:text(h.date,30),value:num(h.value)}))}));
 out.initiatives=list(raw.initiatives,500).map(x=>({id:text(x.id,60)||uid(),name:text(x.name,240),owner:text(x.owner,100),status:['todo','doing','done'].includes(x.status)?x.status:'todo',objectiveId:text(x.objectiveId,60),kpiId:text(x.kpiId,60)}));
 out.checkins=list(raw.checkins,3000).map(c=>({id:text(c.id,60)||uid(),date:text(c.date,30),objectiveId:text(c.objectiveId,60),resultId:text(c.resultId,60),
 actual:c.actual===true?true:num(c.actual),confidence:['high','medium','low'].includes(c.confidence)?c.confidence:'medium',blocker:text(c.blocker,700)}));
 return out;
}
function csv(db){const rows=[['Objective','Team','Owner','Timeframe','Status','Alignment','Progress (%)','Key Results']];
 for(const o of db.objectives){const a=o.align?o.align.type+':'+o.align.id:'';rows.push([o.name,o.team,o.lead,o.timeframe,o.status,a,objectiveProgress(o)??'',o.results.length]);}
 return '\uFEFF'+rows.map(row=>row.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');}
function demo(){const s=blank();s.ultimateGoal='ارائه خدمات قابل اتکا با تجربه عالی مشتری و عملکرد پایدار';
 const p1={id:uid(),name:'کیفیت و رضایت مشتری',parentId:''},p2={id:uid(),name:'بهره‌وری و یادگیری',parentId:''};s.pillars=[p1,p2];
 const o1={id:uid(),name:'تجربه مشتری را به‌صورت قابل سنجش بهبود دهیم',team:'شرکت',lead:'مدیرعامل',timeframe:'۱۴۰۵ / فصل چهارم',status:'active',align:{type:'pillar',id:p1.id},results:[{id:uid(),name:'افزایش شاخص رضایت',type:'number',start:60,current:71,target:85,unit:'امتیاز',weight:2},{id:uid(),name:'کاهش زمان پاسخ',type:'number',start:48,current:36,target:24,unit:'ساعت',weight:1}],createdAt:new Date().toISOString(),closedNote:''};
 const o2={id:uid(),name:'سرعت حل مسئله‌های تیم را افزایش دهیم',team:'عملیات',lead:'سرپرست تیم',timeframe:'۱۴۰۵ / فصل چهارم',status:'active',align:{type:'objective',id:o1.id},results:[{id:uid(),name:'افزایش حل در تماس اول',type:'number',start:40,current:55,target:80,unit:'درصد',weight:1}],createdAt:new Date().toISOString(),closedNote:''};
 s.objectives=[o1,o2];s.kpis=[{id:uid(),name:'زمان پاسخ‌گویی هفتگی',type:'weekly',direction:'down',current:36,target:24,unit:'ساعت',owner:'عملیات',history:[{date:new Date().toISOString().slice(0,10),value:36}]}];
 s.initiatives=[{id:uid(),name:'بازطراحی مسیر ثبت درخواست مشتری',owner:'عملیات',status:'doing',objectiveId:o1.id,kpiId:''}];return s;}
return {blank,uid,text,progress,objectiveProgress,pillarAncestors,validParent,validAlignment,KPIHealth,normalize,csv,demo};
});
