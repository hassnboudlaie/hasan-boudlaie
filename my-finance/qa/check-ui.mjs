/* My Finance UI integrity checks: run with node my-finance/qa/check-ui.mjs
   No real user accounts or financial records are accessed. */
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('index.html'),sw=read('sw.js'),css=read('my-finance-ui-v54.css');
let total=0;
function check(label,fn){
 try{fn();total++;process.stdout.write('PASS '+label+'\n')}
 catch(e){process.stderr.write('FAIL '+label+': '+e.message+'\n');process.exitCode=1}
}
check('one consolidated stylesheet, original cascade preserved',()=>{
 const links=[...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(links.length,1);assert.match(links[0],/^\.\/my-finance-ui-v54\.css\?v=/);
 let pos=-1;
 for(const name of ['premium.css','dashboard-r33.css','design-v49.css','interior-v51.css','mobile-ux-v52.css']){
  const next=css.indexOf(read(name));assert.ok(next>pos,'CSS source missing/reordered: '+name);pos=next;
 }
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
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
check('classic application JavaScript parses',()=>{
 const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 assert.ok(inline.length>=2);
 for(const text of inline)new Function(text);
 for(const name of ['loans.js','commitments.js','reports.js','receivables-actions.js',
 'voice-entry.js','transaction-history.js','install-prompt.js','app-update-v53.js']){
  const check=spawnSync(process.execPath,['--check',resolve(root,name)],{encoding:'utf8'});
  assert.equal(check.status,0,name+': '+check.stderr);
 }
});
check('every PWA precache file exists and new CSS is included',()=>{
 const assets=sw.match(/const ASSETS=(\[[^;]+\]);/)?.[1]||'';
 const paths=[...assets.matchAll(/'(\.\/[^']+)'/g)].map(m=>m[1]);
 assert.ok(paths.length>=15);
 for(const asset of paths){const p=asset.slice(2).split('?')[0];if(p)assert.ok(existsSync(resolve(root,p)),'missing '+asset)}
 const cssHref=html.match(/<link rel="stylesheet" href="(\.\/my-finance-ui-v54\.css\?v=[^"]+)"/)?.[1];
 assert.ok(paths.includes(cssHref));assert.ok(paths.includes('./index.html'));
});
check('release id, PWA cache and stylesheet version align',()=>{
 const rev=html.match(/data-myfinance-release="design-r(\d+)"/)?.[1];
 assert.ok(rev);assert.equal(rev,sw.match(/my-finance-release-\d+r(\d+)/)?.[1]);
 assert.equal(rev,html.match(/my-finance-ui-v54\.css\?v=\d+r(\d+)/)?.[1]);
});
check('no private service credentials committed',()=>{
 for(const p of ['index.html','supabase-sync.js','assets.html','contracts.html']){
  assert.ok(!/sb_secret_[A-Za-z0-9]+/.test(read(p)),'secret in '+p);
 }
});
if(!process.exitCode)process.stdout.write('\n'+total+' UI and offline checks passed.\n');
