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
   else if(action==='read'){result={records:records(req.team),classroom:{phase:get(1,'classroomPhase')?.field_value??0,version:get(1,'classroomPhase')?.version??0}};}
   else if(action==='groupSetup'){
    set(req.team,'groupSize',req.size);set(req.team,'groupReady',req.size>0);result={records:records(req.team)};
   }else if(action==='classroom'){
    if(req.expectedVersion!==(get(1,'classroomPhase')?.version??0)){status=409;result={error:'version conflict'};}
    else{set(1,'classroomPhase',req.phase);nextCalls++;result={records:[get(1,'classroomPhase')]};}
   }else if(action==='write'){
    const conflicts=Object.keys(req.fields).filter(k=>(get(req.team,k)?.version??0)!==req.expected[k]);
    if(conflicts.length){status=409;result={error:'conflict',conflicts};}
    else{const rs=Object.entries(req.fields).map(([k,v])=>set(req.team,k,v));result={records:rs};}
   }else if(action==='logout')result={ok:true};
   else{status=403;result={error:'unknown '+action};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(result)});
  });
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
  await teacher.evaluate(()=>window.AlborzLive.refresh());
  await teacher.locator('.classroom-monitor summary').click();
  await teacher.locator('.classroom-monitor-list details').first().evaluate(el=>el.open=true);
  assert.match(await teacher.locator('.classroom-monitor').innerText(),/ثبت موقت/,'instructor sees shared decision');
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  assert.match(await expert1.locator('.classroom-event').innerText(),/./,'unexpected event appears only on its shared phase');
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert1.locator('[data-class-answer="revision"]').fill('به دلیل اطلاعات تازه نوبت بندی را با تقسیم مسئولیت اصلاح می‌کنیم.');
  await expert1.locator('[data-class-save="revision"]').click();
  await expert1.waitForFunction(()=>document.querySelector('.classroom-saved')?.textContent.includes('ثبت شده'));
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  await expert1.locator('[data-class-answer="evidence"]').fill('مشاهده شد که کارشناس زمان پیگیری روشن اعلام کرد.');
  await expert1.locator('[data-class-save="evidence"]').click();
  await expert1.waitForFunction(()=>document.querySelector('.classroom-input textarea')?.value?.length>0);
  assert.match(get(1,'r0member1').field_value,/مشاهده شد/);
  await teacher.locator('[data-class-next]').click();
  await expert1.evaluate(()=>window.AlborzLive.refresh());
  assert.match(await expert1.locator('.classroom-section-title').innerText(),/جمع‌بندی/);
  await teacher.locator('[data-class-next]').click();
  assert.equal(get(1,'classroomPhase').field_value,2,'instructor begins next independent round');
  assert(nextCalls>=10,'server-controlled step changes saved across all phones');
  await teacher.screenshot({path:'artifacts/alborz-resilience/classroom-teacher-'+width+'.png',fullPage:true});
  await expert1.screenshot({path:'artifacts/alborz-resilience/classroom-participant-'+width+'.png',fullPage:true});
  for(const p of [teacher,expert1,expert2])assert(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'no horizontal overflow '+width);
  assert.deepEqual(errors,[],'no browser exceptions in coordinated classroom');
  console.log('PASS guided classroom '+width+'px: roster 3/6, PIN mapping, teacher progress, independent groups, decision & feedback sync, new round');
  await ctx.close();
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
})();