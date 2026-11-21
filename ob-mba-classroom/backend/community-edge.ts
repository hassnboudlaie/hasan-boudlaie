// MBA OB Learning Community — two student-led formats, verified session access.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
const ORIGIN="https://hassnboudlaie.github.io";
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
const T="mba_ob_community_topics",R="mba_ob_community_replies",V="mba_ob_community_votes",I="mba_ob_community_invites",G="mba_ob_community_reviews";
const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type,apikey,authorization","Vary":"Origin"};
const output=(o:unknown,status=200)=>new Response(JSON.stringify(o),{status,headers});
const bad=(error:string,status=400)=>output({ok:false,error},status);
const plain=(x:unknown)=>String(x??"").trim();
const uuid=(v:unknown)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(plain(v));
const length=(v:unknown,min:number,max:number)=>plain(v).length>=min&&plain(v).length<=max;
async function hash(value:string){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");}
async function who(token:unknown){
 if(typeof token!=="string"||token.length<40||token.length>128)return null;
 const {data:s,error:e}=await db.from("mba_ob_sessions").select("role,student_id,expires_at,revoked_at").eq("token_hash",await hash(token)).maybeSingle();
 if(e||!s||s.revoked_at||Date.parse(s.expires_at)<=Date.now())return null;
 if(s.role==="teacher")return {role:"teacher",id:null,name:"مدرس"};
 if(s.role!=="student"||!s.student_id)return null;
 const {data:u}=await db.from("mba_ob_students").select("id,full_name,approval_status,disabled_at").eq("id",s.student_id).maybeSingle();
 if(!u||u.disabled_at||u.approval_status!=="approved")return null;
 return {role:"student",id:u.id as string,name:u.full_name as string};
}
async function names(ids:string[]){
 const unique=[...new Set(ids.filter(Boolean))];const obj:Record<string,string>={};
 if(unique.length){const {data,error}=await db.from("mba_ob_students").select("id,full_name").in("id",unique);if(error)throw error;for(const x of data||[])obj[x.id]=x.full_name;}
 return obj;
}
function writer(item:any,lookup:Record<string,string>){return item.demo?item.author_label||"نمونه فرضی":item.teacher_post?"مدرس":lookup[item.author_student_id]||"دانشجو";}
function source(raw:unknown){const s=plain(raw);if(!s)return null;if(s.length>500)throw new Error("invalid_url");try{const u=new URL(s);if(!["https:","http:"].includes(u.protocol)||u.username||u.password)throw Error();return u.toString();}catch{throw new Error("invalid_url");}}
function asTopic(item:any,lookup:Record<string,string>,replyCount=0){return {...item,author_name:writer(item,lookup),reply_count:replyCount};}
async function oneTopic(id:string){
 const {data,error}=await db.from(T).select("*").eq("id",id).is("hidden_at",null).maybeSingle();
 if(error)throw error;return data;
}
async function action(a:string,input:any,user:{role:string,id:string|null,name:string}){
 const teacher=user.role==="teacher",student=user.role==="student";
 if(a==="feed"){
  const {data:topics,error}=await db.from(T).select("*").is("hidden_at",null).order("last_activity_at",{ascending:false}).limit(100);
  if(error)throw error;
  const ids=(topics||[]).map(x=>x.id);
  let replies:any[]=[];
  if(ids.length){const q=await db.from(R).select("topic_id,author_student_id").in("topic_id",ids).is("hidden_at",null).limit(5000);if(q.error)throw q.error;replies=q.data||[];}
  const counts:Record<string,number>={};for(const r of replies)counts[r.topic_id]=(counts[r.topic_id]||0)+1;
  const lookup=await names((topics||[]).map(x=>x.author_student_id).filter(Boolean));
  let invited:string[]=[];
  if(student){const q=await db.from(I).select("topic_id").eq("invitee_id",user.id!);if(q.error)throw q.error;invited=(q.data||[]).map(x=>x.topic_id);}
  let graded:any[]=[];
  if(student){const q=await db.from(G).select("topic_id,score,feedback,reviewed_at").eq("student_id",user.id!);if(q.error)throw q.error;graded=q.data||[];}
  return output({ok:true,topics:(topics||[]).map(x=>asTopic(x,lookup,counts[x.id]||0)),invited,grades:graded,me:{role:user.role,name:user.name,id:user.id}});
 }
 if(a==="view"){
  if(!uuid(input.id))return bad("invalid_topic");
  const topic=await oneTopic(input.id);if(!topic)return bad("not_found",404);
  const {data:replies,error}=await db.from(R).select("*").eq("topic_id",topic.id).is("hidden_at",null).order("created_at",{ascending:true}).limit(500);
  if(error)throw error;
  const {data:votes,error:ve}=await db.from(V).select("option_index,student_id").eq("topic_id",topic.id);
  if(ve)throw ve;
  const allIds=[topic.author_student_id,...(replies||[]).map(r=>r.author_student_id)].filter(Boolean);
  const lookup=await names(allIds);
  const totals=[0,0,0,0];for(const vote of votes||[])if(vote.option_index>=0&&vote.option_index<4)totals[vote.option_index]++;
  const meVote=student?(votes||[]).find(v=>v.student_id===user.id)?.option_index??null:null;
  let contributors:any[]=[],myReview:any=null;
  if(teacher){
   const ids=[...new Set(allIds)] as string[];
   const {data:reviews,error:re}=await db.from(G).select("student_id,score,feedback,reviewed_at").eq("topic_id",topic.id);if(re)throw re;
   const reviewMap=new Map((reviews||[]).map(r=>[r.student_id,r]));
   contributors=ids.map(id=>({id,name:lookup[id]||"دانشجو",author:topic.author_student_id===id,replies:(replies||[]).filter(x=>x.author_student_id===id).length,review:reviewMap.get(id)||null}));
  }else{
   const q=await db.from(G).select("score,feedback,reviewed_at").eq("topic_id",topic.id).eq("student_id",user.id!).maybeSingle();
   if(q.error)throw q.error;myReview=q.data;
  }
  return output({ok:true,topic:asTopic(topic,lookup,(replies||[]).length),replies:(replies||[]).map(r=>({...r,author_name:writer(r,lookup)})),vote_totals:totals,my_vote:meVote,contributors,my_review:myReview,me:{role:user.role,id:user.id,name:user.name}});
 }
 if(a==="create"){
  if(!student)return bad("student_only",403);
  const kind=plain(input.kind),title=plain(input.title),body=plain(input.body),question=plain(input.question);
  const category=plain(input.category)||"موضوع آزاد",session=Number(input.session_no||2);
  const options=input.poll_options;
  if(!["case","wiki"].includes(kind)||!length(title,6,150)||!length(body,20,5000)||!length(question,8,900)||category.length>100||!Number.isInteger(session)||session<1||session>16)return bad("invalid_topic");
  if(!Array.isArray(options)||options.length===1||options.length>4||options.some(x=>typeof x!=="string"||x.trim().length<4||x.trim().length>180))return bad("invalid_poll");
  let link;try{link=source(input.source_url);}catch{return bad("invalid_url");}
  const {count,error:ce}=await db.from(T).select("id",{count:"exact",head:true}).eq("author_student_id",user.id!).gte("created_at",new Date(Date.now()-86400000).toISOString());if(ce)throw ce;
  if((count||0)>=6)return bad("daily_limit",429);
  const row={kind,title,body,question,category,session_no:session,author_student_id:user.id,source_url:link,source_label:link?(plain(input.source_label).slice(0,140)||"منبع پیشنهادی"):null,poll_options:options.map(x=>x.trim())};
  const {data,error}=await db.from(T).insert(row).select("id").single();if(error)throw error;
  return output({ok:true,id:data.id},201);
 }
 if(a==="reply"){
  if(!student)return bad("student_only",403);
  if(!uuid(input.topic_id)||!length(input.body,3,2500))return bad("invalid_reply");
  const topic=await oneTopic(input.topic_id);if(!topic)return bad("not_found",404);
  const {count,error:ce}=await db.from(R).select("id",{count:"exact",head:true}).eq("author_student_id",user.id!).gte("created_at",new Date(Date.now()-3600000).toISOString());if(ce)throw ce;
  if((count||0)>=40)return bad("hourly_limit",429);
  let parent=null;
  if(input.parent_reply_id){if(!uuid(input.parent_reply_id))return bad("invalid_parent");const q=await db.from(R).select("id").eq("id",input.parent_reply_id).eq("topic_id",topic.id).is("hidden_at",null).maybeSingle();if(q.error)throw q.error;if(!q.data)return bad("invalid_parent");parent=q.data.id;}
  const {data,error}=await db.from(R).insert({topic_id:topic.id,author_student_id:user.id,body:plain(input.body),parent_reply_id:parent}).select("id").single();if(error)throw error;
  await db.from(T).update({last_activity_at:new Date().toISOString()}).eq("id",topic.id);
  return output({ok:true,id:data.id},201);
 }
 if(a==="summarize"){
  if(!student&&!teacher)return bad("forbidden",403);
  if(!uuid(input.topic_id)||!length(input.summary,30,3000))return bad("invalid_summary");
  const topic=await oneTopic(input.topic_id);if(!topic)return bad("not_found",404);
  if(!teacher&&topic.author_student_id!==user.id)return bad("owner_only",403);
  const {error}=await db.from(T).update({summary:plain(input.summary),updated_at:new Date().toISOString(),last_activity_at:new Date().toISOString()}).eq("id",topic.id);if(error)throw error;
  return output({ok:true});
 }
 if(a==="vote"){
  if(!student)return bad("student_only",403);
  if(!uuid(input.topic_id)||!Number.isInteger(input.option_index))return bad("invalid_vote");
  const topic=await oneTopic(input.topic_id);if(!topic)return bad("not_found",404);
  const opts=topic.poll_options||[];if(input.option_index<0||input.option_index>=opts.length)return bad("invalid_vote");
  const {error}=await db.from(V).upsert({topic_id:topic.id,student_id:user.id,option_index:input.option_index,updated_at:new Date().toISOString()},{onConflict:"topic_id,student_id"});if(error)throw error;
  return output({ok:true});
 }
 if(a==="classmates"){
  if(!student)return bad("student_only",403);
  const {data,error}=await db.from("mba_ob_students").select("id,full_name").eq("approval_status","approved").is("disabled_at",null).neq("id",user.id!).order("full_name").limit(250);if(error)throw error;
  return output({ok:true,students:data||[]});
 }
 if(a==="invite"){
  if(!student)return bad("student_only",403);
  if(!uuid(input.topic_id)||!uuid(input.invitee_id)||input.invitee_id===user.id)return bad("invalid_invite");
  const topic=await oneTopic(input.topic_id);if(!topic)return bad("not_found",404);
  if(topic.author_student_id!==user.id)return bad("owner_only",403);
  const {data:target}=await db.from("mba_ob_students").select("id").eq("id",input.invitee_id).eq("approval_status","approved").is("disabled_at",null).maybeSingle();if(!target)return bad("unknown_student");
  const {error}=await db.from(I).upsert({topic_id:topic.id,inviter_id:user.id,invitee_id:target.id},{onConflict:"topic_id,invitee_id",ignoreDuplicates:true});if(error)throw error;
  return output({ok:true});
 }
 if(a==="review"){
  if(!teacher)return bad("teacher_only",403);
  const score=Number(input.score),studentId=plain(input.student_id),topicId=plain(input.topic_id),feedback=plain(input.feedback);
  if(!uuid(studentId)||!uuid(topicId)||!Number.isInteger(score)||score<0||score>10||feedback.length>1500)return bad("invalid_review");
  const topic=await oneTopic(topicId);if(!topic)return bad("not_found",404);
  const {data:participant,error:pe}=await db.from(R).select("id").eq("topic_id",topicId).eq("author_student_id",studentId).is("hidden_at",null).limit(1);
  if(pe)throw pe;if(topic.author_student_id!==studentId&&!(participant||[]).length)return bad("not_participant",403);
  const {error}=await db.from(G).upsert({topic_id:topicId,student_id:studentId,score,feedback,reviewed_at:new Date().toISOString()},{onConflict:"topic_id,student_id"});if(error)throw error;
  return output({ok:true});
 }
 if(a==="hideTopic"||a==="hideReply"){
  if(!teacher)return bad("teacher_only",403);
  if(!uuid(input.id))return bad("invalid_id");
  const {error}=await db.from(a==="hideTopic"?T:R).update({hidden_at:new Date().toISOString()}).eq("id",input.id);if(error)throw error;
  return output({ok:true});
 }
 return bad("unknown_action",404);
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(origin&&origin!==ORIGIN)return bad("origin_not_allowed",403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return bad("method_not_allowed",405);
 try{
  const body=await req.json();
  if(!body||typeof body!=="object")return bad("invalid_request");
  const user=await who(body.token);
  if(!user)return bad("session_expired",401);
  return await action(plain(body.action),body,user);
 }catch(err){console.error("community error",String(err));return bad("server_error",500);}
});