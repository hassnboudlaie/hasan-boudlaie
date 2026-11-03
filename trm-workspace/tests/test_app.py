"""Smoke and cross-tenant security tests for actual TRM Workspace APIs."""
import importlib
import os
import sys
import tempfile
from pathlib import Path
from fastapi.testclient import TestClient

TEMP=tempfile.TemporaryDirectory()
os.environ['DATABASE_URL']='sqlite:///'+str(Path(TEMP.name)/'test.db')
os.environ['COOKIE_SECURE']='false'
sys.path.insert(0,str(Path(__file__).parents[1]))
from main import app

def register(client,label,mail):
    r=client.post('/api/auth/register',json={'org_name':'شرکت '+label,'name':'مدیر '+label,'email':mail,'password':'StrongPass12345'})
    assert r.status_code==200,r.text

def test_isolation_and_user_roles():
    a=TestClient(app);b=TestClient(app)
    register(a,'الف','a@example.org');register(b,'ب','b@example.org')
    role_a=a.post('/api/positions',json={'title':'مهندس ارشد','strategic_importance':5,'market_availability':1,'future_demand':10})
    assert role_a.status_code==200
    p=role_a.json()['id']
    c=a.post('/api/candidates',json={'full_name':'نمونه پژوهشی','email':'candidate@example.org','position_id':p,'priority':'A','priority_reason':'پروژه‌های موفق'});assert c.status_code==200,c.text
    cid=c.json()['id']
    assert len(a.get('/api/candidates').json())==1
    assert b.get('/api/candidates').json()==[]
    assert b.get('/api/positions').json()==[]
    assert b.get('/api/candidates/'+cid).status_code==404
    assert b.delete('/api/candidates/'+cid).status_code==404
    assert b.post('/api/activities',json={'candidate_id':cid,'summary':'پیگیری'}).status_code==404
    assert b.post('/api/candidates',json={'full_name':'تلاش غیرمجاز','position_id':p}).status_code==422
    assert b.post('/api/surveys',json={'candidate_id':cid,'speed':5,'transparency':5,'appreciation':5}).status_code==404
    assert a.get('/api/dashboard').json()['total']==1
    assert b.get('/api/dashboard').json()['total']==0
    a.post('/api/activities',json={'candidate_id':cid,'summary':'تماس برای آینده','due_date':'2026-11-04'})
    assert a.get('/api/dashboard').json()['due_soon']>=0
    assert len(b.get('/api/activities').json())==0
    assert a.get('/api/candidates-export').status_code==200
    assert 'نمونه پژوهشی' in a.get('/api/candidates-export').text
    assert 'نمونه پژوهشی' not in b.get('/api/candidates-export').text
    invite=a.post('/api/invites',json={'email':'team@example.org','role':'viewer'});assert invite.status_code==200,invite.text
    code=invite.json()['code']
    member=TestClient(app)
    accepted=member.post('/api/invites/accept',json={'code':code,'name':'همکار آزمایشی','password':'StrongPass12345'});assert accepted.status_code==200,accepted.text
    assert len(member.get('/api/candidates').json())==1
    assert member.post('/api/candidates',json={'full_name':'غیرمجاز'}).status_code==403
    assert member.get('/api/members').status_code==403
    assert member.post('/api/invites',json={'email':'someone@example.org'}).status_code==403
    assert b.get('/api/invites/preview/'+code).status_code==404
    assert a.get('/api/members').status_code==200
    assert a.get('/api/audit').status_code==200
    assert a.get('/api/health').status_code==404 # health lives outside api namespace
    assert a.get('/health').status_code==200

def test_pwa_and_public_shell():
    c=TestClient(app)
    html=c.get('/').text
    assert 'TRM Workspace' in html and 'dir="rtl"' in html
    manifest=c.get('/manifest.webmanifest').json()
    assert manifest['display']=='standalone' and manifest['id'] and manifest['scope']=='/'
    assert c.get('/static/icon-192.png').status_code==200
    assert c.get('/static/icon-512.png').status_code==200
    sw=c.get('/sw.js').text
    assert "'/api/'" in sw and 'trm-workspace' in sw
    assert c.get('/api/candidates').status_code==401