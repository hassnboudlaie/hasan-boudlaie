-- Fix 2026-11-14: the deployed attendance Edge Function reports
-- roster_lookup_failed when querying public.mba_ob_guests because service_role
-- lacks table privileges. The browser must never access this table directly.
--
-- Actions that require these grants:
-- registerGuest -> INSERT + SELECT (hourly registration count)
-- guestIdentity / teacherState -> SELECT
-- reviewGuest / revokeGuest -> UPDATE + SELECT
--
-- Keep the existing RLS protection and public-deny policy intact.
grant select, insert, update on table public.mba_ob_guests to service_role;
revoke all on table public.mba_ob_guests from anon, authenticated;

-- Verification (read-only):
-- select has_table_privilege('service_role','public.mba_ob_guests','SELECT'),
--        has_table_privilege('service_role','public.mba_ob_guests','INSERT'),
--        has_table_privilege('service_role','public.mba_ob_guests','UPDATE'),
--        has_table_privilege('anon','public.mba_ob_guests','SELECT'),
--        has_table_privilege('authenticated','public.mba_ob_guests','SELECT');
