# Photo credits

Most of the photography on this site was shot for the restaurant and is owned
by the owners. This file covers the exception: a small number of **openly
licensed photographs sourced from Wikimedia Commons**, used as stand-ins for
dishes and gallery slots we have no photograph of yet.

They are here so a customer can recognise what they are ordering. They are not
pictures of Tamem Kitfo's own plates, and they should be replaced as the owners
photograph the real dishes — see "Replacing these" at the bottom.

## What is used, and under what terms

| File | Dish / slot | License | Photographer | Source |
|---|---|---|---|---|
| `tibs-shekla.jpg` | `shekla-tibs` | **CC BY-SA 4.0** | Khajitdadddy | [Siga Tibs](https://commons.wikimedia.org/wiki/File:Siga_Tibs.jpg) |
| `gomen-besiga.jpg` | `gomen-besiga` | CC0 (public domain) | Andy Li | [Misir Wot and Gomen Besiga](https://commons.wikimedia.org/wiki/File:Misir_Wot_and_Gomen_Besiga_-_Abyssinia,_Brighton.jpg) |
| `tej-berele.jpg` | `honey-tej`, gallery (drinks) | CC0 (public domain) | cotterillmike | [Tej (Ethiopian honey wine)](https://commons.wikimedia.org/wiki/File:Tej_(Ethiopian_honey_wine)_(27241999346).jpg) |
| `beyaynetu.jpg` | `fasting-beyaynetu` | **CC BY-SA 2.0** | Rod Waddington | [Injera, Fasting Food, Ethiopia](https://commons.wikimedia.org/wiki/File:Injera,_Fasting_Food,_Ethiopia_(11286899826).jpg) |
| `genfo-bowl.jpg` | `bulla-genfo` | **CC BY-SA 4.0** | UMarooB | [Porage from Northern Ethiopia](https://commons.wikimedia.org/wiki/File:Porage_from_Northern_Ethiopia.jpg) |
| `injera-stews.jpg` | gallery (food) | **CC BY-SA 4.0** | Artem.G | [Injera with eight kinds of stew](https://commons.wikimedia.org/wiki/File:Injera_with_eight_kinds_of_stew.jpg) |
| `coffee-jebena.jpg` | gallery (events) | **CC BY-SA 4.0** | ProtoplasmaKid | [Coffee ceremony of Ethiopia and Eritrea 4](https://commons.wikimedia.org/wiki/File:Coffee_ceremony_of_Ethiopia_and_Eritrea_4.jpg) |

All seven were resized to 2400px on the long edge and cropped to square by
`scripts/optimize-images.ts`. Cropping counts as modification, which matters
for the five CC BY-SA files.

## Obligations this creates

**CC0 files (`gomen-besiga`, `tej-berele`) carry no obligations at all.** They
are public domain; commercial use, cropping and redistribution are all
unconditional. Nothing further is required for them.

**The five CC BY-SA files do carry obligations**, and they survive being
used commercially:

1. **Attribution** — the photographer, the license, and a link to both the
   source and the license text must be reasonably discoverable by a visitor.
   A credits line in the footer or a `/credits` page both satisfy this; a file
   in the repository does not, because a visitor cannot see it.
2. **Indicate changes** — we cropped and resized. Saying "cropped and resized"
   next to the credit is enough.
3. **ShareAlike** — our cropped version is an *adaptation*, so the cropped
   image must itself be offered under CC BY-SA 4.0. This attaches to the
   photograph only. It does not affect the site's code, the other photographs,
   or anything else the restaurant owns.

> **Not yet done: obligation 1 is unmet.** These images are live but no credit
> is shown anywhere a visitor can reach. Either add a visible credit, or swap
> the five CC BY-SA files for CC0 alternatives. Until one of those happens the
> site is using them outside their license terms.

If a visible credits line is unwanted, the cleanest fix is to drop the five
CC BY-SA images. `gomen-besiga` and `tej-berele` are CC0 and can stay either
way; the menu simply loses the shekla tibs photo and the gallery loses two.

## Two that needed judgement, not just searching

**`fasting-beyaynetu`** is sold as "fully vegan", so the only acceptable
photographs were ones whose own source documents them as fasting food. Several
better-composed platters were rejected because they showed meat, or because
their description did not rule it out. A picture we cannot vouch for is worse
than no picture, which is the rule `lib/data/images.ts` already states.

**`bulla-genfo`** is the hardest dish on the menu to illustrate: there is no
Genfo category on Commons at all, and searches for genfo, bulla, ga'at, kinche
and atmit return almost nothing. The photograph used is northern-style genfo
rather than Gurage bulla made from enset. It was chosen because the
presentation matches the menu copy exactly -- a ring of porridge around a well
of spiced kibbeh. If the owners consider the distinction important, this is the
first photograph to replace.

Every dish on the menu now has an image. None of them are photographs of this
restaurant's own cooking, which remains the thing worth fixing.

## Replacing these

Nothing here needs a code change to retire. `resolveDishImage` prefers
`dishes.image_path`, so the moment a real photo is uploaded through the CMS for
a dish, the stand-in stops being served. Afterwards, tidy up by deleting that
dish's line from `dishPhotos` in `lib/data/images.ts`, the source file in
`assets/source/`, and its row here.

For gallery images, delete the row from `gallery_images` in the CMS and upload
the replacement; the `local:` rows seeded by `0007` are ordinary rows and can be
removed like any other.
