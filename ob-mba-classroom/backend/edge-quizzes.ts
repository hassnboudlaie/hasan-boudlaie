/* MBA OB private per-session quizzes; no answer key exposed to student clients before closing. */
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
const ORIGIN="https://hassnboudlaie.github.io",encoder=new TextEncoder();
function reply(value:Record<string,unknown>,status=200){return new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json;charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}})}
const fail=(error:string,status=400)=>reply({ok:false,error},status);
const sessionNo=(x:unknown)=>{const n=Number(x);return Number.isInteger(n)&&n>=1&&n<=16?n:0};
async function sha256(value:string){const buffer=await crypto.subtle.digest("SHA-256",encoder.encode(value));return Array.from(new Uint8Array(buffer),x=>x.toString(16).padStart(2,"0")).join("")}
async function identity(token:unknown){
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token))return null;
 const {data:s,error:e}=await db.from("mba_ob_sessions").select("role,student_id,expires_at,revoked_at").eq("token_hash",await sha256(token)).maybeSingle();
 if(e||!s||s.revoked_at||Date.parse(s.expires_at)<=Date.now()||!["teacher","student"].includes(s.role))return null;
 if(s.role==="teacher")return {role:"teacher" as const,id:""};
 const {data:student,error:err}=await db.from("mba_ob_students").select("id,full_name,student_number,approval_status,disabled_at").eq("id",s.student_id).maybeSingle();
 if(err||!student||student.disabled_at||student.approval_status!=="approved")return null;
 return {role:"student" as const,id:student.id as string};
}
type Ident=NonNullable<Awaited<ReturnType<typeof identity>>>;
async function bank(session:number){
 const {data,error}=await db.from("mba_ob_quiz_questions").select("question_no,prompt,options,correct_index,explanation").eq("session_no",session).order("question_no");
 if(error)throw Error("bank_lookup_failed");
 return data||[];
}
async function windowFor(session:number){
 const {data,error}=await db.from("mba_ob_quiz_windows").select("session_no,opens_at,closes_at,created_at,updated_at").eq("session_no",session).maybeSingle();
 if(error)throw Error("window_lookup_failed");return data;
}
const publicQuestions=(q:any[])=>q.map(x=>({no:x.question_no,text:x.prompt,options:x.options}));
const grade=(q:any[],answers:number[])=>q.reduce((n,x,i)=>n+(Number(x.correct_index)===answers[i]?1:0),0);
async function responseForStudent(session:number,user:Ident){
 const [questions,window]=await Promise.all([bank(session),windowFor(session)]);
 const {data:attempt,error:attemptError}=await db.from("mba_ob_quiz_attempts").select("id,submitted_at,score,correct_count,answers").eq("student_id",user.id).eq("session_no",session).maybeSingle();
 if(attemptError)throw Error("attempt_lookup_failed");
 const now=Date.now(),opens=window?Date.parse(window.opens_at):0,closes=window?Date.parse(window.closes_at):0;
 const isReady=questions.length===10;
 const status=!isReady?"not_ready":!window?"unscheduled":now<opens?"upcoming":now>=closes?"closed":"open";
 const hasAttempt=Boolean(attempt),showResult=Boolean(attempt&&now>=closes);
 return reply({ok:true,session,status,opens_at:window?.opens_at||null,closes_at:window?.closes_at||null,
  questions:status==="open"&&!attempt?publicQuestions(questions):[],
  attempt:attempt?{id:attempt.id,submitted_at:attempt.submitted_at,...(showResult?{score:attempt.score,correct_count:attempt.correct_count,review:questions.map((q,i)=>({no:q.question_no,answer:Number(attempt.answers[i]),correct_index:q.correct_index,explanation:q.explanation}))}:{})}:null});
}
async function route(body:Record<string,unknown>){
 const u=await identity(body.token);if(!u)return fail("session_expired",401);
 const action=String(body.action||""),session=sessionNo(body.session);
 if(action==="my"){
  if(u.role!=="student")return fail("student_only",403);
  const [a,w]=await Promise.all([db.from("mba_ob_quiz_attempts").select("session_no,id,submitted_at,score,correct_count").eq("student_id",u.id).order("session_no"),db.from("mba_ob_quiz_windows").select("session_no,closes_at")]);
  if(a.error||w.error)throw Error("profile_failed");
  const closeMap=new Map((w.data||[]).map(x=>[x.session_no,Date.parse(x.closes_at)]));
  return reply({ok:true,attempts:(a.data||[]).map(x=>({session:x.session_no,id:x.id,submitted_at:x.submitted_at,score:Date.now()>=(closeMap.get(x.session_no)||Infinity)?x.score:null,correct_count:Date.now()>=(closeMap.get(x.session_no)||Infinity)?x.correct_count:null}))});
 }
 if(action==="teacherStatus"){
  if(u.role!=="teacher")return fail("teacher_only",403);
  const [q,w,a]=await Promise.all([db.from("mba_ob_quiz_questions").select("session_no"),db.from("mba_ob_quiz_windows").select("session_no,opens_at,closes_at"),db.from("mba_ob_quiz_attempts").select("session_no")]);
  if(q.error||w.error||a.error)throw Error("status_failed");
  const counts=new Map<number,number>(),attempts=new Map<number,number>();
  for(const row of q.data||[])counts.set(row.session_no,(counts.get(row.session_no)||0)+1);
  for(const row of a.data||[])attempts.set(row.session_no,(attempts.get(row.session_no)||0)+1);
  return reply({ok:true,sessions:Array.from({length:16},(_,i)=>{const session=i+1,window=(w.data||[]).find(x=>x.session_no===session);return {session,question_count:counts.get(session)||0,attempt_count:attempts.get(session)||0,opens_at:window?.opens_at||null,closes_at:window?.closes_at||null}})});
 }
 if(!session)return fail("invalid_session");
 if(action==="get"){if(u.role!=="student")return fail("student_only",403);return responseForStudent(session,u)}
 if(action==="schedule"){
  if(u.role!=="teacher")return fail("teacher_only",403);
  const start=String(body.opens_at||""),moment=Date.parse(start);
  if(!/\d{4}-\d{2}-\d{2}T/.test(start)||!Number.isFinite(moment)||moment<Date.now()-2592000000||moment>Date.now()+31536000000)return fail("invalid_time");
  const q=await bank(session);if(q.length!==10)return fail("question_bank_incomplete",409);
  const {count,error:countErr}=await db.from("mba_ob_quiz_attempts").select("id",{count:"exact",head:true}).eq("session_no",session);
  if(countErr)throw Error("attempt_count_failed");if(count&&count>0)return fail("schedule_locked_after_attempt",409);
  const opens=new Date(moment).toISOString(),closes=new Date(moment+86400000).toISOString();
  const {error}=await db.from("mba_ob_quiz_windows").upsert({session_no:session,opens_at:opens,closes_at:closes,updated_at:new Date().toISOString()},{onConflict:"session_no"});
  if(error)throw Error("window_save_failed");
  return reply({ok:true,session,opens_at:opens,closes_at:closes});
 }
 if(action==="submit"){
  if(u.role!=="student")return fail("student_only",403);
  const answers=body.answers;
  if(!Array.isArray(answers)||answers.length!==10||answers.some(x=>!Number.isInteger(x)||x<0||x>3))return fail("invalid_answers");
  const w=await windowFor(session),now=Date.now();if(!w)return fail("unscheduled",403);
  if(now<Date.parse(w.opens_at)||now>=Date.parse(w.closes_at))return fail("quiz_closed",403);
  const q=await bank(session);if(q.length!==10)return fail("question_bank_incomplete",409);
  const correct=grade(q,answers),score=correct*2;
  const {data,error}=await db.from("mba_ob_quiz_attempts").insert({student_id:u.id,session_no:session,answers,correct_count:correct,score}).select("id,submitted_at").single();
  if(error){if(error.code==="23505")return fail("already_submitted",409);throw Error("attempt_save_failed")}
  return reply({ok:true,receipt:{id:data.id,submitted_at:data.submitted_at,session},message:"ثبت نهایی شد. پاسخنامه تحلیلی پس از پایان مهلت آزمون قابل مشاهده است."});
 }
 if(action==="list"){
  if(u.role!=="teacher")return fail("teacher_only",403);
  const [a,students,questions]=await Promise.all([
   db.from("mba_ob_quiz_attempts").select("id,student_id,session_no,answers,score,correct_count,submitted_at").eq("session_no",session).order("submitted_at",{ascending:false}).limit(1000),
   db.from("mba_ob_students").select("id,full_name,student_number").limit(1500),bank(session)]);
  if(a.error||students.error)throw Error("attempt_list_failed");
  const people=new Map((students.data||[]).map(x=>[x.id,x]));
  return reply({ok:true,questions:publicQuestions(questions),
   attempts:(a.data||[]).map(row=>({...row,student_name:people.get(row.student_id)?.full_name||"دانشجو",student_number:people.get(row.student_id)?.student_number||"",details:questions.map((q,i)=>({no:q.question_no,answer:row.answers[i],correct_index:q.correct_index,explanation:q.explanation}))}))});
 }
 return fail("unknown_action",404);
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type","Vary":"Origin"}});
 const origin=req.headers.get("origin");if(origin&&origin!==ORIGIN)return fail("origin_not_allowed",403);
 if(req.method!=="POST")return fail("method_not_allowed",405);
 if(Number(req.headers.get("content-length")||0)>24000)return fail("request_too_large",413);
 try{
  if(!(req.headers.get("content-type")||"").includes("application/json"))return fail("bad_content_type",415);
  const body=await req.json();if(!body||typeof body!=="object"||Array.isArray(body))return fail("bad_request");
  return await route(body);
 }catch(e){console.error("MBA quiz API:",e instanceof Error?e.message:"unhandled");return fail("server_error",500)}
});
