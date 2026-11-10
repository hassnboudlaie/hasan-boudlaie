'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const name=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!name.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(name,(err,bytes)=>{res.statusCode=err?404:200;res.setHeader('content-type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/html');res.end(err?'not found':bytes);});
});
(async()=>{
  await new Promise(resolve=>server.listen(4198,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    for(const width of [390,1366]){
      const ctx=await browser.newContext({viewport:{width,height:890}}),err=[];
      await ctx.route('**/functions/v1/alborz-workshop-sync',async route=>{
        let req=route.request().postDataJSON(),body={ok:true},status=200;
        if(req.action==='login'){body={identity:{role:'teacher',team:null,member:null},session:'teacher-demo-session'};}
        else if(req.action==='teacher'){body={records:[],assignedCounts:Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,0]))};}
        else if(req.action==='logout'){body={ok:true};}
        else if(req.action==='classroom'){body={ok:true,records:[],classroom:{phase:req.phase,round:0}};}
        else{status=400;body={error:'Mock does not support '+req.action};}
        await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
      });
      const page=await ctx.newPage();page.on('pageerror',e=>err.push(e.message));
      await page.clock.install();
      const url='http://127.0.0.1:4198/alborz-communication-skills/resilience.html?classroom=1&teacher=1';
      await page.goto(url,{waitUntil:'load'});
      assert.equal(await page.locator('#alborz-facilitator-timer').count(),0,'Timer not shown before instructor authenticates');
      await page.locator('#live-code').fill('0012345678');
      await page.locator('#live-join').click();
      await page.locator('#alborz-facilitator-timer .timer-launch').waitFor({timeout:15000});
      assert.equal(await page.locator('#alborz-facilitator-timer').count(),1);
      assert.equal(await page.locator('[data-class-team-size],[data-class-confirm]').count(),0,'legacy manual group approval controls removed from teacher view');
      const identities=await page.evaluate(()=>({
        names:window.AlborzWorkshop.catalog.models.map(x=>x[1]),
        lengths:window.AlborzWorkshop.catalog.mastery.map(x=>x.after.length),
        people:window.AlborzWorkshop.catalog.mastery.map(x=>x.people.length),
        prompts:window.AlborzWorkshop.catalog.cases.map(x=>x.individualQuestions.length),
        quiz:window.AlborzWorkshop.catalog.professionalQuiz.length,
        answers:window.AlborzWorkshop.catalog.professionalQuiz.map(q=>q.options.findIndex(x=>x.correct))
      }));
      assert.deepEqual(identities.names,['شتر','ماهی آزاد','آفتاب‌پرست','اختاپوس'],'animal scenario identity preserved');
      assert.deepEqual(identities.lengths,[12,12,12,12],'each scenario has 12 dialogue turns');
      assert.deepEqual(identities.people,[5,5,5,5],'five clear roles in each scenario');
      assert.deepEqual(identities.prompts,[3,3,3,3],'personal-pressure reflection prompts in all scenarios');
      assert.equal(identities.quiz,10,'ten scenario-aligned quiz questions preserved');
      assert.equal(new Set(identities.answers).size,3,'multiple-choice answer key uses all option positions');
      await page.locator('[data-timer-compact]').click();
      await page.locator('#alborz-timer-panel').waitFor({state:'visible'});
      assert.equal(await page.locator('[data-timer-preset]').count(),4);
      await page.locator('[data-timer-action="view"]').click();
      assert.equal(await page.locator('#alborz-facilitator-timer').evaluate(n=>n.classList.contains('timer-projector')),true,'projector view available');
      await page.locator('[data-timer-action="view"]').click();
      assert.equal(await page.locator('#alborz-facilitator-timer').evaluate(n=>n.classList.contains('timer-projector')),false,'projector view reversible');
      await page.locator('[data-timer-action="sound"]').click();
      await page.locator('[data-timer-preset="60"]').click();
      await page.locator('[data-timer-action="toggle"]').click();
      assert.equal((await page.evaluate(()=>window.AlborzFacilitatorTimer.getState())).running,true);
      await page.clock.fastForward(10000);
      assert.equal((await page.evaluate(()=>window.AlborzFacilitatorTimer.getState())).remaining,50,'absolute-time countdown should advance 10 seconds');
      await page.locator('[data-timer-action="toggle"]').click();
      await page.clock.fastForward(5000);
      assert.equal((await page.evaluate(()=>window.AlborzFacilitatorTimer.getState())).remaining,50,'pause should freeze timer');
      await page.locator('[data-timer-action="toggle"]').click();
      await page.reload({waitUntil:'load'});
      await page.locator('#alborz-facilitator-timer').waitFor({timeout:15000});
      assert.equal((await page.evaluate(()=>window.AlborzFacilitatorTimer.getState())).running,true,'timer should persist across instructor reload');
      await page.clock.fastForward(51000);
      await page.waitForFunction(()=>window.AlborzFacilitatorTimer.getState().finished);
      assert.equal((await page.evaluate(()=>window.AlborzFacilitatorTimer.getState())).remaining,0);
      await page.locator('[data-timer-compact]').click();
      assert.equal(await page.locator('#alborz-timer-done').isVisible(),true,'ending alert should be visible');
      await page.locator('[data-timer-action="reset"]').click();
      assert.equal((await page.evaluate(()=>window.AlborzFacilitatorTimer.getState())).finished,false,'reset clears finish state');
      await page.locator('#alborz-timer-minutes').fill('7');
      await page.locator('.timer-custom button[type="submit"]').click();
      assert.equal((await page.evaluate(()=>window.AlborzFacilitatorTimer.getState())).duration,420,'custom 7 minute timer');
      const horizontal=await page.evaluate(()=>({width:document.documentElement.scrollWidth,screen:innerWidth}));
      assert(horizontal.width<=horizontal.screen+2,'no horizontal overflow on '+width+'px viewport');
      const participant=await ctx.newPage();participant.on('pageerror',e=>err.push(e.message));
      await participant.goto('http://127.0.0.1:4198/alborz-communication-skills/resilience.html?classroom=1',{waitUntil:'load'});
      assert.equal(await participant.locator('#alborz-facilitator-timer').count(),0,'timer does not appear in participant view');
      assert.deepEqual(err,[],'no browser console page errors');
      await ctx.close();
      console.log('PASS floating teacher timer + individualized 4 scenarios on width='+width);
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
