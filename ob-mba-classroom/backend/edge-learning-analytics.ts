// Allameh MBA Organizational Behavior – learning engagement telemetry.
// Privileged database access stays server-side; custom tokens are revalidated
// against the SAME hashed, revocable attendance sessions as classroom login.
// Never store response text, case answers, drafts, personal identifiers or URL queries.
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const ORIGIN="https://hassnboudlaie.github.io";
const db=createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),{
 auth:{persistSession:false,autoRefreshToken:false}
});
const encoder=new TextEncoder(),now=()=>new Date().toISOString();
const areas=new Set(["home","sessions","session","concepts","case","resources","quiz","performance","reflection","journey","other"]);
const actions=new Set(["open","navigate","guided_step","case_work","quiz_open","resource_open","reflection_saved","journey_check","assignment_open"]);
function response(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{
 "content-type":"application/json; charset=utf-8","cache-control":"no-store",
 "access-control-allow-origin":ORIGIN,"access-control-allow-headers":"content-type,authorization,apikey",
 "access-control-allow-methods":"POST, OPTIONS","vary":"Origin"
}});}
const fail=(error,status=400)=>response({ok:false,error},status);
async function hash(token){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(token))),b=>b.toString(16).padStart(2,"0")).join("");}
async function identity(token){
 if(typeof token!=="string"||!/^[0-9a-f]{64}$/.test(token))return null;
 const {data:s,error}=await db.from("mba_ob_sessions").select("role,student_id,expires_at,revoked_at")
  .eq("token_hash",await hash(token)).maybeSingle();
 if(error||!s||s.revoked_at||Date.parse(s.expires_at)<=Date.now())return null;
 if(s.role==="teacher")return {role:"teacher"};
 if(s.role!=="student"||!s.student_id)return null;
 const {data:u,error:ue}=await db.from("mba_ob_students")
  .select("id,full_name,approval_status,disabled_at").eq("id",s.student_id).maybeSingle();
 if(ue||!u||u.disabled_at||u.approval_status!=="approved")return null;
 return {role:"student",studentId:u.id};
}
const uuid=v=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const areaOf=v=>areas.has(v)?v:"other";
const sessionOf=v=>Number.isInteger(v)&&v>=1&&v<=16?v:null;
async function ensureVisit(id,studentId){
 const {data:found,error}=await db.from("mba_ob_learning_visits")
  .select("id,student_id,active_seconds,last_heartbeat_at").eq("id",id).maybeSingle();
 if(error)throw Error("usage_lookup_failed");
 if(found)return found.student_id===studentId?{...found,existing:true}:null;
 const created=now();
 const {error:insert}=await db.from("mba_ob_learning_visits").insert({
  id,student_id:studentId,started_at:created,last_seen_at:created,last_heartbeat_at:created,active_seconds:0
 });
 if(insert){
  const {data:retry}=await db.from("mba_ob_learning_visits").select("id,student_id,active_seconds,last_heartbeat_at").eq("id",id).maybeSingle();
  return retry&&retry.student_id===studentId?{...retry,existing:true}:null;
 }
 return {id,student_id:studentId,active_seconds:0,last_heartbeat_at:created,existing:false};
}
async function record(input,user){
 if(user.role!=="student")return fail("student_only",403);
 const id=input.visit_id;
 if(!uuid(id))return fail("invalid_visit");
 const visit=await ensureVisit(id,user.studentId);
 if(!visit)return fail("invalid_visit",403);
 if(input.kind==="heartbeat"){
  const requested=Math.max(0,Math.min(30,Number.isInteger(input.seconds)?input.seconds:0));
  const elapsed=Math.max(0,Math.floor((Date.now()-Date.parse(visit.last_heartbeat_at))/1000));
  const delta=Math.min(30,requested,elapsed);
  const {error}=await db.from("mba_ob_learning_visits").update({
    active_seconds:Math.min(43200,visit.active_seconds+delta),last_heartbeat_at:now(),last_seen_at:now()
   }).eq("id",id).eq("student_id",user.studentId);
  if(error)throw Error("usage_write_failed");
  return response({ok:true,credited_seconds:delta});
 }
 if(input.kind!=="event")return fail("invalid_kind");
 const action=String(input.activity||"");
 if(!actions.has(action))return fail("invalid_activity");
 const area=areaOf(input.area),session=sessionOf(input.session_no);
 if(action==="open"&&visit.existing)return response({ok:true,deduplicated:true});
 const {error:ev}=await db.from("mba_ob_learning_events").insert({
   student_id:user.studentId,visit_id:id,area,action,session_no:session,recorded_at:now()
 });
 if(ev)throw Error("usage_event_failed");
 const {error:seen}=await db.from("mba_ob_learning_visits").update({last_seen_at:now()})
  .eq("id",id).eq("student_id",user.studentId);
 if(seen)throw Error("usage_write_failed");
 return response({ok:true});
}
function summarize(visits,events){
 const byArea={};
 for(const e of events)byArea[e.area]=(byArea[e.area]||0)+1;
 return {visits:visits.length,active_seconds:visits.reduce((x,v)=>x+(v.active_seconds||0),0),
  activity_count:events.length,latest_at:visits.reduce((latest,v)=>!latest||v.last_seen_at>latest?v.last_seen_at:latest,null),
  by_area:byArea};
}
async function getUsage(studentId,includeDetails=true){
 const from=new Date(Date.now()-365*86400000).toISOString();
 const [{data:visits,error:ve},{data:events,error:ee}]=await Promise.all([
  db.from("mba_ob_learning_visits").select("id,started_at,last_seen_at,active_seconds")
   .eq("student_id",studentId).gte("started_at",from).order("started_at",{ascending:false}).limit(5000),
  db.from("mba_ob_learning_events").select("area,action,session_no,recorded_at")
   .eq("student_id",studentId).gte("recorded_at",from).order("recorded_at",{ascending:false}).limit(10000)
 ]);
 if(ve||ee)throw Error("analytics_lookup_failed");
 const v=visits||[],e=events||[];
 return {summary:summarize(v,e),recent:includeDetails?e.slice(0,35):[],
  recent_visits:includeDetails?v.slice(0,12):[],period_days:365,
  truncated:v.length===5000||e.length===10000};
}
async function router(input){
 const action=String(input.action||"");
 const user=await identity(input.token);
 if(!user)return fail("session_expired",401);
 if(action==="record")return record(input,user);
 if(action==="mine"){
  if(user.role!=="student")return fail("student_only",403);
  return response({ok:true,...await getUsage(user.studentId)});
 }
 if(action==="classOverview"){
  if(user.role!=="teacher")return fail("teacher_only",403);
  const {data:students,error}=await db.from("mba_ob_students").select("id,full_name,student_number,approval_status,disabled_at")
   .order("enrolled_at",{ascending:true}).limit(500);
  if(error)throw Error("students_lookup_failed");
  const list=await Promise.all((students||[]).filter(s=>s.approval_status==="approved"&&!s.disabled_at)
   .map(async s=>({student_id:s.id,name:s.full_name,student_number:s.student_number,
    ...(await getUsage(s.id,false)).summary})));
  return response({ok:true,students:list,period_days:365});
 }
 if(action==="studentDetail"){
  if(user.role!=="teacher")return fail("teacher_only",403);
  const id=input.student_id;
  if(!uuid(id))return fail("invalid_student");
  const {data:student,error}=await db.from("mba_ob_students").select("id,full_name,student_number,approval_status,disabled_at").eq("id",id).maybeSingle();
  if(error||!student||student.approval_status!=="approved"||student.disabled_at)return fail("student_not_found",404);
  return response({ok:true,student:{id:student.id,name:student.full_name,student_number:student.student_number},
   ...await getUsage(student.id)});
 }
 return fail("unknown_action",404);
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return response({ok:true});
 if(req.method!=="POST")return fail("method_not_allowed",405);
 const origin=req.headers.get("origin");
 if(origin&&origin!==ORIGIN)return fail("origin_not_allowed",403);
 try{
  const text=await req.text();
  if(text.length>4096)return fail("request_too_large",413);
  const input=JSON.parse(text);
  if(!input||typeof input!=="object"||Array.isArray(input))return fail("bad_request");
  return await router(input);
 }catch(error){
  if(error instanceof SyntaxError)return fail("invalid_json",400);
  console.error("MBA analytics",error?.message||"unknown");
  return fail("server_error",500);
 }
});
