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

const parts=['m1','m2','leaders','techniques','visuals','diseases','quiz'];
for(const role of [null,'managers','supervisors']){
 const a=boot({audience:role});assert.equal(a.active(),'course');assert.equal(a.q('#workshopSidebar').hidden,true);
 for(let n=1;n<=6;n++){
  a.q('[data-course-session="'+n+'"]').click();const entry=n===1?'home':'session'+n;
  assert.equal(a.active(),entry);assert.equal(a.q('#workshopSidebar').hidden,false);assert.equal(a.q('#sidebarMobileBar').hidden,false);assert.equal(a.q('#workshopLayout').classList.contains('has-sidebar'),true);assert.equal(a.doc.body.classList.contains('in-workshop'),true);assert.equal(a.q('#audienceStatus').hidden,true);assert.equal(a.all('#workshopNavigation a').length,7);assert.equal(a.q('#sidebarHome').getAttribute('aria-current'),'page');assert.equal(a.q('#sidebarHome').dataset.open,entry);assert.equal(a.q('#sidebarCourse').dataset.open,'course');
  const prefix=n===1?'':'session'+n+'-';for(const [i,link] of a.all('#workshopNavigation a').entries())assert.equal(link.dataset.open,prefix+parts[i]);
  if(role){a.q('.site-nav [data-open="'+prefix+'m2"]').click();assert.equal(a.active(),prefix+'m2');assert.equal(a.q('.site-nav [aria-current="page"]').dataset.open,prefix+'m2');a.q('#sidebarHome').click();assert.equal(a.active(),entry);assert.equal(a.q('#workshopSidebar').hidden,false)}
  a.q('#sidebarCourse').click();assert.equal(a.active(),'course');assert.equal(a.q('#workshopSidebar').hidden,true);assert.equal(a.q('#sidebarMobileBar').hidden,true);
 }
 if(!role)assert.equal(a.q('#sidebarAudience').textContent,'مدیران و سرپرستان');
}
const mobile=boot({audience:null,width:390,hash:'#session4'});assert.equal(mobile.q('#sidebarMobileBar').hidden,false);mobile.q('#sidebarToggle').click();assert.equal(mobile.q('#sidebarToggle').getAttribute('aria-expanded'),'true');assert.equal(mobile.q('#main').getAttribute('inert'),'');assert.equal(mobile.doc.activeElement,mobile.q('#sidebarClose'));
mobile.events.keydown({key:'Tab',shiftKey:true,preventDefault(){}});assert.equal(mobile.doc.activeElement,mobile.q('#sidebarCourse'));mobile.events.keydown({key:'Tab',shiftKey:false,preventDefault(){}});assert.equal(mobile.doc.activeElement,mobile.q('#sidebarClose'));
mobile.events.keydown({key:'Escape',preventDefault(){}});assert.equal(mobile.q('#sidebarToggle').getAttribute('aria-expanded'),'false');assert.equal(mobile.doc.activeElement,mobile.q('#sidebarToggle'));
mobile.q('#sidebarToggle').click();mobile.q('.site-nav [data-open="session4-m2"]').click();assert.equal(mobile.active(),'session4');assert.equal(mobile.q('#sidebarBackdrop').hidden,true);assert.ok(mobile.q('#session4Prompt').textContent.includes('ابتدا'));assert.equal(mobile.doc.activeElement,mobile.q('#session4Prompt'));mobile.q('#session4 [data-session-audience="supervisors"]').click();assert.equal(mobile.location.hash,'#session4-m2');
const routed=boot({audience:'supervisors',width:390,hash:'#session6-quiz'});routed.q('#sidebarToggle').click();routed.q('#sidebarCourse').click();assert.equal(routed.active(),'course');assert.equal(routed.q('#main').getAttribute('inert'),undefined);assert.equal(routed.q('#sidebarBackdrop').hidden,true);assert.equal(routed.doc.activeElement,routed.q('#course h1'));
assert.equal(routed.all('.future-section-list').length,0,'future overviews do not duplicate the dashboard menu');
console.log('PASS: branded dashboard visible on all six entries for both roles and before role selection; seven session-specific links; active entry/section; course return; mobile drawer, focus loop, Escape, gated deep link and duplicate-card removal.');
