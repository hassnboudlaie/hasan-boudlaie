/* Printable/downloadable six-stage case report — local-only until official submission. */
(()=>{
"use strict";
const esc=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const xml=esc; // Numeric HTML entities are XML-compatible.
const steps=x=>Array.isArray(x?.caseFramework?.steps)?x.caseFramework.steps:[];
function build(lesson,enrichment,work){
 const st=steps(enrichment);
 let user={};try{user=JSON.parse(localStorage.getItem("ob-mba-classroom-attendance-identity-v1")||"{}")}catch{}
 const rows=st.map(s=>({title:s.title,english:s.en||"",answer:String(work?.guidedAnswers?.["case-"+s.key]||"").trim()}));
 return {title:"گزارش تحلیل کیس · جلسه "+lesson,caseTitle:enrichment?.caseStudy?.title||"",student:user.name||user.full_name||"دانشجو",rows,completed:rows.filter(s=>s.answer.length>=8).length};
}
const pageCSS='body{font-family:Tahoma,Arial,sans-serif;direction:rtl;color:#183b43;max-width:850px;margin:40px auto;line-height:2;background:white;padding:0 22px}h1{font-size:27px;border-bottom:3px solid #12665e;padding-bottom:16px}h2{font-size:22px}article{margin:22px 0;padding:16px 22px;border:1px solid #cbdedb;border-radius:12px;break-inside:avoid}p{font-size:17px;white-space:pre-wrap}.meta{color:#4c6263}.missing{color:#9a6520}';
function reportHTML(info){
 return '<h1>'+esc(info.title)+'</h1><p class="meta"><strong>کیس:</strong> '+esc(info.caseTitle)+' | <strong>دانشجو:</strong> '+esc(info.student)+'</p>'+
 '<p class="meta">تکمیل‌شده: '+info.completed+' از '+info.rows.length+' مرحله | پیش‌نویس فردی، قبل از ارسال رسمی</p>'+
 info.rows.map(r=>'<article><h2>'+esc(r.title)+'</h2><p lang="en" dir="ltr">'+esc(r.english)+'</p><p class="'+(r.answer?'':'missing')+'">'+esc(r.answer||"این بخش هنوز تکمیل نشده است.")+'</p></article>').join('');
}
function preview(info){
 let old=document.getElementById("obCaseReportPreview");if(old)old.remove();
 const modal=document.createElement("div");modal.id="obCaseReportPreview";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-label","پیش‌نمایش گزارش تحلیل کیس");
 modal.innerHTML='<div class="ob-report-backdrop" data-close-report="1"></div><section class="ob-report-pane"><div class="ob-report-toolbar"><strong>پیش‌نمایش گزارش یکپارچه</strong><span>'+info.completed+' / '+info.rows.length+' مرحله</span><button type="button" data-close-report="1">بستن</button></div><div class="ob-report-paper" id="obReportPaper">'+reportHTML(info)+'</div></section>';
 document.body.appendChild(modal);modal.querySelector("button")?.focus();
 modal.addEventListener("click",ev=>{if(ev.target.closest("[data-close-report]"))modal.remove()});
}
const utf8=t=>new TextEncoder().encode(t);
function zip(files){
 const data=[],entries=[];let position=0;
 const concat=x=>{data.push(x);position+=x.length};
 const u16=(x)=>new Uint8Array([x&255,(x>>8)&255]);
 const u32=(x)=>new Uint8Array([x&255,(x>>8)&255,(x>>16)&255,(x>>>24)&255]);
 const crc32=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0};
 for(const [name,value] of files){
  const n=utf8(name),v=utf8(value),crc=crc32(v),start=position;
  concat(new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(v.length),...u32(v.length),...u16(n.length),...u16(0)]));concat(n);concat(v);entries.push({n,v,crc,start});
 }
 const offset=position;
 for(const e of entries){concat(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(e.crc),...u32(e.v.length),...u32(e.v.length),...u16(e.n.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(e.start)]));concat(e.n)}
 const centralSize=position-offset;concat(new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(entries.length),...u16(entries.length),...u32(centralSize),...u32(offset),...u16(0)]));
 return new Blob(data,{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}
function wordXml(info){
 const p=(s,bold=false)=>'<w:p><w:pPr><w:bidi/><w:jc w:val="right"/><w:spacing w:after="150"/></w:pPr><w:r><w:rPr><w:rtl/>'+(bold?'<w:b/>':'')+'<w:sz w:val="'+(bold?30:24)+'"/></w:rPr><w:t xml:space="preserve">'+xml(s)+'</w:t></w:r></w:p>';
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+p(info.title,true)+p("کیس: "+info.caseTitle+" | دانشجو: "+info.student)+info.rows.map(r=>p(r.title,true)+p(r.english)+p(r.answer||"تکمیل نشده")).join('')+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1100" w:right="1100" w:bottom="1100" w:left="1100"/></w:sectPr></w:body></w:document>';
}
function downloadWord(info){
 const blob=zip([["[Content_Types].xml",'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],["_rels/.rels",'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],["word/document.xml",wordXml(info)]]);
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="OB-Case-Session-"+info.title.match(/\d+/)?.[0]+".docx";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function printPDF(info){
 const w=window.open("","_blank");if(!w){alert("برای ذخیره PDF، اجازه بازشدن پنجره جدید را به مرورگر بدهید.");return}
 w.document.open();w.document.write('<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>'+esc(info.title)+'</title><style>'+pageCSS+'@media print{body{margin:12mm auto;padding:0}}@page{size:A4;margin:18mm}</style></head><body>'+reportHTML(info)+'<script>window.onload=()=>{window.focus();window.print()}<\/script></body></html>');w.document.close();
}
window.OB_CASE_EXPORT={build,preview,downloadWord,printPDF};
})();
