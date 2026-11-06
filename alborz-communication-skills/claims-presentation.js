
'use strict';
(function () {
  const SOURCE = './claims-workshop-v2.html';
  const CACHE_KEY = 'alborz_presentation_source_v1';
  const $ = id => document.getElementById(id);
  const E = value => String(value == null ? '' : value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const fa = value => Number(value).toLocaleString('fa-IR');
  const modules = ['resilience', 'anger', 'assertiveness', 'capstone'];
  let data = null, slides = [], currentIndex = 0, revealed = 0, showNotes = false;

  function card(title, text, extraClass) {
    return '<div class="paper-card ' + (extraClass || '') + '"><h3>' + E(title) + '</h3><p>' + E(text) + '</p></div>';
  }
  function chips(items) {
    return '<div class="chips">' + items.map(item => '<span class="chip">' + E(item) + '</span>').join('') + '</div>';
  }
  function points(items) {
    return '<ol>' + items.map(item => '<li>' + E(item) + '</li>').join('') + '</ol>';
  }
  function dialogue(rows) {
    return '<div class="dialogue">' + rows.map(row =>
      '<div class="dialogue-line"><b>' + E(row[0]) + '</b><p>' + E(row[1]) + '</p></div>'
    ).join('') + '</div>';
  }
  function className(id) {
    const m = (data?.modules || []).find(item => item.id === id);
    return m ? m.title : 'مأموریت نهایی';
  }

  // The already-published classroom course owns this JSON. Do not duplicate its cases,
  // answer keys or science notes in a separate slide-data file.
  function extractSharedData(html) {
    const startMarker = 'const DATA=';
    const endMarker = '\nconst STORE=';
    const start = html.indexOf(startMarker);
    const end = html.indexOf(endMarker, start);
    if (start < 0 || end < 0) throw new Error('منبع محتوای دوره قابل شناسایی نیست.');
    const value = html.slice(start + startMarker.length, end).trim().replace(/;\s*$/, '');
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed.modules) || parsed.modules.length !== 3 ||
        !parsed.quizzes || !Array.isArray(parsed.capstones) ||
        !Array.isArray(parsed.observer)) throw new Error('ساختار منبع آموزشی کامل نیست.');
    for (const m of parsed.modules) {
      if (!m.id || !m.title || !Array.isArray(m.skills) ||
          !Array.isArray(m.cases) || !Array.isArray(parsed.quizzes[m.id])) {
        throw new Error('بخش آموزشی ناقص است.');
      }
    }
    return parsed;
  }
  async function getSource() {
    try {
      const response = await fetch(SOURCE, {cache: 'no-store'});
      if (!response.ok) throw new Error('امکان دریافت منبع وجود ندارد.');
      const parsed = extractSharedData(await response.text());
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(parsed)); } catch (_) {}
      $('source-status').textContent = 'همگام با محتوای اصلی دوره';
      return parsed;
    } catch (err) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Array.isArray(cached.modules) && cached.modules.length === 3) {
          $('source-status').textContent = 'نسخه ذخیره‌شده در همین دستگاه';
          $('source-status').classList.add('offline');
          return cached;
        }
      } catch (_) {}
      throw err;
    }
  }

  function buildSlides(d) {
    const out = [];
    for (const m of d.modules) {
      out.push({
        module: m.id, kind: 'intro', label: 'هدف و نقشه یادگیری', title: m.title,
        lead: m.aim,
        body: '<div class="paper-card highlight"><h3>پرسش آغاز کلاس</h3><p>' + E(m.subtitle) + '</p></div>',
        stages: [
          '<h3>چهار محور کاربردی</h3><div class="slide-grid">' +
             m.skills.map(item => card(item[0], item[1])).join('') + '</div>',
          card('ملاحظه علمی و حرفه‌ای', m.note, 'warning')
        ],
        notes: [m.note, 'پیش از نمایش چهار محور، یک موقعیت واقعیِ بدون اطلاعات محرمانه را از شرکت‌کنندگان بپرسید.']
      });
      for (let i = 0; i < m.skills.length; i++) {
        const sk = m.skills[i];
        out.push({
          module:m.id, kind:'skill', label:'مفهوم ' + fa(i+1) + ' از ' + fa(m.skills.length),
          title:sk[0], lead:sk[1],
          body: '<div class="paper-card highlight"><h3>تمرکز کلاس</h3><p>' + E(sk[1]) + '</p></div>',
          stages:[
            card('نقطه گفت‌وگو', 'در یک پرونده فرضیِ خسارت، چه رفتار قابل مشاهده‌ای نشان می‌دهد این مهارت به کار رفته است؟'),
            card('مرز کاربرد', m.note, 'warning')
          ],
          notes:[m.note, 'از مخاطبان یک نمونه رفتار مشخص بخواهید؛ به‌جای قضاوت درباره شخصیت، بر جمله و تصمیم تمرکز کنید.']
        });
      }
      for (const c of m.cases) {
        const answerStages = c.options.map((opt, j) =>
          '<div class="answer ' + (opt[2] ? 'correct' : 'weak') + '"><span class="number">' + fa(j+1) +
          '.</span><div><b>' + E(opt[0]) + '</b><div class="feedback">' +
          (opt[2] ? 'پاسخ مناسب‌تر: ' : 'نکته قابل اصلاح: ') + E(opt[1]) +
          '</div></div></div>'
        ).join('');
        out.push({
          module:m.id, kind:'case', label:'سناریو · ' + c.line, title:c.title,
          lead:c.context,
          body:chips([c.line, c.strategy]),
          stages:[
            '<h3>تقسیم نقش در تیم پنج‌نفره</h3>' + points(c.roles),
            '<h3>گفت‌وگوی نمونه</h3>' + dialogue(c.dialogue),
            card('اتفاق غیرمنتظره', c.twist, 'warning'),
            '<h3>برای تصمیم‌گیری مکث کنید</h3><div class="reveal-stage">' + c.options.map((opt,j) =>
              '<div class="answer"><span class="number">' + fa(j+1) + '.</span>' + E(opt[0]) + '</div>'
            ).join('') + '</div>',
            '<h3>تحلیل تک‌تک گزینه‌ها</h3><div class="reveal-stage">' + answerStages + '</div>',
            '<h3>پرسش‌های Debrief</h3>' + points(c.turning) +
            '<h3>لحظه‌های مهارتی</h3><div class="slide-grid">' +
              (c.moments || []).map(item => card('جمله کلیدی: ' + item.quote, item.why)).join('') + '</div>'
          ],
          notes:[ 'ابتدا نقش‌ها را بین پنج نفر تقسیم کنید. تا زمان اجرای Role Play، تحلیل گزینه‌ها را آشکار نکنید.',
            ...(c.turning || []), m.note ]
        });
      }
      const qs = d.quizzes[m.id] || [];
      for (let i=0; i<qs.length; i++) {
        const q = qs[i];
        out.push({
          module:m.id, kind:'quiz', label:'پرسش کلاسی · ' + fa(i+1), title:'تصمیم مناسب‌تر چیست؟',
          lead:q.q,
          body:'<h3>ابتدا از کلاس رأی بگیرید</h3><div class="reveal-stage">' +
            q.a.map((opt,j) => '<div class="answer"><span class="number">' + fa(j+1) + '.</span>' + E(opt[0]) + '</div>').join('') + '</div>',
          stages:[
            '<h3>تحلیل و دلیل هر سه گزینه</h3><div class="reveal-stage">' +
              q.a.map((opt,j) => '<div class="answer ' + (j===q.right ? 'correct':'weak') +
                '"><span class="number">' + fa(j+1) + '.</span><div><b>' + E(opt[0]) + '</b>' +
                '<div class="feedback">' + (j===q.right?'گزینه مناسب‌تر: ':'نقطه ضعف: ') + E(opt[1]) + '</div></div></div>').join('') +
            '</div>'
          ],
          notes:['قبل از نمایش تحلیل، از دو نفر بخواهید با شاهد و استدلال از انتخاب متفاوت دفاع کنند.',
                 'جواب مطلوب را فقط پس از دریافت چند پاسخ و بحث کوتاه نمایش دهید.']
        });
      }
      out.push({
        module:m.id, kind:'transfer', label:'جمع‌بندی و انتقال', title:'از یادگیری تا اقدام',
        lead:'مهارت در رفتار مشخص و قابل مشاهده معنا پیدا می‌کند.',
        body:'<h3>چک‌لیست مشاهده</h3>' + points(d.observer.slice(0,4)),
        stages:[
          '<h3>شواهد تکمیلی</h3>' + points(d.observer.slice(4)),
          card('Next Best Step', 'هر نفر یک رفتار مشخص را انتخاب کند که در اولین موقعیت شغلی مشابه اجرا و بازبینی خواهد کرد.', 'highlight')
        ],
        notes:['از گروه‌ها شاهد رفتاری بخواهید؛ این تمرین، ابزار ارزیابی رسمی عملکرد کارکنان نیست.']
      });
    }
    for (const c of d.capstones) {
      out.push({
        module:'capstone', kind:'capstone', label:'مأموریت یکپارچه', title:c.title,
        lead:c.context,
        body:chips([c.line, 'ترکیب سه مهارت']),
        stages:[
          '<h3>نقش‌ها</h3>' + points(c.roles),
          '<h3>گفت‌وگوی نمونه</h3>' + dialogue(c.dialogue),
          card('تغییر شرایط', c.twist, 'warning'),
          '<h3>تحلیل پایانی</h3>' + points(c.turning)
        ],
        notes:['از گروه بخواهید برای هر مهارت یک شاهد از متن ارائه دهد.',
          'توصیه‌های مرتبط با ایمنی، محرمانگی و اختیار کارشناسان باید با رویه سازمان تطبیق داده شوند.']
      });
    }
    return out;
  }

  function current() { return slides[currentIndex]; }
  function select(index) {
    if (index < 0 || index >= slides.length) return;
    currentIndex=index; revealed=0; render();
    try {
      const m=current().module;
      const offset=slides.slice(0,currentIndex).filter(s=>s.module===m).length;
      const url=new URL(location.href);
      url.searchParams.set('module',m);
      url.searchParams.set('slide',String(offset+1));
      history.replaceState(null,'',url.pathname+url.search);
    } catch (_) {}
  }
  function selectModule(module) {
    const idx=slides.findIndex(s=>s.module===module);
    if (idx!==-1) select(idx);
  }
  function render() {
    if (!slides.length) return;
    const s=current(), moduleSlides=slides.filter(x=>x.module===s.module);
    const offset=slides.slice(0,currentIndex).filter(x=>x.module===s.module).length;
    $('module-nav').innerHTML=modules.map(m => {
      const entry=(data.modules || []).find(x=>x.id===m);
      const label=entry ? entry.title : 'مأموریت نهایی';
      const emoji=entry ? entry.emoji : '🎯';
      return '<button type="button" data-module="' + E(m) + '" class="' + (m===s.module?'active':'') +
       '" aria-current="' + (m===s.module?'true':'false') + '"><span class="emoji">' + E(emoji) +
       '</span>' + E(label) + '</button>';
    }).join('');
    $('slide-nav').innerHTML=moduleSlides.map((item,i) => '<button type="button" class="' +
      (i===offset?'active':'') + '" data-slide="' + i + '" aria-current="' + (i===offset?'true':'false') +
      '"><span class="idx">' + fa(i+1) + '</span><span>' + E(item.label) + (item.kind==='case'?' · '+E(item.title):'') + '</span></button>').join('');
    $('nav-count').textContent=fa(moduleSlides.length)+' موضوع';
    $('trail').textContent=className(s.module)+' / '+s.label;
    $('slide').innerHTML='<div class="section-label">' + E(className(s.module)) +
      ' · ' + E(s.label) + '</div><h2>' + E(s.title) + '</h2><p class="lead">' + E(s.lead) +
      '</p><div class="reveal-stage">' + s.body + '</div>' +
      s.stages.slice(0,revealed).map(markup => '<div class="reveal-stage">' + markup + '</div>').join('') +
      (revealed===0?'<p class="reveal-help">برای ادامه تدریس، «نمایش مرحله بعد» را انتخاب کنید.</p>':'');
    $('instructor-notes').hidden=!showNotes;
    $('instructor-notes').innerHTML='<h3>یادداشت مدرس · روی همین نمایشگر قابل مشاهده است</h3>' +
       points(s.notes) + '<p class="warning">هنگام نمایش روی پرده، این بخش را پنهان نگه دارید؛ یادداشت‌ها کنترل دسترسی خصوصی ندارند.</p>';
    $('notes-toggle').setAttribute('aria-pressed',String(showNotes));
    $('notes-toggle').textContent=showNotes?'پنهان‌کردن یادداشت':'یادداشت مدرس';
    $('position').textContent=fa(currentIndex+1)+' از '+fa(slides.length);
    $('bar').style.width=String((currentIndex+1)*100/slides.length)+'%';
    $('previous').disabled=currentIndex===0;
    $('next').disabled=currentIndex===slides.length-1;
    $('reveal').disabled=revealed>=s.stages.length;
    $('reveal').textContent=revealed<s.stages.length?
      'نمایش مرحله بعد' + (s.stages.length?' ('+fa(revealed+1)+'/'+fa(s.stages.length)+')':''):'همه مراحل نمایش داده شد';
    $('slide-nav').querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest',inline:'nearest'});
  }

  $('previous').addEventListener('click',()=>select(currentIndex-1));
  $('next').addEventListener('click',()=>select(currentIndex+1));
  $('reveal').addEventListener('click',()=>{if(current() && revealed<current().stages.length){revealed++;render();}});
  $('notes-toggle').addEventListener('click',()=>{showNotes=!showNotes;render();});
  $('fullscreen').addEventListener('click',async ()=>{
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) { $('trail').textContent='مرورگر اجازه نمایش تمام‌صفحه نداد؛ می‌توانید از تنظیمات مرورگر استفاده کنید.'; }
  });
  $('module-nav').addEventListener('click',event=>{
    const button=event.target.closest('button[data-module]');
    if(button) selectModule(button.dataset.module);
  });
  $('slide-nav').addEventListener('click',event=>{
    const button=event.target.closest('button[data-slide]');
    if(!button)return;
    const module=current().module;
    const list=slides.map((s,i)=>s.module===module?i:null).filter(x=>x!==null);
    select(list[Number(button.dataset.slide)]);
  });
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||''))return;
    if(event.key==='ArrowLeft'){event.preventDefault();select(currentIndex+1);}
    if(event.key==='ArrowRight'){event.preventDefault();select(currentIndex-1);}
    if(event.code==='Space'&&event.target===document.body){event.preventDefault();$('reveal').click();}
    if((event.key==='f'||event.key==='F')&&event.target===document.body){event.preventDefault();$('fullscreen').click();}
  });
  async function init(){
    try {
      data=await getSource();
      slides=buildSlides(data);
      if(slides.length<25)throw new Error('اسلایدهای دوره ناقص‌اند.');
      const p=new URLSearchParams(location.search),chosen=p.get('module');
      const list=slides.map((s,i)=>s.module===chosen?i:null).filter(x=>x!==null);
      const offset=Math.min(list.length-1,Math.max(0,(Number(p.get('slide'))||1)-1));
      select(list.length?list[offset]:0);
    } catch (err) {
      $('slide').innerHTML='<h2>محتوای کلاس بارگذاری نشد</h2><p class="lead">' +
        E(err?.message||'خطای ناشناخته')+'</p><p>اتصال اینترنت را بررسی و صفحه را تازه کنید. نسخه ذخیره‌شده فقط پس از نخستین ورود موفق در دسترس است.</p>';
      $('trail').textContent='خطا در دریافت محتوا';
      $('previous').disabled=true;$('next').disabled=true;$('reveal').disabled=true;
    }
  }
  init();
})();
