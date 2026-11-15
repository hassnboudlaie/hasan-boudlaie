-- Allameh MBA classroom: privacy-minimized learner engagement analytics.
-- Authorization lives in the isolated Edge Function and the existing hashed
-- teacher/student sessions. Do not grant students direct PostgREST access.
create table if not exists public.mba_ob_learning_visits (
 id uuid primary key,
 student_id uuid not null references public.mba_ob_students(id) on delete cascade,
 started_at timestamptz not null default now(),
 last_seen_at timestamptz not null default now(),
 last_heartbeat_at timestamptz not null default now(),
 active_seconds integer not null default 0 check(active_seconds between 0 and 43200)
);
create index if not exists mba_ob_learning_visits_student_time_idx
 on public.mba_ob_learning_visits(student_id,started_at desc);
create table if not exists public.mba_ob_learning_events (
 id bigint generated always as identity primary key,
 student_id uuid not null references public.mba_ob_students(id) on delete cascade,
 visit_id uuid not null references public.mba_ob_learning_visits(id) on delete cascade,
 area text not null check(area in ('home','sessions','session','concepts','case','resources','quiz','performance','reflection','journey','other')),
 action text not null check(action in ('open','navigate','guided_step','case_work','quiz_open','resource_open','reflection_saved','journey_check','assignment_open')),
 session_no smallint check(session_no between 1 and 16),
 recorded_at timestamptz not null default now()
);
create index if not exists mba_ob_learning_events_student_time_idx
 on public.mba_ob_learning_events(student_id,recorded_at desc);
create index if not exists mba_ob_learning_events_visit_idx
 on public.mba_ob_learning_events(visit_id);
alter table public.mba_ob_learning_visits enable row level security;
alter table public.mba_ob_learning_events enable row level security;
revoke all on public.mba_ob_learning_visits,public.mba_ob_learning_events from public,anon,authenticated;
grant select,insert,update on public.mba_ob_learning_visits to service_role;
grant select,insert,update on public.mba_ob_learning_events to service_role;
grant usage,select on sequence public.mba_ob_learning_events_id_seq to service_role;
comment on table public.mba_ob_learning_visits is
 'Approved MBA students: visit count, foreground active seconds and last use only; no private writing or answer content.';
comment on table public.mba_ob_learning_events is
 'Approved MBA students: bounded activity taxonomy only. Teacher and owning student read through custom-token validated Edge API; no direct public REST access.';
