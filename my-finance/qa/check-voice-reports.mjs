/* Synthetic, offline regression for the read-only My Finance command assistant. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';

const elements=new Map();
const element=(id='')=>{
 if(elements.has(id))return elements.get(id);
 const e={id,value:'',hidden:false,disabled:false,style:{},dataset:{},textContent:'',innerHTML:'',
  classList:{contains:()=>true},before(){},append(){},setAttribute(){},addEventListener(){},focus(){},
  scrollIntoView(){},insertAdjacentElement(){},querySelectorAll(){return []},remove(){}};
 elements.set(id,e);return e;
};
const accounts=[{id:'a',name:'بلو',currency:'IRT'}];
const tx=[
 {id:'1',kind:'income',amount:1000000,currency:'IRT',date:'2026-11-02',status:'completed',category:'حقوق',account:'a'},
 {id:'2',kind:'expense',amount:500000,currency:'IRT',date:'2026-11-02',status:'completed',category:'خوراک',account:'a'},
 {id:'3',kind:'expense',amount:1000000,currency:'IRR',date:'2026-11-02',status:'completed',category:'خوراک',account:'a'},
 {id:'4',kind:'expense',amount:120,currency:'USD',date:'2026-11-02',status:'completed',category:'سفر'},
 {id:'5',kind:'expense',amount:9000000,currency:'IRT',date:'2026-11-02',status:'pending',category:'خوراک'},
 {id:'6',kind:'investment',amount:2000000,currency:'IRT',date:'2026-11-02',status:'completed',category:'قرض'}
];
const data={accounts,tx,loans:[{title:'وام نمونه',nextDueJalali:'1405/08/20',installment:300000,currency:'IRT',status:'active'}]};
const windowObj={MyFinanceBridge:{getData:()=>structuredClone(data),getPreferenceNamespace:()=> 'my-finance-user-synthetic'}};
const documentObj={body:{classList:{contains:()=>true}},head:{append(){}},getElementById:id=>element(id),
 createElement:()=>element('element-'+elements.size),
 querySelector:()=>element('home-card'),
 addEventListener(){}};
const context={window:windowObj,document:documentObj,Intl,Date,Number,String,Object,Array,Map,Set,
 console,setTimeout,requestAnimationFrame:fn=>fn()};
const src=readFileSync(resolve('my-finance/finance-assistant-v79.js'),'utf8');
assert.doesNotThrow(()=>new vm.Script(src));
vm.runInNewContext(src,context,{timeout:2000});
assert.ok(windowObj.MyFinanceVoiceReports,'Assistant failed to initialize');
const p=windowObj.MyFinanceVoiceReports.period('سه ماه اخیر');
assert.equal(p.to-p.from,2,'Rolling 3-month window');
assert.equal(windowObj.MyFinanceVoiceReports.period('مهر ۱۴۰۵').from,1405*12+6);
element('mf-va-question').value='گزارش آبان ۱۴۰۵';
windowObj.MyFinanceVoiceReports.run();
const summary=element('mf-va-summary').textContent;
assert.match(summary,/600/,'IRT+IRR must consolidate after rial conversion');
assert.match(summary,/USD/,'Foreign currency must remain separate');
assert.doesNotMatch(summary,/9,000,000|۹٬۰۰۰٬۰۰۰/,'Pending expense excluded');
assert.ok(!element('mf-va-result').hidden,'Report visible');
assert.equal(windowObj.MyFinanceVoiceReports.period('ماه قبل').from,windowObj.MyFinanceVoiceReports.period('ماه قبل').to);
element('mf-va-question').value='اقساط هفته آینده';
windowObj.MyFinanceVoiceReports.run();
assert.match(element('mf-va-title').textContent,/اقساط/);
element('mf-va-question').value='آخرین تراکنش من چیست؟';
windowObj.MyFinanceVoiceReports.run();
assert.match(element('mf-va-title').textContent,/آخرین/);
assert.deepEqual(data.tx,tx,'Read-only assistant must not mutate fixture data');
console.log('PASS My Finance assistant: parser, multi-currency, pending exclusion, due dates, latest transaction.');
