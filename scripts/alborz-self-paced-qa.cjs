'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const name=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!name.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(name,(err,buf)=>{res.statusCode=err?404:200;res.setHeader('content-type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/html');res.end(err?'not found':buf);});
});
(async()=>{
 await new Promise(ok=>server.listen(4197,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1366]){
   const ctx=await browser.newContext({viewport:{width,height:880}}),data=new Map(),errors=[];
   const set=(team,key,value)=>{const id=team+':'+key,old=data.get(id),r={team_no:team,field_key:key,field_value:value,version:(old?.version||0)+1};data.set(id,r);return r;};
   const list=team=>Array.from(data.values()).filter(x=>x.team_no===team);
   await ctx.route('**/functions/v1/alborz-workshop-sync',async route=>{
    const req=route.request().postDataJSON(),action=req.action,token=req.code||'';
    let body={ok:true},status=200;
    if(action==='login'){
      const team=token==='0002000024'||token==='session-g2'?2:1;
      body={identity:{role:'team',team,member:1},session:'session-g'+team};
    }else if(action==='read'){
      body={records:list(req.team),classroom:{phase:1,round:0,version:1}};
    }else if(action==='write'){
      const entries=Object.entries(req.fields||{}),conflict=entries.some(([k])=>(data.get(req.team+':'+k)?.version||0)!==req.expected[k]);
      if(conflict){status=409;body={error:'version conflict'};}
      else body={records:entries.map(([k,v])=>set(req.team,k,v))};
    }else if(action==='logout'){body={ok:true};}
    else {status=400;body={error:'Unexpected '+action};}
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
   });
   const p1=await ctx.newPage(),p2=await ctx.newPage();
   for(const p of [p1,p2])p.on('pageerror',e=>errors.push(e.message));
   const base='http://127.0.0.1:4197/alborz-communication-skills/resilience.html?classroom=1&group=';
   async function enter(page,team,code){
    await page.goto(base+team,{waitUntil:'load'});
    await page.locator('#live-code').fill(code);
    await page.locator('#live-join').click();
    await page.locator('.classroom-welcome').waitFor({timeout:15000});
   }
   await enter(p1,1,'0001000012');
   await enter(p2,2,'0002000024');
   assert.equal(await p1.locator('.classroom-welcome').count(),1,'team identity and check-in visible');
   assert.equal(await p1.locator('[data-team-next]').isDisabled(),true,'check-in before next step');
   await p1.locator('[data-class-checkin]').click();
   await p1.locator('[data-class-checkin]:disabled').waitFor();
   await p1.locator('[data-team-next]').click();
   await p1.locator('.classroom-strategy-comparison').waitFor();
   assert.equal(await p1.locator('.contrast-item').count(),4,'each strategy has a contrast card');
   assert.equal(await p1.locator('.classroom-hero-figure img').count(),1,'approved image displayed');
   await p1.locator('[data-team-next]').click();
   await p1.locator('[data-class-mission="0"]').waitFor();
   await p1.locator('[data-class-mission="0"]').click();
   await p1.locator('[data-class-consensus-check]').check();
   await p1.locator('[data-class-confirm-mission]').click();
   await p1.locator('.classroom-choice-confirmed').waitFor();
   assert.equal(data.get('1:missionChoice')?.field_value,0,'group one chooses camel without instructor');
   await p1.locator('[data-team-next]').click();
   await p1.locator('.classroom-story').waitFor();
   assert.equal(await p1.locator('.classroom-personal-lens').count(),1,'one compact personal resilience guide per case');
   assert.equal(await p1.locator('.classroom-personal-lens li').count(),4,'standard 4 elements: stressor, action, professional boundary, recovery');
   await p1.locator('.classroom-personal-lens summary').click();
   assert.equal(await p1.locator('.classroom-personal-lens').getAttribute('open'),'','case guide opens without cluttering default view');
   await p1.waitForFunction(()=>{const img=document.querySelector('.classroom-case-image');return img&&img.complete&&img.naturalWidth>0;},{},{timeout:12000});
   assert.equal(await p1.locator('.classroom-case-image').count(),1,'original claims illustration loads');
   assert.equal(data.get('1:teamPhase')?.field_value,3,'group advances itself to scenario');
   assert.equal(data.get('2:teamPhase'),undefined,'second group remains independent');
   await p2.locator('[data-class-checkin]').click();
   await p2.locator('[data-class-checkin]:disabled').waitFor();
   await p2.locator('[data-team-next]').click();
   await p2.locator('[data-team-next]').click();
   await p2.locator('[data-class-mission="2"]').click();
   await p2.locator('[data-class-consensus-check]').check();
   await p2.locator('[data-class-confirm-mission]').click();
   await p2.locator('.classroom-choice-confirmed').waitFor();
   assert.equal(data.get('2:missionChoice')?.field_value,2,'group two chooses chameleon independently');
   await p1.evaluate(async()=>{
     await window.AlborzLive.request({action:'write',team:1,fields:{r0initial:'ثبت تصمیم اولیه گروه برای پرونده خسارت',r0revision:'تصمیم اصلاح‌شده پس از داده تازه',r0member1:'اقدام قابل پیگیری گروه در شعبه'},expected:{r0initial:0,r0revision:0,r0member1:0}});
     await window.AlborzLive.refresh();
   });
   for(let st=3;st<10;st++){
      await p1.locator('[data-team-next]').click();
      await p1.waitForFunction(v=>document.querySelector('.class-stage-marker')?.textContent.includes('مرحله '+new Intl.NumberFormat('fa-IR').format(v+1)),st+1);
      if(st===3)assert.equal(await p1.locator('.mastery-person').count(),5,'five role cards for scenario');
      if(st===4){assert.equal(await p1.locator('.mastery-turn.effective').count(),12,'twelve natural dialogue turns');assert.equal(await p1.locator('.mastery-weak-dialog').count(),1,'before/after dialogue available');assert.equal(await p1.locator('.mastery-final-analysis li').count()>=8,true,'observer checklist plus debrief');}
   }
   assert.equal(data.get('1:teamPhase')?.field_value,10,'all eleven steps traversed without teacher');
   await p1.reload({waitUntil:'load'});
   await p1.locator('[data-team-restart]').waitFor({timeout:12000});
   p1.once('dialog',d=>d.accept());
   await p1.locator('[data-team-restart]').click();
   await p1.locator('[data-class-mission="1"]').waitFor();
   assert.equal(data.get('1:teamRound')?.field_value,1,'next mission round starts independently');
   assert.equal(await p1.locator('[data-class-mission="0"]').isDisabled(),true,'completed mission is not repeated');
   assert.deepEqual(errors,[],'no browser runtime errors');
   await ctx.close();
   console.log('PASS independent 11 steps, multiple mission rounds, same-group relogin, roleplay & readable UI width='+width);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
