(() => {
  "use strict";

  const api = "https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-participation";
  const key = "mba-ob-classroom-attendance-identity-v1";
  const controls = document.querySelector("#portfolioControls");
  const status = document.querySelector("#portfolioStatus");
  const content = document.querySelector("#portfolioContent");
  const digits = new Intl.NumberFormat("fa-IR", { useGrouping: false });
  const dates = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" });
  const date = value => value ? dates.format(new Date(value)) : "";
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  const quizStatus = {
    not_ready: "آزمون آماده نشده", unscheduled: "زمان آزمون تعیین نشده",
    upcoming: "هنوز شروع نشده", open: "باز برای پاسخ‌گویی", missed: "مهلت گذشته، ارسالی ثبت نشده",
    awaiting_release: "پاسخ‌ها ثبت شد، در انتظار انتشار نمره", graded: "ارزیابی‌شده",
  };
  const classroomStatus = {
    submitted: "ثبت‌شده", reviewed: "ارزیابی‌شده", revision_requested: "نیازمند بازبینی",
    pending: "در انتظار تأیید", approved: "تأییدشده", rejected: "تأیید نشده",
  };
  const teacherOnly = '<a class="btn" href="./index.html">بازگشت به کلاس</a>';
  let teacher = false;
  let generation = 0;

  async function call(action, studentId) {
    let token;
    try { token = JSON.parse(localStorage.getItem(key) || "null")?.token; } catch {}
    if (!token) throw Error("session_expired");
    const response = await fetch(api, {
      method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(16000), body: JSON.stringify({
        action, token, ...(studentId ? { student_id: studentId } : {}),
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw Error(payload.error || "server_error");
    return payload;
  }

  function message(error, retry) {
    const code = error?.message;
    status.textContent = "";
    if (code === "session_expired" || code === "forbidden") {
      content.innerHTML = '<section class="card"><p>' +
        (code === "forbidden" ? "این پرونده برای دانشجوی تأییدشده و مدرس کلاس در دسترس است." : "برای دیدن پرونده با حساب کلاس وارد شوید.") +
        '</p><a class="btn primary" href="./index.html?next=participation">ورود به کلاس</a></section>';
      return;
    }
    content.innerHTML = '<section class="card alert"><p>' +
      (code === "student_not_found" ? "پرونده این دانشجو در دسترس نیست." : "دریافت پرونده انجام نشد. دوباره تلاش کنید.") +
      '</p><button type="button" class="btn">تلاش مجدد</button></section>';
    content.querySelector("button").addEventListener("click", retry);
  }

  function quizRow(quiz) {
    const review = !teacher && ["graded", "open", "awaiting_release"].includes(quiz.status)
      ? '<a href="./index.html?session=' + quiz.session + '&amp;tab=finalQuiz">' +
        (quiz.status === "open" ? "رفتن به آزمون" : "مشاهده آزمون") + '</a>'
      : "";
    return '<div class="portfolio-session"><div class="portfolio-line"><strong>جلسه ' +
      digits.format(quiz.session) + '</strong><span>' +
      (quiz.score == null ? quizStatus[quiz.status] : digits.format(quiz.score) + ' از ۲۰ · ' +
        digits.format(quiz.correct_count) + ' پاسخ درست از ۱۰') +
      '</span></div>' + (quiz.submitted_at ? '<p class="portfolio-meta">ثبت نهایی ' + date(quiz.submitted_at) + '</p>' : '') +
      review + '</div>';
  }

  function group(label, items, render) {
    return '<details class="portfolio-details"><summary>' + label + ' (' + digits.format(items.length) +
      ')</summary>' + (items.length ? items.map(render).join("") : '<p class="portfolio-session">سابقه‌ای ثبت نشده است.</p>') +
      '</details>';
  }

  function classroomSection({ quizzes, attendance, assignments, cases }) {
    const current = quizzes.filter(quiz => !["not_ready", "unscheduled"].includes(quiz.status));
    const remaining = quizzes.filter(quiz => ["not_ready", "unscheduled"].includes(quiz.status));
    const work = [
      ...assignments.map(item => ({ ...item, label: item.kind === "case" ? "تکلیف کیس" : "تکلیف جلسه" })),
      ...cases.map(item => ({ ...item, label: "تحلیل ساختاریافته کیس" })),
    ].sort((a, b) => a.session_no - b.session_no);
    return '<section class="card" id="classroomHistory"><h2>فعالیت‌های کلاسی</h2><h3>آزمون‌های پایان جلسه</h3>' +
      (current.length ? current.map(quizRow).join("") : '<p>هنوز آزمون برنامه‌ریزی‌شده یا ارسالی ثبت نشده است.</p>') +
      (remaining.length ? group("جلسات بدون آزمون زمان‌بندی‌شده", remaining, quizRow) : "") +
      group("تکالیف و تحلیل کیس‌های کلاسی", work, item => '<article class="portfolio-record"><div class="portfolio-line"><strong>' +
        item.label + ' · جلسه ' + digits.format(item.session_no) + '</strong><span>' + classroomStatus[item.status] +
        (item.score == null ? '' : ' · ' + digits.format(item.score) + ' از ۲۰') + '</span></div><p class="portfolio-meta">ثبت ' +
        date(item.submitted_at) + '</p>' + (item.feedback ? '<p class="portfolio-copy">بازخورد مدرس · ' + escape(item.feedback) + '</p>' : '') + '</article>') +
      group("حضور و غیاب", [...attendance].sort((a, b) => a.session_no - b.session_no), item => '<div class="portfolio-session portfolio-line"><strong>جلسه ' +
        digits.format(item.session_no) + '</strong><span>' + classroomStatus[item.status] + ' · ' + date(item.checked_at) + '</span></div>') +
      '</section>';
  }

  function topicLink(topic) {
    return '<a href="./community.html#topic/' + encodeURIComponent(topic.id) + '">' + escape(topic.title) + '</a>';
  }

  function record(topic, label, timestamp, details = "") {
    return '<article class="portfolio-record"><div class="portfolio-line"><strong>' + topicLink(topic) + '</strong><span class="portfolio-meta">' +
      label + ' · ' + date(timestamp) + '</span></div>' + details + '</article>';
  }

  function communitySection({ topics, replies, votes, reviews }) {
    const owned = new Set(topics.map(topic => topic.id));
    const replyCounts = new Map();
    for (const reply of replies) replyCounts.set(reply.topic.id, (replyCounts.get(reply.topic.id) || 0) + 1);
    return '<section class="card" id="communityHistory"><h2>باشگاه اندیشه</h2>' +
      group("موضوع‌های ساخته‌شده و هدایت بحث", topics, topic => record(topic, topic.kind === "wiki" ? "دانشنامه" : "کیس مدیریتی",
        topic.created_at, '<p>' + digits.format(topic.invites) + ' دعوت · ' + digits.format(replyCounts.get(topic.id) || 0) +
        ' دیدگاه یا پاسخ در بحث خود · ' + (topic.summary ? 'جمع‌بندی ثبت شده' : 'جمع‌بندی ثبت نشده') +
        '</p>' + (topic.summary ? '<p class="portfolio-copy">' + escape(topic.summary) + '</p>' : ''))) +
      group("دیدگاه‌ها و پاسخ‌ها در موضوع‌های دیگران", replies.filter(reply => !owned.has(reply.topic.id)),
        reply => record(reply.topic, reply.parent_reply_id ? "پاسخ" : "دیدگاه", reply.created_at,
          '<p class="portfolio-copy">' + escape(reply.body) + '</p>')) +
      group("رأی‌های ثبت‌شده", votes, vote => record(vote.topic, "شرکت در نظرسنجی", vote.updated_at)) +
      group("نمره‌ها و بازخورد مدرس", reviews, review => record(review.topic, digits.format(review.score) + " از ۱۰", review.reviewed_at,
        review.feedback ? '<p class="portfolio-copy">' + escape(review.feedback) + '</p>' : '')) +
      '</section>';
  }

  function render(data) {
    status.textContent = "";
    content.innerHTML = '<header class="portfolio-header"><h2>' + escape(data.student.full_name) +
        '</h2>' + (teacher && data.student.student_number ? '<p>شماره دانشجویی <bdi>' + escape(data.student.student_number) + '</bdi></p>' : '') +
        '</header><nav class="portfolio-menu" aria-label="بخش‌های پرونده"><a class="btn" href="#classroomHistory">فعالیت‌های کلاسی</a>' +
        '<a class="btn" href="#communityHistory">باشگاه اندیشه</a></nav>' + classroomSection(data.classroom) + communitySection(data.community);
  }

  async function load(studentId) {
    const id = ++generation;
    content.innerHTML = "";
    status.textContent = "در حال دریافت پرونده…";
    try {
      const data = await call("portfolio", studentId);
      if (id !== generation) return;
      render(data);
    } catch (error) {
      if (id === generation) message(error, () => load(studentId));
    }
  }

  async function start() {
    status.textContent = "در حال بررسی دسترسی…";
    content.innerHTML = "";
    try {
      const data = await call("open");
      if (!data.students) { render(data); return; }
      const { students } = data;
      teacher = true;
      status.textContent = "";
      if (!students.length) {
        content.innerHTML = '<section class="card"><p>هنوز دانشجوی تأییدشده‌ای برای نمایش پرونده وجود ندارد.</p>' + teacherOnly + '</section>';
        return;
      }
      controls.innerHTML = '<form class="card portfolio-picker"><label class="field"><span>انتخاب دانشجو</span>' +
        '<select name="student" required><option value="">نام دانشجو را انتخاب کنید</option>' +
        students.map(student => '<option value="' + escape(student.id) + '">' + escape(student.full_name) +
          (student.student_number ? ' · ' + escape(student.student_number) : '') + '</option>').join("") +
        '</select></label><button class="btn primary" type="submit">مشاهده پرونده</button></form>';
      controls.querySelector("form").addEventListener("submit", event => {
        event.preventDefault();
        load(event.currentTarget.elements.student.value);
      });
    } catch (error) {
      message(error, start);
    }
  }
  start();
})();
