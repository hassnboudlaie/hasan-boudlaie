// My Finance secure action endpoint for authenticated OAuth/MCP/GPT clients.
// Never uses service_role. Every query is bound to the Supabase Auth caller and RLS.
// Writes ONLY reviewable drafts, never financial entries/accounts.
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const APP_ORIGIN="https://hassnboudlaie.github.io";
const APP_URL="https://hassnboudlaie.github.io/hasan-boudlaie/my-finance/";
const originHeaders=(origin:string|null)=>{
 const allowed=origin===APP_ORIGIN?APP_ORIGIN:"null";
 return {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":allowed,
  "Access-Control-Allow-Headers":"authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods":"GET, POST, OPTIONS","Cache-Control":"no-store","Vary":"Origin"};
};
function reply(value:unknown,status=200,origin:string|null=null){
 return new Response(JSON.stringify(value),{status,headers:originHeaders(origin)});
}
const currencies=new Set(["IRT","IRR","USD","EUR"]);
const actions=new Set(["expense","income","loan_given"]);
const safeText=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
function todayInTehran(){
 const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Tehran",year:"numeric",month:"2-digit",day:"2-digit"})
  .formatToParts(new Date());
 const get=(name:string)=>parts.find(p=>p.type===name)?.value||"";
 return get("year")+"-"+get("month")+"-"+get("day");
}
function dateOK(date:string){
 return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date+"T12:00:00Z")) &&
  new Date(date+"T12:00:00Z").toISOString().slice(0,10)===date &&
  date>="2000-01-01" && date<=todayInTehran();
}
function isRequestKey(value:unknown):value is string {
 return typeof value==="string" && /^[A-Za-z0-9._-]{12,100}$/.test(value);
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("Origin");
 if(req.method==="OPTIONS"){
  if(origin!==APP_ORIGIN)return reply({error:"ORIGIN_DENIED"},403,origin);
  return new Response(null,{status:204,headers:originHeaders(origin)});
 }
 if(origin&&origin!==APP_ORIGIN)return reply({error:"ORIGIN_DENIED"},403,origin);
 if(!["GET","POST"].includes(req.method))return reply({error:"METHOD_NOT_ALLOWED"},405,origin);
 const token=req.headers.get("Authorization")?.replace(/^Bearer\s+/i,"").trim()||"";
 const base=Deno.env.get("SUPABASE_URL")||"";
 const key=Deno.env.get("SUPABASE_ANON_KEY")||Deno.env.get("SUPABASE_PUBLISHABLE_KEY")||"";
 if(!token||!base||!key)return reply({error:"UNAUTHORIZED"},401,origin);
 const authHeader="Bearer "+token;
 const supabase=createClient(base,key,{global:{headers:{Authorization:authHeader}},
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {data:authData,error:authError}=await supabase.auth.getUser(token);
 const uid=authData?.user?.id||"";
 if(authError||!uid)return reply({error:"UNAUTHORIZED"},401,origin);
 const {data:access,error:accessError}=await supabase.from("finance_access")
  .select("status,expires_at").eq("user_id",uid).maybeSingle();
 if(accessError||access?.status!=="active"||
  (access.expires_at&&Date.parse(access.expires_at)<=Date.now()))return reply({error:"FINANCE_ACCESS_DENIED"},403,origin);

 const route=new URL(req.url).pathname.split("/").filter(Boolean).at(-1)||"";
 const {data:settings,error:settingsError}=await supabase.from("finance_chatgpt_connections")
  .select("enabled,allow_summary,allow_drafts,oauth_client_id").eq("user_id",uid).maybeSingle();
 if(settingsError)return reply({error:"CONNECTION_UNAVAILABLE"},503,origin);
 // Every external action must use a real OAuth access token from the specific client
 // that the owner approved on the My Finance consent page. No session-token shortcuts.
 let claims:Record<string,unknown>={};
 try{
  const encoded=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
  claims=JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length/4)*4,"=")));
 }catch(_){}
 const oauthClient=typeof claims.client_id==="string"?claims.client_id:"";
 if(!oauthClient||!settings?.oauth_client_id||oauthClient!==settings.oauth_client_id)
  return reply({error:"OAUTH_CLIENT_NOT_APPROVED"},403,origin);

 if(req.method==="GET"&&route==="status"){
  return reply({enabled:settings?.enabled===true,
   allow_summary:settings?.enabled===true&&settings.allow_summary===true,
   allow_drafts:settings?.enabled===true&&settings.allow_drafts===true},200,origin);
 }
 if(settings?.enabled!==true)return reply({error:"CONNECTION_DISABLED",message:"Enable ChatGPT access in your own My Finance settings first."},403,origin);
 if(req.method==="GET"&&route==="summary"){
  if(!settings.allow_summary)return reply({error:"SUMMARY_PERMISSION_DENIED"},403,origin);
  const daysRaw=Number(new URL(req.url).searchParams.get("days")||30);
  if(!Number.isInteger(daysRaw)||daysRaw<1||daysRaw>90)return reply({error:"INVALID_DAYS"},400,origin);
  const since=new Date(Date.now()-daysRaw*86400000).toISOString();
  const cutoff=new Date().toISOString();
  const transactions:Array<{entry_type:string;amount:number|string;currency:string;category:string|null}>=[];
  const pageSize=500,max=5000;let truncated=false;
  for(let i=0;i<max;i+=pageSize){
   const {data,error}=await supabase.from("finance_entries")
    .select("entry_type,amount,currency,category").eq("user_id",uid)
    .eq("status","completed").in("entry_type",["expense","income"])
    .gte("occurred_at",since).lte("occurred_at",cutoff)
    .order("occurred_at",{ascending:true}).range(i,i+pageSize-1);
   if(error)return reply({error:"SUMMARY_QUERY_FAILED"},503,origin);
   transactions.push(...(data||[]));
   if((data||[]).length<pageSize)break;
   if(i+pageSize>=max)truncated=true;
  }
  const totals=new Map<string,{income:number;expense:number;count:number;categories:Map<string,number>}>();
  for(const t of transactions){
   const c=currencies.has(t.currency)?t.currency:"OTHER";
   const amount=Number(t.amount);
   if(!Number.isFinite(amount)||amount<=0)continue;
   if(!totals.has(c))totals.set(c,{income:0,expense:0,count:0,categories:new Map()});
   const x=totals.get(c)!;x.count++;
   if(t.entry_type==="income")x.income+=amount;
   if(t.entry_type==="expense"){
    x.expense+=amount;
    const cat=safeText(t.category||"سایر",80);
    x.categories.set(cat,(x.categories.get(cat)||0)+amount);
   }
  }
  return reply({period_days:daysRaw,as_of:cutoff,record_count:transactions.length,truncated,
   totals:[...totals].map(([currency,v])=>({currency,income:v.income,expense:v.expense,
    net:v.income-v.expense,transaction_count:v.count,
    top_expense_categories:[...v.categories].sort((a,b)=>b[1]-a[1]).slice(0,6)
     .map(([category,amount])=>({category,amount}))}))},200,origin);
 }
 if(req.method==="POST"&&route==="draft"){
  if(!settings.allow_drafts)return reply({error:"DRAFT_PERMISSION_DENIED"},403,origin);
  const len=Number(req.headers.get("Content-Length")||0);
  if(len>10000)return reply({error:"BODY_TOO_LARGE"},413,origin);
  let body:Record<string,unknown>;
  try{body=await req.json();if(!body||Array.isArray(body)||typeof body!=="object")throw Error("invalid");}
  catch(_){return reply({error:"INVALID_JSON"},400,origin);}
  if(!actions.has(String(body.action||"")))return reply({error:"UNSUPPORTED_ACTION",message:"Only income, expense and loan_given drafts are available."},422,origin);
  const amount=Number(body.amount),currency=String(body.currency||"");
  const date=safeText(body.occurred_on,10)||todayInTehran();
  if(!Number.isFinite(amount)||amount<=0||amount>1000000000000000||
   !currencies.has(currency)||!dateOK(date))return reply({error:"INVALID_AMOUNT_CURRENCY_OR_DATE"},422,origin);
  const keyValue=body.request_key==null?null:body.request_key;
  if(keyValue!==null&&!isRequestKey(keyValue))return reply({error:"INVALID_REQUEST_KEY"},422,origin);
  const fields={user_id:uid,action:String(body.action),amount,currency,occurred_on:date,
   person:safeText(body.person,120),account_name:safeText(body.account_name,120),
   category:safeText(body.category,150),memo:safeText(body.memo,500),
   request_key:keyValue,status:"pending"};
  let {data,error}=await supabase.from("finance_chatgpt_drafts").insert(fields)
   .select("id,action,amount,currency,occurred_on,created_at").single();
  if(error?.code==="23505"&&keyValue){
   const existing=await supabase.from("finance_chatgpt_drafts")
    .select("id,action,amount,currency,occurred_on,created_at").eq("user_id",uid)
    .eq("request_key",keyValue).maybeSingle();
   if(existing.error||!existing.data)return reply({error:"DRAFT_UNAVAILABLE"},503,origin);
   data=existing.data;error=null;
  }
  if(error||!data)return reply({error:"DRAFT_CREATE_FAILED"},503,origin);
  return reply({draft_id:data.id,action:data.action,amount:data.amount,currency:data.currency,
   occurred_on:data.occurred_on,status:"pending_review",
   review_url:APP_URL+"#chatgpt-draft="+data.id,
   message:"A private draft was created for this My Finance user. No transaction was recorded. User must open the URL and confirm."},201,origin);
 }
 return reply({error:"NOT_FOUND"},404,origin);
});
