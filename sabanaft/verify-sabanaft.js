const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\}\)\(\);\s*$/,'globalThis.__sabaTests={sabaBank,sabaRoles,sabaState};globalThis.__triangleTests={triCases,triCalculate,triPoint,triNormalize,triCurrent,triClassify,triProfiles,quizBank,quizQuestions,quizNormalize,quizScore,audience,audienceData,getState:()=>state};})();');
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
 return{doc,data,events,alerts,location,viewport:context.window,test:context.__triangleTests,saba:context.__sabaTests,get reloaded(){return reloaded},q:s=>doc.querySelector(s),all:s=>doc.querySelectorAll(s),active:()=>doc.querySelector('.view.active').id};
}

const parts=['m1','m2','leaders','techniques','visuals','diseases','quiz'];
const oldBrand={behparvar_session1_v4:JSON.stringify({notes:'Unrelated Behparvar note'})};
for(const role of ['managers','supervisors']){
 const data={...oldBrand};const a=boot({audience:role,data});
 for(let n=1;n<=6;n++){
  a.q('[data-course-session="'+n+'"]').click();
  assert.equal(a.q('#workshopSidebar').hidden,false);
  assert.equal(a.all('#workshopNavigation [data-open]').length,7);
  for(const part of parts){
   const target=(n===1?'':'session'+n+'-')+part;
   a.q('#workshopNavigation [data-open="'+target+'"]').click();
   assert.equal(a.active(),target);assert.equal(a.q('#main').getAttribute('inert'),undefined);
   if(n>1){
    assert(!a.q('#'+target).textContent.includes('هنوز اضافه'));
    const field=a.q('#future-note-'+n+'-'+part);field.value=role+' '+target;field.fire('input');
    const saved=JSON.parse(data['sabanaft_session'+n+'_v1']);
    assert.equal(saved.roleStates[role].notes[part],role+' '+target);
    assert.equal(saved.roleStates[role==='managers'?'supervisors':'managers'].notes[part],undefined);
   }
  }
 }
 const reflection=a.q('[data-saba-question="s2-m1"][data-saba-value="1"]');reflection.click();
 assert.equal(reflection.getAttribute('aria-pressed'),'true');assert.equal(a.q('#saba-feedback-s2-m1').hidden,false);
 for(let n=2;n<=6;n++){
  a.q('[data-saba-submit="'+n+'"]').click();assert(a.q('#saba-result-'+n).textContent.includes('باقی‌مانده'));
  const keys=Object.keys(a.saba.sabaBank).filter(k=>a.saba.sabaBank[k].quiz&&a.saba.sabaBank[k].session===n);assert.equal(keys.length,5);
  for(const key of keys){const item=a.saba.sabaBank[key];a.q('[data-saba-question="'+key+'"][data-saba-value="'+item.correct+'"]').click();assert.equal(a.q('#saba-feedback-'+key).hidden,true)}
  a.q('[data-saba-submit="'+n+'"]').click();assert(a.q('#saba-result-'+n).textContent.includes('۵ از ۵'));
  for(const key of keys)assert.equal(a.q('#saba-feedback-'+key).hidden,false);
 }
 const reloaded=boot({audience:role,data,hash:'#session5-quiz'});assert.equal(reloaded.active(),'session5-quiz');assert(reloaded.q('#saba-result-5').textContent.includes('۵ از ۵'));
 assert.equal(reloaded.q('#future-note-4-techniques').value,role+' session4-techniques');
 const other=boot({audience:role==='managers'?'supervisors':'managers',data});assert.equal(other.q('#saba-result-5').hidden,true);assert.equal(other.q('#future-note-4-techniques').value,'');
 const before=JSON.parse(data.sabanaft_practice_v1).roles[role].submitted[3];assert.equal(before,true);
 reloaded.q('[data-saba-reset="2"]').click();assert.equal(reloaded.q('#saba-result-2').hidden,true);assert.equal(reloaded.saba.sabaState.submitted[3],true);assert.equal(reloaded.q('#future-note-2-quiz').value,role+' session2-quiz');
 const key='s3-q1',correct=reloaded.saba.sabaBank[key].correct;reloaded.q('[data-saba-question="'+key+'"][data-saba-value="'+((correct+1)%4)+'"]').click();assert.equal(reloaded.q('#saba-result-3').hidden,true);assert.equal(reloaded.q('#saba-feedback-'+key).hidden,true);reloaded.q('[data-saba-submit="3"]').click();assert(reloaded.q('#saba-result-3').textContent.includes('۴ از ۵'));
 assert.equal(data.behparvar_session1_v4,oldBrand.behparvar_session1_v4);
}
for(const blocked of [true,false]){
 const a=boot({audience:'managers',blocked,data:blocked?{}:{sabanaft_practice_v1:'invalid json',sabanaft_session3_v1:'null'},hash:'#session3-m1'});
 a.q('[data-saba-question="s3-m1"][data-saba-value="2"]').click();assert.equal(a.q('#saba-feedback-s3-m1').hidden,false);
 if(blocked)assert(a.q('#saba-save-status').textContent.includes('دسترس نیست'));
}
const unselected=boot({audience:null,hash:'#session6-quiz',width:390});assert.equal(unselected.active(),'session6');assert.equal(unselected.q('#sidebarToggle').hidden,false);unselected.q('[data-session-audience="managers"]').click();assert.equal(unselected.reloaded,true);assert.equal(new URL(unselected.location.href).searchParams.get('audience'),'managers');assert.equal(new URL(unselected.location.href).hash,'#session6-quiz');
console.log('PASS: 42 lesson routes for both audiences; all 25 additional quiz questions, withheld keys, full/partial scores, reload, role/session isolation, safe reset, notes, invalid/blocked storage, unrelated Behparvar data and mobile deep-link audience gate.');

