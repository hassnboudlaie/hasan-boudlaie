'use strict';
(function alborzFacilitatorTimer(){
  const params=new URLSearchParams(location.search);
  if(params.get('classroom')!=='1'||!params.has('teacher')||!window.AlborzLive)return;
  const KEY='alborz-facilitator-countdown-v1';
  const fa=n=>String(n).replace(/[0-9]/g,c=>'۰۱۲۳۴۵۶۷۸۹'[Number(c)]);
  const pad=n=>String(Math.max(0,n)).padStart(2,'0');
  const clamp=n=>Math.max(60,Math.min(90*60,Math.round(Number(n)||300)));
  const fmt=sec=>fa(pad(Math.floor(sec/60))+':'+pad(sec%60));
  const defaults={duration:300,remaining:300,endAt:null,running:false,finished:false,sound:true,expanded:false};
  let state={...defaults},host=null,interval=null,audio=null,lastStatus='',lastSeconds=null;
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'null');
    if(saved&&typeof saved==='object'&&Number.isFinite(saved.duration)&&Number.isFinite(saved.remaining)){
      const duration=clamp(saved.duration);
      state={...defaults,duration,remaining:Math.max(0,Math.min(duration,Math.round(saved.remaining))),endAt:typeof saved.endAt==='number'?saved.endAt:null,running:!!saved.running&&typeof saved.endAt==='number',finished:!!saved.finished,sound:saved.sound!==false};
    }
  }catch{}
  function seconds(){
    return state.running&&state.endAt!==null?Math.max(0,Math.ceil((state.endAt-Date.now())/1000)):state.remaining;
  }
  function save(){
    try{const {duration,remaining,endAt,running,finished,sound}=state;localStorage.setItem(KEY,JSON.stringify({duration,remaining,endAt,running,finished,sound}));}catch{}
  }
  function prepareSound(){
    if(!state.sound)return;
    try{const AudioClass=window.AudioContext||window.webkitAudioContext;if(!audio&&AudioClass)audio=new AudioClass();if(audio&&audio.state==='suspended')audio.resume().catch(()=>{});}catch{}
  }
  function beep(){
    if(!state.sound||!audio||audio.state!=='running')return;
    try{
      const now=audio.currentTime;
      for(let i=0;i<3;i++){
        const osc=audio.createOscillator(),gain=audio.createGain(),t=now+i*.27;
        osc.type='sine';osc.frequency.setValueAtTime(i===2?740:590,t);
        gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.14,t+.025);gain.gain.exponentialRampToValueAtTime(.0001,t+.17);
        osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.19);
      }
    }catch{}
  }
  function finish(){
    if(state.finished)return;
    state.running=false;state.remaining=0;state.endAt=null;state.finished=true;save();beep();lastSeconds=null;
  }
  function tick(){
    if(state.running&&state.endAt!==null&&Date.now()>=state.endAt)finish();
    if(!host)return;
    const val=seconds(),phase=state.finished?'پایان زمان':state.running?'در حال شمارش':val===state.duration?'آماده شروع':'مکث';
    if(lastSeconds!==val){
      for(const el of host.querySelectorAll('[data-timer-readout]'))el.textContent=fmt(val);
      host.querySelector('[data-timer-compact]')?.setAttribute('aria-label','تایمر کلاس؛ '+fmt(val));
      lastSeconds=val;
    }
    host.classList.toggle('timer-finished',state.finished);
    host.classList.toggle('timer-running',state.running);
    host.classList.toggle('timer-expanded',state.expanded);
    host.setAttribute('data-timer-phase',state.finished?'finished':state.running?'running':'paused');
    const status=host.querySelector('#alborz-timer-status');
    if(status&&lastStatus!==phase){status.textContent=phase;lastStatus=phase;}
    const start=host.querySelector('[data-timer-action="toggle"]');
    if(start)start.textContent=state.running?'توقف موقت':state.finished?'شروع دوباره':val===state.duration?'شروع شمارش':'ادامه شمارش';
    const toggle=host.querySelector('[data-timer-action="sound"]');
    if(toggle){toggle.textContent=state.sound?'صدا: روشن':'صدا: خاموش';toggle.setAttribute('aria-pressed',String(state.sound));}
    for(const b of host.querySelectorAll('[data-timer-preset]'))b.setAttribute('aria-pressed',String(state.duration===Number(b.dataset.timerPreset)));
    const progress=host.querySelector('[data-timer-progress]');
    if(progress){progress.max=state.duration;progress.value=val;}
    const hint=host.querySelector('#alborz-timer-done');
    if(hint)hint.hidden=!state.finished;
  }
  function preset(value){
    state.duration=clamp(value);state.remaining=state.duration;state.running=false;state.endAt=null;state.finished=false;
    save();tick();
  }
  function toggle(){
    if(state.running){
      state.remaining=seconds();state.running=false;state.endAt=null;
    }else{
      if(state.finished||state.remaining===0){state.remaining=state.duration;state.finished=false;}
      state.endAt=Date.now()+state.remaining*1000;state.running=true;prepareSound();
    }
    save();tick();
  }
  function reset(){state.remaining=state.duration;state.running=false;state.finished=false;state.endAt=null;save();tick();}
  function expand(on){
    state.expanded=on;host.classList.toggle('timer-expanded',on);
    const panel=host.querySelector('#alborz-timer-panel');
    if(panel)panel.hidden=!on;
    const compact=host.querySelector('[data-timer-compact]');
    if(compact)compact.setAttribute('aria-expanded',String(on));
    host.querySelector('[data-timer-action="close"]')?.focus({preventScroll:true});
    tick();
  }
  function render(){
    if(host)return;
    host=document.createElement('aside');
    host.id='alborz-facilitator-timer';
    host.className='alborz-facilitator-timer';
    host.dir='rtl';
    host.setAttribute('aria-label','تایمر مدرس برای تمرین و مونولوگ');
    host.innerHTML=`
      <button type="button" class="timer-launch" data-timer-compact aria-controls="alborz-timer-panel" aria-expanded="false" title="تایمر مونولوگ و تمرین کلاسی">
        <span class="timer-launch-icon" aria-hidden="true">⏱</span><strong>تایمر</strong><b dir="ltr" data-timer-readout>۰۵:۰۰</b>
      </button>
      <div class="timer-panel" id="alborz-timer-panel" hidden role="dialog" aria-modal="false" aria-label="تایمر کلاسی">
        <header class="timer-head"><div><small>ابزار مدرس · در تمام گام‌ها</small><h2>⏱ تایمر مونولوگ و گفت‌وگو</h2></div><button type="button" data-timer-action="close" class="timer-close" aria-label="بستن پنل تایمر">×</button></header>
        <p class="timer-instruction">زمان را تعیین کنید و «شروع شمارش» را بزنید. تایمر با جابه‌جایی گام یا تازه‌سازی صفحه ادامه می‌یابد.</p>
        <div class="timer-presets" aria-label="زمان‌های آماده">
          <button type="button" data-timer-preset="60">۱ دقیقه</button>
          <button type="button" data-timer-preset="180">۳ دقیقه</button>
          <button type="button" data-timer-preset="300">۵ دقیقه</button>
          <button type="button" data-timer-preset="600">۱۰ دقیقه</button>
        </div>
        <form class="timer-custom" id="alborz-timer-custom"><label for="alborz-timer-minutes">زمان دلخواه (دقیقه)</label><input id="alborz-timer-minutes" type="number" min="1" max="90" step="1" inputmode="numeric" value="5" required><button type="submit">تنظیم زمان</button></form>
        <div class="timer-clock" data-timer-clock><span dir="ltr" data-timer-readout>۰۵:۰۰</span><small id="alborz-timer-status" aria-live="polite">آماده شروع</small></div>
        <progress data-timer-progress min="0" max="300" value="300" aria-label="زمان باقی‌مانده"></progress>
        <p id="alborz-timer-done" role="status" hidden>زمان تمام شد! وقت جمع‌بندی و ارائه گروه‌هاست.</p>
        <div class="timer-actions"><button type="button" data-timer-action="toggle" class="timer-primary">شروع شمارش</button><button type="button" data-timer-action="reset">از ابتدا</button><button type="button" data-timer-action="sound" aria-pressed="true">صدا: روشن</button></div>
        <p class="timer-note">فقط برای مدرس است؛ هیچ تغییری در پاسخ‌ها، گروه‌بندی یا مراحل کارگاه ایجاد نمی‌کند.</p>
      </div>`;
    document.body.appendChild(host);
    host.addEventListener('click',e=>{
      const button=e.target.closest('button');if(!button)return;
      if(button.matches('[data-timer-compact]')){expand(!state.expanded);return;}
      if(button.dataset.timerPreset){preset(button.dataset.timerPreset);const input=host.querySelector('#alborz-timer-minutes');if(input)input.value=Math.round(state.duration/60);return;}
      if(button.dataset.timerAction==='close'){expand(false);host.querySelector('[data-timer-compact]')?.focus();return;}
      if(button.dataset.timerAction==='toggle'){toggle();return;}
      if(button.dataset.timerAction==='reset'){reset();return;}
      if(button.dataset.timerAction==='sound'){state.sound=!state.sound;if(state.sound)prepareSound();save();tick();}
    });
    host.querySelector('#alborz-timer-custom')?.addEventListener('submit',e=>{
      e.preventDefault();const input=host.querySelector('#alborz-timer-minutes'),val=Number(input?.value);
      if(!Number.isInteger(val)||val<1||val>90){input?.setCustomValidity('زمان باید بین ۱ تا ۹۰ دقیقه باشد.');input?.reportValidity();return;}
      input.setCustomValidity('');preset(val*60);
    });
    host.querySelector('#alborz-timer-minutes')?.addEventListener('input',e=>e.target.setCustomValidity(''));
    window.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.expanded)expand(false);});
    interval=setInterval(tick,250);
    document.addEventListener('visibilitychange',tick);
    tick();
  }
  function syncIdentity(){
    const authorized=window.AlborzLive.identity()?.role==='teacher';
    if(authorized)render();else if(host){host.remove();host=null;if(interval){clearInterval(interval);interval=null;}state.expanded=false;}
  }
  window.addEventListener('alborz:classroom-auth',syncIdentity);
  window.addEventListener('alborz:classroom-data',syncIdentity);
  window.AlborzFacilitatorTimer={getState:()=>({duration:state.duration,remaining:seconds(),running:state.running,finished:state.finished}),syncIdentity};
  syncIdentity();
})();
