-- =============================================================================
-- TAMEM KITFO — BOLE BRANCH · INITIAL SCHEMA
--
-- Design principles encoded here:
--   1. Every piece of customer-visible content carries parallel _en / _am
--      columns. Amharic is a first-class column, not a translation table.
--   2. The anon (public) role has NO write access anywhere. Public form
--      submissions go through a Next.js Route Handler holding the service
--      role key, so validation and rate limiting run before any INSERT.
--   3. order_items snapshot the dish name and price. Editing a price in the
--      CMS must never rewrite the history of past orders.
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

create type fulfilment_type as enum ('dine_in', 'pickup', 'delivery');
create type order_status    as enum ('new', 'confirmed', 'preparing', 'completed', 'cancelled');
create type inquiry_status  as enum ('new', 'contacted', 'quoted', 'won', 'lost');
create type booking_status  as enum ('new', 'confirmed', 'seated', 'completed', 'cancelled');
create type staff_role      as enum ('owner', 'manager', 'staff');
create type gallery_category as enum ('food', 'dining', 'events', 'drinks');
create type event_type      as enum ('wedding', 'mahiber', 'corporate', 'birthday', 'memorial', 'other');

-- =============================================================================
-- STAFF
-- =============================================================================

create table staff_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  role       staff_role not null default 'staff',
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so the policy can read staff_profiles without recursing
-- through staff_profiles' own RLS policy (a classic Postgres RLS deadlock).
create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from staff_profiles where id = auth.uid());
$$;

create or replace function is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_profiles
    where id = auth.uid() and role in ('owner', 'manager')
  );
$$;

-- =============================================================================
-- MENU
-- =============================================================================

create table menu_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_en    text not null,
  name_am    text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

create table dishes (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references menu_categories(id) on delete set null,
  slug           text not null unique,
  name_en        text not null,
  name_am        text,
  description_en text,
  description_am text,
  price_etb      numeric(10,2) not null check (price_etb >= 0),
  image_path     text,
  spice_level    smallint not null default 0 check (spice_level between 0 and 3),
  tags           text[] not null default '{}',
  is_popular     boolean not null default false,
  is_available   boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index dishes_category_idx  on dishes (category_id, sort_order);
create index dishes_available_idx on dishes (is_available) where is_available;

-- =============================================================================
-- GALLERY & SITE CONTENT
-- =============================================================================

create table gallery_images (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_en       text not null,
  alt_am       text,
  category     gallery_category not null default 'dining',
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create index gallery_published_idx on gallery_images (category, sort_order) where is_published;

-- Overrides for the typed dictionary in lib/i18n. A missing key falls back to
-- the shipped copy, so the site renders correctly against an empty database.
create table site_content (
  key        text primary key,
  value_en   text,
  value_am   text,
  updated_at timestamptz not null default now()
);

-- Single-row table. The check constraint makes a second row impossible.
create table site_settings (
  id                  boolean primary key default true check (id),
  phones              text[] not null default '{}',
  whatsapp_number     text,
  email               text,
  address_en          text,
  address_am          text,
  map_url             text,
  hours               jsonb not null default '{}'::jsonb,
  socials             jsonb not null default '{}'::jsonb,
  is_accepting_orders boolean not null default true,
  delivery_note_en    text,
  delivery_note_am    text,
  updated_at          timestamptz not null default now()
);

-- =============================================================================
-- ORDERS
-- =============================================================================

create table orders (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  customer_name       text not null,
  customer_phone      text not null,
  fulfilment_type     fulfilment_type not null,
  scheduled_for       timestamptz,
  delivery_address    text,
  notes               text,
  subtotal_etb        numeric(10,2) not null check (subtotal_etb >= 0),
  status              order_status not null default 'new',
  telegram_message_id bigint,
  locale              text not null default 'en',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- A delivery order without an address is unactionable. Enforce at the
  -- database level so no future code path can create one.
  constraint delivery_requires_address
    check (fulfilment_type <> 'delivery' or coalesce(trim(delivery_address), '') <> '')
);

create index orders_status_idx  on orders (status, created_at desc);
create index orders_created_idx on orders (created_at desc);
create index orders_phone_idx   on orders (customer_phone);

create table order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  -- Nullable and ON DELETE SET NULL: removing a dish from the menu must not
  -- delete the historical orders that contained it.
  dish_id             uuid references dishes(id) on delete set null,
  dish_name_snapshot  text not null,
  unit_price_snapshot numeric(10,2) not null check (unit_price_snapshot >= 0),
  quantity            int not null check (quantity > 0 and quantity <= 50)
);

create index order_items_order_idx on order_items (order_id);

-- =============================================================================
-- CATERING & BOOKINGS
-- =============================================================================

create table catering_inquiries (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  phone       text not null,
  email       text,
  event_type  event_type not null default 'other',
  event_date  date,
  guest_count int check (guest_count > 0 and guest_count <= 2000),
  location    text,
  message     text,
  status      inquiry_status not null default 'new',
  locale      text not null default 'en',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index catering_status_idx on catering_inquiries (status, created_at desc);

create table table_bookings (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  name       text not null,
  phone      text not null,
  party_size int not null check (party_size > 0 and party_size <= 40),
  booking_at timestamptz not null,
  notes      text,
  status     booking_status not null default 'new',
  locale     text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_when_idx   on table_bookings (booking_at);
create index bookings_status_idx on table_bookings (status, created_at desc);

create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  email      text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- RATE LIMITING
--
-- A vendor-free rate limiter. The Route Handler records a hashed IP per
-- submission and counts recent rows before accepting a new one. Raw IPs are
-- never stored, only a salted hash, so this holds no personal data.
-- =============================================================================

create table submission_log (
  id         bigserial primary key,
  ip_hash    text not null,
  kind       text not null,
  created_at timestamptz not null default now()
);

create index submission_log_lookup_idx on submission_log (ip_hash, kind, created_at desc);

-- =============================================================================
-- updated_at TRIGGERS
-- =============================================================================

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dishes_touch    before update on dishes             for each row execute function touch_updated_at();
create trigger orders_touch    before update on orders             for each row execute function touch_updated_at();
create trigger catering_touch  before update on catering_inquiries for each row execute function touch_updated_at();
create trigger bookings_touch  before update on table_bookings     for each row execute function touch_updated_at();
create trigger content_touch   before update on site_content       for each row execute function touch_updated_at();
create trigger settings_touch  before update on site_settings      for each row execute function touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- Enabled on every table. Any table with RLS on and no matching policy denies
-- by default, which is exactly what we want for the anon role.
-- =============================================================================

alter table staff_profiles      enable row level security;
alter table menu_categories     enable row level security;
alter table dishes              enable row level security;
alter table gallery_images      enable row level security;
alter table site_content        enable row level security;
alter table site_settings       enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table catering_inquiries  enable row level security;
alter table table_bookings      enable row level security;
alter table contact_messages    enable row level security;
alter table submission_log      enable row level security;

-- --- PUBLIC READ (anon + authenticated) -------------------------------------
-- Only published, available content. Note there is deliberately no INSERT
-- policy for anon anywhere in this file.

create policy "public reads categories"
  on menu_categories for select using (true);

create policy "public reads available dishes"
  on dishes for select using (is_available or is_staff());

create policy "public reads published gallery"
  on gallery_images for select using (is_published or is_staff());

create policy "public reads content"
  on site_content for select using (true);

create policy "public reads settings"
  on site_settings for select using (true);

-- --- STAFF READ/WRITE --------------------------------------------------------

create policy "staff read own profile"
  on staff_profiles for select using (id = auth.uid() or is_owner());

create policy "owners manage staff"
  on staff_profiles for all using (is_owner()) with check (is_owner());

create policy "staff write categories"
  on menu_categories for all using (is_staff()) with check (is_staff());

create policy "staff write dishes"
  on dishes for all using (is_staff()) with check (is_staff());

create policy "staff write gallery"
  on gallery_images for all using (is_staff()) with check (is_staff());

create policy "staff write content"
  on site_content for all using (is_staff()) with check (is_staff());

create policy "staff write settings"
  on site_settings for all using (is_staff()) with check (is_staff());

create policy "staff read orders"
  on orders for select using (is_staff());
create policy "staff update orders"
  on orders for update using (is_staff()) with check (is_staff());
create policy "staff delete orders"
  on orders for delete using (is_owner());

create policy "staff read order items"
  on order_items for select using (is_staff());

create policy "staff manage catering"
  on catering_inquiries for all using (is_staff()) with check (is_staff());

create policy "staff manage bookings"
  on table_bookings for all using (is_staff()) with check (is_staff());

create policy "staff manage messages"
  on contact_messages for all using (is_staff()) with check (is_staff());

-- submission_log has RLS enabled and zero policies: only the service role,
-- which bypasses RLS entirely, can touch it.

-- =============================================================================
-- STORAGE
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('dishes', 'dishes', true), ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "public reads dish images"
  on storage.objects for select
  using (bucket_id in ('dishes', 'gallery'));

create policy "staff upload images"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('dishes', 'gallery') and is_staff());

create policy "staff update images"
  on storage.objects for update to authenticated
  using (bucket_id in ('dishes', 'gallery') and is_staff());

create policy "staff delete images"
  on storage.objects for delete to authenticated
  using (bucket_id in ('dishes', 'gallery') and is_staff());
