// Remote smoke test for public MCP protocol and mandatory authorization.
// Does not use finance tokens or touch any user financial data.
import assert from 'node:assert/strict';
const base='https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/finance-chatgpt-mcp';
const fetchJson=async(path,init={})=>{
 const response=await fetch(base+path,{...init,signal:AbortSignal.timeout(15000)});
 const text=await response.text();
 let data=null;try{data=text?JSON.parse(text):null}catch{}
 return {response,data,text};
};
const post=(method,id,params={})=>fetchJson('/mcp',{
 method:'POST',
 headers:{'Content-Type':'application/json','Accept':'application/json, text/event-stream','MCP-Protocol-Version':'2025-06-18'},
 body:JSON.stringify({jsonrpc:'2.0',id,method,params})
});
const {response:h,data:health}=await fetchJson('/health');
assert.equal(h.status,200,'MCP health endpoint must be live');
assert.equal(health?.healthy,true);
const {response:m,data:metadata}=await fetchJson('/.well-known/oauth-protected-resource');
assert.equal(m.status,200,'MCP OAuth resource metadata must be discoverable');
assert.ok(metadata?.authorization_servers?.includes('https://hxcjkewlaniahvuqwwbb.supabase.co/auth/v1'));
const {response:i,data:init}=await post('initialize',1,{
 protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'integration-smoke',version:'1'}
});
assert.equal(i.status,200);
assert.equal(init?.result?.serverInfo?.name,'my-finance');
const {response:t,data:list}=await post('tools/list',2,{});
assert.equal(t.status,200);
assert.deepEqual(list?.result?.tools?.map(x=>x.name),[
 'get_my_finance_summary','list_my_finance_accounts','propose_my_finance_entry','confirm_my_finance_entry'
]);
const {response:u,data:unauthorized}=await post('tools/call',3,{
 name:'get_my_finance_summary',arguments:{days:1}
});
assert.equal(u.status,401,'Unauthenticated calls MUST fail');
assert.match(u.headers.get('WWW-Authenticate')||'',/Bearer resource_metadata=/);
assert.equal(unauthorized?.error,'OAuth authentication required');
const {response:w}=await post('tools/call',4,{
 name:'confirm_my_finance_entry',
 arguments:{draft_id:'00000000-0000-4000-8000-000000000000',user_confirmed:true}
});
assert.equal(w.status,401,'Unauthenticated FINANCIAL WRITES MUST fail');
console.log('PASS: live MCP endpoint, OAuth discovery, initialize, tools/list, unauthenticated read/write blocked.');
