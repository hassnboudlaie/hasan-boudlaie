
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
      $('source-status').textContent = '';
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

  
  // Shared asset family: approved resilience poster + existing Session 2 editorial photographs.
  // These are visual aids, not evidence photographs of actual insurance claimants.
  const art={
    resilience:'assets/session2-welcome-hq.webp',
    anger:'assets/session2-facial-expression-hq.webp',
    assertiveness:'assets/session2-body-language-hq.webp',
    capstone:'assets/session2-hero-hq.webp',
    voice:'assets/session2-voice-tone-hq.webp',
    conversation:'assets/session2-welcome-hq.webp'
  };
  const artOf=(module,kind)=>kind==='dialogue'?art.conversation:kind==='conversation'?art.voice:(art[module]||art.capstone);
  const media=(module,kind,caption='تصویر مفهومی · هویت بصری آکادمی بیمه البرز')=>
    '<figure class="slide-media"><img src="'+E(artOf(module,kind))+'" alt="'+E(caption)+'" loading="lazy" decoding="async"></figure>';
  const overline=(n,title)=>'<div class="narrative-overline"><span class="chapter-num">'+fa(n)+'</span><span>'+E(title)+'</span></div>';
  const challenge=(title,questions)=>
    '<section class="challenge-box"><div class="challenge-kicker">پرسش چالشی</div><h3>'+E(title)+'</h3>'+points(questions)+'</section>';
  const lesson=(title,lead,items)=>'<section class="teaching-frame"><span class="teaching-label">نکته کلیدی</span><h3>'+E(title)+'</h3><p>'+E(lead)+'</p><ol class="lesson-steps">'+items.map(x=>'<li>'+E(x)+'</li>').join('')+'</ol></section>';
  const playLines=(rows)=>'<section class="stage-dialogue"><div class="chapter-caption">گفت‌وگوی نمونه</div>'+dialogue(rows)+'</section>';
  const modelMap=(m)=>{
    if(m.id==='resilience')return '<div class="strategy-matrix" role="img" aria-label="چهار راهبرد تاب‌آوری بر اساس دو محور حفظ یا تغییر هسته و ایجاد یا عدم ایجاد کسب‌وکار جدید">'+
      '<div class="matrix-head">مقایسه دو تصمیم: هسته را حفظ یا تغییر بدهیم؟ کسب‌وکار جدید ایجاد کنیم یا نه؟</div>'+
      '<div class="matrix-grid">'+
      '<div class="matrix-cell"><span>۱ · حفظ هسته، بدون کسب‌وکار تازه</span><strong>🐪 شتر</strong><small>تداوم خدمت و بازیابی ظرفیت</small></div>'+
      '<div class="matrix-cell"><span>۲ · حفظ هسته، کسب‌وکار تازه</span><strong>🐟 ماهی آزاد</strong><small>آزمایش مدل ارزش مستقل در کنار هسته</small></div>'+
      '<div class="matrix-cell"><span>۳ · تغییر هسته، بدون کسب‌وکار تازه</span><strong>🦎 آفتاب‌پرست</strong><small>بازطراحی شیوه اصلی رسیدگی</small></div>'+
      '<div class="matrix-cell"><span>۴ · تغییر هسته، کسب‌وکار تازه</span><strong>🐙 اختاپوس</strong><small>تحول هسته + مسیر ارزش‌آفرینی تازه</small></div>'+
      '</div><p class="model-footnote">چهار حیوان برچسب شخصیت افراد نیستند؛ هر راهبرد انتخابی وابسته به شرایط است.</p></div>';
    return '<div class="process-flow" aria-label="چهار گام عملی">'+m.skills.map((x,i)=>
      '<div class="process-step"><span class="process-number">'+fa(i+1)+'</span><div><b>'+E(x[0])+'</b><p>'+E(x[1])+'</p></div></div>').join('')+'</div>';
  };
  const nextStep=(label,text)=>
    '<div class="transfer-panel"><span>اقدام بعدی</span><h3>'+E(label)+'</h3><p>'+E(text)+'</p></div>';
  function makeSlide(module,kind,label,title,lead,body,stages,notes){
    return {module,kind,label,title,lead,body,stages,notes};
  }
  function buildSlides(d) {
    const out=[];
    for(const m of d.modules){
      const firstCase=m.cases[0];
      out.push(makeSlide(
        m.id,'intro','نقشه یادگیری','اگر فردا این اتفاق بیفتد…',m.aim,
        '<div class="narrative-lead">'+
        overline(1,'چرا این مهارت به کارشناس خسارت مربوط است؟')+
        '<p class="scene-line">'+E(firstCase?.context||m.subtitle)+'</p>'+
        challenge('در همین لحظه، چه چیزی باید تغییر کند؟',[
          'مسئله اصلی چیست: شرایط، رفتار ما یا کیفیت تصمیم؟',
          'چه تصمیمی ممکن است سریع اما غیرحرفه‌ای باشد؟',
          'با چه شاهدی می‌توانیم از تصمیم بهتر دفاع کنیم؟'
        ])+'</div>',
        [
          lesson('آنچه در این بخش یاد می‌گیریم',m.subtitle,m.skills.map(x=>x[0])),
          modelMap(m),
          lesson('مرز علمی و حرفه‌ای',m.note,['بر رفتار قابل مشاهده تمرکز کنید، نه برچسب‌زدن به اشخاص.','تصمیم باید با شواهد پرونده و حدود اختیار سازگار باشد.','در پایان یک اقدام مشخص برای محیط واقعی کار انتخاب کنید.']),
          nextStep('به نخستین سناریو فکر کنید','از شرکت‌کنندگان بخواهید پیش از دریافت «پاسخ درست»، فرض خود را درباره مسئله و راه‌حل توضیح دهند.')
        ],
        [m.note,'این اسلاید سخنرانی صرف نیست: ابتدا روایت واقعی‌نما را بخوانید، یک تصمیم فوری از کلاس بگیرید و سپس مدل را آشکار کنید.']
      ));
      for(let i=0;i<m.skills.length;i++){
        const sk=m.skills[i],anchor=m.cases[i % m.cases.length];
        out.push(makeSlide(
          m.id,'skill','تکنیک '+fa(i+1)+' از '+fa(m.skills.length),
          sk[0],sk[1],
          overline(i+1,'یک مهارت در یک لحظه واقعی')+
          '<div class="editorial-quote"><span class="quote-mark">“</span><p>'+E(anchor.context)+'</p></div>',
          [
            lesson('این مهارت دقیقاً چه کمکی می‌کند؟',sk[1],[
              'نشانه یا مسئله را قبل از واکنش تشخیص دهید.',
              'یک رفتار حرفه‌ای مشخص و قابل مشاهده انتخاب کنید.',
              'نتیجه را با کیفیت خدمت و اعتماد مراجع بسنجید.'
            ]),
            challenge('اگر مسئول همین پرونده بودید، چه می‌کردید؟',[
              'اولین جمله حرفه‌ای شما چه خواهد بود؟',
              'کدام اقدام عجولانه می‌تواند وضعیت را بدتر کند؟',
              'کدام شاهد نشان می‌دهد این مهارت درست اجرا شده است؟'
            ]),
            lesson('نمونه کاربرد و محدودیت',anchor.title,[anchor.context,anchor.strategy,m.note]),
            nextStep('یک جمله تمرین کنید','هر نفر جمله یا رفتار پیشنهادی خود را در کمتر از ۲۰ ثانیه بگوید؛ سپس همتای او بازخوردی بر پایه شواهد بدهد.')
          ],
          [m.note,'از یادگیرنده بخواهید رفتار خود را با یک جمله واقعی و بدون وعده خارج از اختیار بیان کند.']
        ));
      }
      for(const c of m.cases){
        const introductoryQuestions=[
          'صورت مسئله واقعی چیست و از کدام اطلاعات هنوز مطمئن نیستیم؟',
          'اگر بدون بازبینی فرض‌ها تصمیم بگیریم، چه ریسکی ایجاد می‌شود؟',
          ...(c.turning||[]).slice(0,1)
        ];
        const dialogueCut=Math.max(2,Math.ceil(c.dialogue.length/2));
        out.push(makeSlide(
          m.id,'case','سناریو · '+c.line,c.title,
          'یک موقعیت واقعی‌نما در رسیدگی خسارت؛ ابتدا تشخیص بدهید، سپس تصمیم را بیازمایید.',
          '<div class="case-opening">'+overline(1,'صحنه اول')+
          '<p class="scene-line">'+E(c.context)+'</p>'+
          '<div class="scene-stats">'+chips([c.line,c.strategy,'پنج نقش فعال'])+'</div>'+
          '<div class="hook-question">اگر همین حالا مسئول تصمیم بودید، اولین اقدام‌تان چه بود؟</div></div>',
          [
            challenge('قبل از دیدن تحلیل، فرض خود را بررسی کنید',introductoryQuestions),
            lesson('تشخیص مسئله و منطق تصمیم','صورت مسئله را از نشانه‌های آن جدا کنید.',[
              'چه اتفاقی افتاده است؟ '+c.context,
              'چرا تصمیم عجولانه می‌تواند کیفیت خدمت را تهدید کند؟',
              'راهبرد مطرح در این سناریو: '+c.strategy
            ]),
            '<section class="numbered-roles">'+overline(2,'پنج نقش، پنج زاویه دید')+
              '<h3>هر نقش چه چیزی می‌داند؟</h3>'+points(c.roles)+'</section>',
            playLines(c.dialogue.slice(0,dialogueCut)),
            '<div class="facilitation-callout">وقتی گفت‌وگو را متوقف می‌کنید، از کلاس بپرسید: کدام جمله مسئله را روشن‌تر کرد و کدام فرض هنوز بررسی نشده است؟</div>'+
              playLines(c.dialogue.slice(dialogueCut)),
            '<div class="crisis-moment">'+overline(3,'نقطه عطف')+
              '<h3>شرایط تغییر کرد!</h3><p>'+E(c.twist)+'</p>'+
              '<div class="crisis-question">با این اطلاعات جدید، تصمیم اولیه را حفظ می‌کنید یا اصلاح؟ چرا؟</div></div>',
            challenge('کدام گزینه را انتخاب می‌کنید؟',[
              'پیش از آشکارشدن تحلیل، هر نفر یک گزینه و دلیل خود را مطرح کند.',
              'کدام گزینه با شواهد موجود و حدود اختیار سازگارتر است؟'
            ])+'<div class="decision-list">'+c.options.map((opt,i)=>
              '<div class="answer"><span class="number">'+fa(i+1)+'</span><span>'+E(opt[0])+'</span></div>').join('')+'</div>',
            ...c.options.map((opt,i)=>'<section class="option-breakdown">'+overline(i+1,'تحلیل انتخاب شماره '+fa(i+1))+
              '<div class="answer '+(opt[2]?'correct':'weak')+'"><span class="number">'+fa(i+1)+'</span><span>'+E(opt[0])+'</span></div>'+
              '<div class="diagnosis '+(opt[2]?'positive':'caution')+'"><h3>'+(opt[2]?'چرا این انتخاب مناسب‌تر است؟':'این انتخاب چه ضعفی دارد؟')+'</h3>'+
              '<p>'+E(opt[1])+'</p></div>'+
              '<p class="analytical-prompt">کدام شاهد در روایت این نتیجه را پشتیبانی می‌کند؟</p></section>'),
            '<section class="facilitated-debrief">'+overline(4,'تحلیل جمعی')+
              '<h3>از توصیف رفتار به یادگیری برسیم</h3>'+points(c.turning)+
              '<div class="slide-grid">'+(c.moments||[]).map(x=>card('لحظه مهارتی: '+x.quote,x.why,'highlight')).join('')+'</div></section>',
            nextStep('از این پرونده چه با خود می‌بریم؟','در موقعیت مشابه، یک رفتار را مشخص کنید که بتوانید اجرا کنید، شاهدش را ثبت کنید و پس از آن بازبینی انجام دهید.')
          ],
          [
            'ابتدا از افراد بخواهید در ۳۰ ثانیه درباره تصمیم اولیه رأی بدهند. هنوز پاسخ مناسب را فاش نکنید.',
            'پس از اطلاعات نقش‌ها، Role Play سه تا پنج دقیقه اجرا شود؛ از مشاهده‌گر شواهد بخواهید.',
            'بعد از «اتفاق غیرمنتظره»، گروه باید فرض و تصمیم قبلی را بازبینی کند.',
            ...c.turning,
            'تحلیل گزینه‌های اشتباه را جداگانه بخوانید؛ اجتناب از خطا به اندازه انتخاب درست اهمیت دارد.'
          ]
        ));
      }
      for(let i=0;i<(d.quizzes[m.id]||[]).length;i++){
        const q=d.quizzes[m.id][i];
        out.push(makeSlide(
          m.id,'quiz','چالش تصمیم‌گیری · '+fa(i+1),
          'اگر جای کارشناس بودید…',q.q,
          overline(1,'رأی‌گیری پیش از پاسخ')+
          '<div class="decision-list">'+q.a.map((opt,j)=>
            '<div class="answer"><span class="number">'+fa(j+1)+'</span><span>'+E(opt[0])+'</span></div>').join('')+'</div>',
          [
            challenge('پشت انتخابتان چه فرضی هست؟',[
              'چه اطلاعاتی برای قضاوت کافی نیست؟',
              'کدام پاسخ کوتاه‌مدت جذاب است اما در بلندمدت ریسک دارد؟',
              'اگر همکار شما گزینه دیگری انتخاب کرده باشد، با چه شاهدی گفت‌وگو می‌کنید؟'
            ]),
            ...q.a.map((opt,j)=>'<section class="option-breakdown">'+overline(j+1,'بررسی گزینه '+fa(j+1))+
              '<div class="answer '+(j===q.right?'correct':'weak')+'"><span class="number">'+fa(j+1)+'</span><span>'+E(opt[0])+'</span></div>'+
              '<div class="diagnosis '+(j===q.right?'positive':'caution')+'"><h3>'+(j===q.right?'منطق گزینه مناسب‌تر':'چرایی ضعف این گزینه')+
              '</h3><p>'+E(opt[1])+'</p></div></section>'),
            nextStep('تعریف یک رفتار قابل اجرا','یک جمله یا اقدام حرفه‌ای جایگزین بنویسید که بتوانید فردا در شعبه به کار ببرید.')
          ],
          ['قبل از نمایش پاسخ، از دو شرکت‌کننده با انتخاب‌های متفاوت استدلال بخواهید.','دلیل تک‌تک سه گزینه را مستقل از هم تشریح کنید.']
        ));
      }
      out.push(makeSlide(
        m.id,'transfer','جمع‌بندی و انتقال','از فهمیدن تا انجام‌دادن',
        'هدف کلاس، توانایی تصمیم حرفه‌ای تحت فشار است؛ نه حفظ نام تکنیک‌ها.',
        overline(1,'شواهد یادگیری')+'<h3>چه چیزی در رفتار واقعاً تغییر کرد؟</h3>'+points(d.observer.slice(0,4)),
        [
          lesson('فقط رفتار قابل مشاهده را ارزیابی کنید','این‌ها معیار گفتگو برای بازخورد آموزشی‌اند، نه ابزار رسمی ارزیابی کارکنان.',d.observer.slice(4)),
          challenge('تا هفته آینده چه چیزی را امتحان می‌کنید؟',[
            'در چه موقعیتی دقیقاً می‌خواهم رفتار تازه را اجرا کنم؟',
            'چه شاهدی نشان می‌دهد اقدامم مؤثر بوده است؟',
            'از چه کسی بازخورد می‌خواهم؟'
          ]),
          nextStep('تعهد رفتاری یک‌هفته‌ای','هر نفر یک اقدام مشخص، یک موقعیت اجرا و یک معیار بازبینی را با همتایش در میان بگذارد.')
        ],
        ['برای جمع‌بندی از افراد «یک رفتار» بخواهید، نه یک شعار یا فهرست طولانی.']
      ));
    }
    for(const c of d.capstones){
      const mid=Math.ceil(c.dialogue.length/2);
      out.push(makeSlide(
        'capstone','capstone','مأموریت نهایی · ترکیبی',c.title,
        'سه مهارت در یک موقعیت واقعی‌نما به هم پیوند می‌خورند.',
        overline(1,'صحنه مشترک')+
        '<p class="scene-line">'+E(c.context)+'</p>'+chips([c.line,'تاب‌آوری','مدیریت خشم','جرأت‌ورزی'])+
        '<div class="hook-question">کدام بخش موقعیت به تصمیم، کدام به تنظیم هیجان و کدام به بیان قاطع نیاز دارد؟</div>',
        [
          challenge('پیش از نقش‌آفرینی',[
            'مسئله اصلی چیست و کدام بخش از اختیار کارشناس خارج است؟',
            'کدام تصمیم به شواهد بیشتر نیاز دارد؟',
            'اگر مشتری ناراحت‌تر شود، چه چیزی در پاسخ باید ثابت بماند؟'
          ]),
          '<h3>نقش‌های اجرایی</h3>'+points(c.roles),
          playLines(c.dialogue.slice(0,mid)),
          playLines(c.dialogue.slice(mid)),
          '<div class="crisis-moment">'+overline(2,'نقطه عطف')+'<h3>آیا تصمیم هنوز معتبر است؟</h3><p>'+E(c.twist)+'</p></div>',
          '<h3>تحلیل تلفیقی و بازخورد گروهی</h3>'+points(c.turning),
          nextStep('سه شاهد، یک برنامه اقدام','برای تاب‌آوری، مدیریت خشم و جرأت‌ورزی هرکدام یک جمله یا رفتار قابل مشاهده از همین روایت پیدا کنید.')
        ],
        ['هر پنج نقش را توزیع کنید و نقش مشاهده‌گر را جدی بگیرید.','سه مهارت را در یک سناریو با شواهد ملموس تحلیل کنید.',...c.turning]
      ));
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
       '" aria-current="' + (m===s.module?'true':'false') + '"><img class="module-thumb" alt="" src="' +
       E(artOf(m)) + '" loading="lazy" decoding="async"><span>' + E(label) + '</span></button>';
    }).join('');
    $('slide-nav').innerHTML=moduleSlides.map((item,i) => '<button type="button" class="' +
      (i===offset?'active':'') + '" data-slide="' + i + '" aria-current="' + (i===offset?'true':'false') +
      '"><span class="idx">' + fa(i+1) + '</span><span>' + E(item.label) + (item.kind==='case'?' · '+E(item.title):'') + '</span></button>').join('');
    $('nav-count').textContent=fa(moduleSlides.length)+' موضوع';
    $('trail').textContent=className(s.module)+' / '+s.label;
    $('slide').className='slide slide--'+s.kind+' slide--'+s.module;
    const sectionTitle=E(className(s.module));
    const stageLabel=revealed===0?'شروع':'مرحله '+fa(revealed)+' از '+fa(s.stages.length);
    $('slide').innerHTML='<div class="slide-brandline"><img src="assets/alborz-logo.png" alt="بیمه البرز" loading="lazy"><span>آکادمی مدیریت بیمه البرز</span><b>'+sectionTitle+'</b></div>'+
      '<div class="slide-feature"><div class="slide-feature-copy"><div class="section-label">'+sectionTitle+' / '+E(s.label)+'</div>'+
      '<div class="stage-indicator">'+E(stageLabel)+'</div>'+
      '<h2>'+E(s.title)+'</h2><p class="lead">'+E(s.lead)+'</p></div>'+
      media(s.module,s.kind==='case'||s.kind==='capstone'?'conversation':s.kind,
        s.module==='resilience'&&s.kind==='intro'?'تصویر حرفه‌ای آموزش تاب‌آوری':'تصویر آموزشی آکادمی')+'</div>'+
      '<div class="slide-content"><div class="stage-content">'+(revealed === 0 ? s.body : s.stages[revealed-1])+'</div></div>'+
      '';
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
