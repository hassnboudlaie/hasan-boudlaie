'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[
 ['ob-mba-classroom/index.html','./impeccable.css?v=1'],
 ['ob-mba-classroom/attendance.html','./impeccable.css?v=1'],
 ['ob-mba-classroom/install.html','./impeccable.css?v=1']
];
for(const [file,link] of checks){
 const html=read(file);
 assert.ok(html.includes(link),file+' should load the shared visual system');
 assert.ok(html.includes('Vazirmatn.woff2'),file+' should preload the verified font');
 assert.match(html,/<html[^>]*dir="rtl"/,file+' RTL direction');
}
const css=read('ob-mba-classroom/impeccable.css');
const app=read('ob-mba-classroom/app.js');
const sw=read('ob-mba-classroom/sw.js');
const font=fs.readFileSync(path.join(root,'ob-mba-classroom/assets/fonts/Vazirmatn.woff2'));
assert.equal(font.subarray(0,4).toString(),'wOF2','Valid self-hosted WOFF2 font');
assert.ok(font.byteLength>30000,'Non-empty, non-placeholder font');
assert.match(css,/@font-face\s*\{/);
assert.match(css,/font-display:\s*swap/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/:focus-visible/);
assert.match(css,/--ob-font/);
assert.match(css,/min-height:44px/);
assert.match(app,/function focusMainAfterRoute\(\)/,'Focus is managed after app route changes');
assert.match(app,/aria-current="page"/,'Bottom navigation exposes current page');
assert.ok(app.includes('const KEY="ob-mba-classroom-demo-v1"'),'Existing storage contract is preserved');
assert.ok(app.includes('version:8,sessions:')&&app.includes('length:16'),'Course and storage schema remain intact');
assert.ok(sw.includes('ob-mba-classroom-shell-v33'),'New PWA cache version');
assert.ok(sw.includes("'./impeccable.css?v=1'")&&sw.includes("'./assets/fonts/Vazirmatn.woff2'"),'Font and CSS offline-cached');
assert.ok(fs.existsSync(path.join(root,'ob-mba-classroom/assets/fonts/OFL-Vazirmatn.txt')),'Font license available');
console.log('PASS Allameh Impeccable typography, focus, RTL, offline font and storage-contract QA');
