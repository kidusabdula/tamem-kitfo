-- =============================================================================
-- 0006 — Catering inquiry items
--
-- Catering customers can optionally attach dish selections to their enquiry
-- ("40 × Tamem Special Kitfo, 12 × Honey Tej"). Mirrors the order_items
-- snapshot pattern:
--
--   1. dish_id is nullable with ON DELETE SET NULL: removing a dish from the
--      menu must not delete the history of enquiries that listed it.
--   2. dish_name_snapshot freezes the name at request time; menu edits never
--      rewrite history.
--   3. NO price column, on purpose. Catering is quoted per event over the
--      phone; showing menu prices on the card would mislead customers, and a
--      price column would invite someone to trust a client-supplied number.
--   4. RLS enabled, zero policies — identical posture to order_items: the
--      service-role Route Handler writes, staff read through the service role.
--      Anon can neither read nor write.
-- =============================================================================

create table catering_inquiry_items (
  id                 uuid primary key default gen_random_uuid(),
  inquiry_id         uuid not null references catering_inquiries(id) on delete cascade,
  dish_id            uuid references dishes(id) on delete set null,
  dish_name_snapshot text not null,
  quantity           int not null check (quantity > 0 and quantity <= 2000),
  created_at         timestamptz not null default now()
);

create index catering_inquiry_items_inquiry_idx on catering_inquiry_items (inquiry_id);

alter table catering_inquiry_items enable row level security;
