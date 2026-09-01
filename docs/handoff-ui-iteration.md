## HANDOFF PACKAGE: Tamem Kitfo — UI Iteration (Iteration 2)
### For: OpenCode → execute (then code-review → Opus audit)
### Golden Template: `app/(site)/[lang]/page.tsx` + `components/site/dish-card.tsx`

Every visual pattern in this codebase is established in those two files.
Section rhythm, `Reveal` usage, `SectionHeading`, token discipline and image
handling are all demonstrated there. Copy those patterns; do not invent new
ones.

---

### 1. Objective

Refine the visual design of the public site. Iteration 1 is deployed and
functionally complete — ordering, CMS, bilingual routing and Telegram
plumbing all work and are verified in production. This iteration is
**presentation only**.

Live: https://tamem-kitfo.vercel.app · Repo: kidusabdula/tamem-kitfo

---

### 2. Architecture Decisions (LOCKED — do not deviate)

These are not preferences. Each one is load-bearing and was chosen against a
specific failure mode. Changing any of them is a regression even if the page
looks better afterwards.

- **Content is visible by default; animation is opt-in.** → P4
  `components/ui/reveal.tsx` renders elements *visible*. An inline script in
  `app/(site)/[lang]/layout.tsx` sets `data-js="1"` on `<html>` before first
  paint, and only then does CSS in `globals.css` hide `.reveal` elements for
  the IntersectionObserver to reveal. An earlier version used framer-motion
  `whileInView` with `initial={{opacity:0}}` and rendered the **entire site
  blank** when JS failed. Target audience is Ethiopian mobile data. Never
  introduce an initial hidden state that depends on JS to undo.

- **`--color-accent` is a fill, never text.** → P4
  True logo orange is 2.26:1 on cream — it fails WCAG AA as text. Use
  `--color-accent-ink` (4.56:1) for any orange text, and `--color-accent`
  only as a button/badge background with dark foreground. `components/ui/bits.tsx`
  `Price` already does this correctly.

- **Orange is scarce.** → P4
  Accent marks only things you can act on. Everything else is brown, cream and
  photography. Accent sprayed across a page is the visual signature this build
  exists to replace.

- **Public content is fetched on the server.** → P6
  Pages are statically prerendered with `revalidate = 300`. Do not convert a
  page to a client component to add an animation. Push the `'use client'`
  boundary down into the smallest leaf that needs it.

- **Both dictionaries stay in lockstep.** → P6
  `lib/i18n/dictionaries/en.ts` defines the shape; `am.ts` is typed as
  `Dictionary`. Any new string requires both. A missing Amharic key is a
  compile error, and that is deliberate.

- **Images: bundled = static import, CMS = remote.** → P4
  `lib/data/images.ts` `resolveImage()` handles both. Static imports get
  automatic blur placeholders and intrinsic dimensions; remote Supabase URLs
  need explicit `width`/`height` or `fill`. The `local:` scheme is not a
  placeholder to be cleaned up — it is how bundled photography is referenced
  from database rows.

---

### 3. Schema Specification

**No schema change.** This iteration touches no tables, policies or types.
If a design idea appears to need a new field, stop and flag it rather than
adding a column — schema changes route back through the brain.

---

### 4. Type & Validation Layer

**No change.** Do not modify `lib/supabase/database.types.ts`,
`lib/schemas/*`, or the `Dictionary` shape except to *add* UI strings (in
both languages).

---

### 5. API Surface

**No change.** No route handler is in scope.

---

### 6. Module Structure

Work only inside:

```
app/(site)/[lang]/**        page composition
components/site/**          site-specific components
components/ui/**            design primitives
app/globals.css             tokens and utilities
lib/data/images.ts          only to add a new bundled photo
lib/i18n/dictionaries/**    only to add strings, in both files
```

Do **not** touch:

```
app/(admin)/**              CMS — separate iteration
app/api/**                  route handlers
lib/supabase/**             data layer
lib/schemas/**              validation
proxy.ts                    locale + auth routing
supabase/migrations/**      schema
```

---

### 7. Tier Placement

Public site only. The CMS (`/admin`) is deliberately plain — dense tables, big
touch targets, staff on phones in a kitchen. It is not part of this pass.

---

### 8. Acceptance Criteria (what the Auditor will score)

- [ ] `npm run build` and `npm run typecheck` both clean, zero `any`
- [ ] **JS-disabled test:** load `/en` with JavaScript off — all content
      visible. This is the single most important check.
- [ ] Every page renders in both `/en` and `/am` with no English leaking into
      Amharic and no `undefined`
- [ ] Ethiopic text renders in Noto Serif/Sans Ethiopic, not a fallback
- [ ] No horizontal scroll from 360px to 1920px
- [ ] Contrast ≥ 4.5:1 for all body text; ≥ 3:1 for large text — verify any
      new orange text against cream specifically
- [ ] Visible focus rings on every interactive element; keyboard-only path
      through the order flow works
- [ ] `prefers-reduced-motion` disables transforms and opacity transitions
- [ ] LCP element on `/en` is still the hero image and still `priority`
- [ ] No new client component wrapping a whole page

---

### 9. Constraints (what the hands must NOT do)

- Do not add a UI dependency without flagging it first. `motion`,
  `lucide-react`, `cva` and Tailwind v4 are already present and sufficient.
- Do not introduce `initial={{ opacity: 0 }}` or any CSS that hides content
  unless JS runs. See decision 1.
- Do not replace `next/image` with raw `<img>`.
- Do not hardcode a hex colour. Every colour comes from a token in
  `app/globals.css`. If a shade is missing, add a token.
- Do not change copy. Wording is the owners' to change through the CMS, and
  12 slots are already wired to `site_content`. Rewriting a string in the
  dictionary silently overrides nothing — the DB value wins — so the edit
  would appear to do nothing in production.
- Do not "fix" the empty-looking dish cards by inventing photos for dishes
  that have none. `DishMonogram` is the intended honest fallback.
- Do not touch anything in the "do not touch" list in section 6.

---

### 10. Estimated effort

Medium. One focused pass per page, 6 public pages. Do the homepage first and
stop for review before continuing — it establishes the rhythm the others
follow.

---

**HANDOFF READY — paste into OpenCode → execute.**
