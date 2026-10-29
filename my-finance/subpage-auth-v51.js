/* My Finance subpage auth storage adapter — matches the main PWA's remember-me choice.
   No credentials or user data are embedded in this public module.
   Authorization remains server-verified via auth.getUser() and Supabase RLS.
*/
export const AUTH_SESSION_KEY='myfinance-supabase-session-v1';
const KEEP_SIGNED_IN_KEY='myfinance-keep-signed-in-v1';
const keepSignedIn=()=>localStorage.getItem(KEEP_SIGNED_IN_KEY)!=='no';
export const financeAuthStorage={
 getItem(key){
  if(!keepSignedIn())return sessionStorage.getItem(key);
  const persisted=localStorage.getItem(key);
  if(persisted!==null)return persisted;
  const temporary=sessionStorage.getItem(key);
  if(temporary!==null){
   localStorage.setItem(key,temporary);
   sessionStorage.removeItem(key);
  }
  return temporary;
 },
 setItem(key,value){
  if(keepSignedIn()){
   localStorage.setItem(key,value);
   sessionStorage.removeItem(key);
  }else{
   sessionStorage.setItem(key,value);
   localStorage.removeItem(key);
  }
 },
 removeItem(key){
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
 }
};
