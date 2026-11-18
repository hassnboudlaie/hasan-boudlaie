"use strict";
/* Cloudflare AI pilot: offline security and UI integration tests (no real network/cost). */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
const {createHash} = require("node:crypto");
const {JSDOM} = require("jsdom");
const root = __dirname, workerFile = path.join(root,"backend/cloudflare/src/index.mjs");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const ORIGIN="https://hassnboudlaie.github.io";
(async()=>{
 const handler = (await import(pathToFileURL(workerFile).href)).default;
 const accessCode="snp_"+ "ab".repeat(32);
 const hash=createHash("sha256").update(accessCode).digest("hex");
 let active=1, expired=false, quotas=0, modelCalls=0, leaked=false, lastModel=null;
 const db={
  prepare(sql) {
   return {bind(...values){
    return {async first(){
     if(sql.includes("FROM pilot_access")) {
      if(values[0]!==hash)return null;
      return active ? {user_id:"pilot-manager-1",display_name:"مدیر آزمایشی",expires_at:expired?"2025-01-01T00:00:00Z":"2030-01-01T00:00:00Z"} : null;
     }
     if(sql.includes("INSERT INTO coach_quota")) {
      assert.equal(values[0],"pilot-manager-1");
      quotas++;
      return quotas <= 12 ? {hour_hits:quotas,day_hits:quotas}:null;
     }
     leaked=true;throw Error("unrecognized SQL");
    }};
   }};
  }
 };
 const env={DB:db,AI:{async run(model, data){
  assert.equal(model,"@cf/google/gemma-4-26b-a4b-it");
  assert.equal(data.store,false);
  assert.equal(data.chat_template_kwargs.enable_thinking,false);
  assert.ok(data.messages[0].content.includes("competitive_locked"));
  assert.equal(data.messages[0].role,"system");
  modelCalls++;lastModel=data;
  return {response:"بر اساس متن شما، یک نقطه قابل بهبود شفاف‌سازی شاخص نتیجه است."};
 }}};
 const request=(method,url,code,origin=ORIGIN,body)=>{
  const h={"origin":origin};if(code)h.authorization="Bearer "+code;
  if(body!==undefined)h["content-type"]="application/json";
  return new Request("https://saba-leadership-coach-pilot.example.workers.dev"+url,{method,headers:h,
   ...(body===undefined?{}:{body:typeof body==="string"?body:JSON.stringify(body)})});
 };
 const send=async r=>handler.fetch(r,env);
 assert.equal((await send(request("GET","/health"))).status,200);
 assert.equal((await send(request("OPTIONS","/v1/coach",null,"https://evil.example"))).status,403);
 assert.equal((await send(request("GET","/v1/session"))).status,401);
 assert.equal((await send(request("GET","/v1/session","snp_"+ "cc".repeat(32)))).status,401,"unknown code must be denied");
 assert.equal((await send(request("GET","/v1/session",accessCode,"https://evil.example"))).status,403);
 assert.equal((await send(request("GET","/v1/session",accessCode))).status,200);
 active=0;assert.equal((await send(request("GET","/v1/session",accessCode))).status,401);active=1;
 expired=true;assert.equal((await send(request("GET","/v1/session",accessCode))).status,401);expired=false;
 const payload={mode:"review",question:"نوشته من چه ایرادی دارد؟",draft:"من مسئول نتیجه را مشخص می‌کنم.",context:{area:"journey",stageNumber:3,assessmentMode:"competitive_locked",criteria:["شاخص"]},consent:true};
 assert.equal((await send(request("POST","/v1/coach",null,ORIGIN,payload))).status,401);
 assert.equal((await send(request("POST","/v1/coach",accessCode,ORIGIN,{...payload,consent:false}))).status,403);
 assert.equal((await send(request("POST","/v1/coach",accessCode,ORIGIN,{...payload,draft:""}))).status,400);
 assert.equal((await send(request("POST","/v1/coach",accessCode,ORIGIN,"x".repeat(17000)))).status,413);
 const success=await send(request("POST","/v1/coach",accessCode,ORIGIN,payload));
 assert.equal(success.status,200);assert.match((await success.json()).answer,/شاخص/);
 assert.ok(lastModel.messages[1].content.includes("competitive_locked"));
 assert.equal(success.headers.get("access-control-allow-origin"),ORIGIN);
 assert.equal(success.headers.get("cache-control"),"no-store");
 for(let i=1;i<12;i++)assert.equal((await send(request("POST","/v1/coach",accessCode,ORIGIN,payload))).status,200);
 assert.equal((await send(request("POST","/v1/coach",accessCode,ORIGIN,payload))).status,429);
 assert.equal(modelCalls,12);assert.equal(leaked,false);

 // Verify the actual universal PWA client works with a Cloudflare free-pilot endpoint.
 const dom=new JSDOM("<!doctype html><html lang='fa' dir='rtl'><body></body></html>",{
  url:ORIGIN+"/hasan-boudlaie/sabanaft/app/#/studio/daily",runScripts:"outside-only",pretendToBeVisual:true
 });
 const w=dom.window;
 w.SABA_AI_CONFIG={provider:"cloudflare",endpoint:"https://saba-leadership-coach-pilot.username.workers.dev/v1/coach",publishableKey:""};
 let clientSession=0,clientCoach=0,clientUnauthorized=0;
 w.fetch=async (url,options)=>{
  if(String(url).endsWith("/v1/session")){clientSession++;assert.equal(options.headers.Authorization,"Bearer "+accessCode);return {ok:true,json:async()=>({authenticated:true})}}
  if(String(url).endsWith("/v1/coach")){
   clientCoach++;assert.equal(options.headers.Authorization,"Bearer "+accessCode);
   assert.ok(options.body.includes('"consent":true'));
   assert.ok(!("apikey" in options.headers));
   return {ok:true,json:async()=>({answer:"فیدبک آزمایشی Live AI"})};
  }
  clientUnauthorized++;throw Error("Unexpected external call");
 };
 w.eval(read("app/leadership-ai-coach.js"));w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
 const $=id=>w.document.getElementById(id);
 assert.equal($("sabaAiAuth").hidden,false);
 assert.equal($("sabaAiPilotAuth").hidden,false);
 assert.equal($("sabaAiSupabaseAuth").hidden,true);
 $("sabaAiFab").click();
 $("sabaAiQuestion").value="چه پیشرفتی در شیوه رهبری من لازم است؟";
 $("sabaAiSend").click();
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.equal(clientCoach,0,"no model request without authorization/consent");
 $("sabaAiPilotCode").value=accessCode;$("sabaAiSignIn").click();
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.equal(clientSession,1);
 $("sabaAiQuestion").value="پرسش جدید بازاندیشی من چیست؟";
 $("sabaAiConsent").checked=true;
 $("sabaAiSend").click();
 await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(clientCoach,1);
 assert.equal(clientUnauthorized,0);
 assert.match($("sabaAiLog").textContent,/فیدبک آزمایشی/);
 $("sabaAiLogout").click();
 assert.equal(w.sessionStorage.getItem("saba_ai_session_v1"),null);
 dom.window.close();
 assert.match(read("app/ai-config.js"),/endpoint:\s*""/,"public app must remain disabled until valid deployment URL");
 assert.match(read("backend/cloudflare/schema.sql"),/PRIMARY KEY/);
 assert.doesNotMatch(read("backend/cloudflare/src/index.mjs"),/console\.log|OPENAI_API_KEY|GEMINI_API_KEY/);
 console.log("Saba Cloudflare pilot: closed CORS, revocable approval, expiry, consent, draft validation, quota, AI call, UI auth, no token/log leak PASS");
})().catch(e=>{console.error(e);process.exitCode=1});
