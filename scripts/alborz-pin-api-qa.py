"""Uses a private credential file; never prints credentials or response payloads."""
import json,sys,urllib.request,urllib.error,concurrent.futures
url='https://cymatyfnwuxikrghydrn.supabase.co/functions/v1/alborz-workshop-sync'
c=json.load(open(sys.argv[1])); sessions=[]
def call(code,action,**kw):
 req=urllib.request.Request(url,data=json.dumps(dict(code=code,action=action,**kw)).encode(),headers={'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=35) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
def login(row):
 status,d=call(row['code'],'login');assert status==200,('login',status)
 assert d['identity']=={'role':'team','team':row['team'],'member':row['member']}
 assert len(d['session'])==64
 return dict(row,code=d['session'])
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:sessions=list(pool.map(login,c['members']))
print('PASS 50 PIN logins and automatic identities')
a=sessions[0];teacher=c['teacher']['code']
for code,action,kw,expected in [(a['code'],'read',{'team':2},403),(a['code'],'teacher',{},403),(a['code'],'grade',{'team':1},403),(a['code'],'write',{'team':1,'fields':{'r0member2':'denied'},'expected':{'r0member2':0}},403),(c['members'][0]['code'],'read',{'team':1},401),('not-a-code','login',{},401)]:
 assert call(code,action,**kw)[0]==expected,(action,expected)
print('PASS invalid login, cross-team, cross-member and instructor isolation')
def write(row):
 k='r3member'+str(row['member']);status,d=call(row['code'],'read',team=row['team']);assert status==200
 version=next((r['version'] for r in d['records'] if r['field_key']==k),0)
 status,d=call(row['code'],'write',team=row['team'],fields={k:'QA-PIN-SYNC'},expected={k:version});assert status==200
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:list(pool.map(write,sessions))
for row in sessions:
 status,d=call(row['code'],'read',team=row['team']);assert status==200
 assert sum(r['field_value']=='QA-PIN-SYNC' for r in d['records'])==5
status,d=call(teacher,'teacher');assert status==200;assert sum(r['field_value']=='QA-PIN-SYNC' for r in d['records'])==50
print('PASS 50 writes, 50 reads and instructor visibility')
assert call(a['code'],'logout')[0]==200
assert call(a['code'],'read',team=1)[0]==401
print('PASS server-side session revocation')
# Reach the per-IP ceiling with nonexistent PINs; do not print the guessed values.
existing={r['code'] for r in c['members']};guess=next(f'{i:08d}' for i in range(1000) if f'{i:08d}' not in existing)
statuses=[call(guess,'login')[0] for _ in range(12)]
assert 429 in statuses, statuses
assert call(sessions[1]['code'],'read',team=1)[0]==200
print('PASS login throttle and uninterrupted existing session')
