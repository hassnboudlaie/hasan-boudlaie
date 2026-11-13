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
const digits=(value:unknown)=>String(value??"").replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).trim();
function validNationalID(value:string){
 if(!/^[0-9]{10}$/.test(value)||/^(.)\1{9}$/.test(value))return false;
 let sum=0;for(let i=0;i<9;i++)sum+=Number(value[i])*(10-i);
 const rem=sum%11,last=Number(value[9]);
 return rem<2?last===rem:last===11-rem;
}
async function identity(token:unknown,needRole:"student"|"teacher"){
 if(typeof token!=="string"||token.length<40||token.length>128)return null;
 const hash=await sha256(token);
 const {data,error}=await supabase.from("mba_ob_sessions")
  .select("role,student_id,expires_at,revoked_at").eq("token_hash",hash).maybeSingle();
 if(error||!data||data.role!==needRole||data.revoked_at||Date.parse(data.expires_at)<=Date.now())return null;
 if(needRole==="student"){
  const {data:student}=await supabase.from("mba_ob_students")
   .select("id,full_name,student_number,approval_status,disabled_at").eq("id",data.student_id).maybeSingle();
  if(!student||student.disabled_at)return null;
  return {role:"student",student_id:student.id,name:student.full_name,student_number:student.student_number,approval_status:student.approval_status};
 }
 return {role:"teacher"};
}

async function guestIdentity(token:unknown) {
 if(typeof token!=="string"||!/^[0-9a-f]{64}$/.test(token))return null;
 const {data,error}=await supabase.from("mba_ob_guests").select("id,full_name,approval_status,revoked_at,expires_at").eq("token_hash",await sha256(token)).maybeSingle();
 if(error||!data||data.revoked_at||Date.parse(data.expires_at)<=Date.now())return null;
 return {role:"guest",guest_id:data.id,name:data.full_name,approval_status:data.approval_status};
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

 if(action==="registerGuest"){
  const name=safeName(input.name);
  const code=String(input.guest_code||"").trim().toUpperCase().replace(/\s+/g,"");
  if(!name||!/^OBG-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code))return fail("invalid_guest_registration",400);
  const {data:guestCode,error:codeError}=await supabase.from("mba_ob_guest_codes").select("id,active,expires_at,revoked_at").eq("code_hash",await sha256(code)).maybeSingle();
  if(codeError||!guestCode||!guestCode.active||guestCode.revoked_at||(guestCode.expires_at&&Date.parse(guestCode.expires_at)<=Date.now()))return fail("invalid_guest_code",403);
  const {count,error:countError}=await supabase.from("mba_ob_guests").select("id",{head:true,count:"exact"}).eq("code_id",guestCode.id).gte("requested_at",new Date(Date.now()-3600000).toISOString());
  if(countError)throw new Error("guest_registration_lookup_failed");
  if((count||0)>=60)return fail("guest_registration_limit",429);
  const token=randomHex(32);
  const {error:insertError}=await supabase.from("mba_ob_guests").insert({code_id:guestCode.id,full_name:name,token_hash:await sha256(token)});
  if(insertError)throw new Error("guest_registration_failed");
  return result({ok:true,role:"guest",token,name,approval_status:"pending"});
 }
 if(action==="guestState"){
  const guest=await guestIdentity(input.token);
  if(!guest)return fail("session_expired",401);
  return result({ok:true,role:"guest",approval_status:guest.approval_status,guest:{name:guest.name},server_time:stamp()});
 }
 if(action==="accessState"){
  const guest=await guestIdentity(input.token);
  if(guest)return result({ok:true,role:"guest",approval_status:guest.approval_status,guest:{name:guest.name},server_time:stamp()});
 }
 if(action==="status"){return result({ok:true,...await publicState()})}
 if(action==="teacherLogin"){
  const national=digits(input.national_id);
  if(!validNationalID(national)||typeof input.password!=="string"||input.password.length<16||input.password.length>100)return fail("invalid_credentials",401);
  const {data,error}=await supabase.rpc("mba_ob_check_teacher",{p_password:input.password});
  if(error||data!==true)return fail("invalid_credentials",401);
  const {data:settings,error:settingsError}=await supabase.from("mba_ob_teacher_auth").select("national_hash").eq("id",1).maybeSingle();
  if(settingsError||!settings)return fail("invalid_credentials",401);
  if(settings.national_hash){
   const {data:match,error:matchError}=await supabase.rpc("mba_ob_check_teacher_national",{p_number:national});
   if(matchError||match!==true)return fail("invalid_credentials",401);
  }
  return result({ok:true,role:"teacher",...await grantSession("teacher",null)});
 }
 if(action==="registerStudent"){
  const number=digits(input.student_number),name=safeName(input.name);
  if(!/^[0-9]{6,16}$/.test(number)||!name)return fail("invalid_registration");
  const token=randomHex(32);
  const {data,error}=await supabase.rpc("mba_ob_register_by_student_number",{
   p_student_number:number,p_name:name,p_session_hash:await sha256(token)
  });
  if(error||!data?.ok)return fail(String(data?.error||"registration_failed"),409);
  return result({ok:true,role:"student",token,name,student_number:number,
    approval_status:"pending",expires_at:new Date(Date.now()+365*86400000).toISOString()});
 }
 if(action==="teacherNationalLogin"){
  const number=digits(input.national_id),trusted=String(input.device_token||"");
  if(!validNationalID(number)||!(/^[0-9a-f]{64}$/).test(trusted))return fail("invalid_credentials",401);
  const {data,error}=await supabase.rpc("mba_ob_check_teacher_device",{
    p_number:number,p_token_hash:await sha256(trusted)
  });
  if(error||data!==true)return fail("invalid_credentials",401);
  return result({ok:true,role:"teacher",...await grantSession("teacher",null)});
 }
 if(action==="studentState"||action==="accessState"){
  const user=await identity(input.token,"student");
  if(!user){if(action==="studentState")return fail("session_expired",401);}
  else {
  if(user.approval_status!=="approved"){
    return result({ok:true,role:"student",approval_status:user.approval_status,
      student:{id:user.student_id,name:user.name,student_number:user.student_number},
      attendance:[],active:null,server_time:stamp()});
  }
  const {data,error}=await supabase.from("mba_ob_attendance")
   .select("session_no,status,checked_at").eq("student_id",user.student_id).order("session_no");
  if(error)throw new Error("attendance_lookup_failed");
  return result({ok:true,role:"student",approval_status:"approved",
   student:{id:user.student_id,name:user.name,student_number:user.student_number},
   attendance:data||[],...await publicState()});
  }
 }
 if(action==="checkIn"){
  const user=await identity(input.token,"student");
  if(!user)return fail("session_expired",401);
  if(user.approval_status!=="approved")return fail("approval_required",403);
  const lesson=Number(input.session);
  const code=String(input.code||"").trim();
  if(!isInt(lesson,1,16)||!/^[0-9]{6}$/.test(code))return fail("invalid_code");
  const {data,error}=await supabase.rpc("mba_ob_claim_attendance",{
   p_student_id:user.student_id,p_session_no:lesson,p_code_hash:await sha256(code)
  });
  if(error)throw new Error("attendance_submit_failed");
  return result(data as Record<string,unknown>,data?.ok?200:409);
 }
 if(action==="caseMy"||action==="caseSubmit"){
  const student=await identity(input.token,"student");
  if(!student)return fail("session_expired",401);
  if(student.approval_status!=="approved")return fail("approval_required",403);
  const lesson=Number(input.session);
  if(![1,2].includes(lesson))return fail("case_not_published");
  if(action==="caseSubmit"){
   const answers=input.answers;
   if(!answers||typeof answers!=="object"||Array.isArray(answers))return fail("invalid_case_answers");
   const {data,error}=await supabase.rpc("mba_ob_submit_case",{
    p_student_id:student.student_id,p_session_no:lesson,p_answers:answers
   });
   if(error)throw new Error("case_submission_failed");
   return result(data as Record<string,unknown>,data?.ok?200:409);
  }
  const {data:submission,error}=await supabase.from("mba_ob_case_submissions")
   .select("id,session_no,case_title,answers,status,score,feedback,submitted_at,reviewed_at,revision_no")
   .eq("student_id",student.student_id).eq("session_no",lesson).maybeSingle();
  if(error)throw new Error("case_lookup_failed");
  let history:unknown[]=[];
  if(submission){
   const {data:reviews,error:historyError}=await supabase.from("mba_ob_case_reviews")
    .select("decision,score,feedback,reviewed_at,revision_no")
    .eq("submission_id",submission.id).order("reviewed_at",{ascending:false}).limit(50);
   if(historyError)throw new Error("case_lookup_failed");
   history=reviews||[];
  }
  return result({ok:true,submission:submission||null,history,server_time:stamp()});
 }
 const teacher=await identity(input.token,"teacher");
 if(!teacher)return fail("teacher_auth_required",401);
 if(action==="accessState"){return result({ok:true,role:"teacher",approval_status:"approved"})}
 if(action==="teacherBindNational"){
   const number=digits(input.national_id);
   if(!validNationalID(number))return fail("invalid_national_id");
   const {data:settings,error:settingsError}=await supabase.from("mba_ob_teacher_auth").select("national_hash").eq("id",1).maybeSingle();
   if(settingsError||!settings)return fail("teacher_auth_required",401);
   if(settings.national_hash){
     const {data:matches,error:matchError}=await supabase.rpc("mba_ob_check_teacher_national",{p_number:number});
     if(matchError||matches!==true)return fail("invalid_credentials",401);
   }
   const {data,error}=await supabase.rpc("mba_ob_set_teacher_national",{p_number:number});
   if(error||data!==true)throw new Error("teacher_binding_failed");
   const deviceToken=randomHex(32);
   const {error:insertError}=await supabase.from("mba_ob_teacher_devices").insert({
     token_hash:await sha256(deviceToken)
   });
   if(insertError)throw new Error("teacher_binding_failed");
   return result({ok:true,role:"teacher",device_token:deviceToken});
 }

 if(action==="changeTeacherPassword"){
  const password=String(input.password||"");
  if(password.length<16||password.length>100)return fail("password_too_short");
  const {data,error}=await supabase.rpc("mba_ob_set_teacher_password",{p_new:password});
  if(error||data!==true)throw new Error("password_change_failed");
  await supabase.from("mba_ob_sessions").update({revoked_at:stamp()}).eq("role","teacher").is("revoked_at",null);
  return result({ok:true});
 }
 if(action==="caseList"){
  const lesson=Number(input.session)||0;
  if(lesson!==0&&![1,2].includes(lesson))return fail("case_not_published");
  let query=supabase.from("mba_ob_case_submissions")
   .select("id,student_id,session_no,case_title,answers,status,score,feedback,submitted_at,reviewed_at,revision_no")
   .order("submitted_at",{ascending:false}).limit(500);
  if(lesson)query=query.eq("session_no",lesson);
  const [cases,students]=await Promise.all([
   query,
   supabase.from("mba_ob_students").select("id,student_number,full_name").limit(1000)
  ]);
  if(cases.error||students.error)throw new Error("case_list_failed");
  const names=new Map((students.data||[]).map(v=>[v.id,v]));
  const submissions=(cases.data||[]).map(v=>({
   ...v,student_name:names.get(v.student_id)?.full_name||"دانشجو",
   student_number:names.get(v.student_id)?.student_number||""
  }));
  return result({ok:true,submissions,server_time:stamp()});
 }
 if(action==="caseReview"){
  const id=String(input.submission_id||""),decision=String(input.decision||"");
  const rawScore=input.score;
  if(decision==="reviewed"&&(rawScore===null||rawScore===undefined||String(rawScore).trim()===""))return fail("invalid_case_review");
  const score=decision==="revision_requested"?null:Number(rawScore);
  const feedback=String(input.feedback||"").trim();
  if(!/^[0-9a-f-]{36}$/.test(id)||!["reviewed","revision_requested"].includes(decision)||
     feedback.length<8||feedback.length>3000||
     (decision==="reviewed"&&(!Number.isFinite(score)||score<0||score>20)))return fail("invalid_case_review");
  const {data,error}=await supabase.rpc("mba_ob_review_case",{
   p_submission_id:id,p_decision:decision,p_score:score,p_feedback:feedback
  });
  if(error)throw new Error("case_review_failed");
  return result(data as Record<string,unknown>,data?.ok?200:409);
 }
 if(action==="caseHistory"){
  const id=String(input.submission_id||"");
  if(!/^[0-9a-f-]{36}$/.test(id))return fail("invalid_case_review");
  const {data,error}=await supabase.from("mba_ob_case_reviews")
   .select("decision,score,feedback,reviewed_at,revision_no")
   .eq("submission_id",id).order("reviewed_at",{ascending:false}).limit(100);
  if(error)throw new Error("case_lookup_failed");
  return result({ok:true,history:data||[]});
 }
 if(action==="teacherState"){
  const [students,attend,windows,invites,guests,guestCodes]=await Promise.all([
   supabase.from("mba_ob_students").select("id,full_name,student_number,approval_status,enrolled_at,disabled_at,reviewed_at").order("enrolled_at"),
   supabase.from("mba_ob_attendance").select("student_id,session_no,checked_at,status,reviewed_at").order("checked_at",{ascending:false}),
   supabase.from("mba_ob_windows").select("session_no,opened_at,closes_at,closed_at").order("session_no"),
   supabase.from("mba_ob_invitations").select("id,expected_name,redeemed_at,revoked_at"),
   supabase.from("mba_ob_guests").select("id,full_name,approval_status,requested_at,reviewed_at,revoked_at,expires_at").order("requested_at",{ascending:false}).limit(500),
   supabase.from("mba_ob_guest_codes").select("id,active,created_at,revoked_at,expires_at").order("created_at",{ascending:false}).limit(50)
  ]);
  if(students.error||attend.error||windows.error||invites.error||guests.error||guestCodes.error)throw new Error("roster_lookup_failed");
  return result({ok:true,students:students.data||[],attendance:attend.data||[],windows:windows.data||[],
   unredeemed:(invites.data||[]).filter(i=>!i.redeemed_at&&!i.revoked_at).length,invites:invites.data||[],guests:guests.data||[],guest_codes:guestCodes.data||[],server_time:stamp()});
 }

 if(action==="reviewGuest"){
  const id=String(input.guest_id||""),status=String(input.status||"");
  if(!/^[0-9a-f-]{36}$/.test(id)||!["approved","rejected"].includes(status))return fail("review_invalid");
  const {data,error}=await supabase.from("mba_ob_guests").update({approval_status:status,reviewed_at:stamp()})
   .eq("id",id).is("revoked_at",null).select("id").maybeSingle();
  if(error||!data)return fail("guest_not_found",404);
  return result({ok:true,approval_status:status});
 }
 if(action==="revokeGuest"){
  const id=String(input.guest_id||"");
  if(!/^[0-9a-f-]{36}$/.test(id))return fail("review_invalid");
  const {data,error}=await supabase.from("mba_ob_guests").update({revoked_at:stamp()})
   .eq("id",id).is("revoked_at",null).select("id").maybeSingle();
  if(error||!data)return fail("guest_not_found",404);
  return result({ok:true});
 }
 if(action==="issueGuestCode"){
  const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes=crypto.getRandomValues(new Uint8Array(12));
  const raw=Array.from(bytes,b=>alphabet[b%alphabet.length]).join("");
  const code="OBG-"+raw.slice(0,4)+"-"+raw.slice(4,8)+"-"+raw.slice(8,12);
  const {error}=await supabase.from("mba_ob_guest_codes").insert({code_hash:await sha256(code)});
  if(error)throw new Error("guest_code_creation_failed");
  return result({ok:true,code});
 }
 if(action==="revokeGuestCode"){
  const id=String(input.code_id||"");
  if(!/^[0-9a-f-]{36}$/.test(id))return fail("review_invalid");
  const {data,error}=await supabase.from("mba_ob_guest_codes").update({active:false,revoked_at:stamp()})
   .eq("id",id).eq("active",true).select("id").maybeSingle();
  if(error||!data)return fail("guest_code_not_found",404);
  return result({ok:true});
 }
 if(action==="reviewStudent"){
   const id=String(input.student_id||""),status=String(input.status||"");
   if(!/^[0-9a-f-]{36}$/.test(id)||!["approved","rejected"].includes(status))return fail("review_invalid");
   const {data,error}=await supabase.from("mba_ob_students")
    .update({approval_status:status,reviewed_at:stamp()})
    .eq("id",id).is("disabled_at",null).select("id").maybeSingle();
   if(error||!data)return fail("student_not_found",404);
   return result({ok:true,approval_status:status});
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
 if(Number(req.headers.get("content-length")||"0")>30000)return fail("request_too_large",413);
 try {
  const input=await req.json();
  if(!input||typeof input!=="object"||Array.isArray(input))return fail("bad_request");
  return await actionRouter(input);
 }catch(e){
  console.error("MBA attendance request failed:",String(e));
  return fail("server_error",500);
 }
});