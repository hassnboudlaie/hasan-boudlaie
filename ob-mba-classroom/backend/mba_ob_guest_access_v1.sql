-- Teacher-approved guest access for the MBA Organizational Behavior classroom.
-- All sensitive operations go through the existing teacher-authenticated Edge Function.
create table if not exists public.mba_ob_guest_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);
create table if not exists public.mba_ob_guests (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.mba_ob_guest_codes(id),
  full_name text not null check (char_length(full_name) between 3 and 90),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days')
);
create index if not exists mba_ob_guests_pending_idx
  on public.mba_ob_guests (approval_status, requested_at desc);
alter table public.mba_ob_guest_codes enable row level security;
alter table public.mba_ob_guests enable row level security;
revoke all on public.mba_ob_guest_codes from public, anon, authenticated;
revoke all on public.mba_ob_guests from public, anon, authenticated;
-- Initial administrator-held guest code (only its SHA-256 digest is stored).
insert into public.mba_ob_guest_codes (code_hash,active)
values ('26e5f08d623f92a7aa7f3b476b725b909a3d12728da9e9dcb0f616019c4dbce8',true)
on conflict (code_hash) do nothing;
