import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin='http://127.0.0.1:4173';
const dir='artifacts/business-pwa-install';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
const sites=[
 {name:'Business Model Canvas',slug:'business-model-canvas',entry:'studio.html',headline:'بوم کسب‌وکار'},
 {name:'Small Business',slug:'small-business',entry:'index.html',headline:'راه‌اندازی و رشد کسب‌وکار'},
 {name:'OKR service guide',slug:'okr-service',entry:'index.html',headline:'اهداف و نتایج کلیدی'}
];
const results=[],issues=[],ids=[];
function record(name,pass,reason=''){const item={name,pass,reason};results.push(item);console.log((pass?'PASS ':'FAIL ')+name+(reason?' — '+reason:''))}
for(const site of sites){
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'fa-IR'});
 const page=await ctx.newPage();
 page.on('pageerror',error=>issues.push(site.name+': '+error.message));
 try{
  const base=origin+'/'+site.slug+'/';
  const response=await page.goto(base+'install.html',{waitUntil:'load',timeout:22000});
  assert(response?.ok(),'Installer not served');
  assert((await page.locator('h1').innerText()).includes(site.headline),'Wrong installer identity');
  const manifest=await page.evaluate(async()=>{const rel=document.querySelector('link[rel=manifest]')?.href;if(!rel)return null;const r=await fetch(rel);return{url:rel,status:r.status,body:await r.json()}});
  assert(manifest?.status===200,'Manifest unavailable');
  assert.equal(manifest.body.display,'standalone');
  const id=new URL(manifest.body.id||manifest.body.start_url,manifest.url).href;
  const start=new URL(manifest.body.start_url,manifest.url).href;
  const scope=new URL(manifest.body.scope,manifest.url).href;
  assert(start===base+site.entry,'Wrong start URL: '+start);
  assert(scope===base,'Wrong manifest scope: '+scope);
  ids.push(id);
  for(const dim of [192,512]){
   const icon=manifest.body.icons.find(x=>x.sizes===dim+'x'+dim);
   assert(icon,'Missing '+dim+'px PNG icon in manifest');
   const src=new URL(icon.src,manifest.url).href;
   assert(src.startsWith(base),'Icon outside app scope: '+src);
   const check=await page.evaluate(async url=>{
     const response=await fetch(url,{cache:'reload'});
     if(!response.ok)return{status:response.status};
     const buffer=await response.arrayBuffer();
     const bytes=new Uint8Array(buffer.slice(0,24));
     const image=new Image();
     image.src=url;
     let decoded=false;try{await image.decode();decoded=true}catch(e){}
     return{status:response.status,magic:[...bytes.slice(0,8)],width:new DataView(buffer).getUint32(16),height:new DataView(buffer).getUint32(20),decoded,natural:[image.naturalWidth,image.naturalHeight],length:buffer.byteLength};
   },src);
   assert.deepEqual(check.magic,[137,80,78,71,13,10,26,10],'PNG signature wrong');
   assert.equal(check.width,dim,'PNG width incorrect');
   assert.equal(check.height,dim,'PNG height incorrect');
   assert(check.decoded,'Browser could not decode icon '+dim+': '+JSON.stringify(check));
   record(site.name+' icon '+dim+'px',true,'decoded and loaded');
  }
  const sw=await page.evaluate(async()=>{
    if(!('serviceWorker' in navigator))return null;
    return Promise.race([
      navigator.serviceWorker.ready.then(x=>({scope:x.scope,state:x.active?.state})),
      new Promise(resolve=>setTimeout(()=>resolve({timeout:true}),10000))
    ]);
  });
  assert(sw && !sw.timeout && sw.state==='activated','Service worker not active: '+JSON.stringify(sw));
  assert.equal(sw.scope,base,'Service worker scope leaked');
  await page.locator('#install').click();
  const status=await page.locator('#status').innerText();
  assert(status.includes('منوی')||status.includes('نصب'),'No accessible installation guidance');
  const launcher=page.locator(site.slug==='okr-service'?'a[href="./index.html"]':'a.alt');
  const label=await launcher.getAttribute('href');
  assert.equal(label,'./'+site.entry,'Landing link not in same app');
  await launcher.click();
  await page.waitForURL(base+site.entry,{timeout:10000});
  await page.locator('body').waitFor();
  assert((await page.locator('body').innerText()).includes(site.slug==='okr-service'?'اهداف و نتایج کلیدی':site.name==='Business Model Canvas'?'بوم':'کسب‌وکار'),'App page failed');
  await page.screenshot({path:path.join(dir,site.slug+'.png'),fullPage:true});
  record(site.name+' installation page, manifest, scoped service worker, and correct app',true);
 }catch(error){
  record(site.name+' browser installability',false,error.stack||String(error));
  await page.screenshot({path:path.join(dir,'FAIL-'+site.slug+'.png'),fullPage:true}).catch(()=>{});
 }finally{await ctx.close()}
}
try{assert.equal(new Set(ids).size,3,'Installed app IDs collide');record('Three apps have unique install IDs',true,ids.join(' / '))}
catch(e){record('Three apps have unique install IDs',false,e.message)}
{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
 const page=await ctx.newPage();page.on('pageerror',error=>issues.push('catalog: '+error.message));
 try{
  const response=await page.goto(origin+'/downloads/install.html',{waitUntil:'domcontentloaded'});
  assert(response?.ok());
  assert.equal(await page.locator('a[href="../business-model-canvas/install.html"]').count(),1);
  assert.equal(await page.locator('a[href="../small-business/install.html"]').count(),1);
  assert.equal(await page.locator('a[href="../okr-service/install.html"]').count(),1);
  assert.equal(await page.locator('a[href$=".apk"]').count(),0,'Unsafe APK promoted as primary download');
  assert.equal(await page.locator('a[href$=".zip"]').count(),0,'APK ZIP sideload promoted');
  record('Public app installer directory routes to safe PWA installation',true);
 }catch(error){record('Public app installer directory',false,error.stack||String(error))}
 finally{await ctx.close()}
}
await browser.close();
const summary={passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,issues,results};
await fs.writeFile(path.join(dir,'summary.json'),JSON.stringify(summary,null,2));
console.log('SUMMARY',JSON.stringify({passed:summary.passed,failed:summary.failed,issues:summary.issues},null,2));
if(summary.failed||issues.length)process.exitCode=1;
