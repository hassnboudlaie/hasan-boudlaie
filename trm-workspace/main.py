"""TRM Workspace — original, independent implementation of Talent Relationship Management.
Armin Trost (2014) is credited for the conceptual framework, not the source code.
"""
import csv
import hashlib
import hmac
import io
import math
import os
import re
import secrets
import time
from datetime import datetime, timedelta, timezone, date
from typing import Optional, Literal
from uuid import uuid4

from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import create_engine, ForeignKey, Column, String, Integer, Float, DateTime, Boolean, Text, func, UniqueConstraint, select, and_
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from sqlalchemy.exc import IntegrityError

ROOT = os.path.dirname(__file__)
DB_URL = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(ROOT, 'trm.db'))
if DB_URL.startswith('postgres://'): DB_URL = DB_URL.replace('postgres://', 'postgresql://', 1)
engine = create_engine(DB_URL, pool_pre_ping=True, connect_args={'check_same_thread':False} if DB_URL.startswith('sqlite') else {})
DBSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
Base = declarative_base()

def now(): return datetime.now(timezone.utc).replace(tzinfo=None)
def uid(): return str(uuid4())

class Org(Base):
    __tablename__='organizations'
    id=Column(String(36),primary_key=True,default=uid)
    name=Column(String(160),nullable=False)
    slug=Column(String(80),unique=True,nullable=False)
    created_at=Column(DateTime,default=now)

class User(Base):
    __tablename__='users'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),nullable=False,index=True)
    name=Column(String(140),nullable=False)
    email=Column(String(200),nullable=False,unique=True,index=True)
    password_hash=Column(Text,nullable=False)
    role=Column(String(30),default='recruiter')
    active=Column(Boolean,default=True)
    created_at=Column(DateTime,default=now)

class LoginSession(Base):
    __tablename__='login_sessions'
    token_hash=Column(String(64),primary_key=True)
    user_id=Column(String(36),ForeignKey('users.id'),nullable=False,index=True)
    expires_at=Column(DateTime,nullable=False,index=True)
    created_at=Column(DateTime,default=now)

class Position(Base):
    __tablename__='positions'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    title=Column(String(200),nullable=False)
    department=Column(String(180),default='')
    strategic_importance=Column(Integer,default=3)
    market_availability=Column(Integer,default=3)
    future_demand=Column(Integer,default=0)
    current_headcount=Column(Integer,default=0)
    annual_growth_pct=Column(Float,default=0)
    annual_turnover_pct=Column(Float,default=0)
    expected_retirements=Column(Integer,default=0)
    internal_pipeline=Column(Integer,default=0)
    challenges=Column(Text,default='')
    trainable_gaps=Column(Text,default='')
    notes=Column(Text,default='')
    created_at=Column(DateTime,default=now)

class TargetGroup(Base):
    __tablename__='target_groups'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    name=Column(String(200),nullable=False)
    position_id=Column(String(36),nullable=True)
    traits=Column(Text,default='')
    preferences=Column(Text,default='')
    channels=Column(Text,default='')
    created_at=Column(DateTime,default=now)

class Candidate(Base):
    __tablename__='candidates'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    full_name=Column(String(180),nullable=False)
    current_title=Column(String(200),default='')
    company=Column(String(200),default='')
    email=Column(String(200),default='')
    phone=Column(String(65),default='')
    city=Column(String(120),default='')
    skills=Column(Text,default='')
    interests=Column(Text,default='')
    source=Column(String(70),default='direct')
    stage=Column(String(40),default='identified')
    priority=Column(String(1),default='B')
    priority_reason=Column(Text,default='')
    readiness=Column(String(60),default='unknown')
    consent=Column(String(30),default='unknown')
    consent_date=Column(String(20),default='')
    consent_source=Column(String(200),default='')
    do_not_contact=Column(Boolean,default=False)
    target_group_id=Column(String(36),nullable=True)
    position_id=Column(String(36),nullable=True)
    owner_id=Column(String(36),nullable=True)
    next_followup=Column(String(10),default='')
    notes=Column(Text,default='')
    archived=Column(Boolean,default=False)
    created_at=Column(DateTime,default=now)
    updated_at=Column(DateTime,default=now,onupdate=now)

class Activity(Base):
    __tablename__='activities'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    candidate_id=Column(String(36),nullable=False,index=True)
    actor_id=Column(String(36),nullable=False)
    type=Column(String(40),default='followup')
    summary=Column(String(240),nullable=False)
    details=Column(Text,default='')
    due_date=Column(String(10),default='')
    completed=Column(Boolean,default=False)
    completed_at=Column(DateTime,nullable=True)
    created_at=Column(DateTime,default=now)

class EVP(Base):
    __tablename__='evps'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    title=Column(String(200),nullable=False)
    position_id=Column(String(36),nullable=True)
    target_group_id=Column(String(36),nullable=True)
    strengths=Column(Text,default='')
    preferences=Column(Text,default='')
    differentiation=Column(Text,default='')
    evidence=Column(Text,default='')
    promise=Column(Text,default='')
    outreach=Column(Text,default='')
    created_at=Column(DateTime,default=now)

class Referral(Base):
    __tablename__='referrals'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    candidate_id=Column(String(36),nullable=True)
    referrer=Column(String(160),nullable=False)
    candidate_name=Column(String(180),nullable=False)
    candidate_contact=Column(String(200),default='')
    reason=Column(Text,default='')
    status=Column(String(30),default='new')
    created_at=Column(DateTime,default=now)

class Survey(Base):
    __tablename__='candidate_surveys'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    candidate_id=Column(String(36),nullable=False)
    speed=Column(Integer,nullable=False)
    transparency=Column(Integer,nullable=False)
    appreciation=Column(Integer,nullable=False)
    feedback=Column(Text,default='')
    created_at=Column(DateTime,default=now)

class Invite(Base):
    __tablename__='invites'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    email=Column(String(200),nullable=False)
    role=Column(String(30),nullable=False)
    code_hash=Column(String(64),nullable=False,unique=True)
    expires_at=Column(DateTime,nullable=False)
    used=Column(Boolean,default=False)
    created_at=Column(DateTime,default=now)

class Audit(Base):
    __tablename__='audit_log'
    id=Column(String(36),primary_key=True,default=uid)
    org_id=Column(String(36),ForeignKey('organizations.id'),index=True,nullable=False)
    actor_id=Column(String(36),nullable=False)
    action=Column(String(70),nullable=False)
    entity=Column(String(70),nullable=False)
    entity_id=Column(String(36),default='')
    created_at=Column(DateTime,default=now)

Base.metadata.create_all(engine)
app=FastAPI(title='TRM Workspace',version='1.0.0')
app.mount('/static',StaticFiles(directory=os.path.join(ROOT,'static')),name='static')

@app.middleware('http')
async def security_headers(request: Request,call_next):
    response=await call_next(request)
    response.headers['X-Content-Type-Options']='nosniff'
    response.headers['X-Frame-Options']='DENY'
    response.headers['Referrer-Policy']='strict-origin-when-cross-origin'
    response.headers['Permissions-Policy']='camera=(), microphone=(), geolocation=()'
    response.headers['Content-Security-Policy']="default-src 'self'; img-src 'self' data: https://images.unsplash.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    if request.url.path.startswith('/api/'):
        response.headers['Cache-Control']='no-store'
    return response

def session_db():
    db=DBSession()
    try: yield db
    finally: db.close()

def hash_password(password):
    salt=secrets.token_bytes(16); rounds=240_000
    dk=hashlib.pbkdf2_hmac('sha256',password.encode(),salt,rounds)
    return 'pbkdf2_sha256$'+str(rounds)+'$'+salt.hex()+'$'+dk.hex()

def verify_password(password,encoded):
    try:
        _,rounds,salt,digest=encoded.split('$')
        check=hashlib.pbkdf2_hmac('sha256',password.encode(),bytes.fromhex(salt),int(rounds))
        return hmac.compare_digest(check,bytes.fromhex(digest))
    except Exception:return False

def email_norm(v):
    v=(v or '').strip().lower()
    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$',v):raise HTTPException(422,'ایمیل معتبر نیست.')
    return v

def require_user(request:Request,db:Session=Depends(session_db)):
    token=request.cookies.get('trm_sid')
    if not token:raise HTTPException(401,'ابتدا وارد حساب کاربری شوید.')
    s=db.get(LoginSession,hashlib.sha256(token.encode()).hexdigest())
    if not s or s.expires_at<=now():raise HTTPException(401,'نشست شما منقضی شده است.')
    user=db.get(User,s.user_id)
    if not user or not user.active:raise HTTPException(401,'حساب غیرفعال است.')
    return user

def require_editor(user:User=Depends(require_user)):
    if user.role not in ['owner','admin','recruiter','manager']:raise HTTPException(403,'دسترسی ویرایش ندارید.')
    return user

def require_hr(user:User=Depends(require_user)):
    if user.role not in ['owner','admin','recruiter']:raise HTTPException(403,'این اقدام مخصوص تیم جذب است.')
    return user

def require_admin(user:User=Depends(require_user)):
    if user.role not in ['owner','admin']:raise HTTPException(403,'این اقدام مخصوص مدیر سازمان است.')
    return user

def audit(db,user,action,entity,obj_id=''):
    db.add(Audit(org_id=user.org_id,actor_id=user.id,action=action,entity=entity,entity_id=obj_id))

def secure_cookie(response,raw):
    response.set_cookie('trm_sid',raw,max_age=60*60*24*14,secure=os.getenv('COOKIE_SECURE','false').lower()=='true',httponly=True,samesite='lax',path='/')

def make_session(response,db,user):
    raw=secrets.token_urlsafe(48)
    db.add(LoginSession(token_hash=hashlib.sha256(raw.encode()).hexdigest(),user_id=user.id,expires_at=now()+timedelta(days=14)))
    db.commit();secure_cookie(response,raw)

class RegisterIn(BaseModel):
    org_name:str=Field(min_length=2,max_length=160)
    name:str=Field(min_length=2,max_length=140)
    email:str
    password:str=Field(min_length=10,max_length=200)

class LoginIn(BaseModel):
    email:str
    password:str

@app.get('/')
def home():return FileResponse(os.path.join(ROOT,'static','index.html'),headers={'Cache-Control':'no-store'})

@app.get('/health')
def health():return {'status':'ok','service':'trm-workspace'}

@app.post('/api/auth/register')
def register(payload:RegisterIn,response:Response,db:Session=Depends(session_db)):
    mail=email_norm(payload.email)
    if db.query(User).filter(User.email==mail).first():raise HTTPException(409,'این ایمیل قبلاً ثبت شده است.')
    slug='trm-'+secrets.token_hex(5)
    org=Org(name=payload.org_name.strip(),slug=slug);db.add(org);db.flush()
    user=User(org_id=org.id,name=payload.name.strip(),email=mail,password_hash=hash_password(payload.password),role='owner')
    db.add(user);db.flush();audit(db,user,'create','organization',org.id)
    make_session(response,db,user)
    return {'ok':True,'org':org.name,'user':user.name}

@app.post('/api/auth/login')
def login(payload:LoginIn,response:Response,db:Session=Depends(session_db)):
    mail=email_norm(payload.email)
    user=db.query(User).filter(User.email==mail).first()
    if not user or not user.active or not verify_password(payload.password,user.password_hash):raise HTTPException(401,'ایمیل یا رمز عبور درست نیست.')
    make_session(response,db,user)
    return {'ok':True}

@app.post('/api/auth/logout')
def logout(request:Request,response:Response,db:Session=Depends(session_db)):
    token=request.cookies.get('trm_sid')
    if token:db.query(LoginSession).filter(LoginSession.token_hash==hashlib.sha256(token.encode()).hexdigest()).delete();db.commit()
    response.delete_cookie('trm_sid',path='/');return {'ok':True}

@app.get('/api/me')
def me(user:User=Depends(require_user),db:Session=Depends(session_db)):
    org=db.get(Org,user.org_id)
    return {'user':{'id':user.id,'name':user.name,'email':user.email,'role':user.role},'org':{'id':org.id,'name':org.name,'slug':org.slug}}

def scoped(db,cls,user):return db.query(cls).filter(cls.org_id==user.org_id)

def pick(db,cls,id,user):
    item=scoped(db,cls,user).filter(cls.id==id).first()
    if not item:raise HTTPException(404,'این مورد در فضای سازمان شما وجود ندارد.')
    return item

def record(obj):
    return {column.name:(getattr(obj,column.name).isoformat() if isinstance(getattr(obj,column.name),(datetime,date)) else getattr(obj,column.name)) for column in obj.__table__.columns}

CANDIDATE_FIELDS={'full_name','current_title','company','email','phone','city','skills','interests','source','stage','priority','priority_reason','readiness','consent','consent_date','consent_source','do_not_contact','target_group_id','position_id','owner_id','next_followup','notes','archived'}
STAGES={'identified','contacted','interested','nurturing','opportunity','selection','hired','declined','archived'}
SOURCES={'direct','referral','alumni','internship','campus','community','scouting','event','other'}

class CandidateIn(BaseModel):
    full_name:str=Field(min_length=2,max_length=180)
    current_title:str='';company:str='';email:str='';phone:str='';city:str=''
    skills:str='';interests:str='';source:str='direct';stage:str='identified';priority:str='B'
    priority_reason:str='';readiness:str='unknown';consent:str='unknown';consent_date:str='';consent_source:str=''
    do_not_contact:bool=False;target_group_id:Optional[str]=None;position_id:Optional[str]=None;owner_id:Optional[str]=None
    next_followup:str='';notes:str='';archived:bool=False

    @field_validator('priority')
    @classmethod
    def validate_priority(cls,v):
        if v not in ['A','B','C']:raise ValueError('Invalid priority')
        return v
    @field_validator('stage')
    @classmethod
    def validate_stage(cls,v):
        if v not in STAGES:raise ValueError('Invalid stage')
        return v
    @field_validator('source')
    @classmethod
    def validate_source(cls,v):
        if v not in SOURCES:raise ValueError('Invalid source')
        return v
    @field_validator('consent')
    @classmethod
    def validate_consent(cls,v):
        if v not in ['unknown','granted','revoked']:raise ValueError('Invalid consent')
        return v
    @field_validator('next_followup')
    @classmethod
    def validate_date(cls,v):
        if v:
            try:date.fromisoformat(v)
            except ValueError:raise ValueError('Invalid ISO date')
        return v

@app.get('/api/candidates')
def candidates(q:str='',stage:str='',priority:str='',include_archived:bool=False,user:User=Depends(require_user),db:Session=Depends(session_db)):
    query=scoped(db,Candidate,user)
    if not include_archived:query=query.filter(Candidate.archived.is_(False))
    if stage:query=query.filter(Candidate.stage==stage)
    if priority:query=query.filter(Candidate.priority==priority)
    if q:
        esc='%'+q.strip()[:100]+'%'
        query=query.filter((Candidate.full_name.ilike(esc))|(Candidate.current_title.ilike(esc))|(Candidate.company.ilike(esc))|(Candidate.skills.ilike(esc)))
    return [record(x) for x in query.order_by(Candidate.updated_at.desc()).limit(2000).all()]

@app.post('/api/candidates')
def create_candidate(payload:CandidateIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    validate_related(db,user,payload.model_dump())
    if payload.email and scoped(db,Candidate,user).filter(func.lower(Candidate.email)==payload.email.strip().lower(),Candidate.archived.is_(False)).first():
        raise HTTPException(409,'استعداد دیگری با همین ایمیل در سازمان ثبت شده است.')
    obj=Candidate(org_id=user.org_id,**payload.model_dump());db.add(obj);db.flush();audit(db,user,'create','candidate',obj.id);db.commit()
    return record(obj)

@app.get('/api/candidates/{item_id}')
def get_candidate(item_id:str,user:User=Depends(require_user),db:Session=Depends(session_db)):
    item=pick(db,Candidate,item_id,user)
    acts=scoped(db,Activity,user).filter(Activity.candidate_id==item_id).order_by(Activity.created_at.desc()).all()
    surveys=scoped(db,Survey,user).filter(Survey.candidate_id==item_id).all()
    return {'candidate':record(item),'activities':[record(a) for a in acts],'surveys':[record(a) for a in surveys]}

@app.put('/api/candidates/{item_id}')
def update_candidate(item_id:str,payload:CandidateIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    obj=pick(db,Candidate,item_id,user)
    validate_related(db,user,payload.model_dump())
    for k,v in payload.model_dump().items():setattr(obj,k,v)
    obj.updated_at=now();audit(db,user,'update','candidate',item_id);db.commit();return record(obj)

@app.delete('/api/candidates/{item_id}')
def delete_candidate(item_id:str,user:User=Depends(require_admin),db:Session=Depends(session_db)):
    obj=pick(db,Candidate,item_id,user)
    scoped(db,Activity,user).filter(Activity.candidate_id==item_id).delete(synchronize_session=False)
    scoped(db,Survey,user).filter(Survey.candidate_id==item_id).delete(synchronize_session=False)
    audit(db,user,'delete','candidate',item_id);db.delete(obj);db.commit();return {'ok':True}

def validate_related(db,user,fields):
    for key,table in [('position_id',Position),('target_group_id',TargetGroup),('owner_id',User)]:
        value=fields.get(key)
        if value:
            query=db.query(table).filter(table.id==value,table.org_id==user.org_id)
            if not query.first():raise HTTPException(422,f'Invalid {key} for this organization')

@app.get('/api/candidates-export')
def export_candidates(user:User=Depends(require_hr),db:Session=Depends(session_db)):
    rows=scoped(db,Candidate,user).all();output=io.StringIO();fields=sorted(CANDIDATE_FIELDS)
    writer=csv.DictWriter(output,fieldnames=fields);writer.writeheader()
    for obj in rows:writer.writerow({k:getattr(obj,k) for k in fields})
    audit(db,user,'export','candidates');db.commit()
    content='\ufeff'+output.getvalue()
    return Response(content=content,media_type='text/csv; charset=utf-8',headers={'Content-Disposition':'attachment; filename="trm-candidates.csv"'})

@app.post('/api/candidates-import')
async def import_candidates(request:Request,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    body=await request.body()
    if len(body)>2_000_000:raise HTTPException(413,'فایل بیش از حد بزرگ است.')
    try:input_csv=io.StringIO(body.decode('utf-8-sig'));records=list(csv.DictReader(input_csv))
    except Exception:raise HTTPException(422,'فایل CSV قابل خواندن نیست.')
    if len(records)>500:raise HTTPException(422,'در هر نوبت حداکثر ۵۰۰ رکورد وارد کنید.')
    imported=0;skipped=0
    for row in records:
        name=(row.get('full_name') or '').strip()
        email=(row.get('email') or '').strip()
        if len(name)<2 or (email and scoped(db,Candidate,user).filter(func.lower(Candidate.email)==email.lower()).first()):
            skipped+=1;continue
        d={k:row.get(k) for k in CANDIDATE_FIELDS if row.get(k) is not None and k not in ['position_id','target_group_id','owner_id','archived','do_not_contact']}
        for k in ['stage','priority','source','consent']:
            allowed={'stage':STAGES,'priority':{'A','B','C'},'source':SOURCES,'consent':{'unknown','granted','revoked'}}[k]
            if k in d and d[k] not in allowed: d.pop(k)
        d['full_name']=name
        try:validated=CandidateIn(**d)
        except Exception:skipped+=1;continue
        db.add(Candidate(org_id=user.org_id,**validated.model_dump()));imported+=1
    audit(db,user,'import','candidates');db.commit();return {'imported':imported,'skipped':skipped}

class PositionIn(BaseModel):
    title:str=Field(min_length=2,max_length=200)
    department:str=''
    strategic_importance:int=Field(default=3,ge=1,le=5)
    market_availability:int=Field(default=3,ge=1,le=5)
    future_demand:int=Field(default=0,ge=0,le=100000)
    current_headcount:int=Field(default=0,ge=0,le=100000)
    annual_growth_pct:float=Field(default=0,ge=-100,le=500)
    annual_turnover_pct:float=Field(default=0,ge=0,le=100)
    expected_retirements:int=Field(default=0,ge=0,le=100000)
    internal_pipeline:int=Field(default=0,ge=0,le=100000)
    challenges:str='';trainable_gaps:str='';notes:str=''

class GroupIn(BaseModel):
    name:str=Field(min_length=2,max_length=200)
    position_id:Optional[str]=None
    traits:str='';preferences:str='';channels:str=''

class EVPIn(BaseModel):
    title:str=Field(min_length=2,max_length=200)
    position_id:Optional[str]=None;target_group_id:Optional[str]=None
    strengths:str='';preferences:str='';differentiation:str='';evidence:str='';promise:str='';outreach:str=''

@app.get('/api/positions')
def list_positions(user:User=Depends(require_user),db:Session=Depends(session_db)):
    return [record(x) for x in scoped(db,Position,user).order_by(Position.created_at.desc()).all()]

@app.post('/api/positions')
def post_position(p:PositionIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    x=Position(org_id=user.org_id,**p.model_dump());db.add(x);db.flush();audit(db,user,'create','position',x.id);db.commit();return record(x)

@app.put('/api/positions/{id}')
def put_position(id:str,p:PositionIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    x=pick(db,Position,id,user)
    for k,v in p.model_dump().items():setattr(x,k,v)
    audit(db,user,'update','position',id);db.commit();return record(x)

@app.delete('/api/positions/{id}')
def del_position(id:str,user:User=Depends(require_admin),db:Session=Depends(session_db)):
    x=pick(db,Position,id,user)
    for table in [Candidate,TargetGroup,EVP]:scoped(db,table,user).filter(table.position_id==id).update({'position_id':None},synchronize_session=False)
    audit(db,user,'delete','position',id);db.delete(x);db.commit();return {'ok':True}

@app.get('/api/target-groups')
def list_groups(user:User=Depends(require_user),db:Session=Depends(session_db)):
    return [record(x) for x in scoped(db,TargetGroup,user).all()]

@app.post('/api/target-groups')
def post_group(p:GroupIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    validate_related(db,user,p.model_dump())
    x=TargetGroup(org_id=user.org_id,**p.model_dump());db.add(x);db.flush();audit(db,user,'create','target_group',x.id);db.commit();return record(x)

@app.put('/api/target-groups/{id}')
def put_group(id:str,p:GroupIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    x=pick(db,TargetGroup,id,user);validate_related(db,user,p.model_dump())
    for k,v in p.model_dump().items():setattr(x,k,v)
    audit(db,user,'update','target_group',id);db.commit();return record(x)

@app.get('/api/evps')
def list_evps(user:User=Depends(require_user),db:Session=Depends(session_db)):
    return [record(x) for x in scoped(db,EVP,user).all()]

@app.post('/api/evps')
def post_evp(p:EVPIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    validate_related(db,user,p.model_dump());x=EVP(org_id=user.org_id,**p.model_dump())
    db.add(x);db.flush();audit(db,user,'create','evp',x.id);db.commit();return record(x)

@app.put('/api/evps/{id}')
def put_evp(id:str,p:EVPIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    x=pick(db,EVP,id,user);validate_related(db,user,p.model_dump())
    for k,v in p.model_dump().items():setattr(x,k,v)
    audit(db,user,'update','evp',id);db.commit();return record(x)

class ActivityIn(BaseModel):
    candidate_id:str
    type:Literal['call','email','meeting','event','followup','note','referral','selection']='followup'
    summary:str=Field(min_length=2,max_length=240)
    details:str=''
    due_date:str=''
    completed:bool=False

@app.get('/api/activities')
def get_activities(pending:bool=False,user:User=Depends(require_user),db:Session=Depends(session_db)):
    q=scoped(db,Activity,user)
    if pending:q=q.filter(Activity.completed.is_(False))
    return [record(x) for x in q.order_by(Activity.created_at.desc()).limit(1500).all()]

@app.post('/api/activities')
def create_activity(p:ActivityIn,user:User=Depends(require_editor),db:Session=Depends(session_db)):
    c=pick(db,Candidate,p.candidate_id,user)
    if p.due_date:
        try:date.fromisoformat(p.due_date)
        except ValueError:raise HTTPException(422,'تاریخ معتبر نیست.')
    x=Activity(org_id=user.org_id,actor_id=user.id,**p.model_dump())
    if x.completed:x.completed_at=now()
    db.add(x);db.flush()
    if x.due_date and not x.completed:c.next_followup=x.due_date
    audit(db,user,'create','activity',x.id);db.commit();return record(x)

@app.patch('/api/activities/{id}/complete')
def complete_activity(id:str,user:User=Depends(require_editor),db:Session=Depends(session_db)):
    x=pick(db,Activity,id,user);x.completed=True;x.completed_at=now()
    c=pick(db,Candidate,x.candidate_id,user)
    nexts=scoped(db,Activity,user).filter(Activity.candidate_id==c.id,Activity.id!=id,Activity.completed.is_(False),Activity.due_date!='').order_by(Activity.due_date.asc()).first()
    c.next_followup=nexts.due_date if nexts else ''
    audit(db,user,'complete','activity',id);db.commit();return record(x)

class ReferralIn(BaseModel):
    candidate_id:Optional[str]=None
    referrer:str=Field(min_length=2,max_length=160)
    candidate_name:str=Field(min_length=2,max_length=180)
    candidate_contact:str='';reason:str='';status:str='new'

@app.get('/api/referrals')
def list_referrals(user:User=Depends(require_user),db:Session=Depends(session_db)):
    return [record(x) for x in scoped(db,Referral,user).all()]

@app.post('/api/referrals')
def post_referral(p:ReferralIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    if p.candidate_id:pick(db,Candidate,p.candidate_id,user)
    x=Referral(org_id=user.org_id,**p.model_dump());db.add(x);db.flush();audit(db,user,'create','referral',x.id);db.commit();return record(x)

class SurveyIn(BaseModel):
    candidate_id:str
    speed:int=Field(ge=1,le=5)
    transparency:int=Field(ge=1,le=5)
    appreciation:int=Field(ge=1,le=5)
    feedback:str=''

@app.post('/api/surveys')
def post_survey(p:SurveyIn,user:User=Depends(require_hr),db:Session=Depends(session_db)):
    pick(db,Candidate,p.candidate_id,user)
    x=Survey(org_id=user.org_id,**p.model_dump());db.add(x);db.flush();audit(db,user,'create','candidate_survey',x.id);db.commit();return record(x)

@app.get('/api/dashboard')
def dashboard(user:User=Depends(require_user),db:Session=Depends(session_db)):
    all_c=scoped(db,Candidate,user).filter(Candidate.archived.is_(False)).all()
    tasks=scoped(db,Activity,user).filter(Activity.completed.is_(False)).all()
    positions=scoped(db,Position,user).all();surveys=scoped(db,Survey,user).all()
    today=date.today().isoformat()
    overdue=[a for a in tasks if a.due_date and a.due_date<today]
    due_soon=[a for a in tasks if a.due_date and a.due_date<= (date.today()+timedelta(days=7)).isoformat()]
    stagecounts={s:sum(c.stage==s for c in all_c) for s in STAGES}
    src={s:sum(c.source==s for c in all_c) for s in SOURCES}
    avg=None
    if len(surveys)>=3:avg={k:round(sum(getattr(s,k) for s in surveys)/len(surveys),1) for k in ('speed','transparency','appreciation')}
    qualified=sum(c.priority=='A' for c in all_c)
    return {'total':len(all_c),'priority_a':qualified,'overdue':len(overdue),'due_soon':len(due_soon),
      'positions':len(positions),'sources':src,'stages':stagecounts,'surveys_count':len(surveys),'survey_averages':avg,
      'upcoming':[{'id':a.id,'candidate_id':a.candidate_id,'name':next((c.full_name for c in all_c if c.id==a.candidate_id),'—'),'summary':a.summary,'due_date':a.due_date,'overdue':bool(a.due_date and a.due_date<today)} for a in sorted(due_soon,key=lambda a:a.due_date)[:12]]}

@app.get('/api/members')
def members(user:User=Depends(require_admin),db:Session=Depends(session_db)):
    return [{'id':m.id,'name':m.name,'email':m.email,'role':m.role,'active':m.active} for m in scoped(db,User,user).all()]

class InviteIn(BaseModel):
    email:str
    role:Literal['admin','recruiter','manager','viewer']='recruiter'

@app.post('/api/invites')
def create_invite(p:InviteIn,user:User=Depends(require_admin),db:Session=Depends(session_db)):
    mail=email_norm(p.email)
    if db.query(User).filter(User.email==mail).first():raise HTTPException(409,'این ایمیل قبلاً عضو یک سازمان است.')
    code=secrets.token_urlsafe(32)
    obj=Invite(org_id=user.org_id,email=mail,role=p.role,code_hash=hashlib.sha256(code.encode()).hexdigest(),expires_at=now()+timedelta(days=7))
    db.add(obj);db.flush();audit(db,user,'invite','member',obj.id);db.commit()
    return {'code':code,'expires_days':7,'email':mail}

class AcceptInviteIn(BaseModel):
    code:str
    name:str=Field(min_length=2,max_length=140)
    password:str=Field(min_length=10,max_length=200)

@app.get('/api/invites/preview/{code}')
def invite_preview(code:str,db:Session=Depends(session_db)):
    item=db.query(Invite).filter(Invite.code_hash==hashlib.sha256(code.encode()).hexdigest(),Invite.used.is_(False),Invite.expires_at>now()).first()
    if not item:raise HTTPException(404,'دعوت‌نامه معتبر نیست یا منقضی شده است.')
    org=db.get(Org,item.org_id)
    return {'email':item.email,'org':org.name,'role':item.role}

@app.post('/api/invites/accept')
def invite_accept(p:AcceptInviteIn,response:Response,db:Session=Depends(session_db)):
    code_hash=hashlib.sha256(p.code.encode()).hexdigest()
    inv=db.query(Invite).filter(Invite.code_hash==code_hash,Invite.used.is_(False),Invite.expires_at>now()).first()
    if not inv:raise HTTPException(404,'دعوت‌نامه معتبر نیست یا منقضی شده است.')
    if db.query(User).filter(User.email==inv.email).first():raise HTTPException(409,'حسابی با این ایمیل از قبل وجود دارد.')
    user=User(org_id=inv.org_id,name=p.name,email=inv.email,password_hash=hash_password(p.password),role=inv.role)
    db.add(user);inv.used=True;db.flush();audit(db,user,'accept_invite','user',user.id);make_session(response,db,user)
    return {'ok':True}

@app.patch('/api/members/{id}/toggle')
def member_toggle(id:str,user:User=Depends(require_admin),db:Session=Depends(session_db)):
    if user.id==id:raise HTTPException(409,'نمی‌توانید دسترسی خودتان را قطع کنید.')
    obj=pick(db,User,id,user)
    if obj.role=='owner':raise HTTPException(403,'امکان غیرفعال کردن مالک وجود ندارد.')
    obj.active=not obj.active;audit(db,user,'toggle_access','user',id)
    if not obj.active:db.query(LoginSession).filter(LoginSession.user_id==id).delete()
    db.commit();return {'active':obj.active}

@app.get('/api/audit')
def get_audit(user:User=Depends(require_admin),db:Session=Depends(session_db)):
    return [record(x) for x in scoped(db,Audit,user).order_by(Audit.created_at.desc()).limit(100).all()]

@app.get('/manifest.webmanifest')
def manifest():return FileResponse(os.path.join(ROOT,'static','manifest.webmanifest'),media_type='application/manifest+json')

@app.get('/sw.js')
def worker():return FileResponse(os.path.join(ROOT,'static','sw.js'),media_type='text/javascript',headers={'Cache-Control':'no-cache'})