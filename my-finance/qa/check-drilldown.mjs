/* My Finance drilldown regression: synthetic numbers only, no network or user data.
   Run: node my-finance/qa/check-drilldown.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=readFileSync(resolve(base,'drilldown-v61.js'),'utf8');
const classes=new Set(['finance-unlocked']);
const listeners={};
class El{
 constructor(tag='div'){this.tag=tag;this.children=[];this.textContent='';this.className='';this.listeners={};this.attributes={}}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=nodes}
 addEventListener(event,fn){this.listeners[event]=fn}
 setAttribute(k,v){this.attributes[k]=v}
}
const accountHost=new El(),transactionHost=new El();
const document={
 body:{classList:{contains(k){return classes.has(k)}},dataset:{financeView:'home'}},
 documentElement:{lang:'fa'},
 createElement:tag=>new El(tag),
 getElementById:id=>({'finance-account-detail-body':accountHost,'finance-transaction-detail-body':transactionHost})[id]||null,
 addEventListener(type,fn){listeners[type]=fn}
};
let data={accounts:[{id:'account-a',name:'حساب نمونه',currency:'IRT',opening:4000000}],
 tx:[
  {id:'tx-01',account:'account-a',kind:'expense',amount:150000,status:'completed',category:'خوراک',date:'2026-10-30',memo:'خرید روزانه'},
  {id:'tx-02',account:'account-a',kind:'income',amount:950000,status:'completed',category:'درآمد',date:'2026-10-29'}
 ]};
const navigation=[],window={
 MyFinanceBridge:{getData:()=>structuredClone(data)},
 MyFinanceAccountBalance:()=>4800000,
 financeOpenTransaction:id=>navigation.push({type:'transaction',id}),
 financeOpenAccount:id=>navigation.push({type:'account',id}),
 financeBack:()=>navigation.push({type:'back'})
};
const history={state:{context:{accountId:'account-a'}}};
let observerFn;
class MutationObserver{constructor(fn){observerFn=fn}observe(){}}
new Function('window','document','history','MutationObserver',src)(window,document,history,MutationObserver);
assert.ok(window.MyFinanceDrilldown,'Private drilldown must register');
const drill=window.MyFinanceDrilldown;
function flatten(el){
 return [String(el.textContent||''),...el.children.flatMap(flatten)].join(' ');
}
function find(el,cls){
 if(String(el.className).split(/\s+/).includes(cls))return el;
 for(const child of el.children){const found=find(child,cls);if(found)return found}
 return null;
}
drill.render('account-detail',{accountId:'account-a'});
assert.match(flatten(accountHost),/حساب نمونه/);
assert.match(flatten(accountHost),/۴٬۸۰۰٬۰۰۰/);
assert.match(flatten(accountHost),/۲ مورد/);
const item=find(accountHost,'mf-drill-item');
assert.ok(item,'Account transactions should open a nested detail');
item.listeners.click();
assert.deepEqual(navigation.at(-1),{type:'transaction',id:'tx-01'});
drill.render('transaction-detail',{transactionId:'tx-01'});
assert.match(flatten(transactionHost),/۱۵۰٬۰۰۰ تومان/);
assert.match(flatten(transactionHost),/خرید روزانه/);
const related=find(transactionHost,'mf-drill-all');
assert.ok(related,'Transaction should have related account action');
related.listeners.click();
assert.deepEqual(navigation.at(-1),{type:'account',id:'account-a'});
// Missing identifiers must show an empty-state, not other users' records.
drill.render('transaction-detail',{transactionId:'missing'});
assert.match(flatten(transactionHost),/تراکنش یافت نشد/);
// Permission/session loss must erase sensitive DOM.
classes.delete('finance-unlocked');observerFn();
assert.equal(accountHost.children.length,0);
assert.equal(transactionHost.children.length,0);
drill.render('transaction-detail',{transactionId:'tx-01'});
assert.equal(transactionHost.children.length,0);
classes.add('finance-unlocked');
// User context switch must not retain another user's account details.
data={accounts:[{id:'account-b',name:'حساب کاربر دیگر',currency:'USD',opening:200}],tx:[]};
document.body.dataset.financeView='account-detail';
history.state={context:{accountId:'account-a'}};
listeners['myfinance:rebound']();
assert.ok(!flatten(accountHost).includes('حساب نمونه'),'Prior account must not leak after user change');
assert.match(flatten(accountHost),/این حساب در فهرست فعلی یافت نشد/);
console.log('PASS read-only account/transaction drilldown, per-currency labels, nested actions and user isolation');
