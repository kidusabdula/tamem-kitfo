-- Seed the gallery with the bundled photography.
--
-- 0002 seeded the menu and settings but not gallery_images, which was not
-- visible in development: lib/data/queries.ts falls back to the fixtures in
-- lib/data/fixtures.ts whenever a read returns nothing useful, so the gallery
-- looked full locally and was empty the moment the site pointed at a real
-- database. That is the failure mode a fallback layer buys you — it hides its
-- own gaps — so the table needs the rows for real.
--
-- storage_path uses the "local:" scheme that resolveImage() in
-- lib/data/images.ts already understands: it maps to a bundled, build-time
-- optimised import rather than a Storage object. That keeps the photographs
-- served from the CDN with blur placeholders and intrinsic dimensions, and
-- means the gallery works before anyone has uploaded anything. Rows the owners
-- add through the CMS store a real Storage path instead, and the two coexist.
--
-- Idempotent: re-running will not duplicate rows, and will not resurrect a
-- photo the owners have deliberately deleted.

insert into gallery_images (storage_path, alt_en, alt_am, category, sort_order, is_published)
select * from (values
  ('local:kitfo-pro',   'Tamem special kitfo served in enset leaf',           'የታሜም ልዩ ክትፎ በእንሰት ቅጠል ላይ',              'food'::gallery_category,   10, true),
  ('local:kitfo-pro-2', 'Gurage kitfo in a traditional clay bowl',            'የጉራጌ ክትፎ በባህላዊ ሸክላ',                    'food'::gallery_category,   20, true),
  ('local:kitfo-4',     'Niter kibbeh poured from a clay jebena',             'ንጥር ቅቤ ከሸክላ ማሰሮ ሲፈስ',                   'food'::gallery_category,   30, true),
  ('local:kitfo-serve', 'Kitfo served on a woven mesob',                      'ክትፎ በመሶብ ላይ ሲቀርብ',                      'food'::gallery_category,   40, true),
  ('local:kitfo-2',     'Injera and kitfo laid out for the table',            'እንጀራና ክትፎ ለማዕድ ተዘጋጅቶ',                  'food'::gallery_category,   50, true),
  ('local:kitfo-3',     'Ayib, gomen and kitfo in a clay bowl',               'አይብ፣ ጎመንና ክትፎ በሸክላ ሳህን',                'food'::gallery_category,   60, true),
  ('local:view-3',      'The main dining room with tibeb-draped tables',      'ዋናው መመገቢያ አዳራሽ በጠፍ ጨርቅ የተሸፈኑ ጠረጴዛዎች',  'dining'::gallery_category, 10, true),
  ('local:view-5',      'Dining room with hand-painted artwork and wine display', 'በእጅ የተሳሉ ሥዕሎችና የወይን መደርደሪያ ያለው አዳራሽ', 'dining'::gallery_category, 20, true),
  ('local:view-1',      'The garden terrace under bougainvillea',             'ከቡጋንቪላ ሥር ያለው የአትክልት በረንዳ',             'dining'::gallery_category, 30, true),
  ('local:view-4',      'The cultural hall set for a coffee ceremony',        'ባህላዊ አዳራሹ ለቡና ሥነ-ሥርዓት ተዘጋጅቶ',           'events'::gallery_category, 10, true),
  ('local:view-2',      'The bar, stocked and lit for the evening',           'ባሩ ለምሽት ተዘጋጅቶ',                          'drinks'::gallery_category, 10, true)
) as seed(storage_path, alt_en, alt_am, category, sort_order, is_published)
where not exists (select 1 from gallery_images);
