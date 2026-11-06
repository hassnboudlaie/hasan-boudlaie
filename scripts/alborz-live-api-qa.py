import json,sys,time,urllib.request,urllib.error,concurrent.futures,statistics,pathlib
codes=json.load(open(sys.argv[1]));endpoint='https://cymatyfnwuxikrghydrn.supabase.co/functions/v1/alborz-workshop-sync';checks=[]
def req(c,body,origin=None):
 h={'Content-Type':'application/json'}
 if origin:h['Origin']=origin
 t=time.monotonic()
 try:
  r=urllib.request.urlopen(urllib.request.Request(endpoint,data=json.dumps(dict(body,code=c['code'])).encode(),headers=h),timeout=40);status=r.status;b=json.load(r)
 except urllib.error.HTTPError as e:status=e.code;b=json.load(e)
 return status,b,(time.monotonic()-t)*1000
def test(name,actual,expected):
 assert actual==expected,(name,actual,expected);checks.append(name);print('PASS',name,flush=True)
a,b,teacher=codes[0],codes[1],codes[-1]
test('identity',req(a,{'action':'login'})[1].get('identity'),{'role':'team','team':1,'member':1})
for name,c,body,status in [
 ('invalid code',{'code':'0'*24},{'action':'login'},401),
 ('cross-team read',a,{'action':'read','team':2},403),
 ('cross-team write',a,{'action':'write','team':2,'fields':{'teamname':'QA-bad'},'expected':{'teamname':0}},403),
 ('teacher isolation',a,{'action':'teacher'},403),
 ('teacher grade protection',a,{'action':'grade','team':1,'fields':{'instructorScore0':9},'expected':{'instructorScore0':0}},403),
 ('member impersonation',a,{'action':'write','team':1,'fields':{'r0member2':'QA-spoof'},'expected':{'r0member2':0}},403),
 ('private assessment blocked',a,{'action':'write','team':1,'fields':{'apre10':'private'},'expected':{'apre10':0}},400),
 ('personal action blocked',a,{'action':'write','team':1,'fields':{'action':'private'},'expected':{'action':0}},400),
 ('missing revision',a,{'action':'write','team':1,'fields':{'teamname':'QA-team'}},400)]:test(name,req(c,body)[0],status)
test('origin restriction',req(a,{'action':'read','team':1},'https://example.com')[0],403)
def versions(c):return {r['field_key']:r['version'] for r in req(c,{'action':'read','team':c['team']})[1]['records']}
v=versions(a).get('r0initial',0);body={'action':'write','team':1,'fields':{'r0initial':'QA-concurrent'},'expected':{'r0initial':v}}
with concurrent.futures.ThreadPoolExecutor(2) as ex:out=list(ex.map(lambda c:req(c,body),[a,b]))
test('same-field conflict',sorted(x[0] for x in out),[200,409])
v2=versions(a);test('atomic rejection',req(a,{'action':'write','team':1,'fields':{'r0initial':'QA-stale','teamname':'QA-must-not-save'},'expected':{'r0initial':v,'teamname':v2.get('teamname',0)}})[0],409)
test('no partial save',any(r['field_value']=='QA-must-not-save' for r in req(a,{'action':'read','team':1})[1]['records']),False)
def write(c):
 k='r1member'+str(c['member']);v=versions(c).get(k,0)
 return req(c,{'action':'write','team':c['team'],'fields':{k:'QA-load-'+str(c['team'])+'-'+str(c['member'])},'expected':{k:v}})
with concurrent.futures.ThreadPoolExecutor(50) as ex:out=list(ex.map(write,codes[:-1]))
test('50 concurrent writes',sum(x[0]==200 for x in out),50);lat=[x[2] for x in out]
with concurrent.futures.ThreadPoolExecutor(50) as ex:out=list(ex.map(lambda c:req(c,{'action':'read','team':c['team']}),codes[:-1]))
test('50 concurrent reads',sum(x[0]==200 for x in out),50)
test('all teams isolated',all(all(r['team_no']==c['team'] for r in x[1]['records']) for c,x in zip(codes[:-1],out)),True)
r=req(teacher,{'action':'teacher'})[1]['records'];test('ten-team dashboard',len(set(x['team_no'] for x in r)),10)
test('fifty contributions',len([x for x in r if x['field_key'].startswith('r1member')]),50)
v=next((x['version'] for x in r if x['team_no']==1 and x['field_key']=='instructorScore0'),0)
test('teacher grading',req(teacher,{'action':'grade','team':1,'fields':{'instructorScore0':8},'expected':{'instructorScore0':v}})[0],200)
result={'checks':checks,'concurrent_clients':50,'writes_ok':50,'reads_ok':50,'write_p50_ms':round(statistics.median(lat)),'write_p95_ms':round(sorted(lat)[47]),'write_max_ms':round(max(lat))}
p=pathlib.Path('artifacts/alborz-live');p.mkdir(parents=True,exist_ok=True);(p/'api-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
