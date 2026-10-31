/* Compact navigation while scrolling; the three required buttons stay available. */
(function(){
  'use strict';
  function sync(){
    var y=window.scrollY||document.documentElement.scrollTop||0;
    document.documentElement.classList.toggle('alborz-scrolled',y>65);
  }
  window.addEventListener('scroll',sync,{passive:true});
  window.addEventListener('resize',sync,{passive:true});
  sync();
  window.ALBORZ_MOBILE_NAV_READY=true;
})();