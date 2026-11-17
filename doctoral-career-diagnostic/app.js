'use strict';
/* Independent mentoring preparation tool: not an official University of Birmingham form. */
const API_URL = 'https://hxcjkewlaniahvuqwwbb.supabase.co/rest/v1/rpc/submit_mentoring_diagnostic';
const API_KEY = 'sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6';
const INVITE = new URLSearchParams(window.location.search).get('invite') || '';
const STORAGE = 'hb-doctoral-diagnostic-draft-v3';
const SUBMITTED = 'hb-doctoral-diagnostic-submitted-v1';
const q = (id,label,type,opts={}) => ({id,label,type,...opts});
const SECTIONS = [
 {id:'now',title:'Where you are now',subtitle:'Your PhD, your current work and the time you realistically have.',questions:[
  q('phd_stage','Where are you in your PhD research right now?','single',{required:true,options:['Designing or piloting my study','Collecting data','Analysing data','Writing chapters or papers','Working across several stages','None of the above'],hint:'We understand you are a second-year Management PhD student at Birmingham, with an expected 2028 completion.'}),
  q('available_time','How much time could you realistically dedicate to career development alongside work and your PhD?','single',{options:['1–2 hours per month','3–5 hours per month','1–2 hours per week','More than 2 hours per week','It varies / not sure','None of the above'],hint:'No ideal answer — we want a plan that fits your real life.'}),
  q('next_phd_priority','What is your main PhD priority for the next six months?','textarea',{placeholder:'One short sentence is enough.'}),
  q('work_context','What should I know about balancing your full-time role in Qatar and your studies?','textarea',{placeholder:'Share only what you feel comfortable discussing.'})
 ]},
 {id:'strengths',title:'Strengths & interests',subtitle:'Your own view is enough for our first conversation; no formal tests are needed.',questions:[
  q('self_strengths','Which strengths do you most recognise in yourself? Choose up to three.','multi',{required:true,max:3,options:['Research design','Survey research and data collection','Analysing and interpreting findings','Critical reading and writing','Teaching or presenting','Working with people and stakeholders','Organising and leading projects','None of the above']}),
  q('energizers','Which activities give you the most energy? Choose up to three.','multi',{max:3,options:['Exploring research ideas','Teaching and explaining concepts','Writing and publishing','Working with data','Collaborating with other researchers','Solving real organisational problems','Designing research projects','None of the above']}),
  q('career_values','What matters most to you about academic work right now?','single',{options:['Research and discovery','Teaching and student development','Combining teaching and research','Research with practical or policy impact','I am still exploring','None of the above'],hint:'Choose the one that resonates most; this can change as your career develops.'}),
  q('research_interests','Which themes would you like to develop beyond your PhD? Choose up to three.','multi',{max:3,options:['Entrepreneurial fraud and business ethics','Institutions and governance','Signalling, reputation and trust','Behavioural ethics and moral disengagement','Technology and entrepreneurship','Public policy and management','I would like to explore further','None of the above']})
 ]},
 {id:'readiness',title:'Research & career readiness',subtitle:'A simple picture of what you already bring and what you would like to grow.',questions:[
  q('qatar_experience','From your six years of survey research at Qatar University, what experience would you most like to build on?','textarea',{placeholder:'A few words about methods, skills or projects are enough. No confidential details.'}),
  q('publication_stage','Where are you with academic publications?','single',{options:['Not writing a paper yet','Preparing a draft','One or more manuscripts submitted','One or more publications completed','Several different stages at once','None of the above']}),
  q('teaching_experience','What is your teaching experience so far?','single',{options:['Taught university courses','Assisted teaching / led workshops','Presented research but not taught courses','No formal teaching experience yet','None of the above']}),
  q('development_gaps','Where would support make the greatest difference now? Choose up to three.','multi',{max:3,options:['Time and focus','Clarifying original research contribution','Academic writing and publishing','Teaching confidence and practice','Academic network and collaborators','Understanding academic job opportunities','Planning the transition from government work','None of the above']})
 ]},
 {id:'future',title:'Your three-year direction',subtitle:'An aspiration, not a rigid commitment. We will shape the steps together.',questions:[
  q('target_role','What kind of role would you most like to explore after your PhD?','single',{required:true,options:['Academic role combining teaching and research','Research-focused position or postdoc','Teaching-focused lecturer','Research institute or policy research','Gradual transition combining academic and current work','I am not sure yet','None of the above']}),
  q('geography','Where would you consider pursuing an academic career?','multi',{options:['Qatar','Other Gulf countries','United Kingdom','Other countries','Open to several places','Not sure yet','None of the above']}),
  q('constraints','Which factors should our career plan take into account? Choose up to three.','multi',{max:3,options:['PhD completion and workload','Full-time job commitments','Financial or job security','Family or location preferences','Publication / teaching requirements','Academic employment opportunities','Prefer not to say','None of the above']}),
  q('three_year_vision','Imagine it is the end of 2029. What would a fulfilling career look like for you?','textarea',{required:true,placeholder:'Describe it in your own words — the kind of work, impact and lifestyle you would value.'}),
  q('near_term_step','What is one realistic step you could take in 2027 towards that future?','textarea',{placeholder:'For example: one paper, some teaching practice, a conference, an academic CV or a new connection.'})
 ]},
 {id:'mentoring',title:'Our mentoring journey',subtitle:'Our official mentoring relationship is six months. You choose what matters most.',questions:[
  q('mentoring_priorities','What would you most like us to focus on? Choose up to three.','multi',{required:true,max:3,options:['Research productivity and writing','Critical thinking and originality','Research identity and specialisation','Teaching readiness','Academic career options','Government-to-academia transition','Academic networking','Confidence, choices and accountability','None of the above']}),
  q('six_month_value','What would make our six months together worthwhile for you?','textarea',{required:true,placeholder:'One or two specific outcomes are enough.'}),
  q('mentoring_style','How would you prefer me to support you?','single',{options:['Ask thoughtful questions and help me reflect','Share practical advice and examples','Offer direct and constructive feedback','A mix of these approaches','None of the above']}),
  q('first_conversation','What would you most like to discuss in our first meeting?','textarea',{placeholder:'One question or situation you would like to explore.'})
 ]}
];
const NONE_OPTION = 'None of the above';
const OPTION_DESCRIPTIONS = {
 "phd_stage": [
  "Creating or trialling the research approach, questions or vignette scenarios.",
  "Gathering responses or other evidence for the doctoral study.",
  "Interpreting collected data and developing findings.",
  "Drafting thesis chapters, conference papers or journal articles.",
  "Working on more than one of these activities at the same time."
 ],
 "available_time": [
  "A small amount of time alongside your existing PhD and full-time role.",
  "Time for a few focused career-development activities each month.",
  "Enough time for one or two regular activities or conversations each week.",
  "A greater weekly commitment, if your circumstances allow it.",
  "Your availability changes with work, study or other commitments."
 ],
 "self_strengths": [
  "Structuring research questions, methods and study designs.",
  "Designing surveys, recruiting participants or collecting responses.",
  "Making sense of data and communicating useful findings.",
  "Evaluating literature, developing arguments or drafting research text.",
  "Explaining ideas clearly to students, colleagues or audiences.",
  "Building relationships and coordinating with diverse people.",
  "Planning, organising and delivering work or research projects."
 ],
 "energizers": [
  "Discovering new questions, theories and possible research directions.",
  "Helping others understand an idea or develop a new skill.",
  "Turning thinking and evidence into a written academic contribution.",
  "Working through evidence, patterns and analysis.",
  "Learning with others and building research partnerships.",
  "Applying research to practical management or policy challenges.",
  "Planning studies, instruments, questions or research procedures."
 ],
 "career_values": [
  "Discovering ideas, investigating questions and adding to knowledge.",
  "Helping students learn and building confidence as an educator.",
  "Making meaningful contributions to both scholarly work and teaching.",
  "Producing insights useful for organisations, communities or policymakers.",
  "Taking time to learn which activities and roles fit you best."
 ],
 "research_interests": [
  "Research on questionable practices, ethics or misconduct in ventures.",
  "How formal and informal institutions shape organisational behaviour.",
  "How actors communicate credibility, legitimacy and trust.",
  "How people justify unethical decisions or disengage moral concerns.",
  "How digital tools and innovation influence entrepreneurial behaviour.",
  "How organisations, public systems and management decisions interact.",
  "You would like time to discover additional topics beyond the thesis."
 ],
 "publication_stage": [
  "Your priority is currently research development rather than a manuscript.",
  "You are writing or revising a paper that has not yet been submitted.",
  "At least one manuscript is with a journal or conference for review.",
  "You have a published or accepted article, chapter or similar output.",
  "You have drafts, submitted papers or completed outputs at different stages."
 ],
 "teaching_experience": [
  "You have personally delivered university lectures, seminars or courses.",
  "You have supported formal teaching or delivered structured workshops.",
  "You have spoken at conferences or research events but not taught courses.",
  "You have not yet had an opportunity for formal teaching."
 ],
 "development_gaps": [
  "Making space for priorities while balancing employment and the PhD.",
  "Making the distinct research contribution clearer.",
  "Moving from research analysis or notes to publishable writing.",
  "Building experience and comfort in teaching in higher education.",
  "Connecting with researchers, mentors and possible collaborators.",
  "Understanding roles, recruitment requirements and academic pathways.",
  "Planning practical steps for moving from public-sector work to academia."
 ],
 "target_role": [
  "A university role with a substantial mix of teaching and scholarship.",
  "A postdoctoral or other research-led role to develop publications and expertise.",
  "A lecturer or educator role with teaching as its main focus.",
  "Applied research work in an institute, centre or policy-focused team.",
  "Beginning academic work while continuing some professional employment.",
  "You want to explore the available roles before deciding."
 ],
 "geography": [
  "Roles within Qatar, where you currently work.",
  "Other countries in the Gulf region, subject to role and personal fit.",
  "Academic opportunities at universities in the United Kingdom.",
  "International destinations not covered by the options above.",
  "You are flexible about location if the role is a strong match.",
  "You prefer to explore opportunities before deciding where."
 ],
 "constraints": [
  "Your doctoral milestones or workload may affect timing.",
  "You may need to balance academic steps with your current government role.",
  "Maintaining financial stability or dependable employment matters to you.",
  "Where you live, family preferences or relocation feasibility matter.",
  "Research or teaching requirements may need further development.",
  "Availability of suitable academic vacancies could shape your choices.",
  "You would rather discuss any constraints privately in conversation."
 ],
 "mentoring_priorities": [
  "Protecting focused time and converting research into written outputs.",
  "Testing assumptions and clarifying what your research adds.",
  "Developing a coherent set of scholarly interests beyond your PhD.",
  "Building teaching confidence, experience and an academic portfolio.",
  "Understanding academic positions and how to become ready for them.",
  "Mapping a realistic route from your current employment into academia.",
  "Developing professional connections and research partnerships.",
  "Reflecting on decisions and following through on agreed next steps."
 ],
 "mentoring_style": [
  "Support through reflection and questions rather than immediate advice.",
  "Learn from examples, options and practical guidance.",
  "Receive candid feedback while keeping ownership of decisions.",
  "Combine reflection, examples and feedback as the topic requires."
 ]
};
const NONE_DESCRIPTION = 'Choose this if none of the listed options feels accurate. You can describe your own situation below.';

let answers = {};
let current = 0;
let completedRef = '';
let consent = false;
const byId = id => document.getElementById(id);
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function hasAnswer(v){return Array.isArray(v)?v.length>0:(v!==null && v!==undefined && String(v).trim()!=='');}
function allQuestions(){return SECTIONS.flatMap(s=>s.questions);}
function textValue(v){return Array.isArray(v)?v.join(', '):String(v==null?'':v);}
function load(){
 try{const d=JSON.parse(localStorage.getItem(STORAGE)||'{}');if(d && d.answers && typeof d.answers==='object') answers=d.answers;}catch(_){}
 try{const s=JSON.parse(localStorage.getItem(SUBMITTED)||'null');if(s && s.ref)completedRef=s.ref;}catch(_){}
}
function save(manual){
 try{localStorage.setItem(STORAGE,JSON.stringify({answers,version:3,savedAt:new Date().toISOString()}));byId('saveState').textContent=manual?'Draft saved on this device':'Saved on this device';}
 catch(_){byId('saveState').textContent='Storage unavailable — download a backup';}
}
function countAnswered(s){return s.questions.filter(x=>hasAnswer(answers[x.id])).length;}
function totalAnswered(){return allQuestions().filter(x=>hasAnswer(answers[x.id])).length;}
function percent(){return Math.round((current/SECTIONS.length)*100);}
function updateProgress(){
 const value=percent();
 byId('completion').textContent='Section '+Math.min(current+1,SECTIONS.length)+' / '+SECTIONS.length+' · '+totalAnswered()+' reflections captured';
 byId('progressFill').style.width=value+'%';
 document.querySelector('.progress-track').setAttribute('aria-valuenow',value);
}
function updateSteps(){
 byId('steps').innerHTML=SECTIONS.map((s,i)=>{
  const active=current===i?' active':'';
  const done=countAnswered(s)>0 && s.questions.filter(x=>x.required).every(x=>hasAnswer(answers[x.id]))?' done':'';
  return '<button type="button" class="step-link'+active+done+'" data-jump="'+i+'" '+(active?'aria-current="step"':'')+'><span class="step-no">'+(i+1)+'</span>'+esc(s.title)+'</button>';
 }).join('')+'<button type="button" class="step-link'+(current===SECTIONS.length?' active':'')+'" data-jump="'+SECTIONS.length+'"><span class="step-no">✓</span>Review & submit</button>';
}
function isNoneSelected(question){
 const value=answers[question.id];
 return Array.isArray(value)?value.includes(NONE_OPTION):value===NONE_OPTION;
}
function otherKey(id){return id+'__none_detail';}
function answerDisplay(question){
 if(!hasAnswer(answers[question.id]))return '';
 const value=textValue(answers[question.id]);
 const detail=isNoneSelected(question)?String(answers[otherKey(question.id)]||'').trim():'';
 return detail?value+' — '+detail:value;
}
function choices(question,multi){
 const val=answers[question.id];
 const texts=OPTION_DESCRIPTIONS[question.id]||[];
 const options=question.options;
 const name='answer-'+question.id;
 const body=options.map((o,i)=>{
  const selected=multi?(Array.isArray(val)&&val.includes(o)):val===o;
  const desc=o===NONE_OPTION?NONE_DESCRIPTION:texts[i];
  if(!desc)throw new Error('No description for '+question.id+': '+o);
  return '<label class="choice-label'+(selected?' selected':'')+(o===NONE_OPTION?' none-choice':'')+'"><input type="'+(multi?'checkbox':'radio')+'" data-question="'+esc(question.id)+'" name="'+esc(name)+'" value="'+esc(o)+'" '+(selected?'checked':'')+'><span class="choice-copy"><strong>'+esc(o)+'</strong><small>'+esc(desc)+'</small></span></label>';
 }).join('');
 const active=isNoneSelected(question);
 const detail='<div class="none-detail" id="detail-wrap-'+esc(question.id)+'" '+(active?'':'hidden')+'><label for="other-'+esc(question.id)+'">Tell us what fits you better <span class="required">Required when selected</span></label><textarea rows="2" id="other-'+esc(question.id)+'" data-none-detail="'+esc(question.id)+'" placeholder="A short explanation in your own words is enough.">'+esc(answers[otherKey(question.id)]||'')+'</textarea></div>';
 return '<div class="'+(multi?'choice-grid':'single-choice')+'" role="group" aria-label="'+esc(question.label)+'">'+body+'</div>'+detail;
}
function renderQuestion(question,i){
 const val=answers[question.id];
 let html='';
 if(question.type==='textarea')html='<textarea data-question="'+esc(question.id)+'" id="field-'+esc(question.id)+'" rows="4" placeholder="'+esc(question.placeholder||'Write your thoughts here...')+'">'+esc(val||'')+'</textarea>';
 if(question.type==='text')html='<input class="answer-input" type="text" data-question="'+esc(question.id)+'" id="field-'+esc(question.id)+'" value="'+esc(val||'')+'" placeholder="'+esc(question.placeholder||'Your response')+'">';
 if(question.type==='single')html=choices(question,false);
 if(question.type==='multi')html=choices(question,true);
 if(question.type==='rating')html='<div class="rating-options" role="radiogroup" aria-label="'+esc(question.label)+'">'+[1,2,3,4,5].map(n=>'<label class="rating-label"><input type="radio" data-question="'+esc(question.id)+'" name="answer-'+esc(question.id)+'" value="'+n+'" '+(Number(val)===n?'checked':'')+'><span>'+n+'</span></label>').join('')+'</div><div class="rating-key"><span>1 · Not confident yet</span><span>5 · Very confident</span></div>';
 return '<div class="question" id="qwrap-'+esc(question.id)+'"><label class="question-title" '+(['textarea','text'].includes(question.type)?'for="field-'+esc(question.id)+'"':'')+'><span class="question-number">'+String(i+1).padStart(2,'0')+'</span>'+esc(question.label)+(question.required?'<span class="required">Required</span>':'<span class="optional">Optional</span>')+'</label>'+(question.hint?'<p class="hint">'+esc(question.hint)+'</p>':'')+html+'</div>';
}
function showError(message){const el=byId('inlineError');el.hidden=false;el.textContent=message;el.scrollIntoView({behavior:'smooth',block:'nearest'});}
function clearError(){byId('inlineError').hidden=true;byId('inlineError').textContent='';document.querySelectorAll('.error-field').forEach(el=>el.classList.remove('error-field'));}
function render(){
 clearError();updateSteps();updateProgress();
 if(completedRef){renderComplete();return;}
 const review=current===SECTIONS.length;
 const section=SECTIONS[current]||null;
 byId('stageLabel').textContent=review?'FINAL STEP · YOUR REFLECTIONS':'SECTION '+String(current+1).padStart(2,'0')+' OF '+String(SECTIONS.length).padStart(2,'0');
 byId('stageTitle').textContent=review?'Review before sharing':section.title;
 byId('stageDesc').textContent=review?'Check your responses and decide when you are ready to share them with your mentor.':section.subtitle;
 byId('formContent').innerHTML=review?renderReview():'<div class="question-group">'+section.questions.map((x,i)=>renderQuestion(x,i)).join('')+'</div>';
 byId('backBtn').hidden=current===0;
 byId('nextBtn').textContent=review?'Submit privately':'Continue →';
 byId('nextBtn').disabled=false;
 byId('saveBtn').hidden=false;
 if(review)byId('agree').checked=consent;
}
function renderReview(){
 return '<div class="review-box"><h3 class="review-heading">Your reflections, in one place</h3><p class="review-intro">Optional questions may be left unanswered. You can return to any section to change an answer.</p>'+
 SECTIONS.map((s,i)=>{
  let entries=s.questions.filter(x=>hasAnswer(answers[x.id])).map(x=>'<div class="review-item"><b>'+esc(x.label)+'</b><span>'+esc(answerDisplay(x))+'</span></div>').join('');
  return '<section class="review-section"><h3>'+esc(s.title)+' <button type="button" data-jump="'+i+'">Edit section</button></h3>'+(entries||'<p class="review-muted">No answers yet</p>')+'</section>';
 }).join('')+
 '<label class="consent-wrap"><input type="checkbox" id="agree"><span>I understand that sharing these responses is voluntary. I agree that Dr Hasan Boudlaie may use my answers solely to prepare our mentoring conversations and an individual career development plan. I have avoided sensitive or confidential details, and I can request deletion by contacting my mentor through UoB Mentoring Connect.</span></label>'+
 '<div class="review-actions"><button type="button" id="downloadTxt">Download a readable copy (.txt)</button><button type="button" id="downloadJson">Download backup (.json)</button><button type="button" id="copyTxt">Copy answers</button></div>'+
 '<p class="submit-note">This form uses an individual invitation. One completed submission is accepted; keep a backup if you would like your own record. Submissions are private and are not visible to website visitors.</p></div>';
}
function invalidInSection(section){
 for(const question of section.questions){
  if(question.required&&!hasAnswer(answers[question.id]))return {question,message:'Please answer the required question: '+question.label};
  if((question.type==='single'||question.type==='multi')&&isNoneSelected(question)&&!String(answers[otherKey(question.id)]||'').trim()){
   return {question,message:'Please briefly explain your selection of "None of the above" for: '+question.label};
  }
 }
 return null;
}
function validateCurrent(){
 const problem=invalidInSection(SECTIONS[current]);
 if(!problem)return true;
 byId('qwrap-'+problem.question.id)?.classList.add('error-field');
 showError(problem.message);return false;
}
function validateAll(){
 for(let i=0;i<SECTIONS.length;i++){
  const problem=invalidInSection(SECTIONS[i]);
  if(problem){current=i;render();byId('qwrap-'+problem.question.id)?.classList.add('error-field');showError(problem.message);return false;}
 }
 return true;
}

function jump(i){if(Number.isInteger(i)&&i>=0&&i<=SECTIONS.length){current=i;render();window.scrollTo({top:Math.max(0,byId('content').getBoundingClientRect().top+window.scrollY-10),behavior:'smooth'});}}
function plainText(){
 let out='DOCTORAL CAREER & RESEARCH DEVELOPMENT — MENTORING REFLECTIONS\n';
 out+='Prepared for a personal mentoring conversation\nDate: '+new Date().toISOString().slice(0,10)+'\n\n';
 SECTIONS.forEach(s=>{out+='=== '+s.title.toUpperCase()+' ===\n';s.questions.forEach(x=>{out+='\n'+x.label+'\n'+(hasAnswer(answers[x.id])?answerDisplay(x):'[not answered]')+'\n';});out+='\n';});
 return out;
}
function download(name,content,type){
 const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function send(){
 clearError();
 if(!validateAll())return;
 if(!byId('agree').checked){showError('Please review and tick the voluntary sharing agreement before submitting.');return;}
 if(!INVITE){showError('This page was opened without its individual invitation link. Please ask your mentor for the full link. You can still download your answers.');return;}
 if(!window.confirm('Submit your responses privately now? The invitation accepts one completed submission.'))return;
 const btn=byId('nextBtn');btn.disabled=true;btn.textContent='Submitting…';
 const response={schema_version:3,questionnaire:'doctoral_academic_career_2026',consent:true,submitted_client_at:new Date().toISOString(),answers:answers};
 try{
  const res=await fetch(API_URL,{method:'POST',headers:{apikey:API_KEY,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({p_access_code:INVITE,p_response:response})});
  const body=await res.json().catch(()=>({}));
  if(!res.ok||!body.ok)throw new Error((body&&body.message)||'The submission could not be completed. Please try again or download your answers.');
  completedRef=body.reference||'Submitted';localStorage.removeItem(STORAGE);
  try{localStorage.setItem(SUBMITTED,JSON.stringify({ref:completedRef,at:new Date().toISOString()}));}catch(_){}
  consent=false;render();
 }catch(e){showError(e.message||'Unable to submit. Please check your connection, then try again. Your draft remains on this device.');btn.disabled=false;btn.textContent='Submit privately';}
}
function renderComplete(){
 byId('stageLabel').textContent='SUBMISSION RECEIVED';
 byId('stageTitle').textContent='Thank you for reflecting';
 byId('stageDesc').textContent='Your responses have been securely received and will support the first mentoring conversation.';
 byId('formContent').innerHTML='<div class="complete"><div class="complete-mark" aria-hidden="true">✓</div><h3>Your next chapter starts with clarity.</h3><p>Thank you for sharing your perspective. Your mentor can now review your responses and work with you to shape meaningful six-month goals and a longer-term academic career roadmap.</p><span class="reference">Reference: '+esc(completedRef)+'</span><p class="submit-note">Please keep your reference. If you would like to correct or delete your response, contact your mentor using UoB Mentoring Connect.</p></div>';
 byId('backBtn').hidden=true;byId('nextBtn').hidden=true;byId('saveBtn').hidden=true;
 byId('completion').textContent='Complete';byId('progressFill').style.width='100%';document.querySelector('.progress-track').setAttribute('aria-valuenow','100');
}
function onFieldChange(el){
 const id=el.dataset.question;
 if(!id)return;
 const item=allQuestions().find(x=>x.id===id);
 if(!item)return;
 if(item.type==='multi'){
  let selected=Array.from(document.querySelectorAll('input[data-question="'+id+'"]:checked')).map(x=>x.value);
  if(el.value===NONE_OPTION&&el.checked){
   selected=[NONE_OPTION];
  }else if(el.checked){
   selected=selected.filter(x=>x!==NONE_OPTION);
  }
  if(item.max&&selected.length>item.max){
   el.checked=false;showError('Please choose no more than '+item.max+' options for this question.');return;
  }
  answers[id]=selected;
  document.querySelectorAll('input[data-question="'+id+'"]').forEach(x=>{
   x.checked=selected.includes(x.value);
   x.closest('label').classList.toggle('selected',x.checked);
  });
 }else{
  answers[id]=el.value;
  if(item.type==='single')document.querySelectorAll('input[data-question="'+id+'"]').forEach(x=>x.closest('label').classList.toggle('selected',x.checked));
 }
 if(item.type==='single'||item.type==='multi'){
  const active=isNoneSelected(item);
  const detail=byId('detail-wrap-'+id);
  if(detail)detail.hidden=!active;
  if(!active)delete answers[otherKey(id)];
 }
 byId('qwrap-'+id)?.classList.remove('error-field');
 clearError();save(false);updateProgress();updateSteps();
}

function attachEvents(){
 document.body.addEventListener('input',e=>{const el=e.target;
  if(el.matches('textarea[data-none-detail]')){answers[otherKey(el.dataset.noneDetail)]=el.value;clearError();save(false);return;}
  if(el.matches('textarea[data-question],input[type=text][data-question]'))onFieldChange(el);});
 document.body.addEventListener('change',e=>{
  const el=e.target;
  if(el.matches('input[data-question]:not([type=text]),select[data-question]'))onFieldChange(el);
  if(el.id==='agree')consent=el.checked;
 });
 document.body.addEventListener('click',e=>{
  const j=e.target.closest('[data-jump]');if(j){jump(Number(j.dataset.jump));return;}
  const id=e.target.id;
  if(id==='nextBtn'){
   if(current===SECTIONS.length){send();return;}
   if(validateCurrent()){current++;render();byId('content').scrollIntoView({behavior:'smooth'});}
  }
  if(id==='backBtn'&&current>0){current--;render();byId('content').scrollIntoView({behavior:'smooth'});}
  if(id==='saveBtn')save(true);
  if(id==='downloadTxt')download('doctoral-career-mentoring-responses.txt',plainText(),'text/plain;charset=utf-8');
  if(id==='downloadJson')download('doctoral-career-mentoring-backup.json',JSON.stringify({version:3,answers},null,2),'application/json;charset=utf-8');
  if(id==='copyTxt'){navigator.clipboard.writeText(plainText()).then(()=>{e.target.textContent='Copied';}).catch(()=>{showError('Copy not available in this browser. Use Download a readable copy instead.');});}
 });
}
load();attachEvents();render();
