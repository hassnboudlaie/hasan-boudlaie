-- Allameh MBA: centrally submitted, instructor-evaluated case analysis.
-- Isolated namespace; no finance/Kish/insurance tables altered.
create table if not exists public.mba_ob_case_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.mba_ob_students(id),
  session_no integer not null check (session_no in (1,2)),
  case_title text not null,
  framework_version integer not null default 1,
  answers jsonb not null,
  status text not null default 'submitted' check (status in ('submitted','reviewed','revision_requested')),
  score numeric(4,1) check (score between 0 and 20),
  feedback text,
  submitted_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  reviewed_at timestamptz,
  revision_no integer not null default 1 check (revision_no >=1),
  unique (student_id,session_no),
  check (jsonb_typeof(answers)='object'),
  check (octet_length(answers::text)<=20000),
  check (feedback is null or char_length(feedback)<=3000)
);
create table if not exists public.mba_ob_case_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.mba_ob_case_submissions(id) on delete cascade,
  revision_no integer not null,
  decision text not null check (decision in ('reviewed','revision_requested')),
  score numeric(4,1) check (score between 0 and 20),
  feedback text not null check (char_length(btrim(feedback)) between 8 and 3000),
  reviewed_at timestamptz not null default clock_timestamp()
);
create index if not exists mba_ob_case_submissions_session_idx
  on public.mba_ob_case_submissions(session_no,status,submitted_at desc);
create index if not exists mba_ob_case_reviews_submission_idx
  on public.mba_ob_case_reviews(submission_id,reviewed_at desc);
alter table public.mba_ob_case_submissions enable row level security;
alter table public.mba_ob_case_reviews enable row level security;
revoke all on public.mba_ob_case_submissions,public.mba_ob_case_reviews from public,anon,authenticated;
grant select,insert,update,delete on public.mba_ob_case_submissions,public.mba_ob_case_reviews to service_role;

-- Atomic student submission. Once submitted/reviewed, can change only after instructor requests revision.
create or replace function public.mba_ob_submit_case(
 p_student_id uuid,p_session_no integer,p_answers jsonb
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_existing public.mba_ob_case_submissions%rowtype;v_id uuid;
        v_rev integer;v_title text;v_key text;
begin
 if p_session_no not in (1,2) then
  return jsonb_build_object('ok',false,'error','case_not_published');
 end if;
 if not exists (select 1 from public.mba_ob_students
  where id=p_student_id and approval_status='approved' and disabled_at is null) then
  return jsonb_build_object('ok',false,'error','approval_required');
 end if;
 if p_answers is null or jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>20000
    or (select count(*) from jsonb_object_keys(p_answers))<>6 then
  return jsonb_build_object('ok',false,'error','invalid_case_answers');
 end if;
 foreach v_key in array array['problem','evidence','levels','explain','intervention','measurement'] loop
  if jsonb_typeof(p_answers->v_key) is distinct from 'string'
   or char_length(btrim(p_answers->>v_key)) not between 8 and 3000 then
   return jsonb_build_object('ok',false,'error','incomplete_case_answer','field',v_key);
  end if;
 end loop;
 v_title:=case p_session_no when 1 then 'مرکز خدمات سپهر: افزایش تعداد پاسخ‌ها، افت کیفیت'
                                  else 'ارزیابی عملکرد در واحد فروش: وقتی برداشت جای شواهد را می‌گیرد' end;
 select * into v_existing from public.mba_ob_case_submissions
  where student_id=p_student_id and session_no=p_session_no for update;
 if found and v_existing.status<>'revision_requested' then
  return jsonb_build_object('ok',false,'error','case_already_submitted','status',v_existing.status);
 end if;
 if found then
  update public.mba_ob_case_submissions set
    answers=p_answers,case_title=v_title,framework_version=1,
    status='submitted',score=null,feedback=null,reviewed_at=null,
    submitted_at=clock_timestamp(),updated_at=clock_timestamp(),revision_no=revision_no+1
    where id=v_existing.id returning id,revision_no into v_id,v_rev;
 else
  insert into public.mba_ob_case_submissions(student_id,session_no,case_title,answers)
    values(p_student_id,p_session_no,v_title,p_answers)
    returning id,revision_no into v_id,v_rev;
 end if;
 return jsonb_build_object('ok',true,'status','submitted','id',v_id,'revision_no',v_rev);
end;
$$;
revoke all on function public.mba_ob_submit_case(uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.mba_ob_submit_case(uuid,integer,jsonb) to service_role;

-- Append-only assessment log plus current status on the submission row.
create or replace function public.mba_ob_review_case(
 p_submission_id uuid,p_decision text,p_score numeric,p_feedback text
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_case public.mba_ob_case_submissions%rowtype;
begin
 if p_decision not in ('reviewed','revision_requested')
   or char_length(btrim(coalesce(p_feedback,''))) not between 8 and 3000 then
   return jsonb_build_object('ok',false,'error','invalid_case_review');
 end if;
 if (p_decision='reviewed' and (p_score is null or p_score<0 or p_score>20))
   or (p_decision='revision_requested' and p_score is not null) then
   return jsonb_build_object('ok',false,'error','invalid_case_score');
 end if;
 select * into v_case from public.mba_ob_case_submissions where id=p_submission_id for update;
 if not found then return jsonb_build_object('ok',false,'error','case_not_found');end if;
 insert into public.mba_ob_case_reviews(submission_id,revision_no,decision,score,feedback)
  values(v_case.id,v_case.revision_no,p_decision,p_score,btrim(p_feedback));
 update public.mba_ob_case_submissions set status=p_decision,score=p_score,
  feedback=btrim(p_feedback),reviewed_at=clock_timestamp(),updated_at=clock_timestamp()
  where id=v_case.id;
 return jsonb_build_object('ok',true,'status',p_decision,'score',p_score,'revision_no',v_case.revision_no);
end;
$$;
revoke all on function public.mba_ob_review_case(uuid,text,numeric,text) from public,anon,authenticated;
grant execute on function public.mba_ob_review_case(uuid,text,numeric,text) to service_role;
