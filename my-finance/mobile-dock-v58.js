/* My Finance r58: mobile navigation that clears content during downward reading.
   Direction-aware, accessible and independent of financial data/state. */
(()=>{
 'use strict';
 const nav=document.querySelector('.finance-mobile-nav');
 if(!nav)return;
 let prior=Math.max(0,window.scrollY||0),pending=false;
 const show=()=>document.body.classList.remove('finance-dock-auto-hidden');
 const isEditing=()=>Boolean(document.activeElement?.matches?.('input, textarea, select, [contenteditable="true"]'));
 function update(){
  pending=false;
  const current=Math.max(0,window.scrollY||0),delta=current-prior;
  const isMobile=window.matchMedia('(max-width: 1023px)').matches;
  const isSignedIn=document.body.classList.contains('finance-unlocked');
  const dialogOpen=document.getElementById('finance-more-dialog')?.open;
  if(!isMobile||!isSignedIn||dialogOpen||isEditing()||current<180)show();
  else if(delta>12)document.body.classList.add('finance-dock-auto-hidden');
  else if(delta< -9)show();
  prior=current;
 }
 window.addEventListener('scroll',()=>{
  if(pending)return;
  pending=true;window.requestAnimationFrame(update);
 },{passive:true});
 window.addEventListener('resize',()=>{prior=Math.max(0,window.scrollY||0);show()},{passive:true});
 nav.addEventListener('focusin',show);
 nav.addEventListener('click',show);
 document.getElementById('finance-open-more')?.addEventListener('click',show);
 document.addEventListener('keydown',event=>{if(event.key==='Tab'||event.key==='Escape')show()});
})();