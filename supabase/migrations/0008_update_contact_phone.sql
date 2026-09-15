-- Update the public Tamem Kitfo contact number.
--
-- The running site reads phone/WhatsApp from site_settings, not from the
-- original seed migration. This keeps fresh databases correct after 0002_seed
-- and updates existing environments idempotently without touching the rest of
-- the singleton row.

insert into public.site_settings (
  id,
  phones,
  whatsapp_number
)
values (
  true,
  array['+251952372030'],
  '+251952372030'
)
on conflict (id) do update set
  phones = excluded.phones,
  whatsapp_number = excluded.whatsapp_number,
  updated_at = now();
