/* Coming Soon AI Strategy Coach: intentionally no storage, remote calls or AI API. */
(function(){
"use strict";
var dialog=document.getElementById("kishAiStrategyCoachPreview");
if(!dialog)return;
function open(){if(dialog.open)return;if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");}
function close(){if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");}
document.addEventListener("click",function(e){var openButton=e.target.closest("[data-kish-ai-preview]");if(openButton){e.preventDefault();open();return;}if(e.target.closest("[data-kish-ai-close]")){e.preventDefault();close();}});
dialog.addEventListener("click",function(e){if(e.target===dialog)close();});
})();