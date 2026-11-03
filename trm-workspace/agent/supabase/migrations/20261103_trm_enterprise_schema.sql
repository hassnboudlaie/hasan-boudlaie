-- Dedicated TRM Supabase project ONLY. Do not apply to Finance or other apps.
-- Migration: 2026-11-03. Bootstrap organizations/memberships with a verified owner via dashboard admin SQL.
create extension if not exists pgcrypto;
create table if not exists public.trm_orgs (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 2 and 160),
 created_at timestamptz not null default now()
);
create table if not exists public.trm_memberships (
 org_id uuid not null references public.trm_orgs(id) on delete restrict,
 user_id uuid not null references auth.users(id) on delete restrict,
 role text not null check(role in ('owner','admin','recruiter','manager','viewer')),
 status text not null default 'active' check(status in ('active','suspended')),
 created_at timestamptz not null default now(),
 primary key(org_id,user_id)
);
create table if not exists public.trm_roles (
 id uuid primary key default gen_random_uuid(),
 org_id uuid not null references public.trm_orgs(id) on delete restrict,
 title text not null,
 strategy text,
 strategic_importance int check(strategic_importance between 1 and 5),
 market_availability int check(market_availability between 1 and 5),
 forecast_demand int check(forecast_demand >= 0),
 target_group text,
 critical_incidents text,
 created_at timestamptz not null default now(),
 unique(org_id,id)
);
create table if not exists public.trm_evps (
 id uuid primary key default gen_random_uuid(),
 org_id uuid not null references public.trm_orgs(id) on delete restrict,
 role_id uuid not null,
 strengths text,
 preferences text,
 competition text,
 difference text,
 proof text,
 approved boolean not null default false,
 updated_at timestamptz not null default now(),
 foreign key(org_id,role_id) references public.trm_roles(org_id,id) on delete restrict
);
create table if not exists public.trm_vacancies (
 id uuid primary key default gen_random_uuid(),
 org_id uuid not null references public.trm_orgs(id) on delete restrict,
 role_id uuid not null,
 reason text not null,
 stage text not null default 'open' check(stage in ('open','plan','active','filled','closed')),
 owner_user_id uuid references auth.users(id) on delete set null,
 deadline date,
 created_at timestamptz not null default now(),
 foreign key(org_id,role_id) references public.trm_roles(org_id,id) on delete restrict,
 unique(org_id,id)
);
create table if not exists public.trm_talents (
 id uuid primary key default gen_random_uuid(),
 org_id uuid not null references public.trm_orgs(id) on delete restrict,
 role_id uuid,
 display_name text not null,
 professional_title text,
 professional_email text,
 consent_status text not null default 'unknown' check(consent_status in ('unknown','yes','no')),
 consent_recorded_at timestamptz,
 privacy_notice_version text,
 lawful_basis text,
 retention_until date,
 opted_out_at timestamptz,
 created_at timestamptz not null default now(),
 foreign key(org_id,role_id) references public.trm_roles(org_id,id) on delete restrict,
 unique(org_id,id),
 constraint consent_consistency check (consent_status != 'yes' or consent_recorded_at is not null)
);
create table if not exists public.trm_activities (
 id uuid primary key default gen_random_uuid(),
 org_id uuid not null references public.trm_orgs(id) on delete restrict,
 talent_id uuid not null,
 actor_user_id uuid references auth.users(id) on delete set null,
 kind text not null check(kind in ('note','call','email','meeting','followup')),
 occurred_at timestamptz not null default now(),
 next_action text,
 next_due date,
 created_at timestamptz not null default now(),
 foreign key(org_id,talent_id) references public.trm_talents(org_id,id) on delete restrict
);
create table if not exists public.trm_ai_audit (
 id uuid primary key default gen_random_uuid(),
 org_id uuid not null references public.trm_orgs(id) on delete restrict,
 user_id uuid not null references auth.users(id) on delete restrict,
 mode text not null check(mode in ('role','evp','vacancy','relationship')),
 status text not null default 'started' check(status in ('started','completed','failed')),
 provider_response_id text,
 quota_date date not null default (now() at time zone 'UTC')::date,
 quota_slot smallint not null check(quota_slot between 1 and 12),
 unique(org_id,quota_date,quota_slot),
 created_at timestamptz not null default now()
);
create index if not exists trm_ai_org_day on public.trm_ai_audit(org_id,created_at);
create index if not exists trm_vacancies_org_stage on public.trm_vacancies(org_id,stage);
create index if not exists trm_activities_org_due on public.trm_activities(org_id,next_due);
create index if not exists trm_talents_retention on public.trm_talents(org_id,retention_until);

alter table public.trm_orgs enable row level security;
alter table public.trm_memberships enable row level security;
alter table public.trm_roles enable row level security;
alter table public.trm_evps enable row level security;
alter table public.trm_vacancies enable row level security;
alter table public.trm_talents enable row level security;
alter table public.trm_activities enable row level security;
alter table public.trm_ai_audit enable row level security;

revoke all on public.trm_orgs,public.trm_memberships,public.trm_roles,public.trm_evps,public.trm_vacancies,public.trm_talents,public.trm_activities,public.trm_ai_audit from anon;
grant select on public.trm_orgs,public.trm_memberships,public.trm_roles,public.trm_evps,public.trm_vacancies,public.trm_talents,public.trm_activities,public.trm_ai_audit to authenticated;
grant insert,update on public.trm_roles,public.trm_evps,public.trm_vacancies,public.trm_talents,public.trm_activities to authenticated;

-- Memberships: own membership visibility only; membership changes by trusted admin, never by client.
create policy trm_membership_self on public.trm_memberships for select to authenticated
 using(user_id=(select auth.uid()));
create policy trm_org_member_read on public.trm_orgs for select to authenticated
 using(exists (select 1 from public.trm_memberships m where m.org_id=id and m.user_id=(select auth.uid()) and m.status='active'));
create policy trm_role_member_read on public.trm_roles for select to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_roles.org_id and m.user_id=(select auth.uid()) and m.status='active'));
create policy trm_role_staff_insert on public.trm_roles for insert to authenticated
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_roles.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_role_staff_update on public.trm_roles for update to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_roles.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')))
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_roles.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_evps_member_read on public.trm_evps for select to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_evps.org_id and m.user_id=(select auth.uid()) and m.status='active'));
create policy trm_evps_staff_insert on public.trm_evps for insert to authenticated
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_evps.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_evps_staff_update on public.trm_evps for update to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_evps.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')))
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_evps.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_vacancies_member_read on public.trm_vacancies for select to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_vacancies.org_id and m.user_id=(select auth.uid()) and m.status='active'));
create policy trm_vacancies_staff_insert on public.trm_vacancies for insert to authenticated
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_vacancies.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_vacancies_staff_update on public.trm_vacancies for update to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_vacancies.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')))
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_vacancies.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
-- Sensitive talent records: a viewer or generic manager never gets bulk candidate access.
create policy trm_talents_authorized_read on public.trm_talents for select to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_talents.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_talents_authorized_insert on public.trm_talents for insert to authenticated
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_talents.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_talents_authorized_update on public.trm_talents for update to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_talents.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')))
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_talents.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_activities_authorized_read on public.trm_activities for select to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_activities.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_activities_authorized_insert on public.trm_activities for insert to authenticated
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_activities.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_activities_authorized_update on public.trm_activities for update to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_activities.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')))
 with check(exists(select 1 from public.trm_memberships m where m.org_id=trm_activities.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','recruiter')));
create policy trm_ai_admin_audit_read on public.trm_ai_audit for select to authenticated
 using(exists(select 1 from public.trm_memberships m where m.org_id=trm_ai_audit.org_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin')));
-- There are intentionally NO client-side policies to create orgs, memberships or AI audit runs.
-- Hard delete is intentionally service-admin-only pending retention compliance review.
