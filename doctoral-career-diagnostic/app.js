'use strict';
/* Independent mentoring preparation tool: not an official University of Birmingham form. */
const API_URL = 'https://hxcjkewlaniahvuqwwbb.supabase.co/rest/v1/rpc/submit_mentoring_diagnostic';
const API_KEY = 'sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6';
const INVITE = new URLSearchParams(window.location.search).get('invite') || '';
const STORAGE = 'hb-doctoral-diagnostic-draft-v1';
const SUBMITTED = 'hb-doctoral-diagnostic-submitted-v1';
const q = (id,label,type,opts={}) => ({id,label,type,...opts});
const SECTIONS = [
  {id:'starting', title:'Your starting point', subtitle:'Establish what is important to you now, rather than making assumptions about your goals.', questions:[
    q('phd_stage','Where are you in your doctoral journey?','single',{options:['Year 1','Year 2','Year 3 or beyond','Writing-up / completion phase','Prefer to explain in my own words'],required:true}),
    q('career_balance','How do your doctoral research, current employment, and other professional responsibilities fit together?','textarea',{placeholder:'For example, how you allocate time across your PhD, professional role and academic activities. Avoid employer-confidential information.'}),
    q('three_year_vision','Imagine it is late 2029. What academic or professional position would you most like to have reached?','textarea',{required:true,placeholder:'A role, research identity, teaching contribution or balance of activities — in your own words.'})
  ]},
  {id:'research',title:'Your doctoral research',subtitle:'Explore the intellectual architecture of the project without replacing your supervisory team.',questions:[
    q('research_problem','What is the core research problem or question your PhD is trying to answer?','textarea',{placeholder:'Explain it in accessible terms, as if describing your work to a management researcher outside your exact subfield.'}),
    q('theory_integration','How do your institutional, signalling and behavioural perspectives connect?','textarea',{hint:'For example: institutional pressures, signalling or credibility, and mechanisms of ethical decision-making. Which links still need clarification?'}),
    q('research_method','At which stage is your vignette-based or other empirical research?','single',{options:['Refining the design / scenarios','Ethics or research governance preparation','Pilot testing','Recruitment / data collection','Analysis and interpretation','Writing up','Different method or stage']}),
    q('contribution','What do you currently see as the most original theoretical or methodological contribution of your work?','textarea',{placeholder:'What would researchers understand differently because your study exists? If this is unclear, say so.'}),
    q('research_challenge','What is the most difficult judgment or decision you currently face about the scope of your thesis?','textarea',{hint:'Please do not disclose confidential participant data or unpublished sensitive materials.'})
  ]},
  {id:'writing',title:'Research productivity & publishing',subtitle:'Understand existing strengths, the publication pipeline, and what gets in the way of finished work.',questions:[
    q('research_outputs','What research outputs have you completed or are actively developing?','multi',{options:['Working paper or draft manuscript','Journal submission','Journal article accepted/published','Conference paper or presentation','Book chapter','Thesis chapter','Research dataset / methodological output','No formal output yet','Other']}),
    q('writing_barriers','What most slows your progress from reading and analysis to a finished piece of writing?','multi',{max:3,options:['Too many parallel projects','Difficulty defining contribution','Perfectionism / repeated rewriting','Unclear writing structure','Limited focused time','Method or analysis uncertainty','Feedback cycles','Journal / audience fit','Other']}),
    q('next_output','What is your most important planned research output in the next 6–9 months?','textarea',{placeholder:'A paper, chapter, conference submission, or other deliverable — include status and a realistic target if known.'}),
    q('writing_capacity','How much protected writing or analysis time can you usually secure per week?','single',{options:['Less than 3 hours','3–5 hours','6–10 hours','11–15 hours','More than 15 hours','Highly variable / not sure']}),
    q('publication_confidence','How confident are you about turning your current research into publishable work?','rating',{hint:'A reflection baseline, not a performance score.'})
  ]},
  {id:'identity',title:'Research identity & originality',subtitle:'Move from an interesting thesis topic to a sustainable, distinctive research agenda.',questions:[
    q('research_themes','Which research communities or themes could become your longer-term academic home?','multi',{max:3,options:['Entrepreneurship and new venture studies','Business ethics / fraud / misconduct','Institutional theory and governance','Technology / digital entrepreneurship','Organizational behaviour and judgement','Qualitative / experimental methods','Cross-cultural or Gulf-region management','Another theme / still exploring']}),
    q('intellectual_signature','Complete this sentence: In three years, I want colleagues to know me as a researcher who...','textarea',{placeholder:'For example, studies a particular problem, brings together certain theories, or develops a distinctive method.'}),
    q('theory_boundaries','How might your empirical context help test, extend, or challenge existing theory beyond one country or sector?','textarea',{hint:'Think about boundary conditions and comparative relevance, not just the uniqueness of a location.'}),
    q('future_questions','What two or three research questions would you be excited to explore after your PhD?','textarea',{placeholder:'Early ideas are welcome. You do not need a finalized research agenda.'}),
  ]},
  {id:'academia',title:'Teaching & academic readiness',subtitle:'Identify the evidence, skills and experiences needed for the kind of academic role you want.',questions:[
    q('teaching_experience','Which kinds of higher education experience do you already have?','multi',{options:['Leading lectures or seminars','Teaching assistance or tutorials','Curriculum / assessment design','Student supervision or mentoring','Survey research or research support','Research collaboration with faculty','Conference presentations','None of these yet','Other']}),
    q('teaching_examples','What teaching, research or academic achievements could you already demonstrate in an academic job application?','textarea',{placeholder:'Give concrete examples rather than general strengths; short notes are enough.'}),
    q('academic_role','Which type of academic role currently appeals to you most?','single',{options:['Research-intensive faculty position','Balanced research and teaching position','Teaching-focused lecturer / educator','Postdoctoral research position','Research institute / policy research role','Undecided — I want to explore options'],required:true}),
    q('teaching_development','Which academic capabilities do you most want to develop?','multi',{max:3,options:['Teaching practice and student engagement','Course design and assessment','Academic writing and peer review','Research funding / grant applications','Supervision and mentoring','Research visibility and networking','Academic job applications and interviews','Collaborative research leadership']}),
    q('teaching_readiness','How confident are you in your readiness to teach in higher education?','rating'),
  ]},
  {id:'transition',title:'From professional practice to academia',subtitle:'Clarify your preferred destination, transferable strengths, and constraints without making premature commitments.',questions:[
    q('preferred_markets','Where might you realistically consider an academic position after your PhD?','multi',{options:['Qatar','Other Gulf countries','United Kingdom','Europe beyond the UK','North America','Elsewhere internationally','Open to several locations / undecided']}),
    q('professional_capital','What strengths from your government or administrative work — and your previous university-based research experience — could you bring to an academic role?','textarea',{placeholder:'Examples: stakeholder access, public-sector insight, project management, survey design, teaching-related experience.'}),
    q('transition_model','Which transition pathway currently seems most realistic?','single',{options:['Move directly into a full-time academic role','Start with an adjunct, visiting or part-time teaching role','Seek postdoctoral research before a faculty role','Build a dual professional-academic portfolio','Explore opportunities before choosing a pathway']}),
    q('career_constraints','Which factors might influence your career transition?','multi',{options:['Availability of suitable academic posts','Publication record and research profile','Teaching evidence / credentials','Geographical preferences','Timing of PhD completion','Workload and competing responsibilities','Financial or contractual commitments','Visa / employment eligibility where relevant','Other or prefer not to say']}),
    q('career_questions','What are the biggest unanswered questions you have about moving into an academic career?','textarea',{placeholder:'For example, recruitment expectations, faculty qualifications, institutional types, portfolio building or timing.'})
  ]},
  {id:'roadmap',title:'Your 2027–2029 roadmap',subtitle:'Sketch direction and milestones, not promises. We will refine the roadmap together after our first conversation.',questions:[
    q('milestone_2027','By the end of 2027, what evidence of progress would you like to have?','textarea',{placeholder:'Examples: a stronger manuscript pipeline, agreed thesis milestones, teaching exposure or focused research network.'}),
    q('milestone_2028','What would a successful 2028 look like, particularly around your doctoral completion and career readiness?','textarea',{placeholder:'Your graduation timing may change; explain what would constitute meaningful progress.'}),
  ]},
  {id:'mentoring',title:'How we work together',subtitle:'Set an agenda that you own. Our formal mentoring period is six months; the longer roadmap is your development tool.',questions:[
    q('mentoring_priorities','Which THREE priorities would you most like to work on with your mentor first?','multi',{required:true,max:3,options:['Research productivity / time allocation','Framing an original contribution','Critical thinking and challenging assumptions','Academic writing / publication strategy','Research identity and specialization','Teaching readiness and academic portfolio','Exploring academic career pathways','Transitioning from government to academia','Building an academic network','Confidence, decision-making and accountability'],hint:'Select up to three. We can revise these together.'}),
    q('success_indicators','What two observable outcomes would tell you, six months from now, that the mentoring relationship has helped?','textarea',{required:true,placeholder:'For example: one manuscript milestone achieved; a clearer research statement; a teaching evidence plan; a shortlist of roles.'}),
    q('mentoring_style','What forms of mentoring support would help you most?','multi',{max:3,options:['Reflective questioning and listening','Honest, constructive challenge','Practical examples and experience-sharing','Feedback on a short research or career statement','Accountability and progress check-ins','Pointers to resources and networks','Decision-making frameworks','A mix, depending on the topic']}),
    q('meeting_format','What meeting arrangement would work best for you initially?','single',{options:['About 60 minutes monthly by video call','45 minutes monthly by video call','Flexible — decide together','I would prefer to discuss the schedule first'],hint:'The University suggests approximately one meeting a month; the details are flexible.'}),
    q('first_conversation','What would you most like to discuss in our very first mentoring conversation?','textarea',{placeholder:'Choose one real decision, question or opportunity rather than trying to cover everything.'}),
    q('next_90_days','What is one achievable step you could take in the next 90 days, even before the entire roadmap is settled?','textarea',{placeholder:'Be specific about the action you will own and how you will know it is complete.'})
  ]}
];
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
 try{localStorage.setItem(STORAGE,JSON.stringify({answers,version:1,savedAt:new Date().toISOString()}));byId('saveState').textContent=manual?'Draft saved on this device':'Saved on this device';}
 catch(_){byId('saveState').textContent='Storage unavailable — download a backup';}
}
function countAnswered(s){return s.questions.filter(x=>hasAnswer(answers[x.id])).length;}
function totalAnswered(){return allQuestions().filter(x=>hasAnswer(answers[x.id])).length;}
function percent(){return Math.round(totalAnswered()*100/allQuestions().length);}
function updateProgress(){
 const value=percent();
 byId('completion').textContent=totalAnswered()+' of '+allQuestions().length+' answered';
 byId('progressFill').style.width=value+'%';
 document.querySelector('.progress-track').setAttribute('aria-valuenow',value);
}
function updateSteps(){
 byId('steps').innerHTML=SECTIONS.map((s,i)=>{
  const active=current===i?' active':'';
  const done=countAnswered(s)===s.questions.length?' done':'';
  return '<button type="button" class="step-link'+active+done+'" data-jump="'+i+'" '+(active?'aria-current="step"':'')+'><span class="step-no">'+(i+1)+'</span>'+esc(s.title)+'</button>';
 }).join('')+'<button type="button" class="step-link'+(current===SECTIONS.length?' active':'')+'" data-jump="'+SECTIONS.length+'"><span class="step-no">✓</span>Review & submit</button>';
}
function choices(question,multi){
 const val=answers[question.id];
 return '<div class="'+(multi?'choice-grid':'single-choice')+'" role="group" aria-label="'+esc(question.label)+'">'+question.options.map((o,i)=>{
  const selected=multi?(Array.isArray(val)&&val.includes(o)):val===o;
  const name='answer-'+question.id;
  return '<label class="choice-label'+(selected?' selected':'')+'"><input type="'+(multi?'checkbox':'radio')+'" data-question="'+esc(question.id)+'" name="'+esc(name)+'" value="'+esc(o)+'" '+(selected?'checked':'')+'><span>'+esc(o)+'</span></label>';
 }).join('')+'</div>';
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
  let entries=s.questions.filter(x=>hasAnswer(answers[x.id])).map(x=>'<div class="review-item"><b>'+esc(x.label)+'</b><span>'+esc(textValue(answers[x.id]))+'</span></div>').join('');
  return '<section class="review-section"><h3>'+esc(s.title)+' <button type="button" data-jump="'+i+'">Edit section</button></h3>'+(entries||'<p class="review-muted">No answers yet</p>')+'</section>';
 }).join('')+
 '<label class="consent-wrap"><input type="checkbox" id="agree"><span>I understand that sharing these responses is voluntary. I agree that Dr Hasan Boudlaie may use my answers solely to prepare our mentoring conversations and an individual career development plan. I have avoided sensitive or confidential details, and I can request deletion by contacting my mentor through UoB Mentoring Connect.</span></label>'+
 '<div class="review-actions"><button type="button" id="downloadTxt">Download a readable copy (.txt)</button><button type="button" id="downloadJson">Download backup (.json)</button><button type="button" id="copyTxt">Copy answers</button></div>'+
 '<p class="submit-note">This form uses an individual invitation. One completed submission is accepted; keep a backup if you would like your own record. Submissions are private and are not visible to website visitors.</p></div>';
}
function validateCurrent(){
 const section=SECTIONS[current];if(!section)return true;
 const missing=section.questions.find(x=>x.required&&!hasAnswer(answers[x.id]));
 if(missing){const el=byId('qwrap-'+missing.id);if(el)el.classList.add('error-field');showError('Please answer the required question: '+missing.label);return false;}
 return true;
}
function validateAll(){
 for(let i=0;i<SECTIONS.length;i++){
  const missing=SECTIONS[i].questions.find(x=>x.required&&!hasAnswer(answers[x.id]));
  if(missing){current=i;render();const el=byId('qwrap-'+missing.id);if(el)el.classList.add('error-field');showError('Before submitting, please answer this required question: '+missing.label);return false;}
 }
 return true;
}
function jump(i){if(Number.isInteger(i)&&i>=0&&i<=SECTIONS.length){current=i;render();window.scrollTo({top:Math.max(0,byId('content').getBoundingClientRect().top+window.scrollY-10),behavior:'smooth'});}}
function plainText(){
 let out='DOCTORAL CAREER & RESEARCH DEVELOPMENT — MENTORING REFLECTIONS\n';
 out+='Prepared for a personal mentoring conversation\nDate: '+new Date().toISOString().slice(0,10)+'\n\n';
 SECTIONS.forEach(s=>{out+='=== '+s.title.toUpperCase()+' ===\n';s.questions.forEach(x=>{out+='\n'+x.label+'\n'+(hasAnswer(answers[x.id])?textValue(answers[x.id]):'[not answered]')+'\n';});out+='\n';});
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
 const response={schema_version:1,questionnaire:'doctoral_academic_career_2026',consent:true,submitted_client_at:new Date().toISOString(),answers:answers};
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
 const id=el.dataset.question;if(!id)return;
 const item=allQuestions().find(x=>x.id===id);if(!item)return;
 if(item.type==='multi'){
  const selected=Array.from(document.querySelectorAll('input[data-question="'+id+'"]:checked')).map(x=>x.value);
  if(item.max&&selected.length>item.max){el.checked=false;showError('Please choose no more than '+item.max+' options for this question.');return;}
  answers[id]=selected;
  document.querySelectorAll('input[data-question="'+id+'"]').forEach(x=>x.closest('label').classList.toggle('selected',x.checked));
 }else{
  answers[id]=el.value;
  if(item.type==='single')document.querySelectorAll('input[data-question="'+id+'"]').forEach(x=>x.closest('label').classList.toggle('selected',x.checked));
 }
 byId('qwrap-'+id)?.classList.remove('error-field');
 clearError();save(false);updateProgress();updateSteps();
}
function attachEvents(){
 document.body.addEventListener('input',e=>{const el=e.target;if(el.matches('textarea[data-question],input[type=text][data-question]'))onFieldChange(el);});
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
  if(id==='downloadJson')download('doctoral-career-mentoring-backup.json',JSON.stringify({version:1,answers},null,2),'application/json;charset=utf-8');
  if(id==='copyTxt'){navigator.clipboard.writeText(plainText()).then(()=>{e.target.textContent='Copied';}).catch(()=>{showError('Copy not available in this browser. Use Download a readable copy instead.');});}
 });
}
load();attachEvents();render();
