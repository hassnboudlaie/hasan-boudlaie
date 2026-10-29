'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},locale:'fa-IR'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const owner='07f9f4c8-9c1b-42e5-bbf6-a6eece1b7cfe';
 const guest='11111111-1111-4111-8111-111111111111';
 let approved=false,updated=null,signups=0,refreshCount=0;
 await page.route('https://hxcjkewlaniahvuqwwbb.supabase.co/**',async route=>{
  const request=route.request(),url=new URL(request.url()),m=request.method();
  const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,authorization,content-type,prefer,x-client-info','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS','Content-Type':'application/json'};
  if(m==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
  let status=200,data={};
  if(url.pathname==='/auth/v1/signup'){signups++;data={id:guest,email:'foujan@example.test',identities:[{id:'test'}]};}
  else if(url.pathname==='/auth/v1/token'){if(url.searchParams.get('grant_type')==='refresh_token')refreshCount++;data={access_token:'test-token',refresh_token:'test-refresh-'+refreshCount,expires_in:3600,token_type:'bearer'};}
  else if(url.pathname==='/auth/v1/user'){data={id:owner,email:'owner@example.test'};}
  else if(url.pathname==='/auth/v1/logout'){data={};}
  else if(url.pathname==='/auth/v1/recover'){data={};}
  else if(url.pathname==='/auth/v1/user'&&m==='PUT'){data={id:owner,email:'owner@example.test',updated_at:new Date().toISOString()};}
  else if(url.pathname==='/rest/v1/kish_members' && m==='GET'){
   const main={user_id:owner,email:'owner@example.test',full_name:'مالک',role:'super_admin',status:approved?'approved':'pending',department:''};
   if(url.searchParams.has('user_id'))data=[main];
   else data=[main,{user_id:guest,email:'foujan@example.test',full_name:'فوژان بدیع',role:'viewer',status:'pending',department:''}];
  }else if(url.pathname==='/rest/v1/kish_members'&&m==='PATCH'){
   updated=JSON.parse(request.postData());data=[{user_id:guest,...updated}];
  }else{status=404;data={error:'Unexpected mock URL '+url.pathname};}
  await route.fulfill({status,headers:cors,body:JSON.stringify(data)});
 });
 try{
  await page.goto('http://127.0.0.1:8765/okr-system/',{waitUntil:'domcontentloaded'});
  await page.locator('#kishEmail').waitFor();
  assert.equal(await page.locator('#executionApp').isVisible(),false,'workspace must be gated');
  await page.getByRole('button',{name:'ایجاد حساب جدید'}).click();
  assert.ok(await page.locator('#kishName').isVisible(),'new user can register');
  await page.locator('#kishName').fill('فوژان بدیع');
  await page.locator('#kishEmail').fill('foujan@example.test');
  await page.locator('#kishPassword').fill('safe-e2e-test-password');
  await page.getByRole('button',{name:'ثبت‌نام',exact:true}).click();
  await page.getByText('درخواست ثبت شد.',{exact:false}).waitFor();
  assert.equal(signups,1,'backend signup was called');
  assert.equal(await page.locator('#executionApp').isVisible(),false,'new user is not allowed into workspace');
  await page.locator('#kishEmail').fill('owner@example.test');
  await page.locator('#kishPassword').fill('safe-e2e-test-password');
  await page.getByRole('button',{name:'ورود به سامانه'}).click();
  await page.getByRole('heading',{name:'در انتظار تأیید مدیر'}).waitFor();
  assert.equal(await page.locator('#executionApp').isVisible(),false,'pending user must remain locked');
  approved=true;
  await page.getByRole('button',{name:'بررسی مجدد'}).click();
  await page.locator('#kishMembersButton').waitFor();
  assert.equal(await page.locator('#executionApp').isVisible(),true,'verified approved user sees app');
  // After a successful login, reopening the installed app must not ask for credentials.
  await page.reload();
  await page.locator('#kishMembersButton').waitFor({timeout:15000});
  assert.equal(await page.locator('#kishEmail').count(),0,'automatic login must bypass email/password form');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('kish-okr-auth-session-v1')));
  assert.ok(saved?.access_token&&saved?.refresh_token&&saved.expires_at,'session and computed expiry persisted across reloads');
  const stored=await page.evaluate(()=>localStorage.getItem('kish-okr-auth-session-v1'));
  assert.equal(stored.includes('safe-e2e-test-password'),false,'plaintext password must never be stored');
  // An expired access token should be silently replaced using the one-time refresh token.
  await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem('kish-okr-auth-session-v1'));s.expires_at=1;
   localStorage.setItem('kish-okr-auth-session-v1',JSON.stringify(s));
  });
  await page.reload();
  await page.locator('#kishMembersButton').waitFor({timeout:15000});
  assert.ok(refreshCount>=1,'expired session must silently refresh');
  assert.equal(await page.locator('#kishEmail').count(),0,'refresh must not prompt for password');
  await page.locator('#kishMembersButton').click();
  await page.getByRole('heading',{name:'مدیریت کاربران و تأیید دسترسی'}).waitFor();
  const guestRow=page.locator('.kish-member-row').filter({hasText:'foujan@example.test'});
  await guestRow.locator('select').nth(0).selectOption('approved');
  await guestRow.locator('select').nth(1).selectOption('assistant');
  await guestRow.getByRole('button',{name:'ذخیره دسترسی'}).click();
  await guestRow.getByRole('button',{name:'ذخیره شد'}).waitFor();
  assert.equal(updated.status,'approved');
  assert.equal(updated.role,'assistant');
  
  await page.locator('#kishAdminAccount').click();
  const toggle=page.locator('#kishStaySigned');
  assert.equal(await toggle.isChecked(),true);
  await toggle.uncheck();
  assert.equal(await page.evaluate(()=>localStorage.getItem('kish-okr-auth-session-v1')),null,'opt-out clears persistent tokens');
  assert.ok(await page.evaluate(()=>sessionStorage.getItem('kish-okr-auth-session-v1')),'opt-out preserves only this tab session');
  await toggle.check();
  assert.ok(await page.evaluate(()=>localStorage.getItem('kish-okr-auth-session-v1')),'opt-in restores persistent tokens');
  
  // Recovery links must never fall back to the GitHub Pages root domain.
  await page.goto('http://127.0.0.1:8765/okr-system/?qa=recovery-ci#access_token=test-token&refresh_token=test-refresh&expires_in=3600&type=recovery');
  await page.getByRole('heading',{name:'تعیین رمز عبور جدید'}).waitFor();
  assert.equal(page.url().includes('access_token'),false,'tokens must be stripped from browser URL');
  await page.locator('#kishNewPassword').fill('some-secure-test-password');
  await page.locator('#kishConfirmNewPassword').fill('some-secure-test-password');
  await page.getByRole('button',{name:'ذخیره رمز جدید'}).click();
  await page.getByText('رمز جدید ثبت شد',{exact:false}).waitFor();
  assert.equal(await page.locator('#kishEmail').isVisible(),true,'after update, user must log in with new password');
  
  assert.deepEqual(errors,[]);
  console.log('PASS Kish auth: gated entry, signup, pending, owner approval, assistant role');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
