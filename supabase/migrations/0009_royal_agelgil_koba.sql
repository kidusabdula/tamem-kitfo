-- =============================================================================
-- 'leather' → 'koba' — correct the English annotation of the agelgil.
--
-- The Royal Agelgil description was written with 'leather', the literal
-- material of the basket; the English term the owners use for it is 'koba'
-- (ቆባ). The Amharic copy never carried the word, so this is description_en
-- only.
--
-- The 0002 seed was already applied to production, so editing the seed file
-- does not rewrite history — the same gap 0005 closed for the Amharic brand
-- spelling. This corrects the row in place.
--
-- Scoped to the seeded row and only where the old phrase is still present, so
-- a description the owners have since rewritten through the CMS is untouched.
-- Idempotent: a second run matches nothing.
-- =============================================================================

update dishes
set description_en = replace(description_en, 'traditional leather agelgil', 'traditional koba agelgil')
where slug = 'royal-agelgil'
  and description_en like '%traditional leather agelgil%';
