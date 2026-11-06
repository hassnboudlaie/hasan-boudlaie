// Alborz-only API. Custom high-entropy capability authentication; no Finance/Auth access.
const endpoint = Deno.env.get('SUPABASE_URL') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const origins = new Set(['https://hassnboudlaie.github.io']);
const fieldPattern = /^(?:teamname|stage|r[0-3](?:pick|initial|revision|reveal|score[0-4]|evidence|member[1-5])|created(?:Context|Roles|Choice|Event|Dialogue|Debrief|Revision|score[0-4]|evidence)|pitch)$/;
const headers = (origin) => ({'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':origins.has(origin)?origin:'https://hassnboudlaie.github.io','access-control-allow-headers':'content-type','access-control-allow-methods':'POST, OPTIONS','vary':'Origin','x-content-type-options':'nosniff'});
const respond = (data,status,origin) => new Response(JSON.stringify(data),{status,headers:headers(origin)});
async function hash(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),v=>v.toString(16).padStart(2,'0')).join('');}
async function db(path,body,method){const r=await fetch(endpoint+'/rest/v1/'+path,{method:method||(body===undefined?'GET':'POST'),headers:{apikey:serviceKey,authorization:'Bearer '+serviceKey,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Database '+r.status);const text=await r.text();return text?JSON.parse(text):null;}
// Domain-separated HMAC pepper stays in server environment, never in the database.
// Rotating SUPABASE_SERVICE_ROLE_KEY requires reissuing PINs.
async function pinHash(pin){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(serviceKey),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('alborz-pin-v1:'+pin))),v=>v.toString(16).padStart(2,'0')).join('');}
const randomSession=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
async function gate(bucket,limit,seconds){return db('rpc/alborz_login_gate',{p_bucket:bucket,p_limit:limit,p_seconds:seconds});}
function valid(k,v){
 if(!fieldPattern.test(k))return false;
 if(k==='stage')return Number.isInteger(v)&&v>=0&&v<=8;
 if(/^r[0-3]pick$/.test(k))return Array.isArray(v)&&v.length<=4&&new Set(v).size===v.length&&v.every(i=>Number.isInteger(i)&&i>=0&&i<=3);
 if(/^r[0-3]reveal$/.test(k))return typeof v==='boolean';
 if(/score[0-4]$/.test(k))return typeof v==='string'&&/^[012]?$/.test(v);
 return typeof v==='string'&&v.length<=2500;
}
async function limitedBody(req){const reader=req.body?.getReader();if(!reader)return '';let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>18000){await reader.cancel();throw Error('TOO_LARGE');}chunks.push(value);}const all=new Uint8Array(size);let i=0;for(const b of chunks){all.set(b,i);i+=b.length;}return new TextDecoder().decode(all);}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(origin&&!origins.has(origin))return respond({error:'Origin not allowed'},403,origin);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=='POST')return respond({error:'Method not allowed'},405,origin);
 if(!endpoint||!serviceKey)return respond({error:'Backend not configured'},503,origin);
 try{
  const raw=await limitedBody(req);let body;try{body=JSON.parse(raw);}catch{return respond({error:'Invalid JSON'},400,origin);}
  if(!body||Array.isArray(body)||typeof body!=='object')return respond({error:'Invalid request'},400,origin);
  const token=typeof body.code==='string'?body.code.trim().toLowerCase():'';
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const ipHash=await hash(ip);
  if(!await db('rpc/alborz_rate_limit',{p_bucket:'ip:'+ipHash,p_limit:1200}))return respond({error:'کمی بعد دوباره تلاش کنید'},429,origin);
  let permission,digest,session;
  if(/^\d{8}$/.test(token)){
   // PINs only authenticate once. Polling always uses a random 256-bit session.
   if(body.action!=='login')return respond({error:'ابتدا وارد شوید'},401,origin);
   // Shared classroom NAT allows 50 logins. Global budget also bounds distributed guessing.
   if(!await gate('pin-ip:'+ipHash,60,900)||!await gate('pin-global',200,86400))return respond({error:'تلاش‌های ورود زیاد شده است؛ بعداً تلاش کنید یا به مدرس اطلاع دهید.'},429,origin);
   digest=await pinHash(token);
   permission=(await db('alborz_pin_keys?digest=eq.'+digest+'&select=*&limit=1'))?.[0];
   if(permission&&!permission.revoked&&Date.parse(permission.expires_at)>Date.now()){
    session=randomSession();
    await db('alborz_pin_sessions',{digest:await hash(session),pin_digest:digest,expires_at:new Date(Math.min(Date.now()+12*3600000,Date.parse(permission.expires_at))).toISOString()});
    permission.access_role='team';
   }else permission=null;
  }else if(/^[a-f0-9]{64}$/.test(token)){
   digest=await hash(token);
   const row=(await db('alborz_pin_sessions?digest=eq.'+digest+'&select=expires_at,alborz_pin_keys(*)&limit=1'))?.[0];
   if(row&&Date.parse(row.expires_at)>Date.now())permission={...row.alborz_pin_keys,access_role:'team'};
  }else if(/^[a-f0-9]{24}$/.test(token)){
   digest=await hash(token);
   permission=(await db('alborz_access_keys?secret_hash=eq.'+digest+'&select=access_role,team_no,member_no,expires_at,revoked&limit=1'))?.[0];
  }
  if(!permission||permission.revoked||Date.parse(permission.expires_at)<=Date.now()||(permission.access_role==='team'&&!permission.member_no))return respond({error:'کد درست نیست یا اعتبار آن تمام شده است.'},401,origin);
  if(!await db('rpc/alborz_rate_limit',{p_bucket:'key:'+digest,p_limit:120}))return respond({error:'تعداد درخواست زیاد است؛ کمی صبر کنید'},429,origin);
  const identity={role:permission.access_role,team:permission.team_no,member:permission.member_no};
  if(body.action==='logout'&&/^[a-f0-9]{64}$/.test(token)){await db('alborz_pin_sessions?digest=eq.'+digest,undefined,'DELETE');return respond({ok:true},200,origin);}
  if(body.action==='login')return respond({ok:true,identity,...(session?{session}:{})},200,origin);
  const cols='team_no,field_key,field_value,editor_label,updated_at,version';
  if(body.action==='teacher'){
   if(identity.role!=='teacher')return respond({error:'مجوز مدرس لازم است'},403,origin);
   return respond({ok:true,records:await db('alborz_team_fields?select='+cols+'&order=team_no.asc,field_key.asc&limit=1500')},200,origin);
  }
  const team=body.team;
  if(!Number.isInteger(team)||team<1||team>10)return respond({error:'گروه نامعتبر است'},400,origin);
  if(body.action==='grade'){
   if(identity.role!=='teacher')return respond({error:'مجوز مدرس لازم است'},403,origin);
  }else if(identity.role!=='team'||identity.team!==team)return respond({error:'مجوز این گروه را ندارید'},403,origin);
  if(body.action==='read')return respond({ok:true,identity,records:await db('alborz_team_fields?team_no=eq.'+team+'&select='+cols+'&order=field_key.asc&limit=150')},200,origin);
  if(body.action==='write'||body.action==='grade'){
   const fields=body.fields,expected=body.expected;
   if(!fields||Array.isArray(fields)||typeof fields!=='object'||!expected||Array.isArray(expected)||typeof expected!=='object')return respond({error:'اطلاعات یا نسخه پایه نامعتبر است'},400,origin);
   const entries=Object.entries(fields);
   if(entries.length<1||entries.length>12||entries.some(([k,v])=>body.action==='grade'?!/^instructorScore[0-4]$/.test(k)||!Number.isInteger(v)||v<0||v>10:!valid(k,v)))return respond({error:'فیلد یا مقدار نامعتبر است'},400,origin);
   for(const [k] of entries){
    const member=k.match(/^r[0-3]member([1-5])$/);
    if(member&&Number(member[1])!==identity.member)return respond({error:'فقط نظر عضو خود را ویرایش کنید'},403,origin);
    if(!Number.isInteger(expected[k])||expected[k]<0)return respond({error:'نسخه پایه لازم است'},400,origin);
   }
   const result=await db('rpc/alborz_write_fields',{p_team:team,p_fields:fields,p_expected:expected,p_editor:identity.role==='teacher'?'مدرس':'عضو '+identity.member});
   if(!result.ok)return respond({error:'این فیلد هم‌زمان تغییر کرده؛ نسخه تازه را بررسی کنید.',conflicts:result.conflicts},409,origin);
   return respond(result,200,origin);
  }
  return respond({error:'عملیات نامعتبر است'},400,origin);
 }catch(e){if(e.message==='TOO_LARGE')return respond({error:'Request too large'},413,origin);console.error('Alborz request failed');return respond({error:'خطای موقت؛ متن شما حفظ شده است'},503,origin);}
});
