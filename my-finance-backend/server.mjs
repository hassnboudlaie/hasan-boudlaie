import http from 'node:http';
import crypto from 'node:crypto';

const frontend='https://hassnboudlaie.github.io/hasan-boudlaie/my-finance/';
const frontendOrigin=new URL(frontend).origin;
const keyInput=process.env.SESSION_KEY||'';
const key=/^[a-f0-9]{64}$/i.test(keyInput)?Buffer.from(keyInput,'hex'):Buffer.from(keyInput,'base64url');
const env={
 owner:(process.env.OWNER_EMAIL||'').toLowerCase(),
 sheet:process.env.FINANCE_SHEET_ID||'',
 client:process.env.GOOGLE_CLIENT_ID||'',
 secret:process.env.GOOGLE_CLIENT_SECRET||'',
 base:(process.env.PUBLIC_BASE_URL||'').replace(/\/$/,'')
};
const ready=Boolean(env.owner&&env.sheet&&env.client&&env.secret&&key.length===32&&/^https:\/\/[a-z0-9.-]+$/.test(env.base));
const json=(res,status,data,origin)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer',...(origin===frontendOrigin?{'Access-Control-Allow-Origin':frontendOrigin,'Vary':'Origin'}:{})});res.end(JSON.stringify(data))};
const redirect=(res,url,extra={})=>{res.writeHead(302,{'Location':url,'Cache-Control':'no-store','Referrer-Policy':'no-referrer',...extra});res.end()};
const b64=b=>Buffer.from(b).toString('base64url');
function hmac(value){return b64(crypto.createHmac('sha256',key).update(value).digest())}
function seal(obj){
 const nonce=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,nonce);
 cipher.setAAD(Buffer.from('finance-session-v1'));
 const payload=Buffer.concat([cipher.update(JSON.stringify(obj),'utf8'),cipher.final()]);
 return b64(Buffer.concat([nonce,cipher.getAuthTag(),payload]));
}
function unseal(token){
 const buffer=Buffer.from(token,'base64url');
 if(buffer.length<30||buffer.length>9000)throw Error('Invalid session');
 const d=crypto.createDecipheriv('aes-256-gcm',key,buffer.subarray(0,12));
 d.setAAD(Buffer.from('finance-session-v1'));d.setAuthTag(buffer.subarray(12,28));
 const obj=JSON.parse(Buffer.concat([d.update(buffer.subarray(28)),d.final()]).toString('utf8'));
 if(obj.email!==env.owner||!obj.refresh||!obj.exp||Date.now()>obj.exp)throw Error('Session expired');
 return obj;
}
async function formPost(url,payload){
 const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(payload),signal:AbortSignal.timeout(15000)});
 const data=await response.json();
 if(!response.ok)throw Error('Google OAuth request failed');
 return data;
}
async function googleRead(token,range){
 const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(env.sheet)+'/values/'+encodeURIComponent(range)+'?valueRenderOption=UNFORMATTED_VALUE';
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Private spreadsheet read failed');
 const data=await response.json();return data.values||[];
}
const same=(a,b)=>a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
const server=http.createServer(async(req,res)=>{
 const origin=req.headers.origin||'';
 const url=new URL(req.url||'/',env.base||'https://placeholder.invalid');
 try{
  if(url.pathname==='/health')return json(res,200,{status:'ok',configured:ready,storage:'private-google-sheet'});
  if(req.method==='OPTIONS'&&url.pathname==='/api/snapshot'){
   if(origin!==frontendOrigin)return json(res,403,{error:'origin not authorized'},origin);
   res.writeHead(204,{'Access-Control-Allow-Origin':frontendOrigin,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Authorization','Access-Control-Max-Age':'600','Vary':'Origin'});return res.end();
  }
  if(!ready)return json(res,503,{error:'Service requires one-time private Google OAuth configuration'},origin);
  if(req.method==='GET'&&url.pathname==='/auth/start'){
   const state=b64(crypto.randomBytes(24));
   const google=new URL('https://accounts.google.com/o/oauth2/v2/auth');
   for(const [k,v] of Object.entries({client_id:env.client,redirect_uri:env.base+'/auth/callback',response_type:'code',scope:'openid email https://www.googleapis.com/auth/spreadsheets.readonly',access_type:'offline',prompt:'consent',state}))google.searchParams.set(k,v);
   return redirect(res,google.toString(),{'Set-Cookie':'fin_oauth_state='+state+'.'+hmac(state)+'; Max-Age=600; Path=/auth; HttpOnly; Secure; SameSite=Lax'});
  }
  if(req.method==='GET'&&url.pathname==='/auth/callback'){
   const state=url.searchParams.get('state')||'',code=url.searchParams.get('code')||'';
   const cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('fin_oauth_state='))?.slice(16)||'';
   const [fromCookie,sig]=cookie.split('.');
   if(!state||!code||!fromCookie||!sig||!same(state,fromCookie)||!same(sig,hmac(fromCookie)))return json(res,403,{error:'Invalid authorization state'});
   const token=await formPost('https://oauth2.googleapis.com/token',{client_id:env.client,client_secret:env.secret,code,grant_type:'authorization_code',redirect_uri:env.base+'/auth/callback'});
   if(!token.id_token||!token.refresh_token)throw Error('Google did not return an offline access grant');
   const infoResponse=await fetch('https://oauth2.googleapis.com/tokeninfo?id_token='+encodeURIComponent(token.id_token),{signal:AbortSignal.timeout(15000)});
   if(!infoResponse.ok)throw Error('Identity verification failed');
   const info=await infoResponse.json();
   if(info.aud!==env.client||info.email_verified!=='true'||String(info.email).toLowerCase()!==env.owner) return json(res,403,{error:'Owner identity mismatch'});
   const session=seal({v:1,email:env.owner,refresh:token.refresh_token,exp:Date.now()+60*86400000});
   return redirect(res,frontend+'#finance-api-session='+encodeURIComponent(session)+'&api='+encodeURIComponent(env.base),{'Set-Cookie':'fin_oauth_state=; Max-Age=0; Path=/auth; HttpOnly; Secure; SameSite=Lax'});
  }
  if(req.method==='GET'&&url.pathname==='/api/snapshot'){
   if(origin&&origin!==frontendOrigin)return json(res,403,{error:'origin not authorized'},origin);
   const header=req.headers.authorization||'';
   if(!header.startsWith('Bearer '))return json(res,401,{error:'Sign in required'},origin);
   let session;try{session=unseal(header.slice(7))}catch(e){return json(res,401,{error:'Session expired or invalid'},origin)}
   const access=await formPost('https://oauth2.googleapis.com/token',{client_id:env.client,client_secret:env.secret,refresh_token:session.refresh,grant_type:'refresh_token'});
   const [receivables,transactions,transfers]=await Promise.all([googleRead(access.access_token,'Receivables!A1:L10001'),googleRead(access.access_token,'Transactions!A1:N10001'),googleRead(access.access_token,'Transfers!A1:N10001')]);
   return json(res,200,{receivables,transactions,transfers,updatedAt:new Date().toISOString()},origin);
  }
  return json(res,404,{error:'Not found'},origin);
 }catch(e){return json(res,500,{error:'Secure sync failed. Check the Google authorization and private ledger access.'},origin)}
});
server.listen(Number(process.env.PORT)||10000,'0.0.0.0',()=>{console.log('Finance sync service online; configured='+ready)});
