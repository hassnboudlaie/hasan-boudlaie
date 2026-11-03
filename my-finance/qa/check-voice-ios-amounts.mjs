/* My Finance iOS Persian amount regression. No network, no user data, no writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const voiceSrc=fs.readFileSync(path.join(root,'voice-entry.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const extractFn=(src,marker)=>{
 const start=src.indexOf(marker);
 assert.ok(start>=0,'function missing '+marker);
 let level=0,from=src.indexOf('{',start);
 for(let i=from;i<src.length;i++){
  if(src[i]==='{')level++;
  else if(src[i]==='}'&&--level===0)return src.slice(start,i+1);
 }
 throw Error('unclosed function '+marker);
};
const parseFunction=extractFn(html,'function parsePersianNumber(raw)');
const elements=new Map();
function element(id){
 if(elements.has(id))return elements.get(id);
 const e={id,value:'',hidden:false,disabled:false,textContent:'',title:'',dataset:{},
  style:{},classList:{contains:()=>true,toggle(){}},events:{},addEventListener(type,fn){this.events[type]=fn;},
  setAttribute(){},append(){},replaceChildren(){},scrollIntoView(){}};
 elements.set(id,e);return e;
}
const document={
 body:{classList:{contains:()=>true}},
 getElementById:id=>element(id),
 createElement:tag=>element('__'+tag+Math.random()),
 addEventListener(){}
};
const window={MyFinanceBridge:{getData:()=>({accounts:[],tx:[],receivables:[]})},
 MyFinanceCloud:{authenticated:()=>true}};
const digits=s=>String(s??'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
const context={window,document,Intl,Date,Number,String,Object,Array,Map,Set,Boolean,Math,
 setTimeout(){},clearTimeout(){},navigator:{userAgent:'iPhone'},console,digits};
vm.runInNewContext(parseFunction+'; window.parsePersianNumber=parsePersianNumber;',context);
vm.runInNewContext(voiceSrc,context);
const voice=window.MyFinanceVoiceEntry;
assert.ok(voice,'voice module should load');
element('quick').value='یک میلیون و پانصد هزار تومان بابت کرایه';
const parsed=voice.previewFromInput();
assert.equal(parsed.amount,1500000,'Persian phrase must be 1.5m toman');
assert.equal(element('voice-amount').value,1500000);
assert.equal(element('voice-confirm').disabled,false,'review should allow a valid confirmed value');
for(const raw of ['۱۵۰۰۰۰۰','١٥٠٠٠٠٠','۱٬۵۰۰٬۰۰۰','1,500,000','۱.۵۰۰.۰۰۰','1500000']){
 element('voice-amount').value=raw;
 element('voice-amount').value=raw;
 // Trigger the same registered input handler used on the real iPhone.
 element('voice-amount').events.input();
 assert.equal(element('voice-confirm').disabled,false,'localized positive amount rejected: '+raw);
}
for(const raw of ['۱/۵','۱٫۲٫۳','-۱۵۰۰۰۰۰','۰','یک میلیون','']){
 element('voice-amount').value=raw;
 element('voice-amount').events.input();
 assert.equal(element('voice-confirm').disabled,true,'unsafe amount must be blocked: '+raw);
}
const vague=voice.parse('۱/۵ کرایه',[]);
assert.ok(vague.error,'Unqualified slash amount must request clarification');
const precise=voice.parse('یک میلیون و پانصد هزار تومان بابت کرایه',[]);
assert.equal(precise.amount,1500000);
assert.equal(precise.currency,'IRT');
assert.match(html,/id="voice-amount" type="text" inputmode="decimal"/);
assert.match(html,/id="voice-loan-amount" inputmode="decimal"/);
console.log('PASS: iPhone Persian/Arabic digits, 1.5m rent preview, grouped separators, ambiguous amounts blocked; no financial writes.');
