/**
 * My Finance private ChatGPT plugin — MCP Streamable HTTP endpoint.
 * ChatGPT speaks to this server, not to GitHub Pages and not to the database REST API.
 * Only a verified Supabase OAuth client explicitly approved by the account owner can call tools.
 * IMPORTANT: Never turn on the shared project's OAuth issuer until tenant isolation is audited.
 */
const PROJECT="https://hxcjkewlaniahvuqwwbb.supabase.co";
const RESOURCE=PROJECT+"/functions/v1/finance-chatgpt-mcp/mcp";
const PROTECTED=PROJECT+"/functions/v1/finance-chatgpt-mcp/.well-known/oauth-protected-resource";
const APP="https://hassnboudlaie.github.io/hasan-boudlaie/my-finance/";
const API_VERSION="2025-06-18";
const CORS_ORIGIN="https://hassnboudlaie.github.io";
const BASE_HEADERS={
 "Content-Type":"application/json; charset=utf-8",
 "Cache-Control":"no-store",
 "Access-Control-Allow-Methods":"GET, POST, OPTIONS",
 "Access-Control-Allow-Headers":"authorization, content-type, accept, mcp-protocol-version, mcp-session-id",
 "Access-Control-Expose-Headers":"WWW-Authenticate, MCP-Session-Id",
 "Vary":"Origin"
};
const response=(body:unknown,status=200,extra:Record<string,string>={})=>
 new Response(JSON.stringify(body),{status,headers:{...BASE_HEADERS,...extra}});
const failure=(id:unknown,code:number,message:string,data?:unknown)=>
 ({jsonrpc:"2.0",id:id??null,error:{code,message,...(data===undefined?{}:{data})}});
const success=(id:unknown,value:unknown)=>({jsonrpc:"2.0",id:id??null,result:value});
const content=(value:unknown)=>({content:[{type:"text",text:JSON.stringify(value)}]});
const protectedResponse=()=>response({error:"OAuth authentication required"},401,{
 "WWW-Authenticate":'Bearer resource_metadata="'+PROTECTED+'", scope="openid email profile"'
});
const tools=[
 {name:"get_my_finance_summary",title:"Get My Finance summary",
  description:"Read a personal aggregate financial summary grouped by currency and categories for the authenticated My Finance account. Never reveals raw items or bank/account numbers. Requires consent for summaries.",
  annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},
  inputSchema:{type:"object",additionalProperties:false,properties:{days:{type:"integer",minimum:1,maximum:90,default:30}}}},
 {name:"list_my_finance_accounts",title:"List my financial accounts",
  description:"Get ONLY bank/wallet display names and currency of the currently connected user's accounts, so you can match a spoken bank name. Do not invent an account. Requires permission to create drafts.",
  annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},
  inputSchema:{type:"object",additionalProperties:false,properties:{}}},
 {name:"propose_my_finance_entry",title:"Prepare My Finance entry",
  description:"Convert the user's spoken financial intent into a private draft for their account. Expense, income or money lent to another person (loan_given) are supported. Does NOT record any transaction. Always ask for the user's explicit confirmation of amount, currency, category, date and account before invoking confirm. Toman=IRT, Rial=IRR; never confuse these. If account unspecified, it is left empty, so balances won't change.",
  annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},
  inputSchema:{type:"object",additionalProperties:false,required:["action","amount","currency"],
   properties:{action:{type:"string",enum:["expense","income","loan_given"]},
    amount:{type:"number",exclusiveMinimum:0,maximum:1000000000000000},
    currency:{type:"string",enum:["IRT","IRR","USD","EUR"]},
    account_name:{type:"string",maxLength:120,description:"Exact name returned by list_my_finance_accounts, or blank."},
    person:{type:"string",maxLength:120,description:"Required for loan_given"},
    category:{type:"string",maxLength:150},
    memo:{type:"string",maxLength:500},
    occurred_on:{type:"string",description:"Gregorian YYYY-MM-DD. Omit for today in Tehran."},
    request_key:{type:"string",minLength:12,maxLength:100,description:"Stable unique key to avoid duplicate drafts on retries."}}}},
 {name:"confirm_my_finance_entry",title:"Record approved transaction in My Finance",
  description:"FINANCIAL WRITE. Only use after showing the proposed entry to the user and obtaining a NEW, EXPLICIT user approval in this ChatGPT conversation. Calling this tool records the transaction in the connected user's real My Finance account; no app switch. ChatGPT may require on-screen approval (spoken approval alone may not suffice). Loan_given creates a RECEIVABLE, not an expense. Idempotent on draft_id. NEVER auto-call immediately after propose.",
  annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},
  inputSchema:{type:"object",additionalProperties:false,required:["draft_id","user_confirmed"],
   properties:{draft_id:{type:"string",format:"uuid"},
    user_confirmed:{type:"boolean",description:"True only after explicit user confirmation of this draft in ChatGPT."}}}}
];
const safe=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const allowed=new Set(["IRT","IRR","USD","EUR"]);
const act=new Set(["expense","income","loan_given"]);
function todayTehran(){
 const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tehran",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const part=(x:string)=>p.find(q=>q.type===x)?.value||"";
 return part("year")+"-"+part("month")+"-"+part("day");
}
function validDate(x:string){
 return /^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T12:00:00Z"))&&
  new Date(x+"T12:00:00Z").toISOString().slice(0,10)===x&&x<=(todayTehran())&&x>="2000-01-01";
}
async function dbQuery(url:string,token:string,options:RequestInit={}){
 const key=Deno.env.get("SUPABASE_ANON_KEY")||Deno.env.get("SUPABASE_PUBLISHABLE_KEY")||"";
 if(!key)throw Error("SERVER_KEY_MISSING");
 const headers={apikey:key,Authorization:"Bearer "+token,
  Accept:"application/json","Content-Type":"application/json",
  ...(options.headers instanceof Headers?Object.fromEntries(options.headers):options.headers||{})};
 const r=await fetch(PROJECT+"/rest/v1/"+url,{...options,headers});
 const txt=await r.text();let obj:unknown=null;
 try{obj=txt?JSON.parse(txt):null}catch{throw Error("DATABASE_INVALID_RESPONSE")}
 if(!r.ok)throw Error("DATABASE_REJECTED: "+(typeof obj==="object"&&obj&&"message" in obj?String(obj.message).slice(0,160):r.status));
 return obj;
}
async function authContext(request:Request){
 const raw=request.headers.get("Authorization")||"";
 const match=raw.match(/^Bearer\s+([A-Za-z0-9._-]+)$/i);
 if(!match)throw Error("UNAUTHORIZED");
 const token=match[1];
 const key=Deno.env.get("SUPABASE_ANON_KEY")||Deno.env.get("SUPABASE_PUBLISHABLE_KEY")||"";
 const userResponse=await fetch(PROJECT+"/auth/v1/user",{
  headers:{apikey:key,Authorization:"Bearer "+token,Accept:"application/json"}
 });
 if(!userResponse.ok)throw Error("INVALID_TOKEN");
 const user=await userResponse.json();
 const uid=String(user?.id||"");
 if(!uuid.test(uid))throw Error("INVALID_USER");
 let claims:Record<string,unknown>={};
 try{
  const s=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
  claims=JSON.parse(atob(s.padEnd(Math.ceil(s.length/4)*4,"=")));
 }catch{}
 if(claims.sub!==uid||typeof claims.client_id!=="string"||claims.client_id.length<8)
  throw Error("OAUTH_CLIENT_REQUIRED");

 const access=await dbQuery("finance_access?select=status,expires_at&user_id=eq."+uid,token);
 const item=Array.isArray(access)?access[0]:null;
 if(item?.status!=="active"||(item.expires_at&&Date.parse(item.expires_at)<=Date.now()))
  throw Error("FINANCE_ACCOUNT_INACTIVE");
 const settings=await dbQuery("finance_chatgpt_connections?select=enabled,allow_summary,allow_drafts,oauth_client_id&user_id=eq."+uid,token);
 const grant=Array.isArray(settings)?settings[0]:null;
 if(grant?.enabled!==true||grant?.oauth_client_id!==claims.client_id)
  throw Error("CHATGPT_CLIENT_NOT_AUTHORIZED");
 return {uid,token,grant};
}
async function toolCall(name:string,args:Record<string,unknown>,ctx:Awaited<ReturnType<typeof authContext>>){
 const {uid,token,grant}=ctx;
 if(name==="get_my_finance_summary"){
  if(!grant.allow_summary)throw Error("SUMMARY_PERMISSION_DISABLED");
  const days=args.days===undefined?30:Number(args.days);
  if(!Number.isInteger(days)||days<1||days>90)throw Error("INVALID_DAYS");
  const since=new Date(Date.now()-days*86400000).toISOString();
  const before=new Date().toISOString();
  const totals=new Map<string,{income:number;expense:number;count:number;categories:Map<string,number>}>();
  let count=0,clipped=false;
  for(let i=0;i<5000;i+=500){
   const filters=new URLSearchParams({
    select:"entry_type,amount,currency,category",
    user_id:"eq."+uid,status:"eq.completed",
    entry_type:"in.(expense,income)",
    occurred_at:"gte."+since,
    order:"occurred_at.asc",
    limit:"500",offset:String(i)
   });
   const rows=await dbQuery("finance_entries?"+filters,token);
   if(!Array.isArray(rows))throw Error("SUMMARY_DATA_MISSING");
   for(const t of rows){
    const num=Number(t.amount);const currency=String(t.currency||"OTHER");
    if(!(num>0)||!Number.isFinite(num))continue;
    if(!totals.has(currency))totals.set(currency,{income:0,expense:0,count:0,categories:new Map()});
    const v=totals.get(currency)!;v.count++;count++;
    if(t.entry_type==="income")v.income+=num;
    if(t.entry_type==="expense"){v.expense+=num;const category=safe(t.category||"سایر",80);
     v.categories.set(category,(v.categories.get(category)||0)+num)}
   }
   if(rows.length<500)break;
   if(i>=4500)clipped=true;
  }
  return {as_of:before,period_days:days,count,truncated:clipped,
   summary:[...totals].map(([currency,v])=>({currency,
    income:v.income,expense:v.expense,net:v.income-v.expense,transactions:v.count,
    top_expense_categories:[...v.categories].sort((a,b)=>b[1]-a[1]).slice(0,6)
     .map(([category,amount])=>({category,amount}))}))};
 }
 if(name==="list_my_finance_accounts"){
  if(!grant.allow_drafts)throw Error("DRAFT_PERMISSION_DISABLED");
  const query=new URLSearchParams({select:"payload",user_id:"eq."+uid,
   kind:"eq.account",order:"created_at.asc",limit:"100"});
  const rows=await dbQuery("finance_objects?"+query,token);
  if(!Array.isArray(rows))throw Error("ACCOUNTS_UNAVAILABLE");
  return {accounts:rows.map(a=>({name:safe(a.payload?.name,120),
    currency:safe(a.payload?.currency,8)})).filter(a=>a.name),
    note:"Display names only. Never infer hidden bank accounts."};
 }
 if(name==="propose_my_finance_entry"){
  if(!grant.allow_drafts)throw Error("DRAFT_PERMISSION_DISABLED");
  const action=String(args.action||""),currency=String(args.currency||"");
  const amount=Number(args.amount),date=safe(args.occurred_on,10)||todayTehran();
  if(!act.has(action)||!allowed.has(currency)||!Number.isFinite(amount)||
   amount<=0||amount>1e15||!validDate(date))throw Error("INVALID_FINANCIAL_DRAFT");
  const person=safe(args.person,120),account_name=safe(args.account_name,120);
  if(action==="loan_given"&&!person)throw Error("COUNTERPARTY_REQUIRED_FOR_LOAN");
  const request_key=args.request_key===undefined?crypto.randomUUID():safe(args.request_key,100);
  if(!/^[A-Za-z0-9._-]{12,100}$/.test(request_key))throw Error("INVALID_IDEMPOTENCY_KEY");
  const fields={user_id:uid,request_key,action,amount,currency,person,account_name,
   occurred_on:date,category:safe(args.category,150),
   memo:safe(args.memo,500),status:"pending"};
  let draft:null|Record<string,unknown>=null;
  try{
   const rows=await dbQuery("finance_chatgpt_drafts?select=id,action,amount,currency,person,account_name,occurred_on,category,memo,status,expires_at",
    token,{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(fields)});
   draft=Array.isArray(rows)?rows[0]||null:null;
  }catch(e){
   if(!String(e).includes("duplicate key"))throw e;
   const rows=await dbQuery("finance_chatgpt_drafts?select=id,action,amount,currency,person,account_name,occurred_on,category,memo,status,expires_at&user_id=eq."+
    uid+"&request_key=eq."+encodeURIComponent(request_key),token);
   draft=Array.isArray(rows)?rows[0]||null:null;
  }
  if(!draft||!uuid.test(String(draft.id)))throw Error("DRAFT_NOT_CREATED");
  return {draft_id:draft.id,action:draft.action,amount:draft.amount,
   currency:draft.currency,date:draft.occurred_on,category:draft.category,
   account:draft.account_name||"(unspecified)",counterparty:draft.person||"",
   status:draft.status,review_url:APP+"#chatgpt-draft="+draft.id,
   next_step:"Read the amount, currency, action, bank and date back to the user. Do not record anything until the user explicitly confirms."};
 }
 if(name==="confirm_my_finance_entry"){
  if(!grant.allow_drafts)throw Error("DRAFT_PERMISSION_DISABLED");
  if(args.user_confirmed!==true||!uuid.test(String(args.draft_id||"")))
   throw Error("EXPLICIT_USER_CONFIRMATION_REQUIRED");
  const result=await dbQuery("rpc/finance_confirm_chatgpt_draft",token,{
   method:"POST",body:JSON.stringify({p_draft_id:String(args.draft_id)})});
  return {result,already_recorded:result?.status==="already_recorded",
   message:"Confirmed entry recorded in the authenticated user's My Finance cloud account. Refresh or sync the PWA to see it."};
 }
 throw Error("TOOL_NOT_FOUND");
}
Deno.serve(async(request:Request)=>{
 const origin=request.headers.get("Origin");
 if(origin&&origin!==CORS_ORIGIN)return response({error:"ORIGIN_DENIED"},403);
 if(request.method==="OPTIONS")return new Response(null,{status:204,
  headers:{...BASE_HEADERS,"Access-Control-Allow-Origin":CORS_ORIGIN}});
 const path=new URL(request.url).pathname.split("/").filter(Boolean).at(-1)||"";
 if(request.method==="GET"&&path===".well-known")return response({service:"My Finance MCP"},200);
 if(request.method==="GET"&&path==="oauth-protected-resource")
  return response({resource:RESOURCE,authorization_servers:[PROJECT+"/auth/v1"],
   bearer_methods_supported:["header"],scopes_supported:["openid","email","profile"]});
 if(request.method==="GET"&&path==="health")
  return response({service:"My Finance ChatGPT MCP",version:"1.0.0",healthy:true,
   authentication:"OAuth required for all financial actions",writes:"user-confirmed only"});
 if(request.method!=="POST"||path!=="mcp")return response({error:"NOT_FOUND"},404,{"Allow":"POST, OPTIONS"});
 const len=Number(request.headers.get("Content-Length")||"0");
 if(len>18000)return response({error:"BODY_TOO_LARGE"},413);
 let rpc:Record<string,unknown>;
 try{
  const raw=await request.text();
  if(raw.length>18000)throw Error("too long");
  rpc=JSON.parse(raw);
  if(!rpc||Array.isArray(rpc)||rpc.jsonrpc!=="2.0"||typeof rpc.method!=="string")throw Error("invalid RPC");
 }catch{return response(failure(null,-32700,"Parse error"),400)}
 const id=rpc.id,method=rpc.method,params=rpc.params;
 if(method==="initialize")
  return response(success(id,{protocolVersion:API_VERSION,
   capabilities:{tools:{listChanged:false}},
   serverInfo:{name:"my-finance",version:"1.0.0"},
   instructions:"Private finance plugin. Never commit without explicit user confirmation. Keep IRT (toman) separate from IRR (rial)."}));
 if(method==="notifications/initialized"||method==="notifications/cancelled")
  return new Response(null,{status:202,headers:BASE_HEADERS});
 if(method==="ping")return response(success(id,{}));
 if(method==="tools/list")return response(success(id,{tools}));
 if(method!=="tools/call")return response(failure(id,-32601,"Method not found"));
 const name=typeof params==="object"&&params?String((params as Record<string,unknown>).name||""):"";
 const args=typeof params==="object"&&params?
  (params as Record<string,unknown>).arguments:null;
 const cleanArgs=typeof args==="object"&&args!==null&&!Array.isArray(args)?
  args as Record<string,unknown>:{};
 if(!tools.some(t=>t.name===name))return response(failure(id,-32602,"Unknown tool name"));
 try{
  const ctx=await authContext(request);
  const answer=await toolCall(name,cleanArgs,ctx);
  return response(success(id,content(answer)),200,{"MCP-Protocol-Version":API_VERSION});
 }catch(e){
  const message=String((e as Error)?.message||e).slice(0,180);
  if(["UNAUTHORIZED","INVALID_TOKEN","OAUTH_CLIENT_REQUIRED","INVALID_USER"].includes(message))
   return protectedResponse();
  return response(success(id,{...content({error:message}),isError:true}),200);
 }
});
