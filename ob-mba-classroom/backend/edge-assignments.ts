// MBA OB: private student assignment inbox (case analysis + homework).
// This function authenticates existing opaque classroom tokens server-side; no public direct data access.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
const BASE = Deno.env.get("SUPABASE_URL")!;
const SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db=createClient(BASE,SECRET,{auth:{persistSession:false,autoRefreshToken:false}});
const BUCKET="mba-ob-assignments", ORIGIN="https://hassnboudlaie.github.io";
const TYPES:Record<string,string>={
 ".pdf":"application/pdf",
 ".docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
 ".txt":"text/plain",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg"};
const encoder=new TextEncoder();
function answer(obj:Record<string,unknown>,status=200){
 return new Response(JSON.stringify(obj),{status,headers:{
  "Content-Type":"application/json;charset=utf-8","Cache-Control":"no-store",
  "Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"content-type",
  "Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}});
}
const no=(error:string,status=400)=>answer({ok:false,error},status);
function validSession(s:unknown){const n=Number(s);return Number.isInteger(n)&&n>=1&&n<=16?n:0}
function validKind(v:unknown){return v==="case"||v==="homework"?v:""}
async function hash(value:string){const arr=new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(value)));return Array.from(arr,x=>x.toString(16).padStart(2,"0")).join("")}
async function identity(token:unknown){
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token))return null;
 const {data:session,error}=await db.from("mba_ob_sessions").select("role,student_id,expires_at,revoked_at").eq("token_hash",await hash(token)).maybeSingle();
 if(error||!session||session.revoked_at||Date.parse(session.expires_at)<=Date.now()||!["student","teacher"].includes(session.role))return null;
 if(session.role==="teacher")return {role:"teacher" as const,student_id:"",name:"مدرس",student_number:""};
 const {data:student, error:studErr}=await db.from("mba_ob_students").select("id,full_name,student_number,approval_status,disabled_at").eq("id",session.student_id).maybeSingle();
 if(studErr||!student||student.disabled_at||student.approval_status!=="approved")return null;
 return {role:"student" as const,student_id:student.id as string,name:student.full_name as string,student_number:student.student_number as string};
}
function validFile(file:File){
 const ext=(file.name.match(/\.[a-z0-9]+$/i)||[])[0]?.toLowerCase()||"";
 const expected=TYPES[ext];
 return Boolean(expected&&file.size>0&&file.size<=8388608&&file.name.length<=150&&
   (file.type===expected || (ext===".jpg"&&file.type==="image/jpeg") || (!file.type&&ext===".txt")));
}
async function checkSignature(file:File){
 const x=new Uint8Array(await file.slice(0,16).arrayBuffer());
 const name=file.name.toLowerCase();
 if(name.endsWith(".pdf"))return x[0]===37&&x[1]===80&&x[2]===68&&x[3]===70&&x[4]===45;
 if(name.endsWith(".png"))return [137,80,78,71,13,10,26,10].every((v,i)=>x[i]===v);
 if(name.endsWith(".jpg")||name.endsWith(".jpeg"))return x[0]===255&&x[1]===216&&x[2]===255;
 if(name.endsWith(".docx"))return x[0]===80&&x[1]===75;
 if(name.endsWith(".txt"))return !x.includes(0);
 return false;
}
function safeFileName(s:string){
 return s.replace(/[\x00-\x1f\x7f/\\]/g,"").trim().slice(0,120)||"file";
}
async function submit(form:FormData){
 const user=await identity(form.get("token"));
 if(!user)return no("session_expired",401);
 if(user.role!=="student")return no("student_only",403);
 const session=validSession(form.get("session")),kind=validKind(form.get("kind"));
 if(!session||!kind)return no("invalid_assignment");
 const raw=String(form.get("answer")||"").trim();
 if(raw.length>12000)return no("answer_too_long");
 const files=form.getAll("files").filter((x):x is File=>x instanceof File && x.size>0);
 if(files.length>3)return no("too_many_files");
 if(raw.length<8&&!files.length)return no("answer_or_file_required");
 if(files.some(f=>!validFile(f)))return no("invalid_attachment");
 for(const file of files)if(!await checkSignature(file))return no("invalid_file_signature");
 const {data:existing,error:preErr}=await db.from("mba_ob_assignments").select("id,status")
  .eq("student_id",user.student_id).eq("session_no",session).eq("kind",kind).maybeSingle();
 if(preErr)throw new Error("assignment_lookup_failed");
 if(existing&&existing.status!=="revision_requested")return no("assignment_already_submitted",409);
 const uploaded:string[]=[];
 const fileItems:{path:string;name:string;size:number;type:string}[]=[];
 try{
  for(const f of files){
   const ext=(f.name.match(/\.[a-z0-9]+$/i)||[])[0].toLowerCase();
   const path=user.student_id+"/"+session+"/"+kind+"/"+crypto.randomUUID()+ext;
   const {error}=await db.storage.from(BUCKET).upload(path,await f.arrayBuffer(),{contentType:TYPES[ext],upsert:false,cacheControl:"0"});
   if(error)throw new Error("upload_failed");
   uploaded.push(path);
   fileItems.push({path,name:safeFileName(f.name),size:f.size,type:TYPES[ext]});
  }
  const {data,error}=await db.rpc("mba_ob_submit_assignment",{
   p_student_id:user.student_id,p_session_no:session,p_kind:kind,p_answer_text:raw,p_file_items:fileItems});
  if(error)throw new Error("assignment_save_failed");
  if(!data?.ok)throw new Error(String(data?.error||"assignment_save_failed"));
  return answer({ok:true,submission:{...data,session_no:session,kind,file_count:fileItems.length}});
 }catch(e){
  if(uploaded.length)await db.storage.from(BUCKET).remove(uploaded);
  return no(e instanceof Error?e.message:"assignment_save_failed",409);
 }
}
async function route(input:Record<string,unknown>){
 const action=String(input.action||"");
 const user=await identity(input.token);
 if(!user)return no("session_expired",401);
 if(action==="mine"){
  if(user.role!=="student")return no("student_only",403);
  const session=validSession(input.session);
  if(!session)return no("invalid_session");
  const {data,error}=await db.from("mba_ob_assignments")
   .select("id,session_no,kind,answer_text,file_items,status,score,feedback,revision_no,submitted_at,reviewed_at")
   .eq("student_id",user.student_id).eq("session_no",session).order("submitted_at",{ascending:false});
  if(error)throw new Error("assignment_lookup_failed");
  return answer({ok:true,assignments:data||[]});
 }
 if(action==="list"){
  if(user.role!=="teacher")return no("teacher_only",403);
  const session=Number(input.session||0);
  if(session!==0&&!validSession(session))return no("invalid_session");
  let q=db.from("mba_ob_assignments")
   .select("id,student_id,session_no,kind,answer_text,file_items,status,score,feedback,revision_no,submitted_at,reviewed_at")
   .order("submitted_at",{ascending:false}).limit(500);
  if(session)q=q.eq("session_no",session);
  const [a,students]=await Promise.all([q,db.from("mba_ob_students").select("id,full_name,student_number").limit(1000)]);
  if(a.error||students.error)throw new Error("assignment_list_failed");
  const nameMap=new Map((students.data||[]).map(s=>[s.id,s]));
  const list=(a.data||[]).map(x=>({...x,student_name:nameMap.get(x.student_id)?.full_name||"دانشجو",
   student_number:nameMap.get(x.student_id)?.student_number||""}));
  return answer({ok:true,assignments:list});
 }
 if(action==="review"){
  if(user.role!=="teacher")return no("teacher_only",403);
  const id=String(input.id||"");
  const decision=String(input.decision||"");
  const feedback=String(input.feedback||"").trim();
  const score=decision==="reviewed"?Number(input.score):null;
  if(!/^[0-9a-f-]{36}$/.test(id)||!["reviewed","revision_requested"].includes(decision)||
    feedback.length<8||feedback.length>3000||
    (decision==="reviewed"&&(!Number.isFinite(score)||score!<0||score!>20)))return no("invalid_review");
  const {data,error}=await db.rpc("mba_ob_review_assignment",{
   p_id:id,p_decision:decision,p_score:score,p_feedback:feedback});
  if(error)throw new Error("review_failed");
  return answer(data as Record<string,unknown>,data?.ok?200:409);
 }
 if(action==="fileUrl"){
  const id=String(input.id||""),path=String(input.path||"");
  if(!/^[0-9a-f-]{36}$/.test(id)||!path||path.length>500)return no("invalid_attachment");
  const {data:row,error}=await db.from("mba_ob_assignments").select("id,student_id,file_items").eq("id",id).maybeSingle();
  if(error||!row)return no("file_not_found",404);
  if(user.role!=="teacher"&&row.student_id!==user.student_id)return no("forbidden",403);
  const item=(Array.isArray(row.file_items)?row.file_items:[]).find((v:any)=>v?.path===path);
  if(!item)return no("file_not_found",404);
  const {data,error:signedErr}=await db.storage.from(BUCKET).createSignedUrl(path,90,{download:item.name||"attachment"});
  if(signedErr||!data?.signedUrl)throw new Error("download_failed");
  return answer({ok:true,url:data.signedUrl,expires_in:90});
 }
 return no("unknown_action",404);
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(origin&&origin!==ORIGIN)return no("origin_not_allowed",403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{
  "Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"content-type",
  "Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}});
 if(req.method!=="POST")return no("method_not_allowed",405);
 if(Number(req.headers.get("content-length")||"0")>27000000)return no("request_too_large",413);
 try{
  const mime=req.headers.get("content-type")||"";
  if(mime.startsWith("multipart/form-data"))return await submit(await req.formData());
  if(!mime.includes("application/json"))return no("invalid_content_type",415);
  const body=await req.json();
  if(!body||typeof body!=="object"||Array.isArray(body))return no("bad_request");
  return await route(body as Record<string,unknown>);
 }catch(e){
  console.error("MBA assignment API:",e instanceof Error?e.message:"unexpected");
  return no("server_error",500);
 }
});
