const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\}\)\(\);\s*$/,'globalThis.__triangleTests={triCases,triCalculate,triPoint,triNormalize,triCurrent,triClassify,triProfiles,quizBank,quizQuestions,quizNormalize,quizScore,audience,audienceData,getState:()=>state};})();');
const voids=new Set(['meta','link','img','input','br','hr','source']);
class Element{
 constructor(tag,attrs={}){this.tagName=tag;this.attrs=attrs;this.children=[];this.parent=null;this.listeners={};this.style={};this.hidden='hidden' in attrs;this.value='';this.open='open' in attrs;this._text='';this.dataset={};for(const [k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;
 this.dataset=new Proxy(this.dataset,{set:(target,k,v)=>{target[k]=String(v);this.attrs['data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=String(v);return true}});
 this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:c=>{if(!this.classList.contains(c))this.className=(this.className+' '+c).trim()},remove:c=>{this.className=this.className.split(/\s+/).filter(v=>v!==c).join(' ')},toggle:(c,on)=>{const x=on??!this.classList.contains(c);this.classList[x?'add':'remove'](c);return x}};
 }
 get id(){return this.attrs.id}get className(){return this.attrs.class||''}set className(x){this.attrs.class=x}
 removeAttribute(k){delete this.attrs[k]}setAttribute(k,v){this.attrs[k]=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v)}getAttribute(k){return this.attrs[k]}
 appendChild(c){c.parent=this;this.children.push(c);return c}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}set textContent(t){this._text=String(t);this.children=[]}
 set innerHTML(t){this._html=t;this.children=[];parse(t,this)}get innerHTML(){return this._html||''}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
 click(){if(!this.disabled)this.fire('click')}fire(name){for(const fn of this.listeners[name]||[])fn({target:this,preventDefault(){}})}focus(){this.focused=true;let root=this;while(root.parent)root=root.parent;root.activeElement=this}scrollIntoView(){}
 querySelector(s){return this.querySelectorAll(s)[0]||null}
 querySelectorAll(sel){const parts=sel.trim().split(/\s+/);const out=[];const test=(e,p)=>{const attrs=[...p.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)];for(const[,k,v]of attrs)if(!(k in e.attrs)||(v!==undefined&&e.attrs[k]!==v))return false;p=p.replace(/\[[^\]]*\]/g,'');const id=p.match(/#([^.#]+)/);if(id&&e.id!==id[1])return false;for(const[,c]of p.matchAll(/\.([^.#]+)/g))if(!e.classList.contains(c))return false;const tag=p.match(/^[\w-]+/);return !tag||e.tagName===tag[0]};
 const walk=e=>{for(const c of e.children){if(test(c,parts.at(-1))){let n=c.parent,ix=parts.length-2;while(ix>=0&&n){if(test(n,parts[ix]))ix--;n=n.parent}if(ix<0)out.push(c)}walk(c)}};walk(this);return out;
 }
}
function parse(markup,root=new Element('document')){let cur=root;const tokens=markup.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]*>|[^<]+/g)||[];for(const t of tokens){if(t.startsWith('<!--')||t.startsWith('<!'))continue;if(t.startsWith('</')){if(cur.parent)cur=cur.parent;continue}if(t.startsWith('<')){const m=t.match(/^<([\w-]+)([\s\S]*?)\/?\s*>$/);if(!m)continue;const attrs={};for(const a of m[2].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1]]=a[2]??a[3]??a[4]??'';const n=cur.appendChild(new Element(m[1],attrs));if(!voids.has(m[1])&&!t.endsWith('/>'))cur=n;}else cur._text+=t;}return root;}
function boot({hash='',data={},blocked=false,audience='managers',display='',width=1280}={}){
 const doc=parse(html.replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<script>[\s\S]*?<\/script>/g,''));doc.createElement=t=>new Element(t);doc.getElementById=id=>doc.querySelector('#'+id);doc.body=doc.querySelector('body');
 const events={},alerts=[];let reloaded=false;const initialUrl=new URL('https://example.test/?'+(audience?'audience='+audience:'')+(display?'&display='+display:'')+hash);const location={hash,href:initialUrl.href,search:initialUrl.search,reload:()=>reloaded=true,assign:h=>{const u=new URL(h,location.href);location.href=u.href;location.hash=u.hash;location.search=u.search;reloaded=true}};
 const storage={getItem:k=>{if(blocked)throw Error('blocked');return data[k]||null},setItem:(k,v)=>{if(blocked)throw Error('blocked');data[k]=v},removeItem:k=>{if(blocked)throw Error('blocked');delete data[k]}};
 const context={URL,document:doc,localStorage:storage,location,history:{replaceState:(a,b,h)=>{location.hash=new URL(h,location.href).hash;location.href=new URL(h,location.href).href},pushState:(a,b,h)=>{location.hash=new URL(h,location.href).hash;location.href=new URL(h,location.href).href}},window:{innerWidth:width,scrollTo:()=>{},addEventListener:(n,f)=>events[n]=f},alert:t=>alerts.push(t),confirm:()=>true,console};
 vm.runInNewContext(fs.readFileSync(__dirname+'/session-practice.js','utf8'),context,{timeout:10000});
 vm.runInNewContext(fs.readFileSync(__dirname+'/audience-content.js','utf8'),context,{timeout:10000});
 vm.runInNewContext(script,context,{timeout:10000});
 return{doc,data,events,alerts,location,viewport:context.window,test:context.__triangleTests,get reloaded(){return reloaded},q:s=>doc.querySelector(s),all:s=>doc.querySelectorAll(s),active:()=>doc.querySelector('.view.active').id};
}
const app=boot();
assert.equal(app.active(),'course');
assert.equal(app.all('.module-card').length,7,'exactly seven workshop sections');
for(const id of ['home','m1','m2','leaders','techniques','visuals','diseases','quiz','action','assessment'])assert.equal(boot({hash:'#'+id}).active(),id);
const aliases={session:'home',workshop:'home',profile:'home',m3:'leaders',m4:'techniques',m5:'visuals',m6:'diseases',m7:'quiz',m8:'action',m1cases:'m2',m1model:'m1',m1learning:'action',m1action:'action',m1office:'m2'};
for(const [old,target] of Object.entries(aliases))assert.equal(boot({hash:'#'+old}).active(),target,'old bookmark '+old);
assert.equal(boot({hash:'#unknown'}).active(),'course');
const ids=app.all('[id]').map(e=>e.id);assert.equal(new Set(ids).size,ids.length,'unique IDs');
for(const a of app.all('[data-open]')){a.click();assert.equal(app.active(),a.dataset.open)}
for(const a of app.all('a')){const href=a.getAttribute('href');if(href.startsWith('#'))assert.ok(app.q(href),'broken anchor '+href)}
for(const key of ['conversation','conversation_coordination','conversation_change','conversation_workload','nadella','mulally','tech_credibility','tech_charisma','tech_reward','tech_recognition','nitpicker']){
 const options=app.all('[data-question="'+key+'"]');assert.equal(options.length,3);
 const messages=new Set();for(const b of options){b.click();assert.equal(app.q('#'+key+'Feedback').hidden,false);messages.add(app.q('#'+key+'Feedback').textContent);assert.equal(app.all('[data-question="'+key+'"][aria-pressed="true"]').length,1)}assert.equal(messages.size,3,'distinct feedback for '+key);
}
const returned=boot({data:app.data});for(const key of ['conversation','conversation_coordination','conversation_change','conversation_workload','nadella','mulally','tech_credibility','tech_charisma','tech_reward','tech_recognition','nitpicker'])assert.equal(returned.q('#'+key+'Feedback').hidden,false,'answer restored');
app.q('[data-leader="mulally"]').click();assert.equal(app.q('#leader-nadella').hidden,true);assert.equal(app.q('#leader-mulally').hidden,false);app.q('[data-leader="nadella"]').click();assert.equal(app.q('#leader-mulally').hidden,true);
app.q('#calcGrid').click();assert.equal(app.alerts.length,1,'missing answers');
for(let i=0;i<12;i++)app.q('.scale-options button[data-index="'+i+'"][data-value="5"]').click();
app.q('#calcGrid').click();assert.equal(app.q('#marker').style.left,'100%');assert.equal(app.q('#marker').style.bottom,'100%');assert.ok(app.q('#gridResult').classList.contains('show'));
app.q('.scale-options button[data-index="1"][data-value="1"]').click();assert.ok(!app.q('#gridResult').classList.contains('show'),'changed answer invalidates analysis');assert.equal(app.q('#marker').style.display,'none');
for(let i=0;i<12;i++)app.q('.scale-options button[data-index="'+i+'"][data-value="'+(i%2?1:5)+'"]').click();app.q('#calcGrid').click();assert.equal(app.q('#marker').style.left,'100%');assert.equal(app.q('#marker').style.bottom,'0%');
for(let i=0;i<12;i++)app.q('.scale-options button[data-index="'+i+'"][data-value="3"]').click();app.q('#calcGrid').click();assert.equal(app.q('#marker').style.left,'50%');assert.equal(app.q('#marker').style.bottom,'50%');
app.q('[data-question="action"][data-value="clarify"]').click();app.q('#actionWhen').value='فردا ساعت ۹';app.q('#actionWhen').fire('input');
const resumed=boot({hash:'#action',data:app.data});assert.equal(resumed.q('#actionWhen').value,'فردا ساعت ۹');assert.equal(resumed.q('[data-question="action"][data-value="clarify"]').getAttribute('aria-pressed'),'true');
const legacyNotes=boot({data:{sabanaft_session1_v4:JSON.stringify({answers:{m1Situation:'تحویل شیفت',m1Action:'یادداشت قبلی',m1Evidence:'شاهد قبلی'},grid:{0:5}})}});assert.ok(legacyNotes.q('#previousNotes').textContent.includes('یادداشت قبلی'));assert.equal(legacyNotes.q('.scale-options button[data-index="0"][data-value="5"]').getAttribute('aria-pressed'),'true');
const blockedNotes=boot({blocked:true});blockedNotes.q('#actionWhen').value='متن';blockedNotes.q('#actionWhen').fire('input');assert.ok(blockedNotes.q('#noteStatus').textContent.includes('دسترس نیست'));
app.q('#displayMode').click();assert.ok(app.doc.body.classList.contains('presenting'));app.q('#displayMode').click();assert.ok(!app.doc.body.classList.contains('presenting'));
app.q('#reset').click();assert.ok(app.reloaded);assert.equal(Object.keys(JSON.parse(app.data.sabanaft_session1_v4).roleStates.managers.answers).length,0);
assert.ok(!html.includes('یک کیس، سه نگاه'));assert.ok(!html.includes('چه چیزی با خودم می‌برم'));assert.ok(!html.includes('ماژول ۸'));
const handout=fs.readFileSync(__dirname+'/handout-module-1.html','utf8');for(const file of [html,handout])assert.ok(file.includes('assets/vazirmatn.woff2'));
assert.ok(handout.includes('./#m1'));assert.ok(handout.includes('./#m2'));assert.ok(handout.includes('./#leaders'));
console.log('PASS: session-one core; 7 sections; legacy bookmarks; 33 option-specific feedbacks; saved answers, notes and prior notes; grid scores and stale-result invalidation; class mode; blocked storage; reset; anchors and handout.');
