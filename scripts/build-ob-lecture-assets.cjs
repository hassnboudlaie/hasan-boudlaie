#!/usr/bin/env node
/* Original Persian lecture decks derived from the instructor-approved lesson summaries.
   Do not publish publisher-owned source PowerPoint files. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),{execFileSync}=require("node:child_process");
const pptxgen=require("pptxgenjs");
const root=path.resolve(__dirname,".."),dest=path.join(root,"ob-mba-classroom","materials");
const source=fs.readFileSync(path.join(root,"ob-mba-classroom","course-content.js"),"utf8");
const sandbox={window:{}};vm.runInNewContext(source,sandbox,{timeout:1000});
const items=sandbox.window.OB_COURSE_CONTENT?.sessions;
if(!Array.isArray(items)||items.length<2)throw Error("Two course sessions required");
fs.mkdirSync(dest,{recursive:true});
const C={navy:"14283F",teal:"075963",gold:"E9C78D",white:"FFFFFF",cloud:"E1ECEE",muted:"BBD0D8"};
const font="DejaVu Sans";
function line(slide,text,x,y,w,h,opts={}){
 slide.addText(String(text),{x,y,w,h,fontFace:font,fontSize:opts.fontSize||24,color:opts.color||C.white,
  bold:!!opts.bold,rtlMode:true,breakLine:false,align:"right",valign:"mid",
  margin:0,fit:"shrink",...opts});
}
function makeSlide(ppt,entry,idx,total,session){
 const slide=ppt.addSlide();slide.background={color:C.navy};
 slide.addShape(ppt.ShapeType.rect,{x:0,y:0,w:.16,h:7.5,line:{color:C.teal},fill:{color:C.teal}});
 slide.addShape(ppt.ShapeType.line,{x:.65,y:1.25,w:12.0,h:0,line:{color:C.gold,width:1.7}});
 line(slide,"مدیریت رفتار سازمانی  |  MBA",.76,.42,11.8,.43,{fontSize:17,color:C.gold,bold:true});
 const title=entry[0]||"اسلاید آموزشی";
 line(slide,title,.65,1.47,12.05,.76,{fontSize:title.length>42?30:37,color:C.white,bold:true});
 const points=entry.slice(1).filter(x=>String(x).trim());
 const n=Math.max(1,points.length),available=3.75,gap=.12,h=Math.min(.82,(available-gap*(n-1))/n),
       totalH=n*h+(n-1)*gap,start=2.55+(available-totalH)/2;
 points.forEach((item,j)=>{
  const y=start+j*(h+gap);
  slide.addShape(ppt.ShapeType.roundRect,{x:.67,y,w:11.9,h,rectRadius:.10,line:{color:"4D858C",transparency:38},fill:{color:"1C4656"}});
  slide.addShape(ppt.ShapeType.ellipse,{x:12.18,y:y+h/2-.075,w:.13,h:.13,line:{color:C.gold},fill:{color:C.gold}});
  const fontsize=n>=5?19:n>=4?21:24;
  line(slide,item,.92,y+.09,11.1,h-.18,{fontSize:fontsize,color:C.cloud});
 });
 slide.addShape(ppt.ShapeType.line,{x:.66,y:6.86,w:12,h:0,line:{color:"6A9FA5",transparency:30,width:1}});
 line(slide,"جلسه "+String(session).padStart(2,"0")+"  |  اسلاید "+(idx+1)+" از "+total,.74,6.98,11.8,.3,{fontSize:14,color:C.muted});
}
(async()=>{
 for(const s of items.filter(s=>s.id===1||s.id===2)){
   if(!Array.isArray(s.presentation)||!s.presentation.length)throw Error("Missing slides for "+s.id);
   const out="session-"+String(s.id).padStart(2,"0")+"-robbins";
   const ppt=new pptxgen();
   ppt.layout="LAYOUT_WIDE";ppt.author="MBA Organizational Behavior - educational adaptation";
   ppt.subject="Instructor-authored educational adaptation from Robbins chapter "+s.id;
   ppt.title="مدیریت رفتار سازمانی - جلسه "+s.id;
   ppt.lang="fa-IR";ppt.company="MBA Allameh Tabataba'i University";
   s.presentation.forEach((entry,i)=>makeSlide(ppt,entry,i,s.presentation.length,s.id));
   const pptxPath=path.join(dest,out+".pptx");
   await ppt.writeFile({fileName:pptxPath});
   execFileSync("libreoffice",["-env:UserInstallation=file:///tmp/lo-ob-"+s.id,"--headless",
      "--convert-to","pdf","--outdir",dest,pptxPath],{stdio:"inherit",timeout:180000});
   const pdf=path.join(dest,out+".pdf");
   if(!fs.existsSync(pdf))throw Error("PDF conversion failed: "+pdf);
   const signature=fs.readFileSync(pdf).subarray(0,4).toString();
   if(signature!=="%PDF")throw Error("PDF signature invalid");
   console.log(out,s.presentation.length,"slides",fs.statSync(pptxPath).size,"PPTX bytes",fs.statSync(pdf).size,"PDF bytes");
 }
})().catch(e=>{console.error(e);process.exitCode=1});
