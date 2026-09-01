-- Table-level privileges.
--
-- RLS policies and GRANTs are two independent gates in Postgres, and a role
-- must pass BOTH. 0001 enabled RLS and wrote every policy, but never granted
-- the underlying table privileges, so `anon` was rejected before its policies
-- were ever evaluated:
--
--   permission denied for table dishes   (SQLSTATE 42501)
--
-- The visible symptom was subtle rather than loud: every public read failed,
-- the fixture fallback in lib/data/queries.ts caught it, and the site served
-- bundled placeholder data as though nothing were wrong. A CMS edit would
-- have appeared to save and then never show up.
--
-- Supabase normally supplies these through ALTER DEFAULT PRIVILEGES, but
-- relying on that means the schema is not self-contained: restore it into a
-- fresh database and the grants silently differ. Stating them here makes the
-- intent reviewable in version control.
--
-- Granting SELECT to anon does NOT widen what anon can see. RLS still filters
-- rows, so the "public reads available dishes" policy continues to hide
-- unavailable dishes, and the absence of any INSERT policy means writes still
-- fail — which is what keeps order creation confined to the service-role
-- route handlers.

grant usage on schema public to anon, authenticated, service_role;

-- Public, read-only. Exactly the five tables with a "public reads ..." policy.
grant select on table
  menu_categories,
  dishes,
  gallery_images,
  site_content,
  site_settings
to anon;

-- Staff. Every write is still gated by is_staff() / is_owner() in the policies
-- from 0001; these grants only let those policies be reached.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- The public form handlers and the Telegram webhook. This role bypasses RLS by
-- design and is confined to app/api/* and lib/supabase/admin.ts.
grant select, insert, update, delete on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- Anything added by a later migration inherits the same shape.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
