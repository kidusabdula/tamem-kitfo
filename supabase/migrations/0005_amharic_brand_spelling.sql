-- =============================================================================
-- ተመም → ታሜም — correct the Amharic spelling of the brand name in seeded rows.
--
-- The 0002 (menu) and 0004 (gallery) seeds were written with the old spelling.
-- Rows already applied to a database keep it, because editing a seed file does
-- not rewrite history — the same gap 0004 closed for the gallery seed. This
-- corrects the spelling in place.
--
-- replace() only fires where the old spelling is still present, so text the
-- owners have since rewritten through the CMS (a real dish name, a real photo
-- caption) is untouched. Idempotent: a second run matches nothing.
-- =============================================================================

update dishes
set name_am = replace(name_am, 'ተመም', 'ታሜም')
where name_am like '%ተመም%';

update gallery_images
set alt_am = replace(alt_am, 'ተመም', 'ታሜም')
where alt_am like '%ተመም%';
