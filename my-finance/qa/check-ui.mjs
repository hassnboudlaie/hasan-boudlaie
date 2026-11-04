/* My Finance UI integrity checks: run with node my-finance/qa/check-ui.mjs
   No real user accounts or financial records are accessed. */
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('index.html'),sw=read('sw.js'),css=read('my-finance-ui-v54.css'),visual=read('visual-upgrade-v75.css'),dashboard=read('home-dashboard-v84.css');
let total=0;
function check(label,fn){
 try{fn();total++;process.stdout.write('PASS '+label+'\n')}
 catch(e){process.stderr.write('FAIL '+label+': '+e.message+'\n');process.exitCode=1}
}
check('consolidated styles and latest r84 icon dashboard layer',()=>{
 const links=[...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(links.length,7);
 assert.match(links[0],/^\.\/my-finance-ui-v54\.css\?v=/);
 assert.match(links[1],/^\.\/navigation-v60\.css\?v=/);
 assert.match(links[2],/^\.\/drilldown-v61\.css\?v=/);
 assert.match(links[3],/^\.\/mobile-polish-v58\.css\?v=/);
 assert.match(links[4],/^\.\/visual-upgrade-v75\.css\?v=20261102r78$/);
 assert.match(links[5],/^\.\/home-dashboard-v84\.css\?v=20261104r84$/);
 assert.match(links[6],/^\.\/calm-ui-v86\.css\?v=20261104r86$/);
 let pos=-1;
 for(const name of ['premium.css','dashboard-r33.css','design-v49.css','interior-v51.css','mobile-ux-v52.css']){
  const next=css.indexOf(read(name));assert.ok(next>pos,'CSS source missing/reordered: '+name);pos=next;
 }
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
 assert.equal((visual.match(/\{/g)||[]).length,(visual.match(/\}/g)||[]).length);
 assert.equal((dashboard.match(/\{/g)||[]).length,(dashboard.match(/\}/g)||[]).length);
 assert.ok(dashboard.includes('data-finance-view="home"'),'scoped home dashboard CSS missing');
 assert.ok(dashboard.includes('data-finance-view="assistant"'),'assistant dedicated view missing');
 assert.ok(visual.includes('body.finance-unlocked #home .finance-home-hub-copy strong'),'large clickable tiles missing');
 assert.ok(html.includes('class="mf-home-visual"'),'illustrated Home not mounted');
 assert.ok(html.includes('finance-hero-growth-v77.svg?v=20261102r77'),'hero image source missing');
 assert.ok(visual.includes('html.mf-wide-mobile body'),'desktop site zoom fallback missing');
 assert.ok(visual.includes('.mf-action-expense'),'colored transaction tiles missing');
});
check('always-on installment, last recorded transaction and actual market data wiring',()=>{
 const loans=read('loans.js'),pulse=read('dashboard-pulse-v78.js');
 for(const id of ['mf-last-tx','mf-last-tx-title','mf-last-tx-amount','mf-market-card','mf-market-grid','mf-market-refresh']){
  assert.ok(html.includes('id="'+id+'"'),'home is missing '+id);
 }
 assert.ok(html.indexOf('id="loan-due-notice"')<html.indexOf('class="finance-dashboard-metrics"'),'nearest due must be at top of Home');
 assert.ok(html.indexOf('id="mf-last-tx"')<html.indexOf('class="finance-dashboard-metrics"'),'last transaction must be near the top');
 assert.ok(html.includes('dashboard-pulse-v78.js?v=20261102r78'),'market/transaction script not active');
 assert.ok(loans.includes('reminder.hidden=false'),'nearest installment cannot disappear away from due day');
 assert.ok(loans.includes('nextDueJalali'),'actual loan due date not used');
 assert.ok(pulse.includes('MyFinanceBridge?.getData()'),'last transaction must read authorized finance data');
 assert.ok(pulse.includes('iran-market.github.io/main/data/popular.json'),'real market source missing');
 assert.ok(pulse.includes('item?.timestamp'),'rate age must be visible');
 assert.ok(pulse.includes('item?.stale'),'stale upstream data must be respected');
 assert.ok(pulse.includes('Number.isFinite(value)'),'avoid fabricated rate values');
 assert.ok(!pulse.includes('localStorage.setItem'),'market data must not write financial data');
 assert.ok(sw.includes('./dashboard-pulse-v78.js?v=20261102r78'),'market script not cached');
 assert.ok(sw.includes('./loans.js?v=20261102r78'),'updated loan code not cached');
 const syntax=spawnSync(process.execPath,['--check',resolve(root,'dashboard-pulse-v78.js')],{encoding:'utf8'});
 assert.equal(syntax.status,0,syntax.stderr);
});
check('unique ids and essential financial navigation',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(ids.length>60);
 const found=new Set();
 for(const id of ids){assert.ok(!found.has(id),'duplicate id: '+id);found.add(id)}
 for(const id of ['auth-gate','home','balance','income','expense','quick','mf-home-more',
  'finance-quick-fab','loan-due-notice','upcoming-notice','commitments','loans',
  'transactions','accounts','settings','mf-update-notice'])assert.ok(found.has(id),'missing '+id);
 assert.ok(html.includes("'receivables','commitments','loans','reports'"));
});
check('minimal home available and saved',()=>{
 assert.ok(html.includes('<details id="mf-home-more"'));
 assert.ok(html.includes('myfinance-ui-home-more-v1'));
 assert.ok(html.indexOf('id="mf-home-more"')>html.indexOf('id="finance-cashflow-card"'));
});
check('redesign has eight icon actions with working routes',()=>{
 assert.ok(html.includes('class="mf-auth-showcase"'),'new login showcase missing');
 assert.ok(html.includes('class="mf-auth-identity"'),'login brand missing');
 assert.ok(html.includes('id="mf-header-release"'),'visible design version missing');
 assert.ok(html.includes('class="mf-action-grid"'),'new action deck missing');
 const homeActions=html.slice(html.indexOf('<section id="home"'),html.indexOf('</section>',html.indexOf('<section id="home"')));
 assert.equal((homeActions.match(/class="mf-action mf-action-/g)||[]).length,8,'Home must expose exactly eight distinct icon actions');
 for(const route of ['accounts','loans','analysis','reports','assistant'])assert.ok(homeActions.includes("financeNavGo('"+route+"')"),'missing Home route '+route);
 assert.ok(homeActions.includes('financeOpenQuickEntry()'),'voice-entry tile missing');
 assert.ok(homeActions.includes('id="mf-market-disclosure"'),'collapsible market entry missing');
 for(const kind of ['expense','income'])
  assert.ok(html.includes("financeStartRecord('"+kind+"')"),kind+' action missing');
 assert.ok(html.includes("financeNavGo('transfers')"),'transfer shortcut missing');
 assert.ok(html.includes("financeNavGo('loans')"),'loan shortcut missing');
 assert.ok(html.includes('function financeStartRecord(kind)'),'new transaction route function missing');
 assert.ok(visual.includes('My Finance · Visual Upgrade v75'),'v75 visual design layer missing');
 const homeStart=html.indexOf('<section id="home"');
 const homeEnd=html.indexOf('</section>',homeStart);
 const home=html.slice(homeStart,homeEnd);
 assert.ok(home.indexOf('finance-dashboard-metrics')<home.indexOf('mf-action-grid'),'financial hero should lead');
 assert.ok(home.indexOf('finance-balance-hero')<home.indexOf('mf-action-grid'),'quick actions after balance');
 assert.ok(home.indexOf('loan-due-notice')<home.indexOf('finance-dashboard-metrics'),'next installment should lead financial cards');
 assert.ok(home.indexOf('loan-due-notice')<home.indexOf('finance-quick-card'),'alert should be above entry card');
});
check('real 360px screenshot issues are covered by mobile layout',()=>{
 assert.ok(html.includes('data-myfinance-release="design-r84"'),'updated version marker missing');
 assert.ok(html.includes('class="mf-mobile-release"'),'compact mobile version chip missing');
 assert.ok(html.includes('brand-mark-v57.svg?v=20261030r57'),'new brand mark missing');
 const header=html.slice(html.indexOf('<header class="finance-app-header"'),html.indexOf('</header>',html.indexOf('<header class="finance-app-header"'))+9);
 assert.ok(header.includes('class="brand-wrap"'),'brand absent from header');
 const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('</section>',html.indexOf('<section id="home"'))+10);
 const metricStart=home.indexOf('class="finance-dashboard-metrics"');
 const actionStart=home.indexOf('class="mf-command-bar"');
 const kpiStart=home.indexOf('class="finance-kpi-pair"');
 const hero=home.indexOf('class="finance-balance-hero"');
 assert.ok(metricStart>=0&&metricStart<hero&&hero<actionStart&&actionStart<kpiStart,'mobile financial actions should follow balance and precede KPI cards');
 assert.ok(home.indexOf('class="finance-overview-meta"')<metricStart,'month pill should live in compact heading');
 assert.ok(read('mobile-polish-v58.css').includes('r74: canonical handheld layout'),'prior screenshot-directed layout missing');
 assert.ok(visual.includes('@media(max-width:420px)'),'large-type narrow mobile layout missing');
 assert.ok(visual.includes('.finance-admin-header-bell'),'in-header admin bell styling missing');
 const sync=read('supabase-sync.js');
 assert.ok(sync.includes("bell.className='finance-admin-header-bell'"),'admin bell must move out of viewport overlay');
 assert.ok(!sync.includes('position:fixed;bottom:96px;left:18px;z-index:1000'),'floating admin bell regression');
 const assets=sw.match(/const ASSETS=(\[[^;]+\]);/)?.[1]||'';
 assert.ok(assets.includes("./brand-mark-v57.svg?v=20261030r57"),'new brand not cached for PWA');
 const authSrc=html.match(/src="(\.\/supabase-sync\.js\?v=[^"]+)"/)?.[1];
 assert.ok(authSrc&&assets.includes(authSrc),'Current authenticated sync module missing from PWA precache');
});
check('r58 grouped menu and admin dashboard',()=>{
 const mobile=read('mobile-polish-v58.css'),admin=read('admin.html');
 assert.ok(html.includes('class="finance-more-scroll"'));
 assert.equal((html.match(/class="finance-more-group"/g)||[]).length,2);
 assert.ok(mobile.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert.ok(mobile.includes('finance-dock-auto-hidden'));
 assert.ok(admin.includes('id="admin-overview"'));
 assert.ok(admin.includes('id="admin-unread-events"'));
 assert.ok(admin.includes('mf-admin-notification-tools'));
});
check('in-app page hierarchy, Back history and standalone views',()=>{
 const nav=read('navigation-v60.css'),embed=read('embed-v60.css');
 const frame=html.includes('id="finance-embedded-frame"');
 assert.ok(frame,'assets and contracts iframe destination missing');
 assert.ok(html.includes('id="finance-page-header"'));
 assert.ok(html.includes('onclick="financeBack()"'),'Back action not wired');
 assert.ok(html.includes('financeRouterInitialize()'),'in-app route initialization missing');
 assert.ok(html.includes("window.addEventListener('popstate'"),'hardware Back must not reload');
 for(const page of ['cashflow','analysis','quick-entry','assets','contracts']){
  assert.ok(html.includes("financeNavGo('"+page+"')"),'missing clickable '+page+' route');
 }
 assert.ok(nav.includes('data-finance-view="home"')&&nav.includes('data-finance-view="analysis"'));
 assert.ok(nav.includes('data-finance-view="cashflow"'));
 assert.ok(embed.includes('mf-embedded'));
 for(const file of ['assets.html','contracts.html']){
  assert.ok(read(file).includes('embed-nav-v60.js'),'subpage must return through parent shell');
 }
 const result=spawnSync(process.execPath,[resolve(root,'qa/check-router.mjs')],{encoding:'utf8'});
 assert.equal(result.status,0,'Router regression failed: '+result.stderr);
});
check('private nested account and transaction detail screens',()=>{
 const drilldown=read('drilldown-v61.js'),css=read('drilldown-v61.css');
 for(const id of ['finance-account-detail','finance-account-detail-body','finance-transaction-detail','finance-transaction-detail-body'])
  assert.ok(html.includes('id="'+id+'"'),'missing nested screen '+id);
 assert.ok(html.includes("financeNavGo('account-detail',{context:"));
 assert.ok(html.includes("financeNavGo('transaction-detail',{context:"));
 assert.ok(html.includes('const samePage=stored?.mfFinance===true&&stored.route===route'),'Refresh must preserve the current browser history entry');
 assert.ok(html.includes('tab(route,context)'),'Reload should restore private object selection after auth');
 assert.ok(html.includes('history.state?.context||null'),'Language changes should retain private object selection');
 assert.ok(html.includes('window.MyFinanceAccountBalance=balance'));
 assert.ok(drilldown.includes('MyFinanceBridge')&&drilldown.includes('MyFinanceDrilldown'));
 assert.ok(drilldown.includes("if(!authorized()){clear();return}"),'Drilldown must never render if logged out');
 assert.ok(!drilldown.includes('localStorage.setItem('),'No finance writes in drilldown');
 assert.ok(css.includes('.mf-drill-grid'),'Private detail layout missing');
 const ledger=read('transaction-history.js');
 assert.ok(ledger.includes('data-tx-open-id'),'Individual transaction button missing');
 const result=spawnSync(process.execPath,[resolve(root,'qa/check-drilldown.mjs')],{encoding:'utf8'});
 assert.equal(result.status,0,'Nested detail regression failed: '+result.stderr);
});
check('screenshot-reviewed minimal mobile and non-obstructive install UI',()=>{
 const nav=read('navigation-v60.css'),install=read('install-prompt.js');
 const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('</section>',html.indexOf('<section id="home"'))+10);
 assert.equal((home.match(/class="finance-home-hub"/g)||[]).length,2,'Two concise detail tiles');
 assert.ok(nav.includes('#finance-quick-fab{display:none!important}'),'Floating CTA should not cover nested views');
 assert.ok(nav.includes('main>footer{display:none!important}'),'Mobile technical footer should not clutter');
 assert.ok(install.includes("anchor.insertAdjacentElement('afterend',panel)"),'Install prompt must follow header');
 assert.ok(!install.includes('position:fixed'),'Install prompt must not float over header');
 assert.ok(install.includes('myfinance-install-hidden-until-v2'),'Install dismissal should persist');
});
check('retained sessions and accurate initial auth diagnostics',()=>{
 const script=read('supabase-sync.js');
 const currentAuth=html.match(/src="(\.\/supabase-sync\.js\?v=\d{8}r(\d+))"/);
  assert.ok(currentAuth&&Number(currentAuth[2])>=75&&sw.includes("'"+currentAuth[1]+"'"),'Current auth module must use its new version and match the PWA cache');
 assert.ok(script.includes('financeAuthFailureKind('),'Auth status classifier absent');
 const result=spawnSync(process.execPath,[resolve(root,'qa/check-auth.mjs')],{encoding:'utf8'});
 assert.equal(result.status,0,'Authentication regression failed: '+result.stderr);
});
check('classic application JavaScript parses',()=>{
 const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 assert.ok(inline.length>=2);
 for(const text of inline)new Function(text);
 for(const name of ['dashboard-pulse-v78.js','loans.js','commitments.js','reports.js','receivables-actions.js',
 'voice-entry.js','transaction-history.js','install-prompt.js','app-update-v53.js','mobile-dock-v58.js','embed-nav-v60.js','drilldown-v61.js']){
  const check=spawnSync(process.execPath,['--check',resolve(root,name)],{encoding:'utf8'});
  assert.equal(check.status,0,name+': '+check.stderr);
 }
});
check('read-only voice reporting, currency safety and PWA wiring',()=>{
 const assistant=read('finance-assistant-v79.js');
 assert.ok(html.includes('finance-assistant-v79.js?v=20261103r80'),'assistant not loaded in app');
 assert.ok(sw.includes('./finance-assistant-v79.js?v=20261103r80'),'offline assistant asset missing');
 assert.ok(assistant.includes('bridge.getData()'),'reports must use the active account');
 assert.ok(assistant.includes("homeMetrics.insertAdjacentElement('beforebegin',card)"),'complete assistant must be on Home');
 assert.ok(!assistant.includes("const home=document.createElement('button')"),'Home must not show only an assistant shortcut');
 assert.ok(html.includes("'quick-entry','assistant'"),'assistant nav must keep the Home view visible');
 assert.ok(assistant.includes('myfinance:rebound'),'assistant must clear when account identity changes');
 assert.ok(!assistant.includes('service_role'),'privileged key forbidden');
 const syntax=spawnSync(process.execPath,['--check',resolve(root,'finance-assistant-v79.js')],{encoding:'utf8'});
 assert.equal(syntax.status,0,syntax.stderr);
 const run=spawnSync(process.execPath,[resolve(root,'qa/check-voice-reports.mjs')],{encoding:'utf8'});
 assert.equal(run.status,0,'Assistant regression failed: '+run.stderr);
});
check('every PWA precache file exists and new CSS is included',()=>{
 const assets=sw.match(/const ASSETS=(\[[^;]+\]);/)?.[1]||'';
 const paths=[...assets.matchAll(/'(\.\/[^']+)'/g)].map(m=>m[1]);
 assert.ok(paths.length>=15);
 for(const asset of paths){const p=asset.slice(2).split('?')[0];if(p)assert.ok(existsSync(resolve(root,p)),'missing '+asset)}
 const cssHref=html.match(/<link rel="stylesheet" href="(\.\/my-finance-ui-v54\.css\?v=[^"]+)"/)?.[1];
 assert.ok(paths.includes(cssHref));assert.ok(paths.includes('./index.html'));
 assert.ok(paths.includes('./visual-upgrade-v75.css?v=20261102r78'),'visual layer absent from offline cache');
 assert.ok(paths.includes('./home-dashboard-v84.css?v=20261104r84'),'icon dashboard layer absent from offline cache');
 assert.ok(paths.includes('./finance-hero-growth-v77.svg?v=20261102r77'),'decorative hero not available offline');
 for(const asset of ['./navigation-v60.css?v=20261030r63','./embed-v60.css?v=20261030r60','./embed-nav-v60.js?v=20261030r60','./drilldown-v61.css?v=20261030r63','./drilldown-v61.js?v=20261030r63'])assert.ok(paths.includes(asset),'offline missing '+asset);
});
check('release id, PWA cache and stylesheet version align',()=>{
 const rev=html.match(/data-myfinance-release="design-r(\d+)"/)?.[1];
 assert.ok(rev);assert.equal(rev,sw.match(/my-finance-release-\d+r(\d+)/)?.[1]);
 assert.equal(rev,html.match(/home-dashboard-v84\.css\?v=\d+r(\d+)/)?.[1]);
});
check('ChatGPT opt-in is private, cached and consent-based',()=>{
  const assistant=read('personal-chatgpt-connect-v81.js');
  assert.ok(html.includes('./personal-chatgpt-connect-v81.js?v=20261103r81'),'ChatGPT feature must load');
  assert.ok(sw.includes('./personal-chatgpt-connect-v81.js?v=20261103r81'),'ChatGPT feature must be cached offline');
  assert.ok(assistant.includes("namespace().startsWith('my-finance-user-')"),'ChatGPT setting must be scoped to the current account');
  assert.ok(assistant.includes("switchMode(false)"),'User must be able to opt out');
  assert.ok(assistant.includes('navigator.clipboard?.writeText'),'Sharing must be explicit');
  assert.ok(!assistant.includes('service_role'),'No privileged credential in browser');
  const syntax=spawnSync(process.execPath,['--check',resolve(root,'personal-chatgpt-connect-v81.js')],{encoding:'utf8'});
  assert.equal(syntax.status,0,syntax.stderr);
});
check('opt-in ChatGPT bridge is isolated, review-only, and offline-ready',()=>{
  const bridge=read('chatgpt-bridge-v82.js');
  const sync=read('supabase-sync.js'),voice=read('voice-entry.js');
  const server=read('chatgpt/edge/index.ts');
  assert.ok(html.includes('./chatgpt-bridge-v82.js?v=20261103r82'),'bridge must be loaded');
  assert.ok(sw.includes('./chatgpt-bridge-v82.js?v=20261103r82'),'bridge must be available offline');
  assert.ok(html.includes("location.hash)?location.href:financeRouteUrl(route)"),'deep-link authorization flow must survive the initial router');
  assert.ok(sync.includes('chatgptSetConnection')&&sync.includes('chatgptDrafts'),'private cloud bridge actions must exist');
  assert.ok(voice.includes('myfinance:voice-saved'),'review completion signal must exist');
  assert.ok(bridge.includes('myfinance:voice-saved'),'drafts only close after an explicit voice save');
  assert.ok(bridge.includes('finance-unlocked'),'bridge must respect verified sign-in');
  assert.ok(server.includes('OAUTH_CLIENT_NOT_APPROVED'),'OAuth client must match user consent');
  assert.ok(server.includes('user_id",uid'),'server must scope every query to verified user');
  assert.ok(!server.includes('SUPABASE_SERVICE_ROLE_KEY'),'bridge must not bypass RLS');
  assert.ok(!server.includes('.from("finance_entries").insert'),'ChatGPT may not directly save finance entries');
  const js=spawnSync(process.execPath,['--check',resolve(root,'chatgpt-bridge-v82.js')],{encoding:'utf8'});
  assert.equal(js.status,0,js.stderr);
});
check('iPhone localized amount input and spoken rent preview',()=>{
 const voice=read('voice-entry.js');
 assert.ok(html.includes('id="voice-amount" type="text" inputmode="decimal"'),
  'iPhone amount must use text to preserve Persian digits');
 assert.ok(html.includes('id="voice-loan-amount" inputmode="decimal"'),
  'loan input must preserve localized numbers too');
 assert.ok(html.includes('voice-entry.js?v=20261103r83'),
  'updated parser must be fetched after app upgrade');
 assert.ok(sw.includes('voice-entry.js?v=20261103r83'),
  'new parser must be cached by PWA');
 assert.ok(voice.includes('parseLocalizedAmount'),'safe amount parser missing');
 const checkFile=spawnSync(process.execPath,[resolve(root,'qa/check-voice-ios-amounts.mjs')],{encoding:'utf8'});
 assert.equal(checkFile.status,0,(checkFile.stderr||'')+(checkFile.stdout||''));
});
check('cloud bank balance updates on resume without mixing user accounts',()=>{
 const sync=read('supabase-sync.js');
 assert.ok(sync.includes('async function refreshIdentityAndBalances(force=false)'),'automatic cloud refresh missing');
 assert.ok(sync.includes('await refreshIdentity();'),'account identity must be verified before refresh');
 assert.ok(sync.includes('await sync();'),'cloud balances must be fetched while session remains open');
 assert.ok(sync.includes('lastBalanceSyncAt<120000'),'foreground polling must be throttled');
 assert.ok(sync.includes("document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshIdentityAndBalances(true)});"),
  'app resume must refresh bank balances');
 assert.ok(sync.includes('refreshIdentityAndBalances(false)'), 'long-lived sessions must get automatic balance updates');
 assert.ok(sync.includes("account:meta.accountId||null"),'bank account mapping is needed for correct balance');
 assert.ok(html.includes('supabase-sync.js?v=20261104r85'), 'new sync script not loaded');
 assert.ok(sw.includes('supabase-sync.js?v=20261104r85'), 'new sync script not cached');
 const syntax=spawnSync(process.execPath,['--check',resolve(root,'supabase-sync.js')],{encoding:'utf8'});
 assert.equal(syntax.status,0,syntax.stderr);
});
check('free pilot: no email or manual approval step in signup interface',()=>{
 const app=read('supabase-sync.js');
 assert.ok(html.includes('id="auth-confirm-help" hidden aria-hidden="true"'),'Legacy confirmation help must be hidden');
 assert.ok(!html.includes('auth-resend-confirm'),'No resend confirmation button in free pilot');
 assert.ok(!app.includes('auth.resend({type:\'signup\''),'Signup confirmation email resend must be unused');
 assert.ok(app.includes("options:{emailRedirectTo:location.origin+location.pathname,data:signupMetadata()}"),'My Finance marker needed for scoped pilot autoconfirm');
 assert.ok(app.includes("const {error:signInError}=await client.auth.signInWithPassword({email:accountEmail,password});"),'Signup should immediately sign in using original password');
 assert.ok(app.includes("if(data?.session)")||app.includes("if(!data?.session)"),'Signup must handle Supabase session creation');
 assert.ok(!app.includes("مدیر می‌تواند حساب کاربران آزمایشی را مستقیم فعال کند"),'Manual approval prompt must be absent');
 assert.ok(app.includes('persistSession:true'),'Secure session persistence must remain enabled');
 assert.ok(app.includes("const created=await client.from('finance_access').insert({user_id:identity.id,email:identity.email,status:'active'})"),'First sign-in must create automatically active access');
});
check('v86 calm mobile experience is complete, navigable and private',()=>{
 const design=read('calm-ui-v86.css');
 const controls=read('calm-ui-v86.js');
 assert.ok(html.includes('./calm-ui-v86.css?v=20261104r86'),'new calm stylesheet must be last');
 assert.ok(html.includes('<script defer src="./calm-ui-v86.js?v=20261104r86"></script>'),'progressive navigation must be loaded');
 assert.ok(sw.includes("'./calm-ui-v86.css?v=20261104r86'"),'new design must be cached offline');
 assert.ok(sw.includes("'./calm-ui-v86.js?v=20261104r86'"),'new disclosure controller must be cached offline');
 assert.ok(sw.includes('my-finance-release-20261104r84-calm86'),'PWA must rotate cache');
 for(const route of ['transactions','accounts','transfers','receivables','commitments'])
  assert.ok(controls.includes("togglePanel('"+route+"'"),'missing tap-to-open form for '+route);
 assert.ok(controls.includes("window.financeStartRecord=function(kind)"),'expense/income shortcuts must still open the hidden composer');
 assert.ok(controls.includes("window.financeNavGo=function(id,options)"),'profile route must still open profile settings');
 assert.ok(controls.includes("metrics.insertBefore(notices,bar)"),'installment and last transaction remain near primary balance');
 assert.ok(controls.includes("details.append(summary,pair)"),'monthly financial details must remain reachable');
 assert.ok(controls.includes("grid.append(action)"),'secondary home tools must remain reachable');
 assert.ok(!controls.includes('localStorage.setItem'),'new design must not write financial data or preferences');
 assert.ok(!controls.includes('fetch('),'new design must not reach financial endpoints');
 assert.ok(!controls.includes('supabase'),'new design must remain isolated from cloud state');
 assert.ok(design.includes('main > section[hidden]{display:none!important}'),'inactive page must always stay hidden');
 assert.ok(design.includes('[data-finance-view="cashflow"]'),'cashflow drilldown must stay visible');
 assert.ok(design.includes('tx-ledger-item'),'transaction list should be redesigned');
 assert.ok(design.includes('mf-calm-settings-detail'),'settings must use readable disclosure rows');
 assert.ok(design.includes('finance-mobile-nav'),'new stable tab bar missing');
 for(const path of ['calm-ui-v86.js','transaction-history.js','supabase-sync.js']){
  const script=spawnSync(process.execPath,['--check',resolve(root,path)],{encoding:'utf8'});
  assert.equal(script.status,0,(script.stderr||'')+' in '+path);
 }
 assert.equal((design.match(/\{/g)||[]).length,(design.match(/\}/g)||[]).length,'CSS blocks mismatched');
});
check('no private service credentials committed',()=>{
 for(const p of ['index.html','supabase-sync.js','assets.html','contracts.html']){
  assert.ok(!/sb_secret_[A-Za-z0-9]+/.test(read(p)),'secret in '+p);
 }
});
if(!process.exitCode)process.stdout.write('\n'+total+' UI and offline checks passed.\n');
