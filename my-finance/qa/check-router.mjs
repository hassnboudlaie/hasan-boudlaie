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
const ids=['home','transactions','accounts','transfers','receivables','commitments','loans','reports','settings','finance-embedded'];
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
const window={scrollY:0,scrollTo(p){this.scrollY=p.top||0},addEventListener(n,f){handlers[n]=f},requestAnimationFrame(f){f()}};
const document={title:'',body:{dataset:{financeView:'home'},classList:{
  contains:k=>flags.has(k),add:k=>flags.add(k),remove:k=>flags.delete(k)}},
 querySelectorAll(q){return q==='main > section'?Object.values(sections):q==='[data-finance-route]'?['home','transactions','accounts','loans'].map(id=>({dataset:{financeRoute:id},setAttribute(){},classList:{toggle(){}}})):[]},
 getElementById:id=>elements[id]||null,querySelector:()=>null,addEventListener(n,f){handlers['doc:'+n]=f}};
const $=id=>elements[id]||null;
const api=new Function('document','window','history','location','lang','$','requestAnimationFrame',source+';return {financeRouterInitialize,financeNavGo,financeBack};')(document,window,history,location,'fa',$,f=>f());
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
assert.equal(location.hash,'#/home');
console.log('PASS page drilldown, two-level Android Back, embedded assets/contracts, quick entry and Home');
