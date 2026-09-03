-- =============================================================================
-- SEED DATA
--
-- ⚠️  EVERY FACT BELOW IS A PLACEHOLDER.
--
-- The dish names, prices, phone numbers and address were scraped from the
-- previous vendor's site (tamem-kitfo.ai.studio), which was AI-generated and
-- never verified. They exist so the site renders something plausible during
-- development. Replace them from the CMS once the owners confirm the real
-- menu — see docs/OWNER-QUESTIONS.md.
-- =============================================================================

insert into menu_categories (slug, name_en, name_am, sort_order) values
  ('kitfo',     'Kitfo & Dulet',       'ክትፎና ዱለት',        10),
  ('tibs',      'Tibs & Agelgil',      'ጥብስና አገልግል',      20),
  ('breakfast', 'Breakfast',           'ቁርስ',              30),
  ('fasting',   'Fasting Dishes',      'የጾም ምግቦች',        40),
  ('drinks',    'Tej & Drinks',        'ጠጅና መጠጦች',       50)
on conflict (slug) do nothing;

insert into dishes (
  slug, category_id, name_en, name_am, description_en, description_am,
  price_etb, spice_level, tags, is_popular, sort_order
) values
  (
    'tamem-special-kitfo',
    (select id from menu_categories where slug = 'kitfo'),
    'Tamem Special Kitfo', 'የታሜም ልዩ ክትፎ',
    'Prime beef minced by hand and folded through our own niter kibbeh and mitmita. Served with fresh ayib, gomen and warm kocho. Ask for it tire, leb-leb or fully cooked.',
    'በእጅ ተከትፎ በራሳችን ንጥር ቅቤና ሚጥሚጣ የተለወሰ ምርጥ የበሬ ሥጋ። ከትኩስ አይብ፣ ጎመንና ትኩስ ቆጮ ጋር ይቀርባል። ጥሬ፣ ልብ ልብ ወይም የበሰለ ሆኖ ይዘጋጃል።',
    680, 3, '{signature}', true, 10
  ),
  (
    'gurage-kitfo-clay',
    (select id from menu_categories where slug = 'kitfo'),
    'Gurage Kitfo in Clay', 'የጉራጌ ክትፎ በሸክላ',
    'The Gurage way: served sizzling in a hot clay pan with extra kibbeh, homemade kocho, ayib and spiced gomen.',
    'በጉራጌ ባህል፦ በሞቀ የሸክላ ማብሰያ ውስጥ፣ ተጨማሪ ቅቤ፣ የቤት ቆጮ፣ አይብና ጎመን ታክሎበት ይቀርባል።',
    750, 3, '{signature}', true, 20
  ),
  (
    'tamem-special-dulet',
    (select id from menu_categories where slug = 'kitfo'),
    'Tamem Special Dulet', 'የታሜም ልዩ ዱለት',
    'Tripe, liver and lean beef chopped fine and sauteed with green pepper, onion, niter kibbeh and mitmita.',
    'ሰንበር፣ ጉበትና ዘንጋዳ ሥጋ በጥሩ ተከትፎ ከአረንጓዴ በርበሬ፣ ሽንኩርት፣ ንጥር ቅቤና ሚጥሚጣ ጋር ይጠበሳል።',
    540, 2, '{}', true, 30
  ),
  (
    'gomen-besiga',
    (select id from menu_categories where slug = 'kitfo'),
    'Gomen Besiga', 'ጎመን በሥጋ',
    'Collard greens cooked down slowly with tender beef, garlic, ginger and a generous amount of spiced butter.',
    'ጎመን ከለሰለሰ ሥጋ፣ ነጭ ሽንኩርት፣ ዝንጅብልና በበቂ ንጥር ቅቤ ቀስ ብሎ የበሰለ።',
    580, 1, '{}', false, 40
  ),
  (
    'shekla-tibs',
    (select id from menu_categories where slug = 'tibs'),
    'Shekla Tibs', 'ሸክላ ጥብስ',
    'Beef tenderloin cubes pan-fried with rosemary, onion and green chilli, brought to the table still sizzling on charcoal.',
    'የበሬ ጥሬ ሥጋ ኩብ ከሮዝመሪ፣ ሽንኩርትና አረንጓዴ ቃሪያ ጋር ተጠብሶ፣ በከሰል ላይ እየጋለ ይቀርባል።',
    720, 1, '{}', true, 10
  ),
  (
    'royal-agelgil',
    (select id from menu_categories where slug = 'tibs'),
    'Royal Agelgil', 'የታሜም አገልግል',
    'A feast for the table, served inside a traditional leather agelgil wrapped in enset leaves: kitfo, tibs, doro wat, ayib and kocho.',
    'ለማዕድ የሚሆን ድግስ፤ በእንሰት ቅጠል ተጠቅልሎ በባህላዊ አገልግል ውስጥ ይቀርባል፦ ክትፎ፣ ጥብስ፣ ዶሮ ወጥ፣ አይብና ቆጮ።',
    1450, 2, '{sharing}', true, 20
  ),
  (
    'bulla-genfo',
    (select id from menu_categories where slug = 'breakfast'),
    'Special Bulla Genfo', 'ልዩ የቡላ ገንፎ',
    'Refined enset starch cooked to a rich, silky porridge with a well of spiced kibbeh and mitmita in the centre.',
    'የተነጠረ የእንሰት ቡላ ወፍራምና ልስልስ ሆኖ ተሠርቶ፣ በመሃሉ ንጥር ቅቤና ሚጥሚጣ ተጨምሮበት።',
    480, 1, '{}', true, 10
  ),
  (
    'fasting-beyaynetu',
    (select id from menu_categories where slug = 'fasting'),
    'Fasting Beyaynetu', 'የጾም በያይነቱ',
    'Shiro, misir, gomen, kik alicha, timatim fitfit and beetroot on soft injera. Fully vegan.',
    'ሽሮ፣ ምስር፣ ጎመን፣ ክክ አልጫ፣ ቲማቲም ፍትፍትና ቀይ ስር በለስላሳ እንጀራ ላይ። ሙሉ በሙሉ የጾም።',
    480, 1, '{vegan,fasting}', false, 10
  ),
  (
    'honey-tej',
    (select id from menu_categories where slug = 'drinks'),
    'Honey Tej (1L)', 'የማር ጠጅ (1 ሊትር)',
    'Fermented honey wine made with pure honey and gesho, served in a classic berele.',
    'ከንጹህ ማርና ጌሾ የተሠራ ጠጅ፣ በባህላዊ በርሌ ይቀርባል።',
    450, 0, '{}', true, 10
  )
on conflict (slug) do nothing;

-- ⚠️ PLACEHOLDER contact details — confirm all of these with the owners.
insert into site_settings (
  id, phones, whatsapp_number, email, address_en, address_am, map_url, hours, socials
) values (
  true,
  '{+251116670707}',
  '+251116670707',
  'info@tamemkitfo.com',
  'Bole Dabi Complex, Ground Floor, opposite Ramada Hotel, Bole, Addis Ababa',
  'ቦሌ ዳቢ ኮምፕሌክስ፣ ምድር ቤት፣ ከራማዳ ሆቴል ፊት ለፊት፣ ቦሌ፣ አዲስ አበባ',
  'https://www.google.com/maps/search/?api=1&query=Tamem+Kitfo+Bole+Addis+Ababa',
  '{"mon":["07:00","23:30"],"tue":["07:00","23:30"],"wed":["07:00","23:30"],"thu":["07:00","23:30"],"fri":["07:00","23:30"],"sat":["07:00","23:30"],"sun":["07:00","23:30"]}'::jsonb,
  '{}'::jsonb
)
on conflict (id) do nothing;
