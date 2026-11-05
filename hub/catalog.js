(function(){'use strict';
 const input=document.getElementById('superSearch'),buttons=[...document.querySelectorAll('[data-super-filter]')],groups=[...document.querySelectorAll('.super-group')],empty=document.getElementById('superEmpty');
 if(!input||!groups.length)return;
 let active='all';
 function update(){
  const q=input.value.trim().toLocaleLowerCase();
  let visible=0;
  for(const g of groups){
   const kind=g.dataset.group,categoryOK=active==='all'||kind===active;
   let shown=0;
   for(const a of g.querySelectorAll('.super-app-link')){
    const match=categoryOK&&(!q||(a.dataset.search||'').toLocaleLowerCase().includes(q));a.hidden=!match;if(match){shown++;visible++;}
   }
   g.hidden=!shown;
   const badge=g.querySelector('.group-count');if(badge)badge.textContent=String(shown);
  }
  empty.hidden=visible>0;
 }
 buttons.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.superFilter;buttons.forEach(c=>c.setAttribute('aria-pressed',String(b===c)));update();}));
 input.addEventListener('input',update);update();
})();
