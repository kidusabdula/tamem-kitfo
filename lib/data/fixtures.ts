import type {
  Dish,
  GalleryImage,
  MenuCategory,
  SiteSettings,
} from '@/lib/supabase/database.types'

/**
 * Fallback content, used when Supabase is unconfigured or unreachable.
 *
 * This mirrors supabase/migrations/0002_seed.sql. Keep the two in step: the
 * SQL seeds a real database, this keeps the site alive without one.
 *
 * ⚠️ Every price, phone number and address below is an UNVERIFIED placeholder
 * scraped from the previous vendor's AI-generated site. See
 * docs/OWNER-QUESTIONS.md before treating any of it as fact.
 */

const now = '1970-01-01T00:00:00.000Z'

export const fixtureCategories: MenuCategory[] = [
  { id: 'cat-kitfo', slug: 'kitfo', name_en: 'Kitfo & Dulet', name_am: 'ክትፎና ዱለት', sort_order: 10, created_at: now },
  { id: 'cat-tibs', slug: 'tibs', name_en: 'Tibs & Agelgil', name_am: 'ጥብስና አገልግል', sort_order: 20, created_at: now },
  { id: 'cat-breakfast', slug: 'breakfast', name_en: 'Breakfast', name_am: 'ቁርስ', sort_order: 30, created_at: now },
  { id: 'cat-fasting', slug: 'fasting', name_en: 'Fasting Dishes', name_am: 'የጾም ምግቦች', sort_order: 40, created_at: now },
  { id: 'cat-drinks', slug: 'drinks', name_en: 'Tej & Drinks', name_am: 'ጠጅና መጠጦች', sort_order: 50, created_at: now },
]

function dish(d: Omit<Dish, 'created_at' | 'updated_at' | 'image_path' | 'tags' | 'is_popular' | 'is_available' | 'spice_level'> & Partial<Dish>): Dish {
  return {
    image_path: null,
    spice_level: 0,
    tags: [],
    is_popular: false,
    is_available: true,
    created_at: now,
    updated_at: now,
    ...d,
  } as Dish
}

export const fixtureDishes: Dish[] = [
  dish({
    id: 'dish-1',
    category_id: 'cat-kitfo',
    slug: 'tamem-special-kitfo',
    name_en: 'Tamem Special Kitfo',
    name_am: 'የታሜም ልዩ ክትፎ',
    description_en:
      'Prime beef minced by hand and folded through our own niter kibbeh and mitmita. Served with fresh ayib, gomen and warm kocho. Ask for it tire, leb-leb or fully cooked.',
    description_am:
      'በእጅ ተከትፎ በራሳችን ንጥር ቅቤና ሚጥሚጣ የተለወሰ ምርጥ የበሬ ሥጋ። ከትኩስ አይብ፣ ጎመንና ትኩስ ቆጮ ጋር ይቀርባል። ጥሬ፣ ልብ ልብ ወይም የበሰለ ሆኖ ይዘጋጃል።',
    price_etb: 680,
    spice_level: 3,
    tags: ['signature'],
    is_popular: true,
    sort_order: 10,
  }),
  dish({
    id: 'dish-2',
    category_id: 'cat-kitfo',
    slug: 'gurage-kitfo-clay',
    name_en: 'Gurage Kitfo in Clay',
    name_am: 'የጉራጌ ክትፎ በሸክላ',
    description_en:
      'The Gurage way: served sizzling in a hot clay pan with extra kibbeh, homemade kocho, ayib and spiced gomen.',
    description_am:
      'በጉራጌ ባህል፦ በሞቀ የሸክላ ማብሰያ ውስጥ፣ ተጨማሪ ቅቤ፣ የቤት ቆጮ፣ አይብና ጎመን ታክሎበት ይቀርባል።',
    price_etb: 750,
    spice_level: 3,
    tags: ['signature'],
    is_popular: true,
    sort_order: 20,
  }),
  dish({
    id: 'dish-3',
    category_id: 'cat-kitfo',
    slug: 'tamem-special-dulet',
    name_en: 'Tamem Special Dulet',
    name_am: 'የታሜም ልዩ ዱለት',
    description_en:
      'Tripe, liver and lean beef chopped fine and sauteed with green pepper, onion, niter kibbeh and mitmita.',
    description_am:
      'ሰንበር፣ ጉበትና ዘንጋዳ ሥጋ በጥሩ ተከትፎ ከአረንጓዴ በርበሬ፣ ሽንኩርት፣ ንጥር ቅቤና ሚጥሚጣ ጋር ይጠበሳል።',
    price_etb: 540,
    spice_level: 2,
    is_popular: true,
    sort_order: 30,
  }),
  dish({
    id: 'dish-4',
    category_id: 'cat-kitfo',
    slug: 'gomen-besiga',
    name_en: 'Gomen Besiga',
    name_am: 'ጎመን በሥጋ',
    description_en:
      'Collard greens cooked down slowly with tender beef, garlic, ginger and a generous amount of spiced butter.',
    description_am: 'ጎመን ከለሰለሰ ሥጋ፣ ነጭ ሽንኩርት፣ ዝንጅብልና በበቂ ንጥር ቅቤ ቀስ ብሎ የበሰለ።',
    price_etb: 580,
    spice_level: 1,
    sort_order: 40,
  }),
  dish({
    id: 'dish-5',
    category_id: 'cat-tibs',
    slug: 'shekla-tibs',
    name_en: 'Shekla Tibs',
    name_am: 'ሸክላ ጥብስ',
    description_en:
      'Beef tenderloin cubes pan-fried with rosemary, onion and green chilli, brought to the table still sizzling on charcoal.',
    description_am:
      'የበሬ ጥሬ ሥጋ ኩብ ከሮዝመሪ፣ ሽንኩርትና አረንጓዴ ቃሪያ ጋር ተጠብሶ፣ በከሰል ላይ እየጋለ ይቀርባል።',
    price_etb: 720,
    spice_level: 1,
    is_popular: true,
    sort_order: 10,
  }),
  dish({
    id: 'dish-6',
    category_id: 'cat-tibs',
    slug: 'royal-agelgil',
    name_en: 'Royal Agelgil',
    name_am: 'የታሜም አገልግል',
    description_en:
      'A feast for the table, served inside a traditional leather agelgil wrapped in enset leaves: kitfo, tibs, doro wat, ayib and kocho.',
    description_am:
      'ለማዕድ የሚሆን ድግስ፤ በእንሰት ቅጠል ተጠቅልሎ በባህላዊ አገልግል ውስጥ ይቀርባል፦ ክትፎ፣ ጥብስ፣ ዶሮ ወጥ፣ አይብና ቆጮ።',
    price_etb: 1450,
    spice_level: 2,
    tags: ['sharing'],
    is_popular: true,
    sort_order: 20,
  }),
  dish({
    id: 'dish-7',
    category_id: 'cat-breakfast',
    slug: 'bulla-genfo',
    name_en: 'Special Bulla Genfo',
    name_am: 'ልዩ የቡላ ገንፎ',
    description_en:
      'Refined enset starch cooked to a rich, silky porridge with a well of spiced kibbeh and mitmita in the centre.',
    description_am:
      'የተነጠረ የእንሰት ቡላ ወፍራምና ልስልስ ሆኖ ተሠርቶ፣ በመሃሉ ንጥር ቅቤና ሚጥሚጣ ተጨምሮበት።',
    price_etb: 480,
    spice_level: 1,
    is_popular: true,
    sort_order: 10,
  }),
  dish({
    id: 'dish-8',
    category_id: 'cat-fasting',
    slug: 'fasting-beyaynetu',
    name_en: 'Fasting Beyaynetu',
    name_am: 'የጾም በያይነቱ',
    description_en:
      'Shiro, misir, gomen, kik alicha, timatim fitfit and beetroot on soft injera. Fully vegan.',
    description_am:
      'ሽሮ፣ ምስር፣ ጎመን፣ ክክ አልጫ፣ ቲማቲም ፍትፍትና ቀይ ስር በለስላሳ እንጀራ ላይ። ሙሉ በሙሉ የጾም።',
    price_etb: 480,
    spice_level: 1,
    tags: ['vegan', 'fasting'],
    sort_order: 10,
  }),
  dish({
    id: 'dish-9',
    category_id: 'cat-drinks',
    slug: 'honey-tej',
    name_en: 'Honey Tej (1L)',
    name_am: 'የማር ጠጅ (1 ሊትር)',
    description_en:
      'Fermented honey wine made with pure honey and gesho, served in a classic berele.',
    description_am: 'ከንጹህ ማርና ጌሾ የተሠራ ጠጅ፣ በባህላዊ በርሌ ይቀርባል።',
    price_etb: 450,
    spice_level: 0,
    is_popular: true,
    sort_order: 10,
  }),
]

export const fixtureSettings: SiteSettings = {
  id: true,
  phones: ['+251116670707'],
  whatsapp_number: '+251116670707',
  email: 'info@tamemkitfo.com',
  address_en: 'Bole Dabi Complex, Ground Floor, opposite Ramada Hotel, Bole, Addis Ababa',
  address_am: 'ቦሌ ዳቢ ኮምፕሌክስ፣ ምድር ቤት፣ ከራማዳ ሆቴል ፊት ለፊት፣ ቦሌ፣ አዲስ አበባ',
  map_url: 'https://www.google.com/maps/search/?api=1&query=Tamem+Kitfo+Bole+Addis+Ababa',
  hours: {
    mon: ['07:00', '23:30'],
    tue: ['07:00', '23:30'],
    wed: ['07:00', '23:30'],
    thu: ['07:00', '23:30'],
    fri: ['07:00', '23:30'],
    sat: ['07:00', '23:30'],
    sun: ['07:00', '23:30'],
  },
  socials: {},
  is_accepting_orders: true,
  delivery_note_en: null,
  delivery_note_am: null,
  updated_at: now,
}

/**
 * Gallery fixtures reference the local photo set rather than Supabase Storage.
 * `storage_path` is resolved by lib/data/images.ts, which treats a value
 * starting with "local:" as a bundled asset.
 */
export const fixtureGallery: GalleryImage[] = [
  { id: 'g1', storage_path: 'local:kitfo-pro', alt_en: 'Tamem special kitfo served in enset leaf', alt_am: 'የታሜም ልዩ ክትፎ በእንሰት ቅጠል ላይ', category: 'food', sort_order: 10, is_published: true, created_at: now },
  { id: 'g2', storage_path: 'local:kitfo-pro-2', alt_en: 'Gurage kitfo in a traditional clay bowl', alt_am: 'የጉራጌ ክትፎ በባህላዊ ሸክላ', category: 'food', sort_order: 20, is_published: true, created_at: now },
  { id: 'g3', storage_path: 'local:kitfo-4', alt_en: 'Niter kibbeh poured from a clay jebena', alt_am: 'ንጥር ቅቤ ከሸክላ ማሰሮ ሲፈስ', category: 'food', sort_order: 30, is_published: true, created_at: now },
  { id: 'g4', storage_path: 'local:kitfo-serve', alt_en: 'Kitfo served on a woven mesob', alt_am: 'ክትፎ በመሶብ ላይ ሲቀርብ', category: 'food', sort_order: 40, is_published: true, created_at: now },
  { id: 'g5', storage_path: 'local:kitfo-2', alt_en: 'Injera and kitfo laid out for the table', alt_am: 'እንጀራና ክትፎ ለማዕድ ተዘጋጅቶ', category: 'food', sort_order: 50, is_published: true, created_at: now },
  { id: 'g6', storage_path: 'local:kitfo-3', alt_en: 'Ayib, gomen and kitfo in a clay bowl', alt_am: 'አይብ፣ ጎመንና ክትፎ በሸክላ ሳህን', category: 'food', sort_order: 60, is_published: true, created_at: now },
  { id: 'g7', storage_path: 'local:view-3', alt_en: 'The main dining room with tibeb-draped tables', alt_am: 'ዋናው መመገቢያ አዳራሽ በጠፍ ጨርቅ የተሸፈኑ ጠረጴዛዎች', category: 'dining', sort_order: 10, is_published: true, created_at: now },
  { id: 'g8', storage_path: 'local:view-5', alt_en: 'Dining room with hand-painted artwork and wine display', alt_am: 'በእጅ የተሳሉ ሥዕሎችና የወይን መደርደሪያ ያለው አዳራሽ', category: 'dining', sort_order: 20, is_published: true, created_at: now },
  { id: 'g9', storage_path: 'local:view-1', alt_en: 'The garden terrace under bougainvillea', alt_am: 'ከቡጋንቪላ ሥር ያለው የአትክልት በረንዳ', category: 'dining', sort_order: 30, is_published: true, created_at: now },
  { id: 'g10', storage_path: 'local:view-4', alt_en: 'The cultural hall set for a coffee ceremony', alt_am: 'ባህላዊ አዳራሹ ለቡና ሥነ-ሥርዓት ተዘጋጅቶ', category: 'events', sort_order: 10, is_published: true, created_at: now },
  { id: 'g11', storage_path: 'local:view-2', alt_en: 'The bar, stocked and lit for the evening', alt_am: 'ባሩ ለምሽት ተዘጋጅቶ', category: 'drinks', sort_order: 10, is_published: true, created_at: now },
]
