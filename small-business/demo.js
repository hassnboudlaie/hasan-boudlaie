(function(){'use strict';
 const form=document.getElementById('demoForm'),result=document.getElementById('demoResult'),key='hb-small-business-free-demo-v1';
 const get=()=>Object.fromEntries(new FormData(form).entries());
 function display(data){
  document.getElementById('demoHeading').textContent='مسیر پیشنهادی «'+(data.name||'کسب‌وکار شما')+'»';
  document.getElementById('demoDescription').textContent='حوزه فعالیت: '+data.industry+' · وضعیت: '+data.stage;
  const tips=[];
  if(data.customer==='هنوز مشخص نیست')tips.push('اولین قدم: گفت‌وگو با مشتریان احتمالی برای شناخت نیاز واقعی.');
  else if(data.customer==='تصور اولیه داریم')tips.push('اولین قدم: بررسی و دقیق‌کردن گروه مشتریان هدف.');
  else tips.push('اولین قدم: آزمودن پیشنهاد خود با همان مشتریان هدف.');
  if(data.sales==='هنوز خیر')tips.push('یک پیشنهاد خرید روشن، با شرایط تحویل و قیمت، به نخستین مشتریان ارائه کنید.');
  else if(data.sales==='در حال مذاکره با مشتری هستیم')tips.push('نتیجه مذاکرات و دلایل خرید یا نخریدن را ثبت کنید.');
  else tips.push('از مشتریان نخست بازخورد بگیرید و مسیر خرید تکراری را طراحی کنید.');
  if(data.finance==='هنوز محاسبه نکرده‌ایم')tips.push('هزینه ثابت، هزینه هر فروش و قیمت فروش را پیش از سرمایه‌گذاری بیشتر برآورد کنید.');
  else if(data.finance==='تا حدی برآورد کرده‌ایم')tips.push('محاسبه قیمت و نقطه سربه‌سر را با ارقام واقعی تکمیل کنید.');
  else tips.push('نتایج مالی واقعی را ماهانه با برآورد خود مقایسه کنید.');
  const target=document.getElementById('demoTips');target.replaceChildren();
  for(const line of tips){const p=document.createElement('p');p.className='tip';p.textContent=line;target.append(p)}
  result.hidden=false;
 }
 form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=get();try{localStorage.setItem(key,JSON.stringify(data))}catch(e){}display(data);result.scrollIntoView({block:'start',behavior:'smooth'})});
 form.addEventListener('input',()=>{try{localStorage.setItem(key,JSON.stringify(get()))}catch(e){}});
 form.addEventListener('change',()=>{try{localStorage.setItem(key,JSON.stringify(get()))}catch(e){}});
 document.getElementById('clearDemo').addEventListener('click',()=>{if(!confirm('پاسخ‌های نمونه رایگان پاک شوند؟'))return;try{localStorage.removeItem(key)}catch(e){}HTMLFormElement.prototype.reset.call(form);result.hidden=true});
 document.getElementById('printDemo').addEventListener('click',()=>window.print());
 try{const d=JSON.parse(localStorage.getItem(key)||'null');if(d&&typeof d==='object'){for(const [k,v] of Object.entries(d)){if(form.elements[k])form.elements[k].value=v}if(d.name&&d.industry)display(d)}}catch(e){}
 if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
})();