-- Three more gallery photographs, sourced under open licenses.
--
-- ORDERING: apply this AFTER the code that bundles the images is deployed,
-- which is the reverse of the usual migrate-then-deploy rule. These rows use
-- the "local:" scheme, which resolveImage() maps to a build-time import rather
-- than a Storage object, so the key only resolves once the new assets ship.
-- Applied early the rows are not broken, merely invisible: gallery-grid.tsx
-- drops any item whose path does not resolve. Applied after, they appear.
--
-- Provenance: these are openly licensed photographs of Ethiopian food and
-- coffee, not photographs of this restaurant. They fill out a gallery that
-- would otherwise be eleven images, and every one is credited in
-- docs/photo-credits.md. Delete these rows as the owners supply their own.
--
-- Idempotent per row, unlike 0004's table-level guard: that one skips the
-- whole seed if the table has any row at all, which would make this file a
-- no-op forever.

insert into gallery_images (storage_path, alt_en, alt_am, category, sort_order, is_published)
select * from (values
  ('local:injera-stews',  'Injera laid out with a spread of stews',      'እንጀራ ከተለያዩ ወጦች ጋር በማዕድ ላይ',  'food'::gallery_category,   70, true),
  ('local:tej-berele',    'Honey tej served in a traditional berele',    'የማር ጠጅ በባህላዊ በርሌ ሲቀርብ',      'drinks'::gallery_category, 20, true),
  ('local:coffee-jebena', 'A jebena and cups set for the coffee ceremony','ጀበናና ስኒዎች ለቡና ሥነ-ሥርዓት ተዘጋጅተው', 'events'::gallery_category, 20, true)
) as seed(storage_path, alt_en, alt_am, category, sort_order, is_published)
where not exists (
  select 1 from gallery_images g where g.storage_path = seed.storage_path
);
