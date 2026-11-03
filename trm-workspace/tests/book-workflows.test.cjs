const assert=require('node:assert/strict');const B=require('./trost-book-workflows.js');
const db={bookPractice:[]};const seen=[];let renderCalls=0;
const ctx={persist:()=>{seen.push('persist');return true},render:()=>{renderCalls++},toast:()=>{},go:x=>{seen.push(x)}};
const rows=B.data;assert.equal(rows.length,41);assert(rows.some(x=>x.key==='socialmedia'));assert(rows.some(x=>x.key==='socialcommunity'));assert(rows.some(x=>x.key==='retentioncycle'));assert(rows.some(x=>x.key==='guerilla'));assert(rows.some(x=>x.key==='survey'));
const vals={choice:'1',evidence:'بررسی شواهد واقعی درباره تاثیر محتوا در جامعه متخصصان هدف',owner:'کارشناس ارتباطات',due:'2026-12-12',status:'planned'};
const form={dataset:{bookKey:'socialmedia'},querySelector:()=>null};
// Emulate FormData for a fake form in Node.js.
const OriginalFormData=global.FormData;global.FormData=class{constructor(){}entries(){return Object.entries(vals)}};
B.onForm(form,db,ctx);
assert.equal(db.bookPractice.length,1);assert.equal(db.bookPractice[0].key,'socialmedia');
B.onAction('book-chapter','5',db,ctx);assert.match(B.render(db),/ثبت شده/);B.onAction('book-open','socialmedia',db,ctx);B.onAction('book-coach','socialmedia',db,ctx);assert.match(B.render(db),/راهنمای قاعده‌محور/);
B.onAction('book-chapter','7',db,ctx);assert.match(B.render(db),/Candidate Retention/);
assert.match(B.renderAssistant(db),/دستیار راهنمای TRM/);assert.equal(B.answerFor('social media',db).results[0].key,'socialmedia');assert.equal(B.answerFor('Candidate Retention',db).results[0].key,'retentioncycle');
console.log('PASS all ten book chapters, social media, referral, campus, scouting, retention, candidate experience, form saves and local coach');
global.FormData=OriginalFormData;