// Organization units transcribed from the owner's scanned chart, pages 2–10.
// Persian labels are the source of truth; English labels are translations.
// The upload is named Mehr 1404; its printed amendment date is Khordad 1404.
const ORG_CHART_VERSION='kish-chart-1404-v1';
const ORG_CHART_SOURCE={upload:'چارت جدید مهر 1404.pdf',printedAmendment:'خرداد ۱۴۰۴',pages:[2,3,4,5,6,7,8,9,10],note:'Unit labels are derived from department-head positions. Expert, shift, outsourced and consultant positions are not separate departments. Security and inspection have external oversight as noted in the chart.'};
const ORG_LEVELS={directorate:['اداره کل','Directorate General'],deputy:['معاونت','Deputy Directorate'],management:['مدیریت','Management'],office:['ریاست / اداره','Office / Department']};
const ORG_CHART=[
 ['ceo-office','اداره دفتر مدیرعامل','CEO Office','office',null,2],
 ['public-relations','اداره روابط عمومی','Public Relations Office','office',null,2],
 ['inspection','اداره بازرسی و پاسخگویی به شکایات','Inspection and Complaints Office','office',null,2],
 ['civil-defense','اداره پدافند غیرعامل و مدیریت بحران','Civil Defense and Crisis Management Office','office',null,3],
 ['legal','مدیریت حقوقی و امور قراردادها','Legal Affairs and Contracts Management','management',null,2],
 ['strategy','مدیریت طرح و نظارت راهبردی','Planning and Strategic Oversight Management','management',null,2],
 ['strategy-it','اداره توسعه فناوری اطلاعات و تحول دیجیتال','IT Development and Digital Transformation Office','office','strategy',3],
 ['strategic-management','اداره مدیریت راهبردی','Strategic Management Office','office','strategy',3],
 ['pmo','اداره ارزیابی و پیگیری طرح‌ها و پروژه‌ها PMO','Plans and Projects Evaluation and Follow-up Office (PMO)','office','strategy',3],
 ['security','مدیریت حراست','Security Management','management',null,2],
 ['security-documents','اداره حفاظت از اسناد و بررسی حراست','Document Protection and Security Screening Office','office','security',3],
 ['finance-admin','معاونت مالی، اداری و پشتیبانی','Finance, Administration and Support Deputy Directorate','deputy',null,2],
 ['finance','مدیریت مالی','Finance Management','management','finance-admin',4],
 ['income-accounting','اداره حسابداری درآمدها','Revenue Accounting Office','office','finance',4],
 ['cost-accounting','اداره حسابداری هزینه‌ها','Cost Accounting Office','office','finance',4],
 ['warehouse-assets','اداره انبار و اموال','Warehouse and Assets Office','office','finance',4],
 ['human-resources','مدیریت منابع انسانی','Human Resources Management','management','finance-admin',4],
 ['secretariat','اداره دبیرخانه','Secretariat Office','office','human-resources',4],
 ['personnel','اداره امور کارکنان','Personnel Affairs Office','office','human-resources',4],
 ['training','اداره آموزش','Training Office','office','human-resources',4],
 ['support','مدیریت پشتیبانی','Support Management','management','finance-admin',4],
 ['procurement-support','اداره تدارکات و پشتیبانی','Procurement and Support Office','office','support',4],
 ['transport','اداره نقلیه','Transport Office','office','support',4],
 ['economic-technical','معاونت اقتصادی و فنی','Economic and Technical Deputy Directorate','deputy',null,2],
 ['technical-engineering','مدیریت فنی و مهندسی','Technical and Engineering Management','management','economic-technical',5],
 ['port-projects','اداره پروژه‌های بندری و دریایی','Port and Maritime Projects Office','office','technical-engineering',5],
 ['airport-projects','اداره پروژه‌های فرودگاهی و هوانوردی','Airport and Aviation Projects Office','office','technical-engineering',5],
 ['economic-investment','مدیریت امور اقتصادی و سرمایه‌گذاری','Economic Affairs and Investment Management','management','economic-technical',5],
 ['airports','اداره کل فرودگاه‌های کیش','Kish Airports Directorate General','directorate',null,2],
 ['airport-affairs','اداره امور فرودگاهی','Airport Affairs Office','office','airports',6],
 ['hendorabi-airport','اداره فرودگاه هندورابی','Hendorabi Airport Office','office','airports',6],
 ['airport-operations','معاونت عملیات فرودگاهی','Airport Operations Deputy Directorate','deputy','airports',2],
 ['terminals','اداره امور ترمینال‌ها','Terminal Affairs Office','office','airport-operations',6],
 ['toc','اداره TOC و برنامه‌ریزی پروازی','TOC and Flight Planning Office','office','airport-operations',6],
 ['airport-general-services','اداره خدمات عمومی','General Services Office','office','airport-operations',6],
 ['aviation-operations','معاونت عملیات هوانوردی','Aviation Operations Deputy Directorate','deputy','airports',2],
 ['aviation-communications','اداره مخابرات هوانوردی','Aeronautical Telecommunications Office','office','aviation-operations',6],
 ['air-traffic-control','اداره مراقبت پرواز','Air Traffic Control Office','office','aviation-operations',6],
 ['communications-navigation','اداره ارتباطات و ناوبری','Communications and Navigation Office','office','aviation-operations',6],
 ['airport-technical','معاونت فنی و اجرایی فرودگاه','Airport Technical and Executive Deputy Directorate','deputy','airports',2],
 ['airport-electrical','اداره مهندسی برق و ابزار دقیق','Electrical and Instrumentation Engineering Office','office','airport-technical',6],
 ['airport-building-mechanical','اداره مهندسی ساختمان و مکانیک','Building and Mechanical Engineering Office','office','airport-technical',6],
 ['airport-it','اداره فناوری اطلاعات فرودگاه','Airport Information Technology Office','office','airport-technical',6],
 ['airport-safety','مدیریت ایمنی و آتش‌نشانی فرودگاهی','Airport Safety and Firefighting Management','management','airports',2],
 ['airport-fire-rescue','اداره آتش‌نشانی و نجات فرودگاهی','Airport Firefighting and Rescue Office','office','airport-safety',6],
 ['airport-security','اداره حراست و امنیت فرودگاه‌های کیش','Kish Airports Security Office','office','airports',7],
 ['ports','اداره کل بنادر کیش','Kish Ports Directorate General','directorate',null,2],
 ['port-affairs','اداره امور بندر','Port Affairs Office','office','ports',8],
 ['port-it','اداره فناوری اطلاعات بندر','Port Information Technology Office','office','ports',8],
 ['fishing-port','بندر صیادی کیش','Kish Fishing Port','office','ports',8],
 ['hendorabi-port','بندر هندورابی','Hendorabi Port','office','ports',8],
 ['port-safety','اداره ایمنی و پیشگیری از سوانح','Safety and Accident Prevention Office','office','ports',8],
 ['port-security','اداره حراست و گارد بندر','Port Security and Guard Office','office','ports',10],
 ['port-operations','معاونت امور بندری','Port Affairs Deputy Directorate','deputy','ports',2],
 ['port-maintenance','اداره تعمیر و نگهداری ساختمان و تجهیزات بندری','Port Buildings and Equipment Maintenance Office','office','port-operations',8],
 ['container-commercial-terminal','اداره ترمینال کانتینری و تجاری','Container and Commercial Terminal Office','office','port-operations',8],
 ['passenger-vehicle-terminal','اداره ترمینال مسافری و خودرویی','Passenger and Vehicle Terminal Office','office','port-operations',8],
 ['port-general-services','اداره خدمات عمومی بندر','Port General Services Office','office','port-operations',8],
 ['maritime','معاونت امور دریایی','Maritime Affairs Deputy Directorate','deputy','ports',2],
 ['marine-fire-rescue','اداره آتش‌نشانی و نجات بندری و دریایی','Port and Maritime Firefighting and Rescue Office','office','maritime',8],
 ['marine-operations','اداره عملیات دریایی','Marine Operations Office','office','maritime',8],
 ['marine-control','اداره برج مراقبت دریایی','Marine Control Tower Office','office','maritime',8],
 ['charak','مدیریت بندر تجاری و مسافری چارک','Charak Commercial and Passenger Port Management','management','ports',9],
 ['charak-port-affairs','اداره امور بندری بندر چارک','Charak Port Affairs Office','office','charak',9],
 ['charak-maritime','اداره امور دریایی بندر چارک','Charak Maritime Affairs Office','office','charak',9]
].map(([key,faName,enName,level,parent,page])=>({id:'org-'+key,fa:faName,en:enName,level,parentId:parent?'org-'+parent:null,page,...(['port-security','airport-security'].includes(key)?{oversightId:'org-security'}:{}),...(['inspection','security'].includes(key)?{externalOversight:true}:{})}));
function orgNode(key){return ORG_CHART.find(n=>n.id===key);}
function orgName(n){return n?txt(n.fa,n.en):txt('مدیرعامل','CEO');}
function unitName(t){return t?.orgChartId&&orgNode(t.orgChartId)?orgName(orgNode(t.orgChartId)):t?.name||txt('واحد','Unit');}
function orgPath(n){const path=[];for(let cursor=n;cursor;cursor=orgNode(cursor.parentId))path.unshift(orgName(cursor));return path.join(' / ');}
function orgBranch(n){let cursor=n;while(cursor?.parentId)cursor=orgNode(cursor.parentId);return cursor;}
function orgNormalize(s){return String(s||'').replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/[\s\u200c،,\-]/g,'');}
function ensureOrganizationUnits(s){
 const used=new Set();s.teams ||= [];
 for(const node of ORG_CHART){
  let team=s.teams.find(t=>!used.has(t)&&((t.orgChartId||t.id)===node.id||orgNormalize(t.name)===orgNormalize(node.fa)));
  if(!team){team={id:node.id,name:node.fa,lead:'',responsibilities:'',interdependencies:'',participating:false,kpis:[],okrs:[]};s.teams.push(team);}
  used.add(team);team.orgChartId=node.id;team.orgParentId=node.parentId;team.orgLevel=node.level;
  team.unitType=ORG_LEVELS[node.level][0];team.parent=orgNode(node.parentId)?.fa||'مدیرعامل';team.kpis ||= [];team.okrs ||= [];
 }
 s.orgChartVersion=ORG_CHART_VERSION;return s;
}
function makeOrganizationDemoTeams(objective){
 const s=ensureOrganizationUnits({teams:[]});
 const examples=[['org-airport-operations','demo-team-1','قابلیت اتکای خدمت نمونه افزایش یابد','manager@example.invalid'],['org-technical-engineering','demo-team-2','زمان توقف نمونه کاهش یابد','technical@example.invalid']];
 for(const [key,oid,title,owner] of examples){const t=s.teams.find(t=>t.orgChartId===key);t.lead=owner;t.participating=true;t.okrs=[objective(oid,title,'demo-company-0',owner)];}
 return s.teams;
}
function orderedOrgTeams(){return [...ORG_CHART.map(n=>state.teams.find(t=>t.orgChartId===n.id)).filter(Boolean),...state.teams.filter(t=>!orgNode(t.orgChartId))];}
function orgFieldOptions(){return orderedOrgTeams().map(t=>{const n=orgNode(t.orgChartId);return {value:t.id,label:n?orgPath(n):unitName(t),group:n?orgName(orgBranch(n)):txt('واحدهای ثبت‌شده قبلی / سفارشی','Existing / custom units')};});}
function orgOptionMarkup(options,selected){let group=null,html='';for(const o of options){if((o.group||null)!==group){if(group)html+='</optgroup>';group=o.group||null;if(group)html+='<optgroup label="'+esc(group)+'">';}html+='<option value="'+esc(o.value)+'" '+(o.value===selected?'selected':'')+'>'+esc(o.label)+'</option>';}return html+(group?'</optgroup>':'');}
function orgSelectOptions(selected,leading=[]){return orgOptionMarkup([...leading,...orgFieldOptions()],selected);}
function orgDescendantIds(teamId){const team=state.teams.find(t=>t.id===teamId),root=orgNode(team?.orgChartId),ids=new Set([teamId]);if(!root)return ids;for(const t of state.teams){let n=orgNode(t.orgChartId);while(n){if(n.id===root.id){ids.add(t.id);break;}n=orgNode(n.parentId);}}return ids;}
let orgUnitFilter={q:'',branch:'all',level:'all'};
function orgFilteredTeams(){return orderedOrgTeams().filter(t=>{const n=orgNode(t.orgChartId),text=n?orgPath(n)+' '+n.fa+' '+n.en:unitName(t);return (!orgUnitFilter.q||orgNormalize(text).toLowerCase().includes(orgNormalize(orgUnitFilter.q).toLowerCase()))&&(orgUnitFilter.branch==='all'||orgBranch(n)?.id===orgUnitFilter.branch)&&(orgUnitFilter.level==='all'||n?.level===orgUnitFilter.level);});}
function orgUnitToolbar(){return '<article class="card org-unit-controls"><h3>'+txt('واحدهای رسمی شرکت','Company organization units')+'</h3><p class="hint">'+txt('معاونت، مدیریت یا اداره را از چارت انتخاب کنید. داده‌های OKR نمونه هستند؛ نام و ساختار واحدها از چارت واقعی شرکت گرفته شده‌اند.','Choose a deputy directorate, management or office from the chart. OKR examples are fictional; unit names and hierarchy come from the company’s actual chart.')+'</p><div class="filter-grid"><div class="field"><label>'+txt('انتخاب مستقیم واحد','Go to a unit')+'</label><select id="orgUnitJump">'+orgSelectOptions('',[{value:'',label:txt('انتخاب واحد…','Select a unit…')}])+'</select></div><div class="field"><label>'+txt('جست‌وجوی واحد','Search units')+'</label><input id="orgUnitSearch" type="search" value="'+esc(orgUnitFilter.q)+'"></div><div class="field"><label>'+txt('حوزه سازمانی','Organization branch')+'</label><select id="orgUnitBranch">'+optionList([['all',txt('همه حوزه‌ها','All branches')],...ORG_CHART.filter(n=>!n.parentId).map(n=>[n.id,orgName(n)])],orgUnitFilter.branch)+'</select></div><div class="field"><label>'+txt('سطح سازمانی','Organization level')+'</label><select id="orgUnitLevel">'+optionList([['all',txt('همه سطوح','All levels')],...Object.entries(ORG_LEVELS).map(([key,label])=>[key,txt(...label)])],orgUnitFilter.level)+'</select></div></div><datalist id="orgUnitNames">'+orderedOrgTeams().map(t=>'<option value="'+esc(unitName(t))+'"></option>').join('')+'</datalist><p class="hint" id="orgUnitCount"></p></article><div class="unit-list" id="orgUnitRows"></div>';}
function bindOrgUnitToolbar(){
 for(const [id,key] of [['orgUnitSearch','q'],['orgUnitBranch','branch'],['orgUnitLevel','level']]){const el=document.getElementById(id);if(el)el[key==='q'?'oninput':'onchange']=()=>{orgUnitFilter[key]=el.value;renderOrgUnitRows();};}
 const jump=document.getElementById('orgUnitJump');if(jump)jump.onchange=()=>{if(!jump.value)return;orgUnitFilter={q:'',branch:'all',level:'all'};const i=state.teams.findIndex(t=>t.id===jump.value);if(i>=0){openTeams.add(i);renderTeams();document.querySelector('[data-org-team="'+CSS.escape(jump.value)+'"]')?.scrollIntoView({block:'start',behavior:'smooth'});}};
}
