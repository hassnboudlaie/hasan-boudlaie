(function(root){'use strict';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function validKishState(state){
  if(!object(state)||!object(state.meta)||!object(state.strategy))return false;
  if(!Array.isArray(state.strategy.pillars)||!Array.isArray(state.strategy.kpis)||
     !Array.isArray(state.companyOkrs)||!Array.isArray(state.teams))return false;
  if(state.teams.length>1000||state.companyOkrs.length>2000)return false;
  const objective=o=>object(o)&&typeof o.id==='string'&&typeof o.objective==='string'&&
    Array.isArray(o.krs)&&o.krs.length<=1000&&o.krs.every(k=>object(k)&&typeof k.id==='string');
  if(!state.companyOkrs.every(objective)||!state.teams.every(t=>object(t)&&typeof t.id==='string'&&
    Array.isArray(t.okrs)&&t.okrs.every(objective)))return false;
  if(new Set(state.teams.map(t=>t.id)).size!==state.teams.length)return false;
  const goals=[...state.companyOkrs,...state.teams.flatMap(t=>t.okrs)];
  const groups=[state.strategy.pillars,state.strategy.kpis,goals,goals.flatMap(g=>g.krs)];
  for(const records of groups){const ids=new Set();for(const r of records){if(!object(r)||typeof r.id!=='string'||!r.id.trim()||ids.has(r.id))return false;ids.add(r.id);}}
  for(const records of [state.strategy.pillars,goals]){const parents=new Map(records.map(r=>[r.id,r.parentId]));for(const r of records){let next=r.id,seen=new Set();while(parents.has(next)){if(seen.has(next))return false;seen.add(next);next=parents.get(next);}}}

  // The browser merges defaults on restore. Reject keys that could change prototypes.
  const pending=[[state,0]];
  while(pending.length){
    const [value,depth]=pending.pop();if(depth>35)return false;
    if(value&&typeof value==='object')for(const key of Object.keys(value)){
      if(['__proto__','prototype','constructor'].includes(key))return false;
      if(typeof value[key]==='number'&&!Number.isFinite(value[key]))return false;
      if(value[key]&&typeof value[key]==='object')pending.push([value[key],depth+1]);
    }
  }
  return true;
}


const api={validKishState};if(typeof module==='object'&&module.exports)module.exports=api;else root.KishWorkspaceValidation=api;
})(typeof window==='object'?window:globalThis);
