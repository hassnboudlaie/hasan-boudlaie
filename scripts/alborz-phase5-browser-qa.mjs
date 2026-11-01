// Alborz / Phase 5: independent Chromium E2E against localhost.
// This is Chromium mobile emulation, NOT a physical Android/phone approval.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputs=path.join(root,'artifacts','alborz-phase5');
fs.mkdirSync(outputs,{recursive:true});
const checks=[],screenshots=[];
const test=(name,ok,detail='')=>checks.push({name,pass:!!ok,detail});
const server=createServer((req,res)=>{
 try{
  const uri=new URL(req.url,'http://localhost'),relative=decodeURIComponent(uri.pathname).replace(/^\/+/,'');
  const p=path.resolve(root,relative);
  if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  const st=fs.statSync(p);
  if(!st.isFile()){res.writeHead(404);res.end('Not found');return}
  const mime=p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.js')?'application/javascript; charset=utf-8':p.endsWith('.css')?'text/css; charset=utf-8':p.endsWith('.woff2')?'font/woff2':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.png')?'image/png':p.endsWith('.jpg')||p.endsWith('.jpeg')?'image/jpeg':'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'});
  fs.createReadStream(p).pipe(res);
 }catch(e){res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const address=server.address();
const base='http://127.0.0.1:'+address.port+'/alborz-communication-skills/session2-demo.html?release=s12-r8-20261101';
let browser;
try{
 browser=await chromium.launch({headless:true});
 const desktop=await browser.newContext({viewport:{width:1366,height:900}});
 const qaPage=await desktop.newPage();
 await qaPage.goto(base+'&qaAudit=all',{waitUntil:'load',timeout:120000});
 await qaPage.waitForFunction(()=>window.ALBORZ_AUDIT_RESULT!==undefined,{timeout:90000});
 const audit=await qaPage.evaluate(()=>window.ALBORZ_AUDIT_RESULT);
 test('Chromium E2E: 332 six-stage and roleplay checks',audit?.status==='PASS'&&audit?.checks===332&&audit?.passed===332,JSON.stringify({checks:audit?.checks,passed:audit?.passed,failed:audit?.failed}));
 for(const [k,v] of Object.entries({stages:60,insights:40,capstones:40,capstoneOptions:120,thinkingQuestions:30,thinkingOptions:90,dialogues:10,guideTurns:248,focusedTurns:21})){
  test('Live runtime metric '+k,audit?.metrics?.[k]===v,String(audit?.metrics?.[k]));
 }
 await qaPage.screenshot({path:path.join(outputs,'01-browser-audit.png'),fullPage:true});
 screenshots.push('01-browser-audit.png');
 const mobile=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2.5});
 const page=await mobile.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>window.ALBORZ_RELEASE?.id==='s12-r8-20261101',{timeout:15000});
 const general=await page.evaluate(()=>{
  window.go('catalog');
  return {dir:document.documentElement.dir,lang:document.documentElement.lang,techniques:document.querySelectorAll('.tech-card.lab-tech').length,navigation:document.querySelectorAll('.quicknav .back').length};
 });
 test('Mobile: RTL and Persian',general.lang==='fa'&&general.dir==='rtl');
 test('Mobile: 10 techniques',general.techniques===10);
 test('Mobile: 3 navigation actions',general.navigation===3);
 const covers=await page.evaluate(async()=>{
  const imgs=[...document.querySelectorAll('.alborz-tech-cover img')];
  imgs.forEach(img=>img.loading='eager');
  await Promise.race([Promise.all(imgs.map(img=>new Promise(resolve=>{
   if(img.complete)return resolve();
   img.addEventListener('load',resolve,{once:true});
   img.addEventListener('error',resolve,{once:true});
  }))),new Promise(resolve=>setTimeout(resolve,10000))]);
  return {count:imgs.length,loaded:imgs.filter(img=>img.complete&&img.naturalWidth>0).length};
 });
 test('Mobile: ten catalogue photos decode',covers.count===10&&covers.loaded===10,JSON.stringify(covers));
 await page.screenshot({path:path.join(outputs,'02-mobile-catalog-390.png'),fullPage:true});
 screenshots.push('02-mobile-catalog-390.png');
 for(let t=1;t<=10;t++){
  const r=await page.evaluate(t=>{
   window.openAdvancedTech(t-1);
   const count=document.querySelectorAll('.stage-grid .stage-card').length;
   window.go('stage',4);
   const dialogue=document.querySelectorAll('.speech').length;
   const guidance=document.querySelectorAll('.performance-guide').length;
   const focused=document.querySelectorAll('.performance-focus').length;
   const scriptControls=document.querySelectorAll('.scriptbar .tab').length;
   const copyGone=!document.querySelector('.scriptbar')?.textContent.includes('کپی متن');
   window.go('stage',7);
   const keys=document.querySelectorAll('.alborz-key-trigger').length;
   window.toggleAlborzMessage(t,0);
   const expanded=document.querySelectorAll('.alborz-key-detail:not([hidden])').length;
   window.go('stage',5);
   const quizCount=document.querySelectorAll('.alborz-capstone-question').length;
   const preFeedback=document.querySelectorAll('.alborz-quiz-feedback').length;
   return {count,dialogue,guidance,focused,scriptControls,copyGone,keys,expanded,quizCount,preFeedback,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  },t);
  test('Mobile: technique '+t+' six stages, 4 clickable messages, and 4 unspoiled quizzes',r.count===6&&r.dialogue>=20&&r.guidance===r.dialogue&&r.focused>=2&&r.scriptControls===4&&r.copyGone&&r.keys===4&&r.expanded===1&&r.quizCount===4&&r.preFeedback===0,JSON.stringify(r));
  test('Mobile: technique '+t+' no horizontal clipping',r.overflow<=6,'overflow='+r.overflow);
  if(t===1){
   await page.screenshot({path:path.join(outputs,'03-mobile-final-quiz-390.png'),fullPage:true});
   screenshots.push('03-mobile-key-message-390.png');
  }
 }
 test('Mobile: no script exceptions',errors.length===0,errors.join('; '));
 await mobile.close();
 const wideMobile=await browser.newContext({viewport:{width:980,height:740},screen:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2.5,userAgent:'Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36'});
 const wc=await wideMobile.newPage();
 await wc.goto(base,{waitUntil:'load',timeout:30000});
 const simulated=await wc.evaluate(()=>{
  window.openAdvancedTech(0);window.go('stage',4);
  return {viewport:innerWidth,screen:{width:screen.width,height:screen.height},active:document.documentElement.classList.contains('touch-desktop-mode'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
 });
 test('Desktop Site emulation: no horizontal clipping',simulated.overflow<=6,JSON.stringify(simulated));
 if(simulated.viewport>=700)test('Desktop Site emulation: adaptive mode',simulated.active,JSON.stringify(simulated));
 await wc.screenshot({path:path.join(outputs,'04-touch-desktop-simulation.png'),fullPage:true});
 screenshots.push('04-touch-desktop-simulation.png');
 await wideMobile.close();
 await desktop.close();
} catch(e){
 test('E2E execution',false,String(e?.stack||e));
} finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
const failed=checks.filter(x=>!x.pass);
const report={testSuite:'Alborz Phase 5 — Chromium E2E',status:failed.length?'FAIL':'PASS',passed:checks.length-failed.length,failed:failed.length,checks:checks.length,failures:failed,screenshots,scope:'Local HTTP served from actual committed release; simulated desktop/mobile Chromium. NOT verified on physical handset, nor live GitHub Pages deployment.'};
fs.writeFileSync(path.join(outputs,'report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(failed.length)process.exitCode=1;
