(function testClassroom(){
'use strict';
const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
fs.mkdirSync('artifacts/alborz-resilience',{recursive:true});
const root=path.resolve(__dirname,'..'),port=4193;
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),target=path.resolve(root,'.'+pathname);
 if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(target,(err,buf)=>{res.statusCode=err?404:200;res.setHeader('content-type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':target.endsWith('.woff2')?'font/woff2':'text/html');res.end(err?'not found':buf);});
});
(async()=>{
 await new Promise(ok=>server.listen(port,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:'+port+'/alborz-communication-skills/';
 for(const width of [390,1366]){
  const ctx=await browser.newContext({viewport:{width,height:880}}),teacher=await ctx.newPage(),expert1=await ctx.newPage(),expert2=await ctx.newPage(),errors=[];
  for(const p of [teacher,expert1,expert2])p.on('pageerror',e=>errors.push(e.message));
  const data=new Map(),set=(team,k,v)=>{const key=team+':'+k,old=data.get(key);const x={team_no:team,field_key:k,field_value:v,version:(old?.version??0)+1};data.set(key,x);return x;};
  const get=(team,k)=>data.get(team+':'+k);
  const records=team=>[...data.values()].filter(x=>team===null||x.team_no===team);
  let nextCalls=0;
  await ctx.route('**/functions/v1/alborz-workshop-sync',async route=>{
   const req=route.request().postDataJSON(),action=req.action,token=req.code||'';
   let result,status=200;
   if(action==='login'){
    const role=String(token).includes('teacher')||String(token)==='aaaaaaaaaaaaaaaaaaaaaaaa'?'teacher':'team';
    const team=String(token).includes('22222222')||String(token).includes('session-2')?2:1;
    result={identity:role==='teacher'?{role:'teacher',team:null,member:null}:{role:'team',team,member:1},session:role==='teacher'?'session-teacher':'session-'+team};
   }else if(action==='teacher'){result={records:records(null)};}
   else if(action==='read'){result={records:records(req.team),classroom:{phase:get(1,'classroomPhase')?.field_value??0,version:get(1,'classroomPhase')?.version??0,round:get(1,'classroomRound')?.field_value??0}};}
   else if(action==='groupSetup'){
    set(req.team,'groupSize',req.size);set(req.team,'groupReady',req.size>0);result={records:records(req.team)};
   }else if(action==='classroom'){
    const old=get(1,'classroomPhase')?.field_value??0,round=get(1,'classroomRound')?.field_value??0;
    const active=[1,2].filter(team=>get(team,'groupReady')?.field_value===true);
    const wait=old>=3&&old<=9&&req.phase===old+1&&active.some(team=>get(team,'classStepReady')?.field_value!==round+':'+old);
    if(req.expectedVersion!==(get(1,'classroomPhase')?.version??0)||wait){status=409;result={error:wait?'waiting for group readiness':'version conflict'};}
    else{const restarting=old===10&&req.phase===2;set(1,'classroomPhase',req.phase);if(restarting)set(1,'classroomRound',round+1);nextCalls++;result={records:records(1).filter(x=>x.field_key.startsWith('classroom'))};}
   }else if(action==='write'){
    const fields=req.fields,round=get(1,'classroomRound')?.field_value??0,previous=Array.from({length:round},(_,i)=>get(req.team,'missionRound'+i)?.field_value);
    const repeated='missionChoice' in fields&&previous.includes(fields.missionChoice);
    const invalidReady='classStepReady' in fields&&fields.classStepReady!==round+':'+(get(1,'classroomPhase')?.field_value??0);
    const conflicts=Object.keys(fields).filter(k=>(get(req.team,k)?.version??0)!==req.expected[k]);
    if(repeated||invalidReady||conflicts.length){status=409;result={error:repeated?'repeated mission':invalidReady?'wrong step':'conflict',conflicts};}
    else{const rs=Object.entries(fields).map(([k,v])=>set(req.team,k,v));result={records:rs};}
   }else if(action==='resetClassroom'){
    if(req.confirm!=='RESET_ALBORZ_WORKSHOP'){status=400;result={error:'reset confirmation required'};}
    else{data.clear();result={ok:true,reset:true};}
   }else if(action==='logout')result={ok:true};
   else{status=403;result={error:'unknown '+action};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(result)});
  });
  const markReady=async()=>{
    assert.equal(await teacher.locator('[data-class-next]').isDisabled(),true,'instructor waits until active groups complete this step');
    await expert1.locator('[data-class-ready]').click();
    await expert1.locator('[data-class-ready]:disabled').waitFor();
    await teacher.evaluate(()=>window.AlborzLive.refresh());
    assert.equal(await teacher.locator('[data-class-next]').isDisabled(),true,'one ready group cannot advance two-group class');
    await expert2.locator('[data-class-ready]').click();
    await expert2.locator('[data-class-ready]:disabled').waitFor();
    await teacher.evaluate(()=>window.AlborzLive.refresh());
    assert.equal(await teacher.locator('[data-class-next]').isDisabled(),false,'instructor can advance when all groups ready');
  };
  const enter=async(page,url,code)=>{
   await page.goto(base+url,{waitUntil:'load'});
   await page.locator('#live-code').fill(code);
   await page.locator('#live-join').click();
  };
  await enter(teacher,'resilience.html?classroom=1&teacher=1&mission=camel','aaaaaaaaaaaaaaaaaaaaaaaa');
  await teacher.locator('.classroom-team-row').first().waitFor();
  assert.equal(await teacher.locator('.classroom-team-row').count(),10,'instructor starts with team formation');
  await enter(expert1,'resilience.html?classroom=1&mission=camel','11111111');
  await expert1.waitForURL('**/resilience.html?classroom=1&group=1&mission=camel');
  await expert1.locator('[data-class-checkin]').click();
  await expert1.locator('[data-class-checkin]:disabled').waitFor();
  assert.equal(get(1,'checkin1')?.field_value,true,'member 1 checked into group 1');
  await enter(expert2,'resilience.html?classroom=1&mission=chameleon','22222222');
  await expert2.waitForURL('**/resilience.html?classroom=1&group=2&mission=chameleon');
  await expert2.locator('[data-class-checkin]').click();
  await expert2.locator('[data-class-checkin]:disabled').waitFor();
  assert.equal(get(2,'checkin1')?.field_value,true,'member 1 checked into group 2');
  await teacher.evaluate(()=>window.AlborzLive.refresh());
  await teacher.locator('[data-class-team-size="1"]').selectOption('3');
  await teacher.locator('[data-class-confirm="1"]').click();
  await teacher.waitForFunction(()=>document.querySelector('[data-class-confirm="1"]')?.textContent.includes('ثبت دوباره'));
  await teacher.locator('[data-class-team-size="2"]').selectOption('6');
  await teacher.locator('[data-class-confirm="2"]').click();
  await teacher.waitForFunction(()=>document.querySelector('[data-class-confirm="2"]')?.textContent.includes('ثبت دوباره'));
  assert.equal(get(1,'groupSize').field_value,3,'group 1 has a 3-person formation');
  assert.equal(get(2,'groupSize').field_value,6,'group 2 can have six physical participants');
  assert.equal(await teacher.locator('[data-class-next]').isDisabled(),false,'teacher can proceed after group confirmation');
  await teacher.locator('[data-class-next]').click();
  await teacher.waitForFunction(()=>document.querySelector('.class-stage-marker')?.textContent.includes('معرفی چهار راهبرد'));
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  assert.match(await expert1.locator('.classroom-section-title').innerText(),/چهار راهبرد/,'participants see same class phase');
  await teacher.locator('[data-class-next]').click();
  await teacher.waitForFunction(()=>document.querySelector('.class-stage-marker')?.textContent.includes('انتخاب مأموریت'));
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert2.evaluate(()=>window.AlborzLive.refresh());
  await expert1.locator('[data-class-mission="0"]').click();
  await expert1.waitForFunction(()=>document.querySelector('[data-class-mission="0"]')?.classList.contains('selected'));
  await expert2.locator('[data-class-mission="2"]').click();
  await expert2.waitForFunction(()=>document.querySelector('[data-class-mission="2"]')?.classList.contains('selected'));
  assert.equal(get(1,'missionChoice').field_value,0,'group 1 independently chose camel');
  assert.equal(get(2,'missionChoice').field_value,2,'group 2 independently chose chameleon');
  await teacher.evaluate(()=>window.AlborzLive.refresh());
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert2.evaluate(()=>window.AlborzLive.refresh());
  assert.match(await expert1.locator('.classroom-story').innerText(),/۳۰ نفر/,'camel gets temporary crowd scenario');
  assert.match(await expert2.locator('.classroom-story').innerText(),/پرونده‌های درمان/,'chameleon gets structural redesign scenario');
  assert.equal(get(1,'classroomPhase').field_value,3,'instructor phase stored centrally');
  await teacher.locator('[data-class-reference="2"]').click();
  assert.match(await teacher.locator('.classroom-case-caption').innerText(),/آفتاب‌پرست|پرونده|رفت‌وآمدی/);
  for(let phase=4;phase<=6;phase++){
   await markReady();
   await teacher.locator('[data-class-next]').click();
   await teacher.waitForFunction(p=>document.querySelector('.class-stage-marker')?.textContent.includes('مرحله '+new Intl.NumberFormat('fa-IR').format(p+1)),phase);
   await expert1.evaluate(()=>window.AlborzLive.refresh());
   await expert2.evaluate(()=>window.AlborzLive.refresh());
  }
  assert.match(await expert1.locator('.classroom-section-title').innerText(),/انتخاب و تصمیم اولیه/);
  await expert1.locator('[data-class-pick="0"]').check();
  await expert1.locator('[data-class-pick="1"]').check();
  await expert1.locator('[data-class-answer="initial"]').fill('گروه ما صف را اولویت بندی و ثبت موقت مصوب را اجرا می‌کند.');
  await expert1.locator('[data-class-save="initial"]').click();
  await expert1.waitForFunction(()=>document.querySelector('.classroom-saved')?.textContent.includes('ثبت شده'));
  assert.match(get(1,'r0initial').field_value,/ثبت موقت/,'decision saved under group and mission');
  await expert2.locator('[data-class-pick="0"]').check();
  await expert2.locator('[data-class-pick="1"]').check();
  await expert2.locator('[data-class-answer="initial"]').fill('گروه دو مالک فرایند و مسیر مشترک تکمیل مدارک را مشخص می‌کند.');
  await expert2.locator('[data-class-save="initial"]').click();
  await expert2.waitForFunction(()=>document.querySelector('.classroom-saved')?.textContent.includes('ثبت شده'));
  await teacher.evaluate(()=>window.AlborzLive.refresh());
  await teacher.locator('.classroom-monitor > summary').click();
  await teacher.locator('.classroom-monitor-list details').first().evaluate(el=>el.open=true);
  assert.match(await teacher.locator('.classroom-monitor').innerText(),/ثبت موقت/,'instructor sees shared decision');
  await markReady();
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert2.evaluate(()=>window.AlborzLive.refresh());
  assert.match(await expert1.locator('.classroom-event').innerText(),/./,'unexpected event appears only on its shared phase');
  await markReady();
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert2.evaluate(()=>window.AlborzLive.refresh());
  await expert1.locator('[data-class-answer="revision"]').fill('به دلیل اطلاعات تازه نوبت بندی را با تقسیم مسئولیت اصلاح می‌کنیم.');
  await expert1.locator('[data-class-save="revision"]').click();
  await expert1.waitForFunction(()=>document.querySelector('.classroom-saved')?.textContent.includes('ثبت شده'));
  await expert2.locator('[data-class-answer="revision"]').fill('پس از افزایش خطای ثبت، کنترل کیفیت و مسئولیت داده را اصلاح می‌کنیم.');
  await expert2.locator('[data-class-save="revision"]').click();
  await expert2.waitForFunction(()=>document.querySelector('.classroom-saved')?.textContent.includes('ثبت شده'));
  await markReady();
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert2.evaluate(()=>window.AlborzLive.refresh());
  await expert1.locator('[data-class-answer="evidence"]').fill('مشاهده شد که کارشناس زمان پیگیری روشن اعلام کرد.');
  await expert1.locator('[data-class-save="evidence"]').click();
  await expert1.waitForFunction(()=>document.querySelector('.classroom-input textarea')?.value?.length>0);
  assert.match(get(1,'r0member1').field_value,/مشاهده شد/);
  await expert2.locator('[data-class-answer="evidence"]').fill('مشاهده شد که همکار معیار پرونده کامل را به‌وضوح توضیح داد.');
  await expert2.locator('[data-class-save="evidence"]').click();
  await expert2.waitForFunction(()=>document.querySelector('[data-class-answer="evidence"]')?.value?.length>0);
  await markReady();
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  assert.match(await expert1.locator('.classroom-section-title').innerText(),/جمع‌بندی/);
  await teacher.locator('[data-class-next]').click();
  assert.equal(get(1,'classroomPhase').field_value,2,'instructor begins next independent round');
  assert.equal(get(1,'classroomRound')?.field_value,1,'classroom advances to the second round');
  await teacher.waitForFunction(()=>document.querySelector('.class-stage-marker')?.textContent.includes('دور ۲') &&
    document.querySelector('.class-stage-marker')?.textContent.includes('انتخاب مأموریت'));
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert2.evaluate(()=>window.AlborzLive.refresh());
  assert.equal(await expert1.locator('[data-class-mission].selected').count(),0,'group 1 must choose again for round 2');
  assert.equal(await expert2.locator('[data-class-mission].selected').count(),0,'group 2 must choose again for round 2');
  assert.equal(await expert1.locator('[data-class-mission="0"]').isDisabled(),true,'completed camel mission cannot repeat');
  assert.equal(await expert2.locator('[data-class-mission="2"]').isDisabled(),true,'completed chameleon mission cannot repeat');
  assert.equal(await teacher.locator('[data-class-next]').isDisabled(),true,'teacher cannot skip unchosen round 2 missions');
  await expert1.locator('[data-class-mission="1"]').click();
  await expert1.waitForFunction(()=>document.querySelector('[data-class-mission="1"]')?.classList.contains('selected'));
  await expert2.locator('[data-class-mission="3"]').click();
  await expert2.waitForFunction(()=>document.querySelector('[data-class-mission="3"]')?.classList.contains('selected'));
  await teacher.evaluate(()=>window.AlborzLive.refresh());
  assert.equal(await teacher.locator('[data-class-next]').isDisabled(),false,'all confirmed groups chose a fresh mission');
  assert.equal(get(1,'r0initial')?.field_value?.length>0,true,'prior camel decision persisted across rounds');
  assert.equal(get(1,'missionChoiceRound')?.field_value,1,'round marker saved with group 1 new salmon choice');
  assert.equal(get(2,'missionChoiceRound')?.field_value,1,'round marker saved with group 2 octopus choice');
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert2.evaluate(()=>window.AlborzLive.refresh());
  assert.match(await expert1.locator('.classroom-story').innerText(),/۴۰ خودرو/,'second round loads salmon scenario for group 1');
  assert.match(await expert2.locator('.classroom-story').innerText(),/خسارت اموال/,'second round loads octopus scenario for group 2');
  assert(nextCalls>=10,'server-controlled step changes saved across all phones');
  await teacher.screenshot({path:'artifacts/alborz-resilience/classroom-teacher-'+width+'.png',fullPage:true});
  await expert1.screenshot({path:'artifacts/alborz-resilience/classroom-participant-'+width+'.png',fullPage:true});
  for(const p of [teacher,expert1,expert2])assert(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'no horizontal overflow '+width);
  await teacher.locator('.classroom-reset > summary').click();
  let prompts=0;
  teacher.on('dialog',async dialog=>{prompts++;await dialog.accept(prompts===1?'شروع تازه':undefined);});
  await teacher.locator('[data-class-reset]').click();
  await teacher.waitForFunction(()=>document.querySelector('.class-stage-marker')?.textContent.includes('مرحله ۱'));
  assert.equal(data.size,0,'reset clears only workshop data and returns to team formation');
  assert.equal(await teacher.locator('#live-join').count(),0,'instructor remains authenticated after resetting only workshop data');
  assert.deepEqual(errors,[],'no browser exceptions in coordinated classroom');
  console.log('PASS guided classroom '+width+'px: roster 3/6, PIN mapping, teacher progress, independent groups, decision & feedback sync, new round');
  await ctx.close();
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
})();