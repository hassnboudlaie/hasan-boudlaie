// Alborz-only API. Custom high-entropy capability authentication; no Finance/Auth access.
const endpoint = Deno.env.get('SUPABASE_URL') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const origins = new Set(['https://hassnboudlaie.github.io']);
const fieldPattern = /^(?:teamname|stage|checkin[1-5]|missionChoice|missionChoiceRound|missionRound[0-3]|classStepReady|r[0-3](?:pick|initial|revision|reveal|score[0-4]|evidence|member[1-5])|created(?:Context|Roles|Choice|Event|Dialogue|Debrief|Revision|score[0-4]|evidence)|pitch)$/;
const headers = (origin) => ({'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':origins.has(origin)?origin:'https://hassnboudlaie.github.io','access-control-allow-headers':'content-type','access-control-allow-methods':'POST, OPTIONS','vary':'Origin','x-content-type-options':'nosniff'});
const respond = (data,status,origin) => new Response(JSON.stringify(data),{status,headers:headers(origin)});
async function hash(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),v=>v.toString(16).padStart(2,'0')).join('');}
async function db(path,body,method){const r=await fetch(endpoint+'/rest/v1/'+path,{method:method||(body===undefined?'GET':'POST'),headers:{apikey:serviceKey,authorization:'Bearer '+serviceKey,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(8000)});if(!r.ok){const error=await r.text();if(error.includes('CAPACITY_REACHED'))throw Error('CAPACITY_REACHED');throw Error('Database '+r.status);}const text=await r.text();return text?JSON.parse(text):null;}
// National IDs are never persisted in plaintext; the backend uses a domain-separated HMAC.
// Rotating the service key requires a controlled identity-mapping migration.
async function nationalHash(nationalId){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(serviceKey),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('alborz-national-v1:'+nationalId))),v=>v.toString(16).padStart(2,'0')).join('');}
function validNational(id){
 if(!/^\d{10}$/.test(id)||/^(\d)\1{9}$/.test(id))return false;
 const sum=Array.from(id.slice(0,9),(d,i)=>Number(d)*(10-i)).reduce((a,b)=>a+b,0),rem=sum%11;
 return Number(id[9])===(rem<2?rem:11-rem);
}
const randomSession=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
async function gate(bucket,limit,seconds){return db('rpc/alborz_login_gate',{p_bucket:bucket,p_limit:limit,p_seconds:seconds});}
function valid(k,v){
 if(!fieldPattern.test(k))return false;
 if(k==='stage')return Number.isInteger(v)&&v>=0&&v<=8;
 if(k==='missionChoice')return Number.isInteger(v)&&v>=0&&v<=3;
 if(k==='missionChoiceRound'||/^missionRound[0-3]$/.test(k))return Number.isInteger(v)&&v>=0&&v<=3;
 if(k==='classStepReady')return typeof v==='string'&&/^[0-3]:[3-9]$/.test(v);
 if(/^checkin[1-5]$/.test(k))return typeof v==='boolean';
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
  const normalizeDigits=s=>s.replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776)).replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632));
  const token=typeof body.code==='string'?normalizeDigits(body.code.trim().toLowerCase()):'';
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const ipHash=await hash(ip);
  if(!await db('rpc/alborz_rate_limit',{p_bucket:'ip:'+ipHash,p_limit:1200}))return respond({error:'کمی بعد دوباره تلاش کنید'},429,origin);
  let permission,digest,session;
  if(/^\d{10}$/.test(token)){
   if(body.action!=='login')return respond({error:'ابتدا وارد شوید'},401,origin);
   if(!validNational(token))return respond({error:'کد ملی معتبر نیست؛ عدد ده‌رقمی را بررسی کنید.'},400,origin);
   // The private bcrypt instructor record determines role; no second login code is required.
   const isInstructor=await db('rpc/alborz_verify_instructor_national',{p_national:token});
   if(isInstructor===true){
    if(!await gate('instructor-ip:'+ipHash,12,900)||!await gate('instructor-global',60,86400))
     return respond({error:'تلاش‌های ورود مدرس زیاد شده است؛ کمی بعد دوباره تلاش کنید.'},429,origin);
    session=randomSession();digest=await hash(session);
    const expiresAt=new Date(Date.now()+12*3600000).toISOString();
    const rotated=await db('rpc/alborz_rotate_teacher_session',{p_digest:digest,p_expires_at:expiresAt});
    if(rotated!==true)throw Error('Instructor session could not be rotated');
    permission={access_role:'teacher',team_no:null,member_no:null,expires_at:expiresAt,revoked:false};
   }else{
    // Attempting the instructor screen with a participant ID never occupies a seat.
    if(body.instructorView===true)return respond({error:'این کد ملی برای مدرس تعریف نشده است.'},403,origin);
    if(!await gate('national-ip:'+ipHash,60,900)||!await gate('national-global',200,86400))
     return respond({error:'تلاش‌های ورود زیاد شده است؛ کمی بعد دوباره تلاش کنید.'},429,origin);
    digest=await nationalHash(token);
    const seats=await db('rpc/alborz_enroll_national',{p_digest:digest});
    if(!Array.isArray(seats)||seats.length!==1||!Number.isInteger(seats[0].team_no)||!Number.isInteger(seats[0].member_no))
     throw Error('National registration failed');
    session=randomSession();
    const expiresAt=new Date(Date.now()+12*3600000).toISOString();
    await db('alborz_national_sessions',{digest:await hash(session),national_digest:digest,expires_at:expiresAt});
    permission={access_role:'team',team_no:seats[0].team_no,member_no:seats[0].member_no,expires_at:expiresAt,revoked:false};
   }
  }else if(/^[a-f0-9]{64}$/.test(token)){
   digest=await hash(token);
   const row=(await db('alborz_national_sessions?digest=eq.'+digest+'&select=expires_at,alborz_national_members(team_no,member_no)&limit=1'))?.[0];
   if(row&&Date.parse(row.expires_at)>Date.now()&&row.alborz_national_members){
    permission={access_role:'team',team_no:row.alborz_national_members.team_no,member_no:row.alborz_national_members.member_no,expires_at:row.expires_at,revoked:false};
   }else{
    const instructor=(await db('alborz_access_keys?secret_hash=eq.'+digest+'&access_role=eq.teacher&select=access_role,team_no,member_no,expires_at,revoked&limit=1'))?.[0];
    permission=instructor&&!instructor.revoked?instructor:null;
   }
  }else if(/^[a-f0-9]{24}$/.test(token)){
   digest=await hash(token);
   const row=(await db('alborz_access_keys?secret_hash=eq.'+digest+'&select=access_role,team_no,member_no,expires_at,revoked&limit=1'))?.[0];
   // Legacy participant codes cannot authenticate. The instructor still needs a secret.
   permission=row?.access_role==='teacher'?row:null;
  }
  if(!permission||permission.revoked||Date.parse(permission.expires_at)<=Date.now()||(permission.access_role==='team'&&!permission.member_no))return respond({error:'کد درست نیست یا اعتبار آن تمام شده است.'},401,origin);
  if(!await db('rpc/alborz_rate_limit',{p_bucket:'key:'+digest,p_limit:120}))return respond({error:'تعداد درخواست زیاد است؛ کمی صبر کنید'},429,origin);
  const identity={role:permission.access_role,team:permission.team_no,member:permission.member_no};
  if(body.action==='logout'&&/^[a-f0-9]{64}$/.test(token)){if(permission.access_role==='teacher')await db('alborz_access_keys?secret_hash=eq.'+digest+'&access_role=eq.teacher',undefined,'DELETE');else await db('alborz_national_sessions?digest=eq.'+digest,undefined,'DELETE');return respond({ok:true},200,origin);}
  if(body.action==='login')return respond({ok:true,identity,...(session?{session}:{})},200,origin);
  const cols='team_no,field_key,field_value,editor_label,updated_at,version';
  if(body.action==='teacher'){
   if(identity.role!=='teacher')return respond({error:'مجوز مدرس لازم است'},403,origin);
   return respond({ok:true,records:await db('alborz_team_fields?select='+cols+'&order=team_no.asc,field_key.asc&limit=1500')},200,origin);
  }
  // Instructor-only classroom progression and group confirmation. No new authentication or finance access.
  async function teacherWrite(team, fields, expectedFromClient){
   const keys=Object.keys(fields);
   const lookup=await db('alborz_team_fields?team_no=eq.'+team+'&field_key=in.('+keys.join(',')+')&select=field_key,version,field_value');
   const existing=Object.fromEntries((lookup||[]).map(row=>[row.field_key,row]));
   if(expectedFromClient!==undefined && (existing.classroomPhase?.version||0)!==expectedFromClient)return {ok:false,conflicts:['classroomPhase']};
   const expected=Object.fromEntries(keys.map(key=>[key,existing[key]?.version||0]));
   return db('rpc/alborz_write_fields',{p_team:team,p_fields:fields,p_expected:expected,p_editor:'مدرس'});
  }
  if(body.action==='classroom'){
   if(identity.role!=='teacher')return respond({error:'مجوز مدرس لازم است'},403,origin);
   const next=body.phase;
   if(!Number.isInteger(next)||next<0||next>10||!Number.isInteger(body.expectedVersion)||body.expectedVersion<0)return respond({error:'گام یا نسخه کلاس نامعتبر است'},400,origin);
   const currentRows=await db('alborz_team_fields?team_no=eq.1&field_key=in.(classroomPhase,classroomRound)&select=field_key,version,field_value');
   const by=Object.fromEntries((currentRows||[]).map(row=>[row.field_key,row]));
   const currentPhase=Number(by.classroomPhase?.field_value??0),round=Number(by.classroomRound?.field_value??0);
   const restart=currentPhase===10&&next===2;
   if(Math.abs(next-currentPhase)>1&&!restart)return respond({error:'هر بار فقط یک گام کلاس را تغییر دهید'},400,origin);
   if(restart&&round>=3)return respond({error:'چهار دور مأموریت کامل شده‌اند؛ کارگاه را جمع‌بندی کنید'},400,origin);
   // Server-side gate: a screen is never advanced before its confirmed groups finish.
   if(next===currentPhase+1){
    const snapshot=await db('alborz_team_fields?field_key=in.(groupReady,missionChoice,missionChoiceRound,classStepReady)&select=team_no,field_key,field_value&limit=100');
    const grouped=new Map();
    for(const row of snapshot||[]){const v=grouped.get(row.team_no)||{};v[row.field_key]=row.field_value;grouped.set(row.team_no,v);}
    const active=[...grouped.entries()].filter(([,v])=>v.groupReady===true);
    if(currentPhase===0&&active.length===0)return respond({error:'ابتدا دست‌کم یک گروه را تأیید کنید'},409,origin);
    if(currentPhase===2&&(!active.length||active.some(([,v])=>v.missionChoiceRound!==round||!Number.isInteger(v.missionChoice))))return respond({error:'منتظر انتخاب مأموریت همه گروه‌های فعال بمانید'},409,origin);
    if(currentPhase>=3&&currentPhase<=9&&active.some(([,v])=>v.classStepReady!==round+':'+currentPhase))return respond({error:'برخی گروه‌ها هنوز پایان این گام را اعلام نکرده‌اند'},409,origin);
   }
   const fields=restart?{classroomPhase:next,classroomRound:round+1}:{classroomPhase:next};
   const result=await teacherWrite(1,fields,body.expectedVersion);
   if(!result.ok)return respond({error:'گام کلاس در دستگاه دیگری تغییر کرده است. دوباره بررسی کنید.'},409,origin);
   return respond({ok:true,records:result.records},200,origin);
  }
  if(body.action==='resetClassroom'){
   if(identity.role!=='teacher')return respond({error:'مجوز مدرس لازم است'},403,origin);
   if(body.confirm!=='RESET_ALBORZ_WORKSHOP')return respond({error:'تأیید شروع دوباره نامعتبر است'},400,origin);
   // Clear ONLY workshop progress. National-ID registrations and instructor access remain intact; other apps are not touched.
   await db('alborz_team_fields?team_no=gte.1&team_no=lte.10',undefined,'DELETE');
   return respond({ok:true,reset:true},200,origin);
  }
  if(body.action==='groupSetup'){
   if(identity.role!=='teacher')return respond({error:'مجوز مدرس لازم است'},403,origin);
   const team=body.team,size=body.size;
   if(!Number.isInteger(team)||team<1||team>10||![0,3,4,5].includes(size))return respond({error:'گروه یا شمار اعضا نامعتبر است'},400,origin);
   const checked=(await db('alborz_team_fields?team_no=eq.'+team+'&field_key=in.(checkin1,checkin2,checkin3,checkin4,checkin5)&select=field_value'))?.filter(r=>r.field_value===true).length||0;
   if(size<checked)return respond({error:'این گروه '+checked+' عضو حاضر دارد؛ ظرفیت را کمتر از تعداد حاضران تعیین نکنید.'},409,origin);
   const result=await teacherWrite(team,{groupSize:size,groupReady:size>0});
   if(!result.ok)return respond({error:'اطلاعات گروه تغییر کرده است؛ دوباره تلاش کنید'},409,origin);
   return respond({ok:true,records:result.records},200,origin);
  }
  const team=body.team;
  if(!Number.isInteger(team)||team<1||team>10)return respond({error:'گروه نامعتبر است'},400,origin);
  if(body.action==='grade'){
   if(identity.role!=='teacher')return respond({error:'مجوز مدرس لازم است'},403,origin);
  }else if(identity.role!=='team'||identity.team!==team)return respond({error:'مجوز این گروه را ندارید'},403,origin);
  if(body.action==='read'){
   const [records,current]=(await Promise.all([
    db('alborz_team_fields?team_no=eq.'+team+'&select='+cols+'&order=field_key.asc&limit=150'),
    db('alborz_team_fields?team_no=eq.1&field_key=in.(classroomPhase,classroomRound)&select=field_key,field_value,version')
   ]));
   const by=Object.fromEntries((current||[]).map(x=>[x.field_key,x]));
   return respond({ok:true,identity,records,classroom:{phase:Number(by.classroomPhase?.field_value??0),version:by.classroomPhase?.version??0,round:Number(by.classroomRound?.field_value??0)}},200,origin);
  }
  if(body.action==='write'||body.action==='grade'){
   const fields=body.fields,expected=body.expected;
   if(!fields||Array.isArray(fields)||typeof fields!=='object'||!expected||Array.isArray(expected)||typeof expected!=='object')return respond({error:'اطلاعات یا نسخه پایه نامعتبر است'},400,origin);
   const entries=Object.entries(fields);
   if(entries.length<1||entries.length>12||entries.some(([k,v])=>body.action==='grade'?!/^instructorScore[0-4]$/.test(k)||!Number.isInteger(v)||v<0||v>10:!valid(k,v)))return respond({error:'فیلد یا مقدار نامعتبر است'},400,origin);
   if(body.action==='write'&&('missionChoice' in fields||'missionChoiceRound' in fields||Object.keys(fields).some(k=>/^missionRound[0-3]$/.test(k)))){
    if(!('missionChoice' in fields&&'missionChoiceRound' in fields))return respond({error:'انتخاب راهبرد و شماره دور باید با هم ثبت شوند'},400,origin);
    const run=(await db('alborz_team_fields?team_no=eq.1&field_key=in.(classroomRound,classroomPhase)&select=field_key,field_value'));
    const state=Object.fromEntries((run||[]).map(x=>[x.field_key,x.field_value]));
    const round=Number(state.classroomRound??0),phase=Number(state.classroomPhase??0);
    if(phase!==2||fields.missionChoiceRound!==round||fields['missionRound'+round]!==fields.missionChoice)return respond({error:'فقط در مرحله انتخاب و برای دور جاری می‌توان مأموریت تعیین کرد'},409,origin);
    if(entries.length!==3||entries.some(([key])=>!['missionChoice','missionChoiceRound','missionRound'+round].includes(key)))return respond({error:'فقط مأموریت همان دور قابل ثبت است'},400,origin);
    const earlier=await db('alborz_team_fields?team_no=eq.'+team+'&field_key=in.(missionRound0,missionRound1,missionRound2,missionRound3)&select=field_key,field_value');
    if((earlier||[]).some(x=>Number(x.field_key.slice(-1))<round&&x.field_value===fields.missionChoice))return respond({error:'این مأموریت در دور قبلی اجرا شده است؛ یکی از راهبردهای دیگر را انتخاب کنید'},409,origin);
   }
   if(body.action==='write'&&'classStepReady' in fields){
    if(entries.length!==1)return respond({error:'اعلام پایان گام را جدا ثبت کنید'},400,origin);
    const stateRows=await db('alborz_team_fields?team_no=eq.1&field_key=in.(classroomRound,classroomPhase)&select=field_key,field_value');
    const state=Object.fromEntries((stateRows||[]).map(x=>[x.field_key,x.field_value]));
    const phase=Number(state.classroomPhase??0),round=Number(state.classroomRound??0);
    if(phase<3||phase>9||fields.classStepReady!==round+':'+phase)return respond({error:'گام کلاس تغییر کرده؛ صفحه را به‌روزرسانی کنید'},409,origin);
    const mineRows=await db('alborz_team_fields?team_no=eq.'+team+'&field_key=in.(groupReady,missionChoice,missionChoiceRound,r0initial,r1initial,r2initial,r3initial,r0revision,r1revision,r2revision,r3revision,r0member1,r0member2,r0member3,r0member4,r0member5,r1member1,r1member2,r1member3,r1member4,r1member5,r2member1,r2member2,r2member3,r2member4,r2member5,r3member1,r3member2,r3member3,r3member4,r3member5)&select=field_key,field_value&limit=40');
    const mine=Object.fromEntries((mineRows||[]).map(x=>[x.field_key,x.field_value]));
    if(mine.groupReady!==true||mine.missionChoiceRound!==round||!Number.isInteger(mine.missionChoice))return respond({error:'ابتدا گروه و مأموریت این دور را تأیید کنید'},409,origin);
    const prefix='r'+mine.missionChoice;
    if(phase===6&&!(typeof mine[prefix+'initial']==='string'&&mine[prefix+'initial'].trim().length>=10))return respond({error:'ابتدا تصمیم اولیه گروه را ثبت کنید'},409,origin);
    if(phase===8&&!(typeof mine[prefix+'revision']==='string'&&mine[prefix+'revision'].trim().length>=10))return respond({error:'ابتدا تصمیم اصلاح‌شده را ثبت کنید'},409,origin);
    if(phase===9&&!Array.from({length:5},(_,i)=>mine[prefix+'member'+(i+1)]).some(v=>typeof v==='string'&&v.trim().length>=10))return respond({error:'ابتدا یک شاهد رفتاری از گروه ثبت کنید'},409,origin);
   }
   for(const [k] of entries){
    const member=k.match(/^r[0-3]member([1-5])$/);
    if(member&&Number(member[1])!==identity.member)return respond({error:'فقط نظر عضو خود را ویرایش کنید'},403,origin);
    const checkin=k.match(/^checkin([1-5])$/);
    if(checkin&&Number(checkin[1])!==identity.member)return respond({error:'ثبت حضور فقط برای عضو خودتان مجاز است'},403,origin);
    if(!Number.isInteger(expected[k])||expected[k]<0)return respond({error:'نسخه پایه لازم است'},400,origin);
   }
   const result=await db('rpc/alborz_write_fields',{p_team:team,p_fields:fields,p_expected:expected,p_editor:identity.role==='teacher'?'مدرس':'عضو '+identity.member});
   if(!result.ok)return respond({error:'این فیلد هم‌زمان تغییر کرده؛ نسخه تازه را بررسی کنید.',conflicts:result.conflicts},409,origin);
   return respond(result,200,origin);
  }
  return respond({error:'عملیات نامعتبر است'},400,origin);
 }catch(e){if(e.message==='CAPACITY_REACHED')return respond({error:'ظرفیت ۵۰ نفر کارگاه تکمیل شده است؛ با مدرس هماهنگ کنید.'},409,origin);if(e.message==='TOO_LARGE')return respond({error:'Request too large'},413,origin);console.error('Alborz request failed');return respond({error:'خطای موقت؛ متن شما حفظ شده است'},503,origin);}
});
