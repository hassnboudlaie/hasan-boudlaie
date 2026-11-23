const $ = (id) => document.getElementById(id);
const number = new Intl.NumberFormat('fa-IR');
const fa = (n) => number.format(n);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
})[char]);
const key = 'nekoufekr-hr-v1';
const unknown = 'اطلاعات کافی ندارم';
const noNeed = 'فعلاً مشکل خاصی نمی‌بینیم';
const notRelevant = 'به کار واحد یا شرکت ما مربوط نیست';
const reportHeaders = ['موضوع','کار لازم','اثر مشکل','زمان شروع','مسئول پیگیری','امتیاز'];
const roles = ['هیئت‌مدیره یا مدیر ارشد هلدینگ','مدیرعامل یا مدیر ارشد تابعه','مدیر یا کارشناس منابع انسانی','مدیر واحد عملیاتی یا پشتیبانی','نماینده تیم مشترک هلدینگ و تابعه','سایر نقش‌ها'];
const need = ['فعلاً کاری لازم نیست','روش فعلی باید بهتر شود','باید یک روش تازه راه بیندازیم یا روش فعلی را از نو بچینیم','هنوز نمی‌دانیم چه کاری لازم است','به کار واحد یا شرکت ما مربوط نیست'];
const impact = ['فقط یک کار را سخت‌تر می‌کند','یک تیم یا بخشی از کار را کند می‌کند','به نتیجه کار یک شرکت آسیب می‌زند','ادامه یک خدمت مهم یا کار چند شرکت را به خطر می‌اندازد','هنوز معلوم نیست'];
const urgency = ['بعد از شش ماه','سه تا شش ماه آینده','یک تا سه ماه آینده','در ۳۰ روز آینده','هنوز معلوم نیست'];
const ownership = ['ستاد هلدینگ','شرکت تابعه','مسئولیت مشترک ستاد و تابعه','هنوز معلوم نیست چه کسی باید پیگیری کند'];
const readiness = ['می‌توانیم شروع کنیم؛ مسئول و اطلاعات مشخص‌اند','با کمی هماهنگی یا جمع‌کردن اطلاعات می‌توانیم شروع کنیم','اول باید مدیران تصمیم بگیرند یا امکانات لازم فراهم شود','هنوز معلوم نیست'];
const assessFields = [['need','فکر می‌کنید چه کاری لازم است؟',need],['impact','این مشکل چه اثری روی کار دارد؟',impact],['urgency','کی باید شروع کنیم؟',urgency],['owner','چه کسی باید پیگیری کند؟',ownership],['readiness','برای شروع آماده‌اید؟',readiness]];

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
    const status = $('save-status');
    status.dataset.state = 'saved';
    if (status.textContent !== 'پیش‌نویس در این مرورگر ذخیره شد') status.textContent = 'پیش‌نویس در این مرورگر ذخیره شد';
  } catch {
    $('save-status').dataset.state = 'error';
    $('save-status').textContent = 'ذخیره مرورگر در دسترس نیست. پیش از خروج، فایل پاسخ‌ها را بگیرید.';
  }
}

function useOrganization() {
  draft = state.drafts[state.current] ??= blankDraft();
  currentStages = [...stages, {
    id:'specific', title:'مسئله‌های ویژه شرکت شما', level:state.current === 'holding' ? 'ستاد هلدینگ' : 'شرکت تابعه',
    questions:portfolio[state.current], service:'کمک به حل مسئله‌ای که در کار این شرکت دیده می‌شود',
    deliverable:'شرح مشکل، تیم درگیر و چند کار مشخص برای حل آن',
  }];
  navigation = [{id:'profile',title:'شرکت و واحد شما'}, {id:'business',title:'اولویت‌های کسب‌وکار'}, {id:'signals',title:'مشکل‌های شرکت و حرف کارکنان',questions:signals}, ...currentStages,
    {id:'catalog',title:'همه حوزه‌های منابع انسانی'},
    {id:'planning',title:'از همکاری چه می‌خواهید؟',questions:planning},
    {id:'report',title:'مرور و نقشه راه'}];
}
useOrganization();

function businessTitle(id) {
  const item = businessCases[id];
  return item?.local?.[state.current] ?? item?.title;
}

function priorityCases() {
  return (draft.priorities ?? []).filter((item) => item?.business);
}

function availableAreas(item) {
  return peopleFactors[item.factor]?.[1] ?? [];
}

function linkedArea(item) {
  const areas = availableAreas(item);
  return areas.includes(item.area) ? item.area : areas[0];
}

function linkedAreas() {
  return new Set(priorityCases().map(linkedArea).filter(Boolean));
}

function guidedPath() {
  const areas = linkedAreas();
  return navigation.filter((section) => section.id !== 'catalog' && (!diagnosis[section.id] || areas.has(section.id)));
}

function caseSelect(slot, name, label, entries, selected) {
  return `<label>${label}<select data-case="${slot}" data-field="${name}">
    <option value="">انتخاب کنید</option>
    ${entries.map(([id,title]) => `<option value="${id}" ${String(selected) === String(id) ? 'selected' : ''}>${title}</option>`).join('')}
    </select></label>`;
}

function businessMarkup() {
  const entries = Object.keys(businessCases).map((id) => [id,businessTitle(id)]);
  const caseMarkup = (slot) => {
    const item = draft.priorities?.[slot] ?? {};
    const areas = availableAreas(item);
    const area = linkedArea(item);
    return `<div class="grid">
      ${caseSelect(slot,'business','کدام چالش برای شرکت مهم است؟',entries,item.business)}
      ${item.business ? caseSelect(slot,'importance','حل این چالش در شش ماه آینده چقدر مهم است؟',caseImportance.map((label,i) => [i,label]),item.importance) : ''}
      ${item.business ? caseSelect(slot,'factor','کدام مسئله مربوط به کارکنان یا شیوه کار به این چالش ربط دارد؟',
        [...businessCases[item.business].factors,'uncertain','outside'].map((id) => [id,peopleFactors[id][0]]),item.factor) : ''}
      ${areas.length ? caseSelect(slot,'area','اول کدام حوزه را بررسی کنیم؟',areas.map((id) => [id,stages.find((section) => section.id === id).title]),area) : ''}
      ${areas.length ? caseSelect(slot,'owner','به نظرتان این کار را چه کسی پیگیری کند؟ (اختیاری)',ownership.map((label,i) => [i,label]),item.owner) : ''}
    </div>
    ${item.business ? `<label class="comment">از کجا می‌فهمید بهتر شده؟ (اختیاری)
      <textarea rows="2" maxlength="800" data-case="${slot}" data-field="evidence" placeholder="مثلاً ${businessCases[item.business].measures[0]}">${escapeHtml(item.evidence)}</textarea></label>` : ''}
    ${area ? `<p class="note">پیشنهاد برای شروع، قابل تغییر در همین فرم · <strong>${stages.find((section) => section.id === area).title}</strong></p>`
      : item.factor === 'outside' ? '<p class="note">این چالش در گزارش می‌آید تا در گفت‌وگو مسیر مناسبش روشن شود.</p>'
      : item.factor === 'uncertain' ? '<p class="note">در گزارش پیشنهاد می‌شود اول چند نمونه واقعی را با تیم مرور کنیم.</p>' : ''}`;
  };
  return `<p class="help">از کاری شروع کنید که باید در خود شرکت بهتر شود. بعد بگویید کارکنان یا شیوه کار چه نقشی در آن دارند.</p>
    <section class="report-block"><h3>چالش اول</h3>${caseMarkup(0)}</section>
    <details class="report-block" ${draft.priorities?.[1]?.business ? 'open' : ''}><summary>افزودن چالش دوم <span>اختیاری</span></summary>${caseMarkup(1)}</details>`;
}

function catalogMarkup() {
  const areas = linkedAreas();
  return `<p class="help">در مسیر اصلی حوزه‌های مرتبط با چالش شما آمده‌اند. اینجا می‌توانید هر حوزه دیگری را هم بررسی کنید.</p>
    <div class="grid">${currentStages.filter((section) => diagnosis[section.id]).map((section) =>
      `<button type="button" data-step="${section.id}">${section.title}${areas.has(section.id) ? ' · در مسیر شما' : ''}</button>`).join('')}</div>`;
}

function options(items, selected) {
  return '<option value="">انتخاب کنید</option>' + items.map((label, index) =>
    `<option value="${index}" ${selected === index ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function processState(section) {
  return draft.answers[`state-${section.id}`]?.selected[0];
}

function symptomPrompt(status) {
  return status === 0 ? 'چون روش مشخصی ندارید، کدام مشکل‌ها در عمل پیش می‌آیند؟'
    : status === 6 ? 'حتی اگر از روش کار مطمئن نیستید، چه مشکل‌هایی دیده‌اید؟'
    : 'در انجام این کار، کدام مشکل‌ها را بیشتر می‌بینید؟';
}

function diagnosisQuestion(section) {
  return [`problem-${section.id}`, symptomPrompt(processState(section)), diagnosis[section.id][1],
    'یک نمونه واقعی بنویسید. چه شد و چه کسی یا چه کاری تحت تأثیر قرار گرفت؟', 3];
}

function allQuestions(section) {
  if (!diagnosis[section.id]) return section.questions;
  const stateQuestion = [`state-${section.id}`,diagnosis[section.id][0],processStates,'',1];
  return processState(section) === 7 ? [stateQuestion] : [stateQuestion,diagnosisQuestion(section),...section.questions];
}

function diagnosisMarkup(section) {
  const status = processState(section);
  return `<section class="assessment diagnosis-state">
    <label><span class="question-index">۱.</span> ${diagnosis[section.id][0]}<select data-process aria-describedby="process-current">${options(processStates,status)}</select></label>
    <p id="process-current" class="selection-limit" aria-live="polite">${processStates[status] ?? 'یک گزینه که به وضع فعلی نزدیک‌تر است انتخاب کنید.'}</p>
  </section>
  <div id="diagnosis-details" ${status === 7 ? 'hidden' : ''}>
    ${questionMarkup(diagnosisQuestion(section),1)}
    ${linkedAreas().has(section.id) ? `<details class="report-block"><summary>زمان شروع و کمک مورد نیاز <span>اختیاری</span></summary>${assessmentMarkup(section)}</details>` : assessmentMarkup(section)}
    <details class="report-block no-print"><summary>سؤال‌های بیشتر درباره این موضوع <span>اختیاری</span></summary>
      ${section.questions.map((question,index) => questionMarkup(question,index + 2)).join('')}
    </details>
  </div>`;
}

function labels(q) {
  if (q[0].startsWith('state-')) return q[2];
  return [...q[2], 'سایر؛ در توضیح بنویسید', noNeed, notRelevant, unknown];
}

function questionMarkup(q, position) {
  const [id,title,,prompt,max] = q;
  const value = draft.answers[id] || { selected:[], comment:'' };
  const maxReached = max > 1 && value.selected.filter((index) => index <= q[2].length).length >= max;
  return `<fieldset class="question" aria-describedby="limit-${id}"><legend><span class="question-index">${fa(position + 1)}.</span> <span data-question-title="${id}">${title}</span></legend>
    <p class="selection-limit" id="limit-${id}" aria-live="polite">${selectionHint(max,value.selected.length,maxReached)}</p>
    <div class="choices">${labels(q).map((label,i) => `<label class="choice">
      <input type="${max === 1 ? 'radio' : 'checkbox'}" name="${id}" data-q="${id}" value="${i}" ${value.selected.includes(i) ? 'checked' : maxReached && i <= q[2].length ? 'disabled' : ''}><span>${label}</span></label>`).join('')}</div>
    <details class="question-comment" ${value.comment ? 'open' : ''}>
      <summary>افزودن توضیح یا مثال <span>اختیاری</span></summary>
      <label class="comment"><span>${prompt}</span><textarea rows="3" maxlength="1500" data-comment="${id}">${escapeHtml(value.comment)}</textarea></label>
    </details>
  </fieldset>`;
}

function selectionHint(max, selected, reached) {
  if (max === 1) return 'یک گزینه انتخاب کنید';
  if (reached) return `سقف ${fa(max)} گزینه پر شد. برای تغییر، یکی را بردارید.`;
  return `حداکثر ${fa(max)} گزینه${selected ? ` · ${fa(selected)} انتخاب شده` : ''}`;
}

function assessmentMarkup(section) {
  const value = draft.assessment[section.id] || {};
  const active = value.need === 1 || value.need === 2;
  return `<section class="assessment"><h3>از کجا شروع کنیم؟</h3>
    <p class="help">اگر کاری لازم است، بگویید چقدر مهم است و چه کسی آن را دنبال کند.</p>
    <div class="grid">${assessFields.map(([field,label,items]) => `<label ${field !== 'need' && !active ? 'hidden' : ''}>${label}<select data-assess="${field}">${options(items,value[field])}</select></label>`).join('')}</div>
    <label class="comment">نتیجه دلخواه (اختیاری)<textarea rows="2" maxlength="1500" data-assess-note placeholder="مثلاً اگر کار بهتر شود، چه تغییری در تیم یا خدمت می‌بینید؟">${escapeHtml(value.note)}</textarea></label>
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
  if (section.id === 'business') {
    const items = [draft.priorities?.[0] ?? {}, ...(draft.priorities?.[1]?.business ? [draft.priorities[1]] : [])];
    return [items.reduce((sum,item) => sum + Number(Boolean(item.business)) + Number(Boolean(item.factor)) + Number(item.importance !== undefined),0),items.length * 3];
  }
  if (!section.questions) return undefined;
  if (diagnosis[section.id]) {
    const status = processState(section);
    const linked = linkedAreas().has(section.id);
    const total = linked ? 2 : 3;
    if (status === 7) return [total,total];
    const count = Number(status !== undefined) + Number(answered(diagnosisQuestion(section)))
      + Number(!linked && assessmentComplete(draft.assessment[section.id]));
    return [count,total];
  }
  const assess = currentStages.includes(section);
  return [section.questions.filter(answered).length + (assess && assessmentComplete(draft.assessment[section.id]) ? 1 : 0), section.questions.length + Number(assess)];
}

function updateNavigation(rebuild = false) {
  const path = guidedPath();
  const menu = navigation.filter((section) => path.includes(section) || section.id === 'catalog' || section.id === step);
  const counts = path.map(progress);
  const done = counts.reduce((sum,count) => sum + (count?.[0] ?? 0),0);
  const total = counts.reduce((sum,count) => sum + (count?.[1] ?? 0),0);
  $('progress').max = total;
  $('progress').value = done;
  $('progress-percent').textContent = `${fa(Math.round(done * 100 / total))}٪`;
  $('progress-detail').textContent = `${fa(done)} از ${fa(total)} پاسخ اصلی`;
  $('start').textContent = draft.lastStep && draft.lastStep !== 'profile' ? 'ادامه پرسشنامه' : 'شروع پرسشنامه';
  if (rebuild) {
    $('steps').innerHTML = menu.map((section) =>
      `<button type="button" data-step="${section.id}" ${section.id === step ? 'aria-current="step"' : ''}><span>${section.title}</span><small></small></button>`).join('');
  }
  $('steps').querySelectorAll('button').forEach((button,index) => {
    const count = progress(menu[index]);
    if (!count) return;
    const badge = button.querySelector('small');
    badge.textContent = count[0] === count[1] ? 'کامل' : `${fa(count[0])} از ${fa(count[1])}`;
    badge.classList.toggle('done', count[0] === count[1]);
  });
}

function profileMarkup() {
  return `<p class="help">برای ستاد و هر شرکت یک فرم مستقل تکمیل کنید. اگر پاسخ شما دیدگاه یک واحد است، نام همان واحد را ثبت کنید.</p>
  <div class="grid">
    <label>شرکت یا ستاد<select id="organization">${Object.entries(organizations).map(([id,[title]]) =>
      `<option value="${id}" ${id === state.current ? 'selected' : ''}>${title}</option>`).join('')}</select></label>
    <label>نقش پاسخ‌دهنده<select data-profile="role">${options(roles,draft.profile.role)}</select></label>
    <label>نام واحد یا تیم (اختیاری)<input type="text" maxlength="120" data-profile="unit" value="${escapeHtml(draft.profile.unit)}"></label>
    <label>این پاسخ‌ها مربوط به چه زمانی است؟ (اختیاری)<input type="text" maxlength="100" data-profile="period" value="${escapeHtml(draft.profile.period)}" placeholder="برای نمونه، شش ماه اخیر"></label>
    <label>تعداد کارکنان (اختیاری)<select data-profile="size">${options(['کمتر از ۲۰ نفر','۲۰ تا ۴۹ نفر','۵۰ تا ۹۹ نفر','۱۰۰ تا ۲۴۹ نفر','۲۵۰ نفر و بیشتر','در دسترس نیست'],draft.profile.size)}</select></label>
    <label>چطور پاسخ می‌دهید؟<select data-profile="mode">${options(['پاسخ فردی','پاسخ مشترک تیم یا جلسه مدیریتی'],draft.profile.mode)}</select></label>
  </div>
  <p class="note">پاسخ‌ها روی همین مرورگر ذخیره می‌شوند. در پایان، فایل پاسخ‌ها را برای مشاور بفرستید. از درج نام یا اطلاعات شناسایی کارکنان و مشتریان خودداری کنید.</p>
  ${Object.keys(draft.answers).length || Object.keys(draft.assessment).length || Object.keys(draft.profile).length || priorityCases().length ? '<button type="button" data-action="reset">پاک کردن پیش‌نویس همین دامنه</button>' : ''}`;
}

function recommendations() {
  return currentStages.flatMap((section) => {
    if (diagnosis[section.id] && processState(section) === 7) return [];
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

function suggestedStep(status, issues) {
  if (status === undefined || status === 6) return 'اول در گفت‌وگو با تیم روشن کنیم کار الان چطور انجام می‌شود.';
  if (status === 7) return 'این موضوع به کار این واحد یا شرکت مربوط نیست.';
  if (status === 0) return 'اگر این کار لازم است، یک روش ساده تعریف کنیم و مشخص کنیم چه کسی مسئول است.';
  if (status <= 2) return 'توافق کنیم چه کسی، چه کاری را، در چه زمانی انجام می‌دهد.';
  if (!issues) return 'روش فعلی را ادامه دهیم و نتیجه را هر چند وقت بررسی کنیم.';
  if (status === 3) return 'مشکل را بررسی کنیم و چند عدد ساده برای دیدن نتیجه کار انتخاب کنیم.';
  return 'با کمک نتیجه‌ها، علت مشکل را پیدا کنیم و یک تغییر کوچک را امتحان کنیم.';
}

function selectedLabels(question) {
  return (draft.answers[question[0]]?.selected ?? []).map((index) => labels(question)[index]);
}

function signalsSummary() {
  const titles = ['اثر مشکلات مربوط به نیروها بر کار شرکت','مشکل‌هایی که کارکنان مطرح می‌کنند یا مدیران می‌بینند',
    'چطور از کارکنان نظر می‌گیرید؟','بعد از شنیدن نظرها چه می‌شود؟'];
  return `<section class="report-block"><h3>کار شرکت و حرف کارکنان</h3>
    <ul>${signals.map((question,index) => {
      const value = draft.answers[question[0]];
      const selected = selectedLabels(question);
      return `<li><strong>${titles[index]}</strong><br>${selected.join('، ') || (value?.comment.trim() ? 'مثال ثبت شده' : 'هنوز پاسخی نداریم')}
        ${value?.comment.trim() ? `<div class="report-detail">${escapeHtml(value.comment)}</div>` : ''}</li>`;
    }).join('')}</ul>
  </section>`;
}

function diagnosisSummary() {
  const diagnosed = currentStages.filter((section) => diagnosis[section.id] &&
    (processState(section) !== undefined || answered(diagnosisQuestion(section))));

  return `<section class="report-block"><h3>روش کار امروز و مشکل‌هایی که دیده‌اید</h3>
    ${diagnosed.length ? `<ul>${diagnosed.map((section) => {
      const status = processState(section);
      const q = diagnosisQuestion(section);
      const findings = status === 7 ? [] : selectedLabels(q);
      const issues = status !== 7 && ((draft.answers[q[0]]?.selected ?? []).some((index) => index <= q[2].length)
        || Boolean(draft.answers[q[0]]?.comment.trim()));
      return `<li><strong>${section.title}</strong><br>${processStates[status] ?? 'روش کار هنوز روشن نیست'}
        ${findings.length ? `<br>آنچه گزارش کردید: ${findings.join('، ')}` : ''}
        <br>قدم پیشنهادی: ${suggestedStep(status,issues)}</li>`;
    }).join('')}</ul>` : '<p>با پاسخ به سؤال‌های روش کار و مشکل‌ها، این بخش تکمیل می‌شود.</p>'}
  </section>`;
}

function linkedSolutions() {
  return priorityCases().map((item,index) => {
    const area = linkedArea(item);
    const section = stages.find((entry) => entry.id === area);
    const status = section ? processState(section) : undefined;
    const findings = section ? selectedLabels(diagnosisQuestion(section)) : [];
    const assessment = area ? draft.assessment[area] ?? {} : {};
    let category, next, gap = 0;
    if (item.factor === 'outside') {
      category = 'بررسی با مدیر کسب‌وکار';
      next = 'مانع اصلی را با تیم مسئول کسب‌وکار روشن کنیم.';
    } else if (!section || status === undefined || status === 6 || status === 7) {
      category = 'اول بررسی بیشتر';
      next = status === 7 ? 'با پاسخ‌دهنده بررسی کنیم کدام روش یا تیم واقعاً به مسئله مربوط است.'
        : 'چند نمونه واقعی را مرور کنیم تا ارتباط چالش با روش کار روشن شود.';
    } else {
      const question = diagnosisQuestion(section);
      const response = draft.answers[question[0]];
      const hasIssue = Boolean(response?.selected.some((option) => option <= question[2].length) || response?.comment.trim());
      const noIssue = response?.selected.includes(question[2].length + 1) && !hasIssue;
      if (status === 0) {
        category = 'ایجاد یک روش تازه';
        gap = 3;
        next = `با یک تیم شروع کنیم و مراحل و مسئول کار را روشن کنیم. ${serviceActions[area][0]}.`;
      } else if (status >= 3 && !hasIssue && !noIssue) {
        category = 'اول بررسی بیشتر';
        next = 'روش مشخص است. چند نمونه واقعی را ببینیم تا معلوم شود کجا باید آن را اصلاح یا کامل‌تر کنیم.';
      } else if (status <= 2 || hasIssue) {
        category = 'اصلاح روش موجود';
        gap = 2;
        next = `اول بخشی را که دردسر ایجاد می‌کند پیدا کنیم و تغییر را در یک تیم امتحان کنیم. ${serviceActions[area][0]}.`;
      } else if (noIssue && status >= 4) {
        category = 'ادامه روش فعلی و بررسی نتیجه';
        next = 'روش فعلی را ادامه دهیم و ببینیم نتیجه مرتبط با چالش بهتر می‌شود یا هنوز مانعی باقی مانده است.';
      } else {
        category = 'توسعه روش موجود';
        gap = 1;
        next = `روش فعلی را برای نیاز پیشِ رو کامل‌تر کنیم و نتیجه را بسنجیم. ${serviceActions[area][0]}.`;
      }
    }
    const importance = Number.isInteger(item.importance) && item.importance < 4 ? item.importance : null;
    return {
      order:index, business:businessTitle(item.business), factor:peopleFactors[item.factor]?.[0], area:section?.title,
      areaId:area, status:processStates[status], findings, category, next,
      owner:ownership[item.owner ?? assessment.owner],
      respondentView:assessment.need === 0 && gap > 0 ? 'پاسخ‌دهنده فعلاً اقدامی درخواست نکرده است. نیاز به کار را در جلسه بررسی کنیم.' : undefined,
      deliverable:gap > 0 ? section.deliverable : undefined,
      outcome:item.evidence?.trim(), measures:businessCases[item.business].measures,
      validation:area ? serviceActions[area][1] : 'گفت‌وگو با تیم و بررسی چند نمونه واقعی',
      importance:importance === null ? null : caseImportance[importance], timing:urgency[assessment.urgency],
      priority:importance === null ? null : (importance + 1) * 4 + gap,
    };
  }).sort((a,b) => (b.priority ?? -1) - (a.priority ?? -1) || a.order - b.order);
}

function solutionsMarkup(solutions) {
  return `<section class="report-block"><h3>پیشنهاد خدمات برای چالش‌های اصلی شرکت</h3>
    ${solutions.length ? `<p class="help">ترتیب پیشنهادها از اهمیت چالش شروع می‌شود. اگر اهمیت یکسان باشد، موضوعی که به ساخت یا تغییر بیشتری نیاز دارد بالاتر می‌آید.</p>
    <ol>${solutions.map((item) => `<li>
      <h4>${item.business}</h4>
      <p><strong>اهمیت برای شرکت</strong> · ${item.importance ?? 'هنوز مشخص نیست'}<br>
      <strong>مسئله مربوط به کارکنان</strong> · ${item.factor ?? 'هنوز مشخص نیست'}<br>
      <strong>حوزه و روش فعلی</strong> · ${item.area ?? 'هنوز مشخص نیست'}${item.status ? ` · ${item.status}` : ''}<br>
      ${item.findings.length ? `<strong>آنچه در عمل دیده‌اید</strong> · ${item.findings.join('، ')}<br>` : ''}
      <strong>پیشنهاد</strong> · ${item.category}. ${item.next}<br>
      ${item.deliverable ? `<strong>خروجی کار</strong> · ${item.deliverable}<br>` : ''}
      ${item.respondentView ? `<strong>نظر پاسخ‌دهنده</strong> · ${item.respondentView}<br>` : ''}
      <strong>مسئول پیشنهادی</strong> · ${item.owner ?? 'در گفت‌وگو مشخص شود'}${item.timing ? ` · ${item.timing}` : ''}<br>
      <strong>چطور نتیجه را بسنجیم؟</strong> · ${item.outcome ? escapeHtml(item.outcome) : item.measures.join('، ')}<br>
      <strong>برای اطمینان چه چیزی را بررسی کنیم؟</strong> · ${item.validation}</p>
    </li>`).join('')}</ol>` : '<p>با ثبت یک چالش کسب‌وکار، پیشنهادهای این بخش شکل می‌گیرد.</p>'}
  </section>`;
}

const phaseTitles = ['۳۰ روز اول | بررسی و شروع کار','روز ۳۱ تا ۹۰ | آماده کردن و امتحان راه‌حل','بعد از روز ۹۰ | اجرای کامل و بررسی نتیجه'];

function reportMarkup() {
  const solutions = linkedSolutions();
  const linked = linkedAreas();
  const ranked = recommendations().filter(({section}) => !linked.has(section.id));
  const unfinished = guidedPath().find((section) => {
    const count = progress(section);
    return count && count[0] < count[1];
  });
  const deferred = currentStages.filter((section) => {
    if (section.id !== 'specific') return false;
    const value = draft.assessment[section.id];
    return processState(section) !== 7 && (!value || value.need === undefined || value.need === 3);
  });
  const phaseItems = (phase) => ranked.filter((item) => item.phase === phase).map(({section,value}) => {
    const prepare = value.readiness === 2 || value.readiness === 3 || value.readiness === undefined;
    const action = phase === 0 ? (prepare ? 'بررسی مسئله، مشخص کردن مسئول و جمع‌کردن اطلاعات و امکانات لازم' : 'ثبت وضعیت امروز و شروع یک کار کوچک برای حل مشکل')
      : phase === 1 ? 'آماده کردن راه‌حل با تیم و امتحان کردن آن' : 'برنامه‌ریزی برای اجرای کامل، آموزش تیم و بررسی نتیجه';
    return `<li><strong>${section.service}</strong> · ${action}<br>مسئول پیشنهادی: ${ownership[value.owner] ?? 'نیازمند تعیین'}<br>نتیجه‌ای که تحویل می‌دهیم: ${section.deliverable}</li>`;
  });
  return `<p class="help"><strong>${organizations[state.current][0]}</strong>${draft.profile.role !== undefined ? ` · ${roles[draft.profile.role]}` : ''}${draft.profile.unit ? ` · ${escapeHtml(draft.profile.unit)}` : ''}${draft.profile.period ? ` · ${escapeHtml(draft.profile.period)}` : ''}</p>
    <p class="note">این نتیجه بر اساس پاسخ‌های همین واحد یا شرکت است. در جلسه بعد، پاسخ‌های ستاد و شرکت‌ها را کنار هم می‌گذاریم و درباره کارهای بعدی تصمیم می‌گیریم.</p>
    <section class="report-share no-print" aria-labelledby="share-title">
      <span class="form-sticker" aria-hidden="true">📄</span>
      <div>
        <h3 id="share-title">فایل پاسخ‌ها برای ارسال به مشاور</h3>
        <p>${unfinished ? 'بعضی سؤال‌های اصلی هنوز بی‌پاسخ‌اند. می‌توانید ادامه دهید یا همین پاسخ‌ها را دریافت کنید.' : 'همه سؤال‌های اصلی پاسخ داده شده‌اند. فایل را دریافت کنید.'}</p>
        <div class="report-tools">
          <button type="button" class="primary" data-action="download">دانلود فایل پاسخ‌ها</button>
          <button type="button" data-action="print">چاپ یا ذخیره PDF</button>
          ${unfinished ? `<button type="button" data-step="${unfinished.id}">ادامه تکمیل</button>` : ''}
        </div>
      </div>
    </section>
    ${solutionsMarkup(solutions)}
    ${signalsSummary()}
    ${diagnosisSummary()}
    <section class="report-block"><h3>سایر درخواست‌های کمک</h3>
      ${ranked.length ? `<div class="table-scroll"><table role="table"><thead role="rowgroup"><tr role="row">${reportHeaders.map((label) => `<th role="columnheader" scope="col">${label}</th>`).join('')}</tr></thead><tbody role="rowgroup">
      ${ranked.map(({section,value,score}) => `<tr role="row">${[section.title,need[value.need],impact[value.impact] ?? 'ثبت نشده',urgency[value.urgency] ?? 'ثبت نشده',ownership[value.owner] ?? 'تعیین نشده',score === null ? 'نیاز به بررسی' : fa(score)].map((cell,index) =>
        `<td role="cell" data-label="${reportHeaders[index]}">${cell}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      <p class="muted">امتیاز بین ۳ و ۱۲ است. اثر مشکل روی کار دو برابر زمان شروع وزن دارد. اگر دو امتیاز برابر باشند، کاری که زودتر باید شروع شود بالاتر می‌آید.</p>` : '<p>هنوز کاری برای شروع مشخص نکرده‌اید.</p>'}
      ${deferred.length ? `<p><strong>برای تصمیم‌گیری هنوز اطلاعات بیشتری لازم است:</strong> ${deferred.map((section) => section.title).join('، ')}</p>` : ''}
    </section>
    <section class="report-block"><h3>زمان‌بندی پیشنهادی برای سایر درخواست‌ها</h3>
      ${[0,1,2].map((phase) => {
        const items = phaseItems(phase);
        return `<h4>${phaseTitles[phase]}</h4>${items.length ? `<ul>${items.join('')}</ul>` : '<p class="muted">با اطلاعات فعلی اقدامی برای این بازه پیشنهاد نشده است.</p>'}`;
      }).join('')}
      ${ranked.some(({score}) => score === null) ? '<p>کارهایی که اثر یا زمان شروعشان روشن نیست، در جلسه بعد بررسی می‌شوند.</p>' : ''}
    </section>
    <details class="report-block" id="full-report"><summary>همه پاسخ‌ها و مثال‌های شما</summary>
      ${navigation.filter((section) => section.questions).map((section) => `<h4>${section.title}</h4>
        <ul>${allQuestions(section).filter(answered).map((q) => {
          const value = draft.answers[q[0]];
          const selections = value.selected.map((index) => labels(q)[index]).join('، ');
          return `<li><strong>${q[1]}</strong><br>${selections || '—'}${value.comment.trim() ? `<div class="report-detail">${escapeHtml(value.comment)}</div>` : ''}</li>`;
        }).join('') || '<li>پاسخی ثبت نشده است.</li>'}
        ${currentStages.includes(section) && processState(section) !== 7 ? assessFields.filter(([field]) => draft.assessment[section.id]?.[field] !== undefined).map(([field,label,choices]) =>
          `<li><strong>${label}</strong> · ${choices[draft.assessment[section.id][field]]}</li>`).join('') : ''}
        ${processState(section) !== 7 && draft.assessment[section.id]?.note?.trim() ? `<li class="report-detail"><strong>نتیجه دلخواه</strong><br>${escapeHtml(draft.assessment[section.id].note)}</li>` : ''}
        </ul>`).join('')}
    </details>`;
}

function render(focus = false) {
  const section = navigation.find((entry) => entry.id === step);
  const path = guidedPath();
  const index = path.indexOf(section);
  let body;
  if (step === 'profile') body = profileMarkup();
  else if (step === 'report') body = reportMarkup();
  else if (step === 'business') body = businessMarkup();
  else if (step === 'catalog') body = catalogMarkup();
  else if (diagnosis[step]) body = `<p class="help">اول بگویید کار الان چطور انجام می‌شود. بعد مشکل‌هایی را که واقعاً می‌بینید انتخاب کنید.</p>
    ${diagnosisMarkup(section)}`;
  else body = `<p class="help">${step === 'specific' ? organizations[state.current][1] : step === 'signals' ? 'از نتیجه کار شرکت، دغدغه‌های کارکنان و راه شنیدن نظرشان شروع کنیم.' : step === 'planning' ? 'بگویید دوست دارید با چه نتیجه‌ای شروع کنیم و مشاور کجا کمک کند.' : 'آنچه در ستاد یا شرکت خودتان می‌بینید انتخاب کنید.'}</p>
    ${section.questions.map(questionMarkup).join('')}
    ${currentStages.includes(section) ? assessmentMarkup(section) : ''}`;
  $('panel').innerHTML = `${index >= 0 ? `<p class="step-kicker">بخش ${fa(index + 1)} از ${fa(path.length)}${section.level ? ` · ${section.level}` : ''}</p>` : ''}
    <h2 id="step-title" tabindex="-1">${section.title}</h2>${body}
    <div class="actions no-print">${index < 0 ? `<button type="button" data-step="${step === 'catalog' ? 'business' : 'catalog'}">${step === 'catalog' ? 'بازگشت به اولویت‌ها' : 'بازگشت به همه حوزه‌ها'}</button>`
      : index > 0 ? `<button type="button" data-step="${path[index-1].id}">بخش قبل</button>` : '<span></span>'}
    ${index >= 0 && index < path.length - 1 ? `<button type="button" class="primary" data-step="${path[index+1].id}">${path[index+1].id === 'report' ? 'مرور پاسخ‌ها و نقشه راه' : 'بخش بعد'}</button>`
      : step === 'report' ? '<button type="button" data-step="profile">بازگشت به اطلاعات شرکت</button>' : '<button type="button" data-step="report">مرور و نقشه راه</button>'}</div>`;
  updateNavigation(true);
  if (focus) {
    $('step-title').focus({preventScroll:true});
    $('panel').scrollIntoView({block:'start'});
  }
}

function download() {
  const payload = {
    version:3, exportedAt:new Date().toISOString(), organization:state.current, organizationName:organizations[state.current][0],
    profile:{...draft.profile, roleLabel:roles[draft.profile.role]},
    linkedSolutions:linkedSolutions(),
    sections:navigation.filter((section) => section.questions).map((section) => ({
      id:section.id, title:section.title, level:section.level,
      questions:allQuestions(section).map((q) => ({
        id:q[0], question:q[1], selected:(draft.answers[q[0]]?.selected || []).map((i) => labels(q)[i]),
        comment:draft.answers[q[0]]?.comment || '',
      })),
      assessment:processState(section) !== 7 && draft.assessment[section.id] ? {
        ...Object.fromEntries(assessFields.map(([field,,choices]) => [field,choices[draft.assessment[section.id][field]]])),
        note:draft.assessment[section.id].note || '',
      } : undefined,
    })),
    diagnosis:currentStages.filter((section) => diagnosis[section.id] && processState(section) !== undefined).map((section) => ({
      area:section.id, status:processState(section), current:processStates[processState(section)],
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
  if (target.dataset.field === 'evidence' && target.dataset.case !== undefined) {
    draft.priorities[target.dataset.case].evidence = target.value;
  } else if (target.dataset.comment) response(target.dataset.comment).comment = target.value;
  else if (target.hasAttribute('data-assess-note')) (draft.assessment[step] ??= {}).note = target.value;
  else if (target.dataset.profile && target.type === 'text') draft.profile[target.dataset.profile] = target.value;
  else return;
  save();
  updateNavigation();
});

$('panel').addEventListener('change', ({target}) => {
  if (target.dataset.case !== undefined && target.tagName === 'SELECT') {
    const {case:slot,field} = target.dataset;
    const value = target.value === '' ? undefined : target.value;
    draft.priorities ??= [];
    const item = draft.priorities[slot] ??= {};
    if (field === 'business') {
      item.business = value;
      if (!value) draft.priorities[slot] = {};
      else if (!businessCases[value].factors.includes(item.factor) && !['outside','uncertain'].includes(item.factor)) {
        delete item.factor;
        delete item.area;
        delete item.owner;
      }
    } else if (field === 'factor') {
      item.factor = value;
      if (!availableAreas(item).includes(item.area)) {
        delete item.area;
        delete item.owner;
      }
    } else if (field === 'area') {
      item.area = value;
      delete item.owner;
    } else {
      item[field] = value === undefined ? undefined : Number(value);
    }
    render();
    $('panel').querySelector(`select[data-case="${slot}"][data-field="${field}"]`)?.focus({preventScroll:true});
  } else if (target.id === 'organization') {
    state.current = target.value;
    useOrganization();
    render();
    $('organization').focus();
  } else if (target.dataset.profile && target.tagName === 'SELECT') {
    draft.profile[target.dataset.profile] = target.value === '' ? undefined : Number(target.value);
  } else if (target.hasAttribute('data-process')) {
    const status = target.value === '' ? undefined : Number(target.value);
    response(`state-${step}`).selected = status === undefined ? [] : [status];
    $('process-current').textContent = processStates[status] ?? 'یک گزینه که به وضع فعلی نزدیک‌تر است انتخاب کنید.';
    $('diagnosis-details').hidden = status === 7;
    $('panel').querySelector(`[data-question-title="problem-${step}"]`).textContent = symptomPrompt(status);
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
    const q = allQuestions(navigation.find((section) => section.id === step)).find((question) => question[0] === id);
    const index = Number(target.value);
    const exclusive = (i) => i > q[2].length;
    const value = response(id);
    if (!target.checked) value.selected = value.selected.filter((i) => i !== index);
    else if (q[4] === 1 || exclusive(index)) value.selected = [index];
    else value.selected = [...value.selected.filter((i) => !exclusive(i)),index].slice(0,q[4]);
    const maxReached = q[4] > 1 && value.selected.filter((i) => !exclusive(i)).length >= q[4];
    $('limit-' + id).textContent = selectionHint(q[4],value.selected.length,maxReached);
    if (target.checked && index === q[2].length) {
      $('panel').querySelector(`[data-comment="${id}"]`).closest('details').open = true;
    }
    $('panel').querySelectorAll(`[data-q="${id}"]`).forEach((input) => {
      input.checked = value.selected.includes(Number(input.value));
      input.disabled = input.type === 'checkbox' && !input.checked && !exclusive(Number(input.value)) && maxReached;
    });
  } else return;
  save();
  updateNavigation();
});

function goTo(section) {
  step = section;
  draft.lastStep = section;
  $('toggle-steps').setAttribute('aria-expanded','false');
  save();
  render(true);
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.step) {
    goTo(button.dataset.step);
  } else if (button.id === 'start') {
    goTo(navigation.some((section) => section.id === draft.lastStep) ? draft.lastStep : 'profile');
  } else if (button.id === 'toggle-steps') {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
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
