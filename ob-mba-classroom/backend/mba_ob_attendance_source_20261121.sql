-- Attendance verification source. No historical attendance is fabricated.
-- The 2026-11-21 audit found 13 approved students but zero attendance rows.
alter table public.mba_ob_attendance
  add column if not exists source text not null default 'student_code';

do $$
begin
 if not exists (
  select 1 from pg_constraint
  where conname='mba_ob_attendance_source_check'
    and conrelid='public.mba_ob_attendance'::regclass
 ) then
  alter table public.mba_ob_attendance
   add constraint mba_ob_attendance_source_check
   check (source in ('student_code','teacher_manual'));
 end if;
end
$$;

comment on column public.mba_ob_attendance.source is
 'student_code: student requested check-in via timed code; teacher_manual: teacher explicitly verified in-class presence and created the record. Neither approval of membership nor entering the app implies attendance.';
