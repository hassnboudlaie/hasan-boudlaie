import http from 'node:http';
const origin='https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/finance-chatgpt-mcp';
const self=process.env.PUBLIC_BASE_URL||'https://my-finance-chatgpt-mcp-gateway.onrender.com';
const challenge=(process.env.OPENAI_CHALLENGE||'').trim();
const port=Number(process.env.PORT||10000);
const paths=new Set(['/mcp','/health','/.well-known/oauth-protected-resource']);
const srv=http.createServer(async(req,res)=>{
 const url=new URL(req.url||'/',self);const path=url.pathname;
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(path==='/.well-known/openai-apps-challenge'&&req.method==='GET'){
  res.writeHead(challenge?200:404,{'Content-Type':'text/plain; charset=utf-8'});res.end(challenge);return;
 }
 if(!paths.has(path)||!['GET','POST','OPTIONS'].includes(req.method||'')){
  res.writeHead(404,{'Content-Type':'application/json'});res.end('{"error":"NOT_FOUND"}');return;
 }
 let chunks=[],size=0;
 try{
  for await(const chunk of req){
   size+=chunk.length;if(size>32000)throw Error('BODY_LIMIT');chunks.push(chunk);
  }
  const headers={};
  for(const key of ['authorization','content-type','accept','mcp-protocol-version','mcp-session-id'])
   if(req.headers[key])headers[key]=String(req.headers[key]);
  const upstream=await fetch(origin+path+url.search,{
   method:req.method,headers,body:req.method==='POST'?Buffer.concat(chunks):undefined,
   redirect:'manual',signal:AbortSignal.timeout(18000)});
  const replyHeaders={'Content-Type':upstream.headers.get('content-type')||'application/json'};
  const auth=upstream.headers.get('www-authenticate');
  if(auth)replyHeaders['WWW-Authenticate']='Bearer resource_metadata="'+self+'/.well-known/oauth-protected-resource"';
  const bytes=Buffer.from(await upstream.arrayBuffer());
  res.writeHead(upstream.status,replyHeaders);res.end(bytes);
 }catch(error){
  res.writeHead(size>32000?413:502,{'Content-Type':'application/json'});
  res.end('{"error":"UPSTREAM_UNAVAILABLE"}');
 }
});
srv.listen(port,'0.0.0.0');
