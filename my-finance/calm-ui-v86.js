/* My Finance v86 — calm, tap-first, multi-screen presentation layer.
 * Intentionally does not read/write financial data, accounts, tokens or Supabase.
 * Existing routes, forms, element IDs and account-level permissions stay intact.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const home=$('home'),metrics=home?.querySelector('.finance-dashboard-metrics');
 if(!home||!metrics||!document.querySelector('.finance-mobile-nav'))return;
 const lang=()=>document.documentElement.lang==='en';
 const label=(fa,en)=>lang()?en:fa;
 const composers=new Map();
 function togglePanel(section,titleFa,titleEn,icon='＋'){
  const root=$(section);
  if(!root)return;
  // The registration form is the first top-level card, but never the history/list card.
  const card=[...root.children].find(el=>el.classList?.contains('card')&&!el.classList.contains('tx-history-card'));
  if(!card||card.parentElement?.classList?.contains('mf-calm-composer'))return;
  const details=document.createElement('details');
  details.className='mf-calm-composer';
  details.dataset.composer=section;
  const summary=document.createElement('summary');
  summary.className='mf-calm-composer-summary';
  const mark=document.createElement('span');
  mark.className='mf-calm-composer-icon';mark.setAttribute('aria-hidden','true');mark.textContent=icon;
  const title=document.createElement('strong');
  title.textContent=label(titleFa,titleEn);title.dataset.fa=titleFa;title.dataset.en=titleEn;
  const hint=document.createElement('span');hint.className='mf-calm-composer-hint';hint.textContent=label('بازکردن','Open');hint.dataset.fa='بازکردن';hint.dataset.en='Open';
  summary.append(mark,title,hint);
  root.insertBefore(details,card);
  details.append(summary,card);
  details.addEventListener('toggle',()=>{
   hint.textContent=details.open?label('بستن','Close'):label('بازکردن','Open');
  });
  composers.set(section,details);
 }
 function revealComposer(section,focusField=false){
  const details=composers.get(section);
  if(!details)return;
  details.open=true;
  if(focusField){
   const field=details.querySelector('input:not([type=hidden]), select, textarea');
   requestAnimationFrame(()=>{try{field?.focus({preventScroll:true})}catch(_){field?.focus()}});
  }
 }
 window.financeRevealComposer=revealComposer;
 // Keep the existing on-page financeStartRecord button behavior.
 const startRecord=window.financeStartRecord;
 if(typeof startRecord==='function'){
  window.financeStartRecord=function(kind){
   revealComposer('transactions');
   return startRecord.apply(this,arguments);
  };
 }
 togglePanel('transactions','ثبت تراکنش جدید','New transaction','＋');
 togglePanel('accounts','افزودن حساب','Add account','＋');
 togglePanel('transfers','انتقال پول','Transfer money','⇄');
 togglePanel('receivables','ثبت طلب یا سرمایه‌گذاری','Add receivable','＋');
 togglePanel('commitments','تعهد جدید','New recurring payment','＋');
 // Move the always-needed notices directly below the main cash balance.
 const notices=home.querySelector(':scope > .mf-home-notices');
 const bar=metrics.querySelector('.mf-command-bar');
 if(notices&&bar)metrics.insertBefore(notices,bar);
 // Keep all eight quick actions, but show just four choices in the primary view.
 const actions=home.querySelector('.mf-action-grid');
 if(actions&&!$('mf-calm-extras')){
  const extra=document.createElement('details');extra.id='mf-calm-extras';extra.className='mf-calm-extras';
  const summary=document.createElement('summary');summary.textContent=label('سایر خدمات','Other tools');summary.dataset.fa='سایر خدمات';summary.dataset.en='Other tools';
  const grid=document.createElement('div');grid.className='mf-calm-extras-grid';
  for(const klass of ['mf-action-loans','mf-action-analysis','mf-action-reports','mf-action-assistant']){
   const action=actions.querySelector('.'+klass);
   if(action)grid.append(action);
  }
  extra.append(summary,grid);
  actions.parentElement.append(extra);
 }
 // Monthly charts/KPIs remain available by a clearly labeled one-tap disclosure.
 const pair=metrics.querySelector('.finance-kpi-pair');
 const receivables=metrics.querySelector('.finance-receivables-strip');
 if(pair&&!$('mf-calm-insights')){
  const details=document.createElement('details');
  details.id='mf-calm-insights';details.className='mf-calm-insights';
  const summary=document.createElement('summary');
  summary.innerHTML='<span class="mf-calm-insights-symbol" aria-hidden="true">▥</span><span class="mf-calm-insights-copy"></span><span class="mf-calm-chevron" aria-hidden="true">⌄</span>';
  const insightLabel=summary.querySelector('.mf-calm-insights-copy');
  insightLabel.textContent=label('گزارش مالی این ماه','This month');
  insightLabel.dataset.fa='گزارش مالی این ماه';insightLabel.dataset.en='This month';
  metrics.insertBefore(details,pair);
  details.append(summary,pair);
  if(receivables)details.append(receivables);
 }
 // Leave the original cashflow card as a direct child of #home: virtual
 // cashflow and analysis routes depend on that structure. It is hidden on Home
 // via CSS and remains fully accessible through its navigation route.
 // Settings are a quiet directory; every existing form stays present inside its own
 // accessible disclosure. Profile can be automatically expanded by its own route.
 const settings=$('settings');
 if(settings){
  const names=new Map([
   ['finance-profile-card',['حساب و مشخصات من','My profile','♙']],
   ['personal-ai-panel',['هوش مصنوعی و ChatGPT','AI & ChatGPT','✧']],
   ['supabase-sync',['اتصال و همگام‌سازی','Cloud sync','↻']]
  ]);
  [...settings.children].forEach(card=>{
   if(!card.classList?.contains('card')||card.querySelector(':scope > .mf-calm-settings-detail'))return;
   const [fa,en,icon]=names.get(card.id)||[
    card.querySelector('h2')?.textContent?.trim().replace(/\s*\/.*$/,'')||'تنظیمات بیشتر',
    'More settings','⚙'
   ];
   const detail=document.createElement('details');detail.className='mf-calm-settings-detail';
   const summary=document.createElement('summary');
   const mark=document.createElement('span');mark.className='mf-calm-settings-icon';mark.setAttribute('aria-hidden','true');mark.textContent=icon;
   const text=document.createElement('strong');text.textContent=label(fa,en);text.dataset.fa=fa;text.dataset.en=en;
   const chevron=document.createElement('span');chevron.textContent='⌄';chevron.className='mf-calm-chevron';
   summary.append(mark,text,chevron);
   const body=document.createElement('div');body.className='mf-calm-settings-body';
   while(card.firstChild)body.append(card.firstChild);
   detail.append(summary,body);card.append(detail);
  });
 }
 function openProfile(){
  const details=$('finance-profile-card')?.querySelector('.mf-calm-settings-detail');
  if(details)details.open=true;
 }
 const nav=window.financeNavGo;
 if(typeof nav==='function'){
  window.financeNavGo=function(id,options){
   if(id==='profile')openProfile();
   if(id==='transactions'&&options?.showComposer)revealComposer('transactions');
   return nav.apply(this,arguments);
  };
 }
 // Current route may be #/profile after reload.
 if(document.body.dataset.financeView==='profile'||location.hash==='#/profile')openProfile();
 document.addEventListener('myfinance:unlocked',()=>{
  if(document.body.dataset.financeView==='profile')openProfile();
 });
 // Make section subtitles secondary, not permanently occupying mobile space.
 document.body.classList.add('mf-calm-ui');
 window.MyFinanceCalmUI={revealComposer};
})();