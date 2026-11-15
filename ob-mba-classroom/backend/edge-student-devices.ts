// Allameh MBA classroom – approved-student cross-device sign-in.
// Existing classroom approval is never repeated per device.
// The student's approved session may set/rotate a personal password; the password
// then verifies independent logins without teacher review. Service role stays here.
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const ORIGIN="https://hassnboudlaie.github.io";
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{
 auth:{persistSession:false,autoRefreshToken:false}
});
const encoder=new TextEncoder();
const hex=(n=32)=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>b.toString(16).padStart(2,"0")).join("");
async function sha(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(s))),b=>b.toString(16).padStart(2,"0")).join("");}
const normalizeNumber=(v:unknown)=>String(v||"").replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776))
 .replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).trim();
function send(payload:Record<string,unknown>,status=200){return new Response(JSON.stringify(payload),{status,headers:{
 "content-type":"application/json; charset=utf-8","cache-control":"no-store",
 "access-control-allow-origin":ORIGIN,"access-control-allow-headers":"content-type,authorization,apikey",
 "access-control-allow-methods":"POST, OPTIONS","vary":"Origin"
}});}
const error=(code:string,status=400)=>send({ok:false,error:code},status);
async function approved(token:unknown){
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token))return null;
 const {data:s,error}=await db.from("mba_ob_sessions")
  .select("student_id,role,revoked_at,expires_at").eq("token_hash",await sha(token)).maybeSingle();
 if(error||!s||s.role!=="student"||!s.student_id||s.revoked_at||Date.parse(s.expires_at)<=Date.now())return null;
 const {data:u,error:ue}=await db.from("mba_ob_students")
  .select("id,student_number,full_name,approval_status,disabled_at").eq("id",s.student_id).maybeSingle();
 if(ue||!u||u.disabled_at||u.approval_status!=="approved")return null;
 return u;
}
async function action(input:Record<string,unknown>){
 const mode=String(input.action||"");
 if(mode==="passwordStatus"||mode==="setPassword"){
  const user=await approved(input.token);
  if(!user)return error("session_expired",401);
  if(mode==="passwordStatus"){
   const {data,e}=await db.from("mba_ob_student_device_passwords").select("student_id").eq("student_id",user.id).maybeSingle();
   if(e)throw Error("status_failed");
   return send({ok:true,enabled:!!data});
  }
  const password=input.password;
  if(typeof password!=="string"||password.length<12||password.length>128||!/[\p{L}]/u.test(password)||!/[0-9]/.test(password))
   return error("password_policy",400);
  const {data, error:e}=await db.rpc("mba_ob_set_device_password",{p_student_id:user.id,p_password:password});
  if(e)throw Error("set_password_failed");
  if(data!==true)return error("password_policy",400);
  return send({ok:true,enabled:true});
 }
 if(mode==="studentDeviceLogin"){
  const number=normalizeNumber(input.student_number);
  const password=input.password;
  if(!/^\d{6,16}$/.test(number)||typeof password!=="string"||password.length>128||password.length<12)
   return error("invalid_credentials",401);
  const {data:id,error:e}=await db.rpc("mba_ob_verify_device_password",{
    p_student_number:number,p_password:password
  });
  if(e)throw Error("credential_check_failed");
  if(typeof id!=="string")return error("invalid_credentials",401);
  const {data:user,error:ue}=await db.from("mba_ob_students")
   .select("id,student_number,full_name,approval_status,disabled_at").eq("id",id).maybeSingle();
  if(ue||!user||user.approval_status!=="approved"||user.disabled_at)return error("invalid_credentials",401);
  const token=hex(32),expires=new Date(Date.now()+365*86400000).toISOString();
  const {error:se}=await db.from("mba_ob_sessions").insert({
   role:"student",student_id:id,token_hash:await sha(token),expires_at:expires
  });
  if(se)throw Error("login_session_failed");
  return send({ok:true,role:"student",token,name:user.full_name,student_number:user.student_number,
   approval_status:"approved",expires_at:expires});
 }
 return error("unknown_action",404);
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return send({ok:true});
 if(req.method!=="POST")return error("method_not_allowed",405);
 const origin=req.headers.get("origin");
 if(origin&&origin!==ORIGIN)return error("origin_not_allowed",403);
 try{
  const body=await req.text();
  if(body.length>4096)return error("request_too_large",413);
  const input=JSON.parse(body);
  if(!input||typeof input!=="object"||Array.isArray(input))return error("bad_request",400);
  return await action(input);
 }catch(e){
  if(e instanceof SyntaxError)return error("invalid_json",400);
  console.error("MBA student device login:",e instanceof Error?e.message:"unknown");
  return error("server_error",500);
 }
});
