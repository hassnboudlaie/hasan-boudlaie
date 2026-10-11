import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const artifacts=process.argv[3]?path.resolve(process.argv[3]):here;
const origin='https://hassnboudlaie.github.io/hasan-boudlaie/okr-system/';
const revision=process.argv[2]||'free-20261011';
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const paths=['','offline.html','favicon.svg','assets/kishports_main.svg','assets/airport_opration.svg'];
const settled=await Promise.allSettled(paths.map(async asset=>{
 const url=new URL(asset,origin);url.searchParams.set('release',revision);
 const r=await fetch(url,{headers:{'User-Agent':ua},signal:AbortSignal.timeout(30000)});const body=await r.text();
 const expected=asset===''?'index.html':asset;
 assert.equal(r.status,200,'HTTP '+asset);assert.ok(r.url.startsWith(origin),'Unexpected redirect');
 if(['index.html','offline.html'].includes(expected)){
  const hash=digest(body),local=digest(fs.readFileSync(path.join(artifacts,expected),'utf8'));
  assert.equal(hash,local,'Published file is not the expected release: '+expected);
  fs.mkdirSync(path.join(artifacts,'live-verification'),{recursive:true});fs.writeFileSync(path.join(artifacts,'live-verification',expected),body);
 }
 return {path:asset||'/',status:r.status,bytes:Buffer.byteLength(body)};
}));
for(const result of settled){if(result.status==='fulfilled')console.log(JSON.stringify(result.value));else console.error(result.reason.message);}
assert.ok(settled.every(x=>x.status==='fulfilled'),'Public URL verification failed');
const health=await fetch('https://kish-okr-execution.hasanboudlaie.chatgpt.site/api/okr/health',{headers:{'User-Agent':ua},signal:AbortSignal.timeout(30000)});
assert.equal(health.status,200);assert.equal((await health.json()).authentication,'organization-account');
console.log('PASS: anonymous public Pages HTML and assets match the release, offline file is downloadable, and the unchanged central backend remains healthy. These are HTTP checks, not physical laptop/Iran-network tests.');
