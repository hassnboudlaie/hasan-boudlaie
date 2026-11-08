/* QA for Alborz Session 3 only. Run: node scripts/verify-alborz-session3.cjs */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const path=require("node:path");
const base=path.resolve(__dirname,"..","alborz-communication-skills");
const source=fs.readFileSync(path.join(base,"session3-listening-lab.js"),"utf8");
const entry=fs.readFileSync(path.join(base,"index.html"),"utf8");
new vm.Script(source,{filename:"session3-listening-lab.js"});
const find=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,"Missing content marker "+start);return JSON.parse(source.slice(a+start.length,b));};
const raw=find("const raw=",";\nconst cases=");
const briefs=find("const briefs=",";\nconst state=");
assert.equal(raw.length,12,"Twelve case records");
assert.equal(briefs.length,12,"Twelve role briefs");
const roles=["رئیس شعبه همتا","معاون شعبه","کارشناس شعبه","مشتری","نماینده بیمه","کارشناس ستاد"];
const names=new Set();
for(let i=0;i<12;i++){
 const c=raw[i],b=briefs[i];
 assert.equal(c[0],roles[Math.floor(i/2)],"Two scenarios per role, ordered");
 assert.equal(c.length,10,"Ten required scenario fields");
 assert(!names.has(c[1]),"Unique case title");names.add(c[1]);
 for(const index of [4,5]){
   const lines=c[index].split("|");assert.equal(lines.length,6,"Six alternated speaker turns per pass");
   for(const line of lines) assert(line.trim().length>=18,"Substantive complete utterance");
 }
 for(const index of [2,3,6,7,8,9]) assert(c[index].trim().length>=15,"Role-specific scenario guidance");
 assert(b.manager&&b.partner,"Both persona briefs");
 assert(b.manager.name&&b.manager.goal&&b.manager.act&&b.partner.name&&b.partner.goal&&b.partner.act,"Role actions");
 assert(Array.isArray(b.rules)&&b.rules.length>=2,"Per-case instructor rules");
 for(const key of ["watch","avoid","probe","feedback","transfer"]) assert(b[key]?.length>20,"Specific observations: "+key);
}
assert(entry.includes('src="session3-listening-lab.js'),'Academy loads isolated Session 3 script');
assert(entry.includes('if(id===3){window.alborzSession3Page();return}'),'Only third session uses this lesson');
assert(source.includes('window.alborzSession3Page=function()'),'Session 3 boot entry');
assert(source.includes('state.max'),'Instructor steps stay gated');
assert(source.includes('data-s3-nextcase'),'Case-to-case navigation exists');
console.log("PASS: 12 cases, 6 relationships x 2, 6+6 utterances, guidance, wiring and syntax.");
