'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage();await page.addInitScript(()=>window.__kishAuthTestBypass=true);
try{await page.goto('http://127.0.0.1:8765/okr-system/?qa=clone-hierarchy#explore');await page.locator('.kx-app').waitFor();
async function create(kind,values){await page.evaluate(kind=>window.KishExploreBridge.form(kind),kind);for(const [key,value] of Object.entries(values)){const el=page.locator('#pf-'+key);if(await el.evaluate(e=>e.tagName==='SELECT'))await el.selectOption(value);else await el.fill(value);}await page.locator('#platformDialog [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('platformDialog').open);}
await create('goal',{objective:'QA clone parent',owner:'Original lead',teamId:'company',parentId:'doc-pillar-1',status:'draft'});
const parent=await page.evaluate(()=>window.KishExploreBridge.snapshot().goals.find(g=>g.objective==='QA clone parent'));
await create('goal',{objective:'QA clone child',owner:'Child lead',teamId:'company',parentId:parent.id,status:'draft'});
const child=await page.evaluate(()=>window.KishExploreBridge.snapshot().goals.find(g=>g.objective==='QA clone child'));
await create('project',{title:'QA clone initiative',owner:'Project lead',teamId:'company',objectiveId:child.id,status:'in-progress',due:'2026-12-31'});
const result=await page.evaluate(({parent,child})=>{
 const B=window.KishExploreBridge;
 const before=JSON.stringify(B.snapshot().goals),originalInitiative=B.snapshot().initiatives.find(i=>i.title==='QA clone initiative');
 const cycle=window.KishTeamBridge.snapshot().cycles.find(c=>!c.closedAt);
 const copyId=B.lifecycle(parent.id,'clone',{options:'yes',title:'QA hierarchy copy',includeKrs:'on',includeSubgoals:'on',includeInitiatives:'on',timeframeId:cycle?.id||''});
 const snap=B.snapshot(),copy=snap.goals.find(g=>g.id===copyId),copiedChild=snap.goals.find(g=>g.clonedFrom===child.id),initiative=snap.initiatives.find(i=>i.objectiveId===copiedChild?.id);
 return {copy,copiedChild,initiative,cycle,originalInitiative,unchanged:before===JSON.stringify(snap.goals.filter(g=>g.id!==copy.id&&g.id!==copiedChild.id))};
},{parent,child});
assert.ok(result.unchanged);assert.equal(result.copiedChild.parentId,result.copy.id);assert.equal(result.copy.owner,'');assert.equal(result.copiedChild.owner,'');assert.equal(result.initiative.status,'planned');assert.equal(result.initiative.progress,0);assert.equal(result.initiative.owner,'');assert.notEqual(result.initiative.id,result.originalInitiative.id);if(result.cycle){assert.equal(result.copy.due,result.cycle.end);assert.equal(result.copiedChild.due,result.cycle.end);}
await page.reload();const retained=await page.evaluate(id=>window.KishExploreBridge.snapshot().goals.some(g=>g.id===id),result.copy.id);assert.ok(retained);console.log('PASS recursive clone: parent links, initiative isolation, owner reset, timeframe dates, original records, persistence');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
