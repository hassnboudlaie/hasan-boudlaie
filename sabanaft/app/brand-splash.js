(function(){
"use strict";
var overlay=document.getElementById("brandSplash"),enter=document.getElementById("splashEnter");
if(!overlay||!enter)return;
var params=new URLSearchParams(location.search),preview=params.get("splash")==="preview";
var installed=!!(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
var done=false,seen=false;
try{seen=sessionStorage.getItem("mls_splash_seen_v1")==="yes"}catch(e){}
if(!preview&&(!installed||seen))return;
overlay.hidden=false;
try{sessionStorage.setItem("mls_splash_seen_v1","yes")}catch(e){}
function dismiss(){if(done)return;done=true;overlay.classList.add("is-exiting");setTimeout(function(){overlay.hidden=true;overlay.classList.remove("is-exiting")},260)}
enter.addEventListener("click",dismiss);
if(!preview){window.addEventListener("load",function(){setTimeout(dismiss,900)},{once:true});setTimeout(dismiss,2600)}
})();