-- Private question banks and per-session 24-hour windows. No questions/answers are exposed through the public API.
create table if not exists public.mba_ob_quiz_windows (
 session_no smallint primary key check (session_no between 1 and 16),
 opens_at timestamptz not null,
 closes_at timestamptz not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint exactly_24h check(closes_at = opens_at + interval '24 hours')
);
create table if not exists public.mba_ob_quiz_questions (
 session_no smallint not null check(session_no between 1 and 16),
 question_no smallint not null check(question_no between 1 and 10),
 prompt text not null check(char_length(prompt) between 15 and 1500),
 options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options)=4),
 correct_index smallint not null check(correct_index between 0 and 3),
 explanation text not null,
 primary key(session_no,question_no)
);
create table if not exists public.mba_ob_quiz_attempts (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.mba_ob_students(id),
 session_no smallint not null references public.mba_ob_quiz_windows(session_no),
 answers jsonb not null check(jsonb_typeof(answers)='array' and jsonb_array_length(answers)=10),
 correct_count smallint not null check(correct_count between 0 and 10),
 score numeric(4,1) not null check(score between 0 and 20),
 submitted_at timestamptz not null default now(),
 unique(student_id,session_no)
);
create index if not exists mba_ob_quiz_attempts_session_idx on public.mba_ob_quiz_attempts(session_no,submitted_at desc);
alter table public.mba_ob_quiz_windows enable row level security;
alter table public.mba_ob_quiz_questions enable row level security;
alter table public.mba_ob_quiz_attempts enable row level security;
revoke all on public.mba_ob_quiz_windows,public.mba_ob_quiz_questions,public.mba_ob_quiz_attempts from public,anon,authenticated;
grant select,insert,update,delete on public.mba_ob_quiz_windows,public.mba_ob_quiz_questions,public.mba_ob_quiz_attempts to service_role;
-- Do not seed windows: only instructor may set the class-end time.
