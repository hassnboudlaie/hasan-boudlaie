/* My Finance · Dashboard Pulse v78
  Authorized in-browser finance summaries + public, timestamped market JSON.
  Never writes transactions, loans, authentication or accounting data.
  Market source: Iran Market Data (TGJU via GitHub public JSON), ~30-minute publication.
*/
(()=>{
 'use strict';
 const get=id=>document.getElementById(id);
 const fmt=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2});
 const money=n=>fmt.format(n);
 const source='https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/popular.json';
 const publicSite='https://iran-market.github.io/';
 const symbols=[
  {id:'USD_IRR_FREE',name:'دلار آزاد',icon:'💵'},
  {id:'EUR_IRR_FREE',name:'یورو',icon:'💶'},
  {id:'GOLD_18K_IRR',name:'طلای ۱۸ عیار · گرم',icon:'🥇'},
  {id:'COIN_EMAMI_IRR',name:'سکه امامی',icon:'🪙'}
 ];
 let lastFetch=0,inFlight=false,lastValid=null;
 function authorized(){return document.body.classList.contains('finance-unlocked')}
 function changedLanguage(){return document.documentElement.lang==='en'}
 function latestTransaction(){
  const card=get('mf-last-tx'),title=get('mf-last-tx-title'),amount=get('mf-last-tx-amount'),extra=get('mf-last-tx-extra');
  if(!card||!title||!amount||!extra)return;
  if(!authorized()){
   card.disabled=true;title.textContent='آخرین تراکنش';amount.textContent='—';extra.textContent='';return;
  }
  let data;
  try{data=window.MyFinanceBridge?.getData()}catch(_){data=null}
  const tx=(Array.isArray(data?.tx)?data.tx:[]).filter(x=>x&&x.status!=='cancelled'&&x.status!=='pending');
  // Storage/cloud sync maintain insertion order; a backdated entry must remain the latest REGISTERED record.
  const newest=tx.at(-1);
  if(!newest){
   card.disabled=false;title.textContent='هنوز تراکنشی ثبت نشده';
   amount.textContent='—';extra.textContent='برای ثبت هزینه یا درآمد اینجا بزنید';
   card.dataset.lastTxId='';return;
  }
  card.disabled=false;card.dataset.lastTxId=String(newest.id||'');
  const account=(data.accounts||[]).find(a=>a.id===newest.account);
  const curr=newest.currency||account?.currency||'IRT';
  const unit=curr==='IRT'?'تومان':curr==='IRR'?'ریال':curr;
  const kind=newest.kind==='income'?'درآمد':newest.kind==='expense'?'هزینه':newest.kind==='transfer'?'انتقال':newest.kind==='investment'?'سرمایه‌گذاری':'تراکنش';
  const category=String(newest.category||newest.memo||kind).trim();
  title.textContent=category.length>75?category.slice(0,75)+'…':category;
  const numeric=Number(newest.amount);
  const sign=newest.kind==='income'?'+':newest.kind==='expense'?'−':'';
  amount.textContent=Number.isFinite(numeric)?sign+money(numeric)+' '+unit:'مبلغ نامشخص';
  amount.classList.toggle('mf-positive',newest.kind==='income');
  amount.classList.toggle('mf-negative',newest.kind==='expense');
  const at=new Date(newest.date||newest.occurredAt||'');
  const date=Number.isFinite(at.getTime())?new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Tehran'}).format(at):'';
  extra.textContent=[kind,date,account?.name||newest.accountName||''].filter(Boolean).join(' · ');
 }
 function priceDate(time){
  const d=new Date(time);
  return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'}).format(d):'زمان نامشخص';
 }
 function stale(time,flag){
  const value=new Date(time).getTime();
  return flag===true||!Number.isFinite(value)||Date.now()-value>90*60*1000||value-Date.now()>10*60*1000;
 }
 function setStatus(message,type='neutral'){
  const status=get('mf-market-status');if(!status)return;
  status.textContent=message;status.dataset.state=type;
 }
 function renderMarkets(payload){
  const holder=get('mf-market-grid');
  if(!holder)return;
  if(!payload||!Array.isArray(payload.data))return setStatus('داده معتبر بازار در دسترس نیست','unavailable');
  const bySymbol=new Map(payload.data.filter(x=>x&&typeof x.symbol==='string').map(x=>[x.symbol,x]));
  holder.replaceChildren();
  let freshCount=0,shownCount=0;
  for(const {id,name,icon} of symbols){
   const item=bySymbol.get(id);
   const value=Number(item?.price);
   const exists=item?.currency==='IRT'&&Number.isFinite(value)&&value>0;
   const itemStale=!exists||stale(item?.timestamp,item?.stale||payload.meta?.stale);
   const card=document.createElement('div');card.className='mf-market-rate';
   const head=document.createElement('div');head.className='mf-market-rate-head';
   const art=document.createElement('span');art.className='mf-market-emoji';art.setAttribute('aria-hidden','true');art.textContent=icon;
   const label=document.createElement('strong');label.textContent=name;
   head.append(art,label);
   const number=document.createElement('b');number.dir='auto';number.textContent=exists?money(value)+' تومان':'—';
   const foot=document.createElement('small');
   const percent=Number(item?.change_pct);
   if(exists){
    shownCount++;
    foot.textContent=(itemStale?'⚠️ نرخ قدیمی · ':'')+priceDate(item?.timestamp)+(Number.isFinite(percent)?' · '+(percent>0?'+':'')+new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(percent)+'٪':'');
    if(!itemStale)freshCount++;
   }else foot.textContent='قیمت در دسترس نیست';
   foot.className='mf-market-rate-foot';
   card.classList.toggle('mf-rate-stale',itemStale);
   card.append(head,number,foot);
   holder.append(card);
  }
  if(!shownCount)setStatus('منبع قیمت در دسترس نیست','unavailable');
  else if(freshCount===shownCount)setStatus('نرخ واقعی بازار · به‌روزرسانی منبع حدود هر ۳۰ دقیقه','fresh');
  else setStatus('برخی قیمت‌ها قدیمی‌اند؛ زمان هر نرخ را بررسی کنید','stale');
 }
 async function refreshMarkets(force=false){
  if(!authorized()||document.hidden||inFlight)return;
  if(!force&&Date.now()-lastFetch<5*60*1000)return;
  inFlight=true;lastFetch=Date.now();
  if(!lastValid)setStatus('دریافت قیمت‌های بازار…');
  try{
   const response=await fetch(source,{cache:'no-store',mode:'cors',signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const payload=await response.json();
   if(!payload||!Array.isArray(payload.data)||payload.meta?.unit!=='toman')throw Error('invalid source payload');
   lastValid=payload;renderMarkets(payload);
  }catch(_){
   if(lastValid){renderMarkets(lastValid);setStatus('ارتباط با بازار قطع است؛ آخرین نرخ‌های دریافتی نمایش داده شده‌اند','stale');}
   else setStatus('اتصال به منبع نرخ برقرار نیست؛ هیچ قیمت تخمینی نمایش داده نمی‌شود','unavailable');
  }finally{inFlight=false}
 }
 const card=get('mf-last-tx');
 card?.addEventListener('click',()=>{
  if(!authorized())return;
  const id=card.dataset.lastTxId;
  if(id&&typeof window.financeOpenTransaction==='function')window.financeOpenTransaction(id);
  else if(typeof window.financeNavGo==='function')window.financeNavGo('transactions');
  else if(typeof financeNavGo==='function')financeNavGo('transactions');
 });
 const btn=get('mf-market-refresh');
 btn?.addEventListener('click',()=>refreshMarkets(true));
 for(const event of ['myfinance:changed','myfinance:rebound','myfinance:cloud-synced','myfinance:unlocked']){
  document.addEventListener(event,()=>{latestTransaction();refreshMarkets(false)});
 }
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){latestTransaction();refreshMarkets(false)}});
 window.addEventListener('pageshow',()=>{latestTransaction();refreshMarkets(false)});
 setInterval(()=>{if(authorized()&&!document.hidden){latestTransaction();refreshMarkets(false)}},5*60*1000);
 latestTransaction();refreshMarkets(false);
 window.MyFinanceDashboardPulse={renderLatest:latestTransaction,refreshMarkets};
})();
