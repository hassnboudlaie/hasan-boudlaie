/* Routing tests: Node standard library, never connects to Supabase or private records.
   Run: node my-finance/qa/check-router.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(folder,'index.html'),'utf8');
const a=html.indexOf('const financeVirtualRoutes=');
const b=html.indexOf('function financeOpenDetail(target){',a);
assert.ok(a>=0&&b>a,'In-app router missing');
const source=html.slice(a,b);
assert.ok(source.includes("window.addEventListener('popstate'"),'Android Back handler missing');
const ids=['home','transactions','accounts','transfers','receivables','commitments','loans','reports','settings','finance-embedded','finance-account-detail','finance-transaction-detail'];
const sections=Object.fromEntries(ids.map(id=>[id,{id,hidden:id!=='home'}]));
const elements={
 'finance-page-header':{hidden:true},
 'finance-page-title':{textContent:''},
 'finance-more-dialog':{open:false,close(){this.open=false},querySelector(){return {focus(){}}}},
 'finance-open-more':{setAttribute(){},classList:{toggle(){}}},
 'mf-home-more':{open:false},
 'finance-embedded-frame':{dataset:{},src:'about:blank'},
 'quick':{focus(){},scrollIntoView(){}}
};
const flags=new Set(['finance-unlocked']),handlers={};
const location={pathname:'/hasan-boudlaie/my-finance/index.html',search:'?test=1',hash:'#/home',
 get href(){return this.pathname+this.search+this.hash}};
const stack=[{state:null,url:location.href}];let cursor=0;
function updateUrl(url){const i=String(url).indexOf('#');location.hash=i<0?'':String(url).slice(i)}
const history={state:null,scrollRestoration:'auto',
 replaceState(state,_title,url){stack[cursor]={state,url};this.state=state;updateUrl(url)},
 pushState(state,_title,url){stack.splice(cursor+1);stack.push({state,url});cursor++;this.state=state;updateUrl(url)},
 back(){if(cursor<1)return;cursor--;const entry=stack[cursor];this.state=entry.state;updateUrl(entry.url);handlers.popstate?.({state:entry.state})}
};
const rendered=[];
const window={scrollY:0,scrollTo(p){this.scrollY=p.top||0},addEventListener(n,f){handlers[n]=f},requestAnimationFrame(f){f()},
 MyFinanceDrilldown:{render(route,context){rendered.push({route,context})}}};
const document={title:'',body:{dataset:{financeView:'home'},classList:{
  contains:k=>flags.has(k),add:k=>flags.add(k),remove:k=>flags.delete(k)}},
 querySelectorAll(q){return q==='main > section'?Object.values(sections):q==='[data-finance-route]'?['home','transactions','accounts','loans'].map(id=>({dataset:{financeRoute:id},setAttribute(){},classList:{toggle(){}}})):[]},
 getElementById:id=>elements[id]||null,querySelector:()=>null,addEventListener(n,f){handlers['doc:'+n]=f}};
const $=id=>elements[id]||null;
const api=new Function('document','window','history','location','lang','$','requestAnimationFrame',source+';return {financeRouterInitialize,financeNavGo,financeBack,tab};')(document,window,history,location,'fa',$,f=>f());
api.financeRouterInitialize();
assert.equal(history.state.route,'home');
api.financeNavGo('cashflow');
assert.equal(document.body.dataset.financeView,'cashflow');
assert.deepEqual(Object.values(sections).filter(s=>!s.hidden).map(s=>s.id),['home']);
api.financeNavGo('analysis');
assert.equal(document.body.dataset.financeView,'analysis');
assert.equal(elements['mf-home-more'].open,true);
assert.equal(history.state.depth,2);
api.financeBack();assert.equal(document.body.dataset.financeView,'cashflow');
api.financeBack();assert.equal(document.body.dataset.financeView,'home');
api.financeNavGo('accounts');api.financeNavGo('transactions');
api.financeBack();assert.equal(document.body.dataset.financeView,'accounts');
api.financeBack();
api.financeNavGo('assets');
assert.deepEqual(Object.values(sections).filter(s=>!s.hidden).map(s=>s.id),['finance-embedded']);
assert.equal(elements['finance-embedded-frame'].src,'./assets.html?embedded=1');
api.financeBack();assert.equal(elements['finance-embedded-frame'].src,'about:blank');
api.financeNavGo('contracts');assert.equal(elements['finance-embedded-frame'].src,'./contracts.html?embedded=1');
api.financeBack();
api.financeNavGo('quick-entry');assert.equal(elements['finance-page-title'].textContent,'ثبت سریع تراکنش');
api.financeBack();assert.equal(document.body.dataset.financeView,'home');
api.financeNavGo('accounts');
api.financeNavGo('account-detail',{context:{accountId:'account-a'}});
assert.equal(document.body.dataset.financeView,'account-detail');
assert.equal(history.state.context.accountId,'account-a');
assert.equal(location.hash,'#/account-detail');
assert.ok(!location.href.includes('account-a'),'Account identifier must not be in URL');
assert.deepEqual(Object.values(sections).filter(s=>!s.hidden).map(s=>s.id),['finance-account-detail']);
api.financeNavGo('transaction-detail',{context:{transactionId:'tx-private-42'}});
assert.equal(history.state.context.transactionId,'tx-private-42');
assert.ok(!location.href.includes('tx-private-42'),'Transaction identifier must not be in URL');
assert.deepEqual(Object.values(sections).filter(s=>!s.hidden).map(s=>s.id),['finance-transaction-detail']);
api.financeBack();
assert.equal(document.body.dataset.financeView,'account-detail');
assert.equal(history.state.context.accountId,'account-a');
assert.deepEqual(rendered.at(-1).context,{accountId:'account-a'});
api.financeBack();assert.equal(document.body.dataset.financeView,'accounts');
api.financeBack();assert.equal(document.body.dataset.financeView,'home');
// Refresh preserves the active private detail, Back depth and language redraw.
api.financeNavGo('accounts');
api.financeNavGo('account-detail',{context:{accountId:'account-a'}});
const depthBeforeRefresh=history.state.depth;
const countBeforeRefresh=stack.length;
const revived=new Function('document','window','history','location','lang',''PASS page drilldown, two-level Android Back, embedded assets/contracts, quick entry and Home');
,'requestAnimationFrame',source+';return {financeRouterInitialize,financeNavGo,financeBack,tab};')(document,window,history,location,'fa',$,f=>f());
revived.financeRouterInitialize();
assert.equal(history.state.route,'account-detail');
assert.equal(history.state.context.accountId,'account-a');
assert.equal(history.state.depth,depthBeforeRefresh);
assert.equal(stack.length,countBeforeRefresh);
revived.tab('account-detail');
assert.deepEqual(rendered.at(-1).context,{accountId:'account-a'});
revived.financeBack();assert.equal(document.body.dataset.financeView,'accounts');
revived.financeBack();assert.equal(document.body.dataset.financeView,'home');
assert.equal(location.hash,'#/home');
assert.equal(location.hash,'#/home');
console.log('PASS page drilldown, two-level Android Back, embedded assets/contracts, quick entry and Home');
