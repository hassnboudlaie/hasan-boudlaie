(()=>{"use strict";
const action=document.getElementById("installAction"),status=document.getElementById("installStatus"),details=document.getElementById("instructions"),copy=document.getElementById("copyLink");
let pending=null;const installed=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const say=t=>{status.hidden=!t;status.textContent=t||""};
function refresh(){
if(installed()){action.textContent="ورود به اپ";action.dataset.mode="open";say("")}
else if(pending){action.innerHTML='نصب اپ <span aria-hidden="true">↓</span>';action.dataset.mode="prompt";say("")}
else{action.innerHTML='روش نصب <span aria-hidden="true">↓</span>';action.dataset.mode="help";say("")}
}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();pending=e;refresh()});
window.addEventListener("appinstalled",()=>{pending=null;refresh()});
action.addEventListener("click",async()=>{
if(action.dataset.mode==="open"){location.href="./";return}
if(pending){const e=pending;pending=null;try{await e.prompt();const r=await e.userChoice;refresh();say(r.outcome==="accepted"?"درخواست نصب ثبت شد.":"نصب لغو شد.")}catch{refresh();details.open=true;details.scrollIntoView({block:"start",behavior:"smooth"})}}
else{details.open=true;details.scrollIntoView({block:"start",behavior:"smooth"})}
});
copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(new URL("./install.html",location.href).href);say("لینک کپی شد.")}catch{say("لینک را از نوار آدرس کپی کنید.")}});
refresh();
})();