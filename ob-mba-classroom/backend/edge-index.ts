// MBA Organizational Behavior attendance edge API.
// Secrets remain in Supabase runtime; the browser receives opaque device tokens only.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigin = "https://hassnboudlaie.github.io";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession:false,autoRefreshToken:false } }
);
const encoder=new TextEncoder();
const stamp=()=>new Date().toISOString();
const randomHex=(n=24)=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>b.toString(16).padStart(2,"0")).join("");
async function sha256(s:string){
 const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(s)));
 return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
function result(body:Record<string,unknown>,status=200,origin=allowedOrigin) {
 return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"no-store","Access-Control-Allow-Origin":origin,
  "Access-Control-Allow-Headers":"content-type,authorization,apikey",
  "Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}});
}
function fail(error:string,status=400){return result({ok:false,error},status)}
function safeName(n:unknown){const v=String(n||"").replace(/\s+/g," ").trim();return v.length>=3&&v.length<=90?v:""}
function isInt(x:unknown,min:number,max:number){return Number.isInteger(x)&&Number(x)>=min&&Number(x)<=max}
async function identity(token:unknown,needRole:"student"|"teacher"){
 if(typeof token!=="string"||token.length<40||token.length>128)return null;
 const hash=await sha256(token);
 const {data,error}=await supabase.from("mba_ob_sessions")
  .select("role,student_id,expires_at,revoked_at").eq("token_hash",hash).maybeSingle();
 if(error||!data||data.role!==needRole||data.revoked_at||Date.parse(data.expires_at)<=Date.now())return null;
 if(needRole==="student"){
  const {data:student}=await supabase.from("mba_ob_students")
   .select("id,full_name,disabled_at").eq("id",data.student_id).maybeSingle();
  if(!student||student.disabled_at)return null;
  return {role:"student",student_id:student.id,name:student.full_name};
 }
 return {role:"teacher"};
}
async function grantSession(role:"student"|"teacher",studentId:string|null){
 const token=randomHex(32);
 const expires=new Date(Date.now()+(role==="teacher"?90:365)*86400000).toISOString();
 const {error}=await supabase.from("mba_ob_sessions").insert({
  role,student_id:studentId,token_hash:await sha256(token),expires_at:expires
 });
 if(error)throw new Error("session_store_failed");
 return {token,expires_at:expires};
}
async function publicState(){
 const {data,error}=await supabase.from("mba_ob_windows")
  .select("session_no,opened_at,closes_at,closed_at")
  .is("closed_at",null).gt("closes_at",stamp()).order("opened_at",{ascending:false}).limit(1);
 if(error)throw new Error("window_lookup_failed");
 return {active:data?.[0]||null,server_time:stamp()};
}
async function actionRouter(input:Record<string,unknown>){
 const action=String(input.action||"");
 if(action==="status"){return result({ok:true,...await publicState()})}
 if(action==="teacherLogin"){
  if(typeof input.password!=="string"||input.password.length<30||input.password.length>100)return fail("invalid_credentials",401);
  const {data,error}=await supabase.rpc("mba_ob_check_teacher",{p_password:input.password});
  if(error||data!==true)return fail("invalid_credentials",401);
  return result({ok:true,role:"teacher",...await grantSession("teacher",null)});
 }
 if(action==="redeem"){
  const code=String(input.invite||"").trim().toLowerCase();
  const name=safeName(input.name);
  if(!/^[0-9a-f]{32}$/.test(code)||!name)return fail("invalid_invitation");
  const token=randomHex(32);
  const hash=await sha256(token);
  const {data,error}=await supabase.rpc("mba_ob_redeem_invitation",{
   p_invite_hash:await sha256(code),p_name:name,p_session_hash:hash
  });
  if(error||!data?.ok)return fail(String(data?.error||"invite_unavailable"),409);
  return result({ok:true,role:"student",token,name:data.name,student_id:data.student_id,
   expires_at:new Date(Date.now()+365*86400000).toISOString(),...await publicState()});
 }
 if(action==="studentState"){
  const user=await identity(input.token,"student");
  if(!user)return fail("session_expired",401);
  const {data,error}=await supabase.from("mba_ob_attendance")
   .select("session_no,status,checked_at").eq("student_id",user.student_id).order("session_no");
  if(error)throw new Error("attendance_lookup_failed");
  return result({ok:true,student:{id:user.student_id,name:user.name},
   attendance:data||[],...await publicState()});
 }
 if(action==="checkIn"){
  const user=await identity(input.token,"student");
  if(!user)return fail("session_expired",401);
  const lesson=Number(input.session);
  const code=String(input.code||"").trim();
  if(!isInt(lesson,1,16)||!/^[0-9]{6}$/.test(code))return fail("invalid_code");
  const {data,error}=await supabase.rpc("mba_ob_claim_attendance",{
   p_student_id:user.student_id,p_session_no:lesson,p_code_hash:await sha256(code)
  });
  if(error)throw new Error("attendance_submit_failed");
  return result(data as Record<string,unknown>,data?.ok?200:409);
 }
 const teacher=await identity(input.token,"teacher");
 if(!teacher)return fail("teacher_auth_required",401);
 if(action==="teacherState"){
  const [students,attend,windows,invites]=await Promise.all([
   supabase.from("mba_ob_students").select("id,full_name,enrolled_at,disabled_at").order("enrolled_at"),
   supabase.from("mba_ob_attendance").select("student_id,session_no,checked_at,status,reviewed_at").order("checked_at",{ascending:false}),
   supabase.from("mba_ob_windows").select("session_no,opened_at,closes_at,closed_at").order("session_no"),
   supabase.from("mba_ob_invitations").select("id,expected_name,redeemed_at,revoked_at")
  ]);
  if(students.error||attend.error||windows.error||invites.error)throw new Error("roster_lookup_failed");
  return result({ok:true,students:students.data||[],attendance:attend.data||[],windows:windows.data||[],
   unredeemed:(invites.data||[]).filter(i=>!i.redeemed_at&&!i.revoked_at).length,invites:invites.data||[],server_time:stamp()});
 }
 if(action==="issueInvites"){
  const provided=Array.isArray(input.names)?input.names:null;
  const names=provided?provided.map(safeName):null;
  const count=names?names.length:Number(input.count);
  if(!isInt(count,1,50)||(names&&names.some(n=>!n)))return fail("invite_count_invalid");
  const raw=Array.from({length:count},()=>randomHex(16));
  const data=await Promise.all(raw.map(async(code,i)=>({token_hash:await sha256(code),expected_name:names?.[i]||null})));
  const {error}=await supabase.from("mba_ob_invitations").insert(data);
  if(error)throw new Error("invite_creation_failed");
  return result({ok:true,codes:raw.map((code,i)=>({code,name:names?.[i]||""}))});
 }
 if(action==="openWindow"){
  const lesson=Number(input.session),minutes=Number(input.minutes);
  if(!isInt(lesson,1,16)||![5,10,15,20,30].includes(minutes))return fail("window_parameters_invalid");
  const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
  const opened=stamp(),closed=new Date(Date.now()+minutes*60000).toISOString();
  const {error}=await supabase.from("mba_ob_windows").upsert({
   session_no:lesson,code_hash:await sha256(code),opened_at:opened,closes_at:closed,closed_at:null
  },{onConflict:"session_no"});
  if(error)throw new Error("window_open_failed");
  await supabase.from("mba_ob_failed_codes").delete().eq("session_no",lesson);
  return result({ok:true,code,session:lesson,opens_at:opened,closes_at:closed});
 }
 if(action==="closeWindow"){
  const lesson=Number(input.session);
  if(!isInt(lesson,1,16))return fail("invalid_session");
  const {error}=await supabase.from("mba_ob_windows").update({closed_at:stamp()}).eq("session_no",lesson);
  if(error)throw new Error("window_close_failed");
  return result({ok:true});
 }
 if(action==="review"){
  const lesson=Number(input.session),id=String(input.student_id||"");
  const status=String(input.status||"");
  if(!isInt(lesson,1,16)||!/^[0-9a-f-]{36}$/.test(id)||!["approved","rejected"].includes(status))return fail("review_invalid");
  const {data,error}=await supabase.from("mba_ob_attendance").update({status,reviewed_at:stamp()})
   .eq("session_no",lesson).eq("student_id",id).select("student_id").maybeSingle();
  if(error||!data)return fail("attendance_not_found",404);
  return result({ok:true,status});
 }
 if(action==="disableStudent"){
  const id=String(input.student_id||"");
  if(!/^[0-9a-f-]{36}$/.test(id))return fail("student_invalid");
  const {error}=await supabase.from("mba_ob_students").update({disabled_at:stamp()}).eq("id",id);
  if(error)throw new Error("disable_failed");
  return result({ok:true});
 }
 return fail("unknown_action",404);
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(origin&&origin!==allowedOrigin)return fail("origin_not_allowed",403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{
  "Access-Control-Allow-Origin":allowedOrigin,"Access-Control-Allow-Headers":"content-type,authorization,apikey",
  "Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}});
 if(req.method==="GET")return result({ok:true,service:"mba-ob-attendance"});
 if(req.method!=="POST")return fail("method_not_allowed",405);
 if(Number(req.headers.get("content-length")||"0")>20000)return fail("request_too_large",413);
 try {
  const input=await req.json();
  if(!input||typeof input!=="object"||Array.isArray(input))return fail("bad_request");
  return await actionRouter(input);
 }catch(e){
  console.error("MBA attendance request failed:",String(e));
  return fail("server_error",500);
 }
});