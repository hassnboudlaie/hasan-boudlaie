const {spawn}=require('node:child_process'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),port=4396,base='http://127.0.0.1:'+port+'/alborz-communication-skills/';
const output=path.join(root,'artifacts','alborz-poster-session4');
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
(async()=>{
for(let i=0;i<30;i++){try{await new Promise((resolve,reject)=>{const q=http.get(base+'index.html',r=>{r.resume();r.statusCode===200?resolve():reject()});q.on('error',reject);q.setTimeout(2000,()=>q.destroy());});break}catch{await new Promise(r=>setTimeout(r,200));}}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const p=await browser.newPage({viewport:{width:430,height:900},deviceScaleFactor:2});
await p.goto(base+'index.html?m=4',{waitUntil:'networkidle'});
await p.locator('.s4-root').waitFor();
const save=async name=>{await p.screenshot({path:path.join(output,name+'.png'),fullPage:false});console.log('captured '+name)};
await save('01-home');
await p.locator('[data-s4-open="techniques"]').first().click();await save('02-techniques');
await p.locator('.s4-tech').first().click();await save('03-technique');
await p.locator('[data-s4-open="practice"]').first().click();await save('04-roleplay-groups');
await p.locator('[data-s4-group="0"]').first().click();await save('05-scenarios');
await p.locator('.s4-case').first().click();await save('06-case-conversation');
await p.locator('[data-s4-open="exam"]').first().click();await save('07-final-exam');
await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill('SIGTERM'));