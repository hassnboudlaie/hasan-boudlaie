(()=>{
"use strict";
const identityKey="mba-ob-classroom-attendance-identity-v1";
const loginApi="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-student-devices";
const login=document.getElementById("login"),form=document.getElementById("login-form");
const notice=document.getElementById("login-status"),assessment=document.getElementById("assessment");
function showLogin(message=""){
 assessment.replaceChildren();login.hidden=false;notice.textContent=message;
}
window.OB_ACCESS={role:"student"};
async function showQuiz(){
 if(!window.OB_QUIZ){
  assessment.textContent="فایل آزمون بارگذاری نشد. دوباره لینک را باز کنید.";
  return;
 }
 login.hidden=true;
 assessment.innerHTML=window.OB_QUIZ.studentHTML(1);
 const error=await window.OB_QUIZ.refreshStudent(1);
 if(error==="session_expired"||error==="student_only")showLogin("برای باز کردن آزمون با حساب دانشجویی وارد شوید.");
}
form.addEventListener("submit",async event=>{
 event.preventDefault();
 const submit=form.querySelector("button");
 submit.disabled=true;notice.textContent="در حال ورود…";
 try{
  const body=new FormData(form);
  const response=await fetch(loginApi,{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({action:"studentDeviceLogin",student_number:body.get("student_number"),password:body.get("password")})});
  const data=await response.json();
  if(response.status===401){notice.textContent="شماره دانشجویی و رمز شخصی را بررسی کنید.";return;}
  if(!response.ok||!data.ok||!data.token)throw Error("login");
  localStorage.setItem(identityKey,JSON.stringify({role:"student",token:data.token,name:data.name,student_number:data.student_number}));
  form.reset();await showQuiz();
 }catch{
  notice.textContent="ارتباط با سامانه برقرار نشد. اتصال مرورگر را بررسی کنید.";
 }finally{submit.disabled=false}
});
let credential;
try{credential=JSON.parse(localStorage.getItem(identityKey)||"null")}catch{}
if(credential?.role==="student"&&credential.token)showQuiz();else showLogin();
})();
