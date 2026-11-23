const $ = (id) => document.getElementById(id);
const number = new Intl.NumberFormat('fa-IR');
const fa = (n) => number.format(n);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
})[char]);
const key = 'nekoufekr-hr-v1';
const unknown = 'اطلاعات کافی ندارم';
const noNeed = 'فعلاً نیازی در این زمینه نداریم';
const notRelevant = 'برای این دامنه کاربرد ندارد';
const roles = ['هیئت‌مدیره یا مدیر ارشد هلدینگ','مدیرعامل یا مدیر ارشد تابعه','مدیر یا کارشناس منابع انسانی','مدیر واحد عملیاتی یا پشتیبانی','نماینده تیم مشترک هلدینگ و تابعه','سایر نقش‌ها'];
const need = ['فعلاً نیاز به مداخله ندارد','نیاز به بهبود دارد','نیاز به طراحی یا بازطراحی دارد','برای قضاوت شواهد کافی نیست','در این دامنه موضوعیت ندارد'];
const impact = ['محدود به یک فعالیت','اثر محسوس بر یک تیم یا فرایند','اثر جدی بر نتیجه یک شرکت','اثر حیاتی بر تداوم خدمت یا چند شرکت','هنوز معلوم نیست'];
const urgency = ['بعد از شش ماه','سه تا شش ماه آینده','یک تا سه ماه آینده','در ۳۰ روز آینده','هنوز معلوم نیست'];
const ownership = ['ستاد هلدینگ','شرکت تابعه','مسئولیت مشترک ستاد و تابعه','نیاز به تصمیم درباره متولی'];
const readiness = ['آماده شروع؛ متولی و داده در دسترس است','با هماهنگی یا داده تکمیلی قابل شروع است','ابتدا باید زیرساخت یا تصمیم مدیریتی فراهم شود','هنوز معلوم نیست'];
const assessFields = [['need','نوع نیاز',need],['impact','شدت اثر بر کسب‌وکار',impact],['urgency','فوریت اقدام',urgency],['owner','سطح مناسب پیگیری',ownership],['readiness','آمادگی اجرا',readiness]];

function blankDraft() {
  return { profile:{}, answers:{}, assessment:{} };
}

let state = { current:'holding', drafts:{} };
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && Object.hasOwn(organizations,saved.current) && saved.drafts) state = saved;
} catch {}
let step = 'profile';
let draft;
let currentStages;
let navigation;

function save() {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    $('save-status').textContent = 'پیش‌نویس روی همین مرورگر ذخیره شد.';
  } catch {
    $('save-status').textContent = 'ذخیره مرورگر در دسترس نیست. پیش از خروج، فایل پاسخ‌ها را بگیرید.';
  }
}

function useOrganization() {
  draft = state.drafts[state.current] ??= blankDraft();
  currentStages = [...stages, {
    id:'specific', title:'نیازهای اختصاصی کسب‌وکار', level:state.current === 'holding' ? 'ستاد هلدینگ' : 'شرکت تابعه',
    questions:portfolio[state.current], service:'طراحی مداخله متناسب با مدل کسب‌وکار',
    deliverable:'تعریف گلوگاه، گروه هدف و یک بسته اقدام متناسب با عملیات شرکت',
  }];
  navigation = [{id:'profile',title:'مشخصات و دامنه'}, ...currentStages,
    {id:'planning',title:'انتظارات از همکاری',level:'طراحی خدمات',questions:planning},
    {id:'report',title:'مرور و نقشه راه'}];
}
useOrganization();

function options(items, selected) {
  return '<option value="">انتخاب کنید</option>' + items.map((label, index) =>
    `<option value="${index}" ${selected === index ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function labels(q) {
  return [...q[2], 'سایر؛ در توضیح بنویسید', noNeed, notRelevant, unknown];
}

function questionMarkup(q) {
  const [id,title,,prompt,max] = q;
  const value = draft.answers[id] || { selected:[], comment:'' };
  const maxReached = max > 1 && value.selected.filter((index) => index <= q[2].length).length >= max;
  return `<fieldset class="question"><legend>${title}<small>${max === 1 ? 'یک گزینه' : `حداکثر ${fa(max)} گزینه`}</small></legend>
    <div class="choices">${labels(q).map((label,i) => `<label class="choice">
      <input type="${max === 1 ? 'radio' : 'checkbox'}" name="${id}" data-q="${id}" value="${i}" ${value.selected.includes(i) ? 'checked' : maxReached && i <= q[2].length ? 'disabled' : ''}><span>${label}</span></label>`).join('')}</div>
    <label class="comment">توضیح یا شواهد (اختیاری)<textarea rows="2" maxlength="1500" data-comment="${id}" placeholder="${prompt}">${escapeHtml(value.comment)}</textarea></label>
  </fieldset>`;
}

function assessmentMarkup(section) {
  const value = draft.assessment[section.id] || {};
  const active = value.need === 1 || value.need === 2;
  return `<section class="assessment"><h3>جمع‌بندی نیاز در این حوزه</h3>
    <p class="help">این ارزیابی مشخص می‌کند آیا این حوزه وارد اولویت‌بندی خدمات می‌شود.</p>
    <div class="grid">${assessFields.map(([field,label,items]) => `<label ${field !== 'need' && !active ? 'hidden' : ''}>${label}<select data-assess="${field}">${options(items,value[field])}</select></label>`).join('')}</div>
    <label class="comment">صورت مسئله و معیار موفقیت (اختیاری)<textarea rows="2" maxlength="1500" data-assess-note placeholder="برای کدام تیم، چه چیزی باید تغییر کند و از کجا می‌فهمیم بهتر شده است؟">${escapeHtml(value.note)}</textarea></label>
  </section>`;
}

function assessmentComplete(value = {}) {
  return value.need !== undefined && (
    value.need !== 1 && value.need !== 2 ||
    ['impact','urgency','owner','readiness'].every((field) => value[field] !== undefined)
  );
}

function answered(question) {
  const value = draft.answers[question[0]];
  return Boolean(value?.selected.length || value?.comment.trim());
}

function progress(section) {
  if (!section.questions) return undefined;
  const assess = currentStages.includes(section);
  return [section.questions.filter(answered).length + (assess && assessmentComplete(draft.assessment[section.id]) ? 1 : 0), section.questions.length + Number(assess)];
}

function updateNavigation() {
  const counts = navigation.map(progress).filter(Boolean);
  const done = counts.reduce((sum,[value]) => sum + value,0);
  const total = counts.reduce((sum,[,value]) => sum + value,0);
  $('progress').max = total;
  $('progress').value = done;
  $('progress-detail').textContent = `${fa(done)} از ${fa(total)} سؤال و جمع‌بندی حوزه`;
  $('steps').innerHTML = navigation.map((section) => {
    const count = progress(section);
    return `<button type="button" data-step="${section.id}" ${section.id === step ? 'aria-current="step"' : ''}><span>${section.title}</span>${count ? `<small>${fa(count[0])}/${fa(count[1])}</small>` : ''}</button>`;
  }).join('');
}

function profileMarkup() {
  return `<p class="help">برای ستاد و هر شرکت یک فرم مستقل تکمیل کنید. اگر پاسخ شما دیدگاه یک واحد است، نام همان واحد را ثبت کنید.</p>
  <div class="grid">
    <label>دامنه پاسخ<select id="organization">${Object.entries(organizations).map(([id,[title]]) =>
      `<option value="${id}" ${id === state.current ? 'selected' : ''}>${title}</option>`).join('')}</select></label>
    <label>نقش پاسخ‌دهنده<select data-profile="role">${options(roles,draft.profile.role)}</select></label>
    <label>نام واحد یا تیم (اختیاری)<input type="text" maxlength="120" data-profile="unit" value="${escapeHtml(draft.profile.unit)}"></label>
    <label>بازه زمانی شواهد (اختیاری)<input type="text" maxlength="100" data-profile="period" value="${escapeHtml(draft.profile.period)}" placeholder="برای نمونه، شش ماه اخیر"></label>
    <label>اندازه نیروی انسانی در دامنه (اختیاری)<select data-profile="size">${options(['کمتر از ۲۰ نفر','۲۰ تا ۴۹ نفر','۵۰ تا ۹۹ نفر','۱۰۰ تا ۲۴۹ نفر','۲۵۰ نفر و بیشتر','در دسترس نیست'],draft.profile.size)}</select></label>
    <label>شیوه تکمیل<select data-profile="mode">${options(['پاسخ فردی','پاسخ مشترک تیم یا جلسه مدیریتی'],draft.profile.mode)}</select></label>
  </div>
  <p class="note">پاسخ‌ها در همین مرورگر ذخیره می‌شوند. در پایان فایل پاسخ‌ها یا گزارش PDF را دانلود و از مسیر مورد توافق برای مشاور ارسال کنید. فقط شواهد تجمیعی و بدون اطلاعات شناسایی کارکنان یا مشتریان ثبت کنید.</p>
  ${Object.keys(draft.answers).length || Object.keys(draft.assessment).length || Object.keys(draft.profile).length ? '<button type="button" data-action="reset">پاک کردن پیش‌نویس همین دامنه</button>' : ''}`;
}

function recommendations() {
  return currentStages.flatMap((section) => {
    const value = draft.assessment[section.id];
    if (!value || (value.need !== 1 && value.need !== 2)) return [];
    const rateable = [value.impact,value.urgency].every((entry) => Number.isInteger(entry) && entry < 4);
    const score = rateable ? 2 * (value.impact + 1) + value.urgency + 1 : null;
    const phase = score === null ? null : value.urgency === 3 ? 0
      : value.readiness === 2 || value.readiness === 3 || value.readiness === undefined ? 0
      : value.urgency === 2 ? 1 : 2;
    return [{ section, value, score, phase }];
  }).sort((a,b) => (b.score ?? 0) - (a.score ?? 0) || (b.value.urgency ?? 0) - (a.value.urgency ?? 0));
}

const phaseTitles = ['۳۰ روز اول | تأیید و اقدام اولیه','روز ۳۱ تا ۹۰ | طراحی و اجرای آزمایشی','پس از روز ۹۰ | استقرار و پایش'];

function reportMarkup() {
  const ranked = recommendations();
  const deferred = currentStages.filter((section) => {
    const value = draft.assessment[section.id];
    return !value || value.need === undefined || value.need === 3;
  });
  const phaseItems = (phase) => ranked.filter((item) => item.phase === phase).map(({section,value}) => {
    const prepare = value.readiness === 2 || value.readiness === 3 || value.readiness === undefined;
    const action = phase === 0 ? (prepare ? 'تأیید مسئله، تعیین متولی و آماده‌سازی داده و منابع' : 'تعیین خط مبنا و اجرای اقدام محدود برای رفع گلوگاه')
      : phase === 1 ? 'طراحی مشترک و اجرای آزمایشی' : 'برنامه‌ریزی برای استقرار، توانمندسازی و پایش';
    return `<li><strong>${section.service}</strong> · ${action}<br>متولی پیشنهادی: ${ownership[value.owner] ?? 'نیازمند تعیین'}<br>خروجی پیشنهادی خدمت: ${section.deliverable}</li>`;
  });
  return `<p class="help"><strong>${organizations[state.current][0]}</strong>${draft.profile.role !== undefined ? ` · ${roles[draft.profile.role]}` : ''}${draft.profile.unit ? ` · ${escapeHtml(draft.profile.unit)}` : ''}${draft.profile.period ? ` · ${escapeHtml(draft.profile.period)}` : ''}</p>
    <p class="note">این برآورد از پاسخ همین دامنه به دست می‌آید. در جلسه بعدی، نتایج ستاد و تابعه‌ها، شواهد و منابع اجرا را کنار هم بگذارید تا مسیر همکاری نهایی شود.</p>
    <div class="report-tools">
      <button type="button" class="primary" data-action="print">چاپ یا ذخیره PDF</button>
      <button type="button" data-action="download">دانلود فایل پاسخ‌ها</button>
    </div>
    <section class="report-block"><h3>نیازهای اولویت‌دار</h3>
      ${ranked.length ? `<div class="table-scroll"><table><thead><tr><th>حوزه</th><th>نوع نیاز</th><th>اثر</th><th>فوریت</th><th>متولی</th><th>امتیاز</th></tr></thead><tbody>
      ${ranked.map(({section,value,score}) => `<tr><td>${section.title}</td><td>${need[value.need]}</td><td>${impact[value.impact] ?? 'ثبت نشده'}</td><td>${urgency[value.urgency] ?? 'ثبت نشده'}</td><td>${ownership[value.owner] ?? 'تعیین نشده'}</td><td>${score === null ? 'نیاز به بررسی' : fa(score)}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="muted">امتیاز از ۳ تا ۱۲ است. اثر بر کسب‌وکار دو برابر فوریت وزن دارد. در امتیاز برابر، فوریت بالاتر در اولویت است. آمادگی اجرا در تعیین زمان شروع به کار می‌رود.</p>` : '<p>هنوز حوزه‌ای به‌عنوان نیاز به بهبود یا طراحی ثبت نشده است.</p>'}
      ${deferred.length ? `<p><strong>نیازمند تکمیل شواهد یا ارزیابی:</strong> ${deferred.map((section) => section.title).join('، ')}</p>` : ''}
    </section>
    <section class="report-block"><h3>پیش‌نویس نقشه راه خدمات</h3>
      ${[0,1,2].map((phase) => {
        const items = phaseItems(phase);
        return `<h4>${phaseTitles[phase]}</h4>${items.length ? `<ul>${items.join('')}</ul>` : '<p class="muted">با اطلاعات فعلی اقدامی برای این بازه پیشنهاد نشده است.</p>'}`;
      }).join('')}
      ${ranked.some(({score}) => score === null) ? '<p>نیازهایی که اثر یا فوریتشان هنوز معلوم نیست، در جلسه تشخیص تکمیلی بررسی می‌شوند.</p>' : ''}
    </section>
    <details class="report-block" id="full-report"><summary>پاسخ‌ها و شواهد ثبت‌شده</summary>
      ${navigation.filter((section) => section.questions).map((section) => `<h4>${section.title}</h4>
        <ul>${section.questions.filter(answered).map((q) => {
          const value = draft.answers[q[0]];
          const selections = value.selected.map((index) => labels(q)[index]).join('، ');
          return `<li><strong>${q[1]}</strong><br>${selections || '—'}${value.comment.trim() ? `<div class="report-detail">${escapeHtml(value.comment)}</div>` : ''}</li>`;
        }).join('') || '<li>پاسخی ثبت نشده است.</li>'}
        ${currentStages.includes(section) ? assessFields.filter(([field]) => draft.assessment[section.id]?.[field] !== undefined).map(([field,label,choices]) =>
          `<li><strong>${label}</strong> · ${choices[draft.assessment[section.id][field]]}</li>`).join('') : ''}
        ${draft.assessment[section.id]?.note?.trim() ? `<li class="report-detail"><strong>صورت مسئله و معیار موفقیت</strong><br>${escapeHtml(draft.assessment[section.id].note)}</li>` : ''}
        </ul>`).join('')}
    </details>`;
}

function render(focus = false) {
  const index = navigation.findIndex((section) => section.id === step);
  const section = navigation[index];
  let body;
  if (step === 'profile') body = profileMarkup();
  else if (step === 'report') body = reportMarkup();
  else body = `<p class="help">${step === 'specific' ? organizations[state.current][1] : step === 'planning' ? 'انتظار شما از نتیجه، شیوه همکاری و پیش‌نیازهای شروع را مشخص می‌کند.' : 'گزینه‌های مرتبط را بر اساس وضعیت دامنه انتخاب‌شده مشخص کنید.'}</p>
    ${section.questions.map(questionMarkup).join('')}
    ${currentStages.includes(section) ? assessmentMarkup(section) : ''}`;
  $('panel').innerHTML = `<p class="step-kicker">بخش ${fa(index + 1)} از ${fa(navigation.length)}${section.level ? ` · ${section.level}` : ''}</p>
    <h2 id="step-title" tabindex="-1">${section.title}</h2>${body}
    <div class="actions no-print">${index ? `<button type="button" data-step="${navigation[index-1].id}">بخش قبل</button>` : '<span></span>'}
    ${index < navigation.length - 1 ? `<button type="button" class="primary" data-step="${navigation[index+1].id}">${navigation[index+1].id === 'report' ? 'مرور پاسخ‌ها و نقشه راه' : 'بخش بعد'}</button>` : '<button type="button" data-step="profile">بازگشت به مشخصات</button>'}</div>`;
  updateNavigation();
  if (focus) {
    $('step-title').focus({preventScroll:true});
    $('workspace').scrollIntoView({block:'start'});
    const active = $('steps').querySelector('[aria-current=step]');
    if ($('steps').scrollWidth > $('steps').clientWidth) {
      $('steps').scrollBy({left:active.getBoundingClientRect().left - $('steps').getBoundingClientRect().left});
    }
  }
}

function download() {
  const payload = {
    version:1, exportedAt:new Date().toISOString(), organization:state.current, organizationName:organizations[state.current][0],
    profile:{...draft.profile, roleLabel:roles[draft.profile.role]},
    sections:navigation.filter((section) => section.questions).map((section) => ({
      id:section.id, title:section.title, level:section.level,
      questions:section.questions.map((q) => ({
        id:q[0], question:q[1], selected:(draft.answers[q[0]]?.selected || []).map((i) => labels(q)[i]),
        comment:draft.answers[q[0]]?.comment || '',
      })),
      assessment:draft.assessment[section.id] && {
        ...Object.fromEntries(assessFields.map(([field,,choices]) => [field,choices[draft.assessment[section.id][field]]])),
        note:draft.assessment[section.id].note || '',
      },
    })),
    roadmap:recommendations().map(({section,score,phase}) => ({
      area:section.title, score, when:phase === null ? 'نیاز به بررسی تکمیلی' : phaseTitles[phase],
      service:section.service, deliverable:section.deliverable,
    })),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const link = Object.assign(document.createElement('a'), {href:url,download:`nekoufekr-hr-${state.current}.json`});
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url),5000);
}

function response(id) {
  return draft.answers[id] ??= {selected:[],comment:''};
}

$('panel').addEventListener('input', ({target}) => {
  if (target.dataset.comment) response(target.dataset.comment).comment = target.value;
  else if (target.hasAttribute('data-assess-note')) (draft.assessment[step] ??= {}).note = target.value;
  else if (target.dataset.profile && target.type === 'text') draft.profile[target.dataset.profile] = target.value;
  else return;
  save();
  updateNavigation();
});

$('panel').addEventListener('change', ({target}) => {
  if (target.id === 'organization') {
    state.current = target.value;
    useOrganization();
    render();
    $('organization').focus();
  } else if (target.dataset.profile && target.tagName === 'SELECT') {
    draft.profile[target.dataset.profile] = target.value === '' ? undefined : Number(target.value);
  } else if (target.dataset.assess) {
    const field = target.dataset.assess;
    const value = draft.assessment[step] ??= {};
    value[field] = target.value === '' ? undefined : Number(target.value);
    if (field === 'need') {
      const active = value.need === 1 || value.need === 2;
      $('panel').querySelectorAll('[data-assess]:not([data-assess=need])').forEach((select) => {
        select.closest('label').hidden = !active;
        if (!active) {
          delete value[select.dataset.assess];
          select.value = '';
        }
      });
    }
  } else if (target.dataset.q) {
    const id = target.dataset.q;
    const q = navigation.find((section) => section.id === step).questions.find((question) => question[0] === id);
    const index = Number(target.value);
    const exclusive = (i) => i > q[2].length;
    const value = response(id);
    if (!target.checked) value.selected = value.selected.filter((i) => i !== index);
    else if (q[4] === 1 || exclusive(index)) value.selected = [index];
    else value.selected = [...value.selected.filter((i) => !exclusive(i)),index].slice(0,q[4]);
    $('panel').querySelectorAll(`[data-q="${id}"]`).forEach((input) => {
      input.checked = value.selected.includes(Number(input.value));
      input.disabled = input.type === 'checkbox' && !input.checked && !exclusive(Number(input.value)) && value.selected.filter((i) => !exclusive(i)).length >= q[4];
    });
  } else return;
  save();
  updateNavigation();
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.step) {
    step = button.dataset.step;
    render(true);
  } else if (button.id === 'start') {
    render(true);
  } else if (button.dataset.action === 'download') {
    download();
  } else if (button.dataset.action === 'print') {
    const details = $('full-report');
    const restore = !details.open;
    details.open = true;
    window.print();
    if (restore) details.open = false;
  } else if (button.dataset.action === 'reset' && window.confirm('پیش‌نویس همین دامنه پاک شود؟')) {
    state.drafts[state.current] = blankDraft();
    useOrganization();
    save();
    render(true);
  }
});

render();
