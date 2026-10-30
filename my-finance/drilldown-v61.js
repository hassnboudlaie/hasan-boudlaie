/* My Finance v61 · private, read-only account/transaction drilldown.
   Every value comes from the authenticated, per-user MyFinanceBridge.
   Never write finance data; IDs exist in history.state only (not URLs).
*/
(()=>{
 'use strict';
 const bridge=window.MyFinanceBridge;
 const hostAccount=document.getElementById('finance-account-detail-body');
 const hostTx=document.getElementById('finance-transaction-detail-body');
 if(!bridge||!hostAccount||!hostTx)return;
 const authorized=()=>document.body.classList.contains('finance-unlocked');
 const en=()=>document.documentElement.lang==='en';
 const txt=(fa,english)=>en()?english:fa;
 const number=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2});
 const currencyName=c=>({IRT:txt('تومان','toman'),IRR:txt('ریال','rial'),USD:txt('دلار','USD'),EUR:txt('یورو','EUR')}[c]||String(c||''));
 const amount=(n,c)=>Number.isFinite(Number(n))?number.format(Number(n))+' '+currencyName(c):'—';
 function node(tag,cls,content){
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(content!==undefined)el.textContent=String(content);
  return el;
 }
 function field(label,value){
  const row=node('div','mf-drill-field');
  row.append(node('span','mf-drill-field-name',label),node('strong','mf-drill-field-value',value==null||value===''?'—':value));
  return row;
 }
 function backOrEmpty(host,message){
  const card=node('div','mf-drill-empty');
  card.append(node('p','',message));
  const btn=node('button','mf-drill-return',txt('بازگشت به فهرست','Return to list'));
  btn.type='button';
  btn.addEventListener('click',()=>window.financeBack?.());
  card.append(btn);host.replaceChildren(card);
 }
 function safeData(){
  if(!authorized())return {accounts:[],tx:[]};
  const data=bridge.getData();
  return {accounts:Array.isArray(data.accounts)?data.accounts:[],tx:Array.isArray(data.tx)?data.tx:[]};
 }
 function renderAccount(id){
  if(!authorized()){clear();return}
  const data=safeData(),account=typeof id==='string'?data.accounts.find(a=>a.id===id):null;
  if(!account){backOrEmpty(hostAccount,txt('این حساب در فهرست فعلی یافت نشد. از صفحه حساب‌ها دوباره انتخاب کنید.','Account not found. Select it again from Accounts.'));return}
  const wrap=node('div','mf-drill-content');
  const head=node('div','mf-drill-overview');
  const name=node('div','mf-drill-overview-name');
  name.append(node('small','',txt('حساب مالی','FINANCIAL ACCOUNT')),node('h3','',account.name||txt('حساب بدون نام','Untitled account')));
  head.append(name);
  const cur=String(account.currency||'IRT');
  let balance='—';
  try{if(typeof window.MyFinanceAccountBalance==='function')balance=amount(window.MyFinanceAccountBalance(account),cur)}catch(_){}
  head.append(node('strong','mf-drill-balance',balance));
  wrap.append(head);
  const details=node('div','mf-drill-grid');
  details.append(field(txt('واحد پول','Currency'),currencyName(cur)),field(txt('موجودی اولیه','Opening balance'),account.opening==null?txt('ثبت نشده','Not specified'):amount(account.opening,cur)));
  wrap.append(details);
  const txs=data.tx.filter(t=>t.account===account.id&&t.status!=='cancelled').sort((a,b)=>String(b.date||b.occurredAt||'').localeCompare(String(a.date||a.occurredAt||'')));
  const section=node('div','mf-drill-related');
  const title=node('div','mf-drill-related-head');title.append(node('h3','',txt('گردش‌های این حساب','Account transactions')),node('small','',number.format(txs.length)+' '+txt('مورد','entries')));
  section.append(title);
  if(!txs.length)section.append(node('p','mf-drill-empty-line',txt('برای این حساب تراکنشی ثبت نشده است.','No transactions recorded for this account.')));
  for(const entry of txs.slice(0,8)){
   const btn=node('button','mf-drill-item');
   btn.type='button';btn.setAttribute('aria-label',txt('نمایش جزئیات تراکنش','View transaction details'));
   const info=node('span','mf-drill-item-copy');
   info.append(node('strong','',entry.category||entry.memo||txt('تراکنش','Transaction')),node('small','',String(entry.date||entry.occurredAt||'').slice(0,10)));
   btn.append(info,node('b','',amount(entry.amount,entry.currency||cur)),node('span','mf-drill-chevron','‹'));
   btn.addEventListener('click',()=>window.financeOpenTransaction?.(entry.id));
   section.append(btn);
  }
  if(txs.length>0){
   const all=node('button','mf-drill-all',txt('مشاهده تمام تراکنش‌های این حساب','See all transactions'));
   all.type='button';
   all.addEventListener('click',()=>{
    if(window.MyFinanceHistory?.openFiltered)window.MyFinanceHistory.openFiltered({accountId:account.id});
    else window.financeNavGo?.('transactions');
   });
   section.append(all);
  }
  wrap.append(section);hostAccount.replaceChildren(wrap);
 }
 function renderTransaction(id){
  if(!authorized()){clear();return}
  const data=safeData(),entry=typeof id==='string'?data.tx.find(t=>t.id===id):null;
  if(!entry){backOrEmpty(hostTx,txt('تراکنش یافت نشد. از فهرست تراکنش‌ها دوباره انتخاب کنید.','Transaction not found. Return to the transaction list.'));return}
  const account=data.accounts.find(a=>a.id===entry.account);
  const cur=String(entry.currency||account?.currency||'IRT');
  const type=({income:txt('درآمد','Income'),expense:txt('هزینه','Expense'),investment:txt('سرمایه‌گذاری یا قرض','Investment or loan'),transfer:txt('انتقال','Transfer')}[entry.kind]||txt('تراکنش','Transaction'));
  const status=({completed:txt('ثبت‌شده','Completed'),pending:txt('در انتظار','Pending'),cancelled:txt('لغوشده','Cancelled')}[entry.status]||txt('ثبت‌شده','Completed'));
  const wrap=node('div','mf-drill-content');
  const overview=node('div','mf-drill-overview mf-drill-transaction');
  overview.append(node('small','',type),node('strong','mf-drill-balance',amount(entry.amount,cur)),node('h3','',entry.category||type));
  wrap.append(overview);
  const grid=node('div','mf-drill-grid');
  grid.append(
   field(txt('نوع','Type'),type),
   field(txt('وضعیت','Status'),status),
   field(txt('حساب','Account'),account?.name||entry.accountName||txt('نامشخص','Unknown')),
   field(txt('تاریخ','Date'),String(entry.date||entry.occurredAt||'').slice(0,10)||'—'),
   field(txt('واحد پول','Currency'),currencyName(cur)),
   field(txt('دسته‌بندی','Category'),entry.category||'—')
  );
  wrap.append(grid);
  if(entry.memo)wrap.append(field(txt('توضیحات','Notes'),entry.memo));
  if(account){
   const button=node('button','mf-drill-all',txt('مشاهده حساب مرتبط','Open related account'));
   button.type='button';button.addEventListener('click',()=>window.financeOpenAccount?.(account.id));
   wrap.append(button);
  }
  hostTx.replaceChildren(wrap);
 }
 function clear(){hostAccount.replaceChildren();hostTx.replaceChildren()}
 function render(route,context){
  if(!authorized()){clear();return}
  if(route==='account-detail')renderAccount(context?.accountId);
  if(route==='transaction-detail')renderTransaction(context?.transactionId);
 }
 const refresh=()=>{
  const route=document.body.dataset.financeView;
  if(['account-detail','transaction-detail'].includes(route))render(route,history.state?.context);
 };
 for(const e of ['myfinance:changed','myfinance:cloud-synced','myfinance:rebound','myfinance:unlocked']){
  document.addEventListener(e,refresh);
 }
 // Data from a previous user must not persist in hidden drilldown DOM.
 new MutationObserver(()=>{if(!authorized())clear()}).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.MyFinanceDrilldown={render,clear};
 refresh();
})();
