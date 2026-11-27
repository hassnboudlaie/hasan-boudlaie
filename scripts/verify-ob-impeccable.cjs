'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[
 ['ob-mba-classroom/index.html','./impeccable.css?v=2'],
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
const mobile=read('ob-mba-classroom/mobile-experience.css');
assert.ok(read('ob-mba-classroom/index.html').includes('./mobile-experience.css?v=3'),'Mobile-first CSS linked');
assert.ok(read('ob-mba-classroom/index.html').includes('./academic-workspace.css?v=4'),'Structural academic redesign is linked');
assert.match(read('ob-mba-classroom/academic-workspace.css'),/\.ob-dashboard-layout/,'Student redesign has a distinct layout');
assert.match(app,/ob-teacher-console/,'Instructor workspace rebuilt');
assert.match(mobile,/\.entrance-card/,'Entrance supports mobile layout');
assert.match(mobile,/max-width:380px/,'Small phones covered');
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
assert.ok(/version:\\d+,sessions:/.test(app)&&app.includes('length:16')&&app.includes('const KEY="ob-mba-classroom-demo-v1"'),'Sixteen sessions and persistent local storage remain intact after lesson updates');
assert.ok(/ob-mba-classroom-shell-v\d+/.test(sw),'New PWA cache version');
assert.ok(sw.includes("'./impeccable.css?v=2'")&&sw.includes("'./assets/fonts/Vazirmatn.woff2'"),'Font and CSS offline-cached');
assert.ok(fs.existsSync(path.join(root,'ob-mba-classroom/assets/fonts/OFL-Vazirmatn.txt')),'Font license available');
for(const file of ['learning-analytics.js','learning-analytics.css','learning-journey.js','learning-journey.css','student-devices.js','student-devices.css']){assert.ok(fs.existsSync(path.join(root,'ob-mba-classroom',file)),'Missing '+file);assert.ok(sw.includes("'./"+file+"?v="+(file==="learning-analytics.js"?2:1)+"'"),'Offline missing '+file)}
assert.match(app,/OB_ANALYTICS\?\.onRender/,'Analytics wired into approved app');
console.log('PASS Allameh Impeccable typography, focus, RTL, offline font and storage-contract QA');
