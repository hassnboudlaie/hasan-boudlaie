'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const BASE=process.env.SABA_BASE_URL||'http://127.0.0.1:4173/sabanaft/app/';
const OUT=path.resolve('artifacts/saba-impeccable');fs.mkdirSync(OUT,{recursive:true});
const report={base:BASE,cases:[],failures:[],engines:[],limitations:['Physical devices and screen readers not tested; axe is not WCAG certification.']};
const check=(ok,msg)=>{if(!ok)report.failures.push(msg);};
async function scan(page,name){
 await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
 const issues=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
 const metrics=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,heading:document.querySelector('.view.active h1')?.textContent}));
 report.cases.push({name,...metrics,issues});check(metrics.overflow<=1,name+' overflow '+metrics.overflow);
 for(const v of issues)if(['serious','critical'].includes(v.impact))check(false,name+' '+JSON.stringify(v));
 await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:true});
}
(async()=>{
 try{
 for(const [engine,type,widths] of [['chromium',chromium,[360,390,768,1366,1536]],['webkit',webkit,[390,1366]]]){
 const browser=await type.launch({headless:true});report.engines.push(engine);
 for(const width of widths){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['home','course','session/1','coach','passport','journey']){
 await page.goto(BASE+'#/'+route,{waitUntil:'load'});
 await scan(page,engine+'-'+width+'-'+route.replace('/','-'));
 }
 await page.goto(BASE+'#/home');
 await page.locator('.saba-tabbar [data-go="course"]').click();
 await page.waitForFunction(()=>document.activeElement?.matches('.view.active h1'));
 check(await page.locator('#courseView').isVisible(),engine+' route destination');
 if(width<1460){
 await page.locator('#modelNavToggle').click();
 check(await page.locator('#main').evaluate(n=>n.inert),engine+' drawer background inert');
 await page.locator('#modelNavClose').press('Shift+Tab');
 check(await page.locator('#modelSideNav').evaluate(n=>n.contains(document.activeElement)),engine+' drawer focus containment');
 await page.keyboard.press('Escape');
 check(await page.locator('#modelNavToggle').evaluate(n=>document.activeElement===n),engine+' drawer return focus');
 }else{
 await page.locator('#modelSideNav [data-go="context"]').click();check(await page.locator('#contextView').isVisible(),'wide desktop sidebar interaction');
 }
 await page.goto(BASE+'#/coach');
 await page.locator('#cj-situation').fill('برای روشن شدن مرز اختیار در تیم، گفت‌وگو و اقدام مشخصی می‌خواهم.');
 await page.reload();check((await page.locator('#cj-situation').inputValue()).includes('مرز اختیار'),engine+' draft persistence');
 await page.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Quota','QuotaExceededError')};});
 await page.locator('#cj-situation').fill('این پیش‌نویس هنگام خطای ذخیره باید روی صفحه باقی بماند.');
 check(await page.locator('#cj-save-warning').isVisible(),engine+' storage warning');
 await page.evaluate(()=>{Storage.prototype.setItem=window.__setItem;});await page.locator('#cj-retry-save').click();
 check(!await page.locator('#cj-save-warning').isVisible(),engine+' storage retry');
 if(engine==='chromium'&&width===390){
 await page.goto(BASE+'#/journey');await page.locator('[data-lj="startCompetitive"]').click();await page.locator('[data-lj="hint"]').click();
 await scan(page,'chromium-coach-dialog');await page.keyboard.press('Escape');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();
 await context.setOffline(true);await page.reload({waitUntil:'load'});
 check(await page.locator('#journeyRoot').isVisible(),'offline journey');await context.setOffline(false);
 await page.goto(BASE+'#/course');await page.evaluate(()=>document.documentElement.style.zoom='2');await scan(page,'chromium-text-zoom-200');
 }
 check(!errors.length,engine+' '+width+' JS errors '+errors.join('|'));await context.close();
 }
 await browser.close();
 }
 }catch(e){report.failures.push(e.stack||String(e));}
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));process.exitCode=report.failures.length?1:0;
})();
