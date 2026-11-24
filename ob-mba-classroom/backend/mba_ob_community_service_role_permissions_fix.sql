-- The club Edge Function authorizes classroom sessions before accessing these tables.
-- Only its server-side role needs table access.
grant select, insert, update on table
  public.mba_ob_community_topics,
  public.mba_ob_community_replies,
  public.mba_ob_community_votes,
  public.mba_ob_community_reviews
to service_role;

-- Invites use INSERT ... ON CONFLICT DO NOTHING.
grant select, insert on table public.mba_ob_community_invites to service_role;
