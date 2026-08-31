# Tamem Kitfo — Bole

Bilingual (English / አማርኛ) website, ordering flow and staff CMS for the Bole
branch of Tamem Kitfo, Addis Ababa.

```
Next.js 16 App Router · TypeScript strict · Tailwind v4 · Supabase · Telegram
```

---

## Running it

```bash
npm install
cp .env.example .env.local     # fill in, or leave empty — see below
npm run dev                    # http://localhost:3000
```

**The site runs with no environment variables at all.** Every public read goes
through `lib/data/queries.ts`, which catches any Supabase error and serves the
bundled fixtures in `lib/data/fixtures.ts` instead. A restaurant site that
cannot show its address because a database is down has failed at its only job.

What needs real keys: placing an order, the Telegram notifications, and the
CMS. Those say so explicitly rather than failing silently.

| Command | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run images` | Regenerate `assets/images` from `assets/source` originals |
| `npm run db:types` | Regenerate `lib/supabase/database.types.ts` from the live schema |

---

## Setting up Supabase

1. Create a project, then run the migrations in order:
   `supabase/migrations/0001_init.sql`, then `0002_seed.sql`.
2. **Disable public signup** (Authentication → Providers → Email → *Confirm
   signup* off, *Allow new users to sign up* off). Staff are created by hand.
3. Create each staff member in Authentication → Users, then insert their row:

   ```sql
   insert into staff_profiles (id, full_name, role)
   values ('<auth user uuid>', 'Full Name', 'owner');
   ```

   An auth user without a `staff_profiles` row can sign in but sees nothing —
   RLS returns no rows and the CMS explains why.
4. Storage buckets `dishes` and `gallery` are created by the migration with
   public read and staff-only write.

### The seed data is not real

`0002_seed.sql` is transcribed from the previous vendor's site, which was
AI-generated and unverified. **Every price, phone number, address and opening
hour in it is a placeholder.** `docs/questions-for-the-owners.md` is the list
of things to confirm before launch.

---

## Architecture notes

### Two root layouts

`app/(site)/[lang]/` is the public site; `app/(admin)/` is the CMS. They are
sibling route groups, each with its own `<html>`, sharing only design tokens
and fonts.

### Language

The public site puts the locale in the URL (`/en/menu`, `/am/menu`) and
prerenders both. This is deliberate: a client-side locale toggle would flash
English before hydrating for an Amharic-first visitor, and search engines would
only ever see one language.

The CMS keeps the staff member's language in a cookie instead — it is one
private app, not something that needs indexing.

Two sources, one API:

- **UI chrome** — `lib/i18n/dictionaries/{en,am}.ts`. `en.ts` defines the shape
  (`export type Dictionary = typeof en`) and `am.ts` is typed against it, so a
  missing Amharic key is a compile error, not a blank on the page.
- **Content** — parallel `_en` / `_am` columns in Postgres, read through
  `pick(row, 'name', locale)`, which falls back to English when the Amharic
  column is still empty.

### Where writes happen

| Path | Client | Why |
|---|---|---|
| Public forms (`app/api/*`) | service role | anon has no INSERT policies anywhere |
| Telegram webhook | service role | no user session exists |
| CMS (`app/(admin)`) | cookie-bound | RLS evaluates the signed-in staff member |

The service role bypasses RLS completely. It is confined to those two places
and guarded by `server-only`.

### Things that are load-bearing

- **Prices are never trusted from the client.** The order payload carries
  `{slug, quantity}` only; `app/api/orders/route.ts` re-reads every price from
  the database. A client that posts its own prices is a client that orders a
  1450 ETB agelgil for one birr.
- **Order lines are snapshots.** `order_items` stores the dish name and unit
  price as they were. Editing the menu never rewrites what a customer was
  charged.
- **Order lookup needs the code *and* the phone.** A four-character code alone
  would let anyone enumerate the restaurant's orders and read customer
  addresses. Both failure modes return the same "not found".
- **The Telegram webhook fails closed**; the rate limiter fails **open**. A
  misconfigured webhook must block, but a limiter bug must never stop a real
  customer from ordering.
- **The site renders without JavaScript.** Scroll-reveal animations are opt-in:
  content is visible by default, and an inline script in `<head>` sets
  `data-js="1"` before first paint, which is what licenses the CSS to hide it.
  If JS never runs, the page is simply static. This matters on Addis mobile
  data.
- **Rate limiting is vendor-free** — a `submission_log` table plus salted
  SHA-256 IP hashes. Raw IPs are never stored.

### Telegram

Orders post a card to the staff group with inline buttons. Tapping ✅ Confirm
hits `/api/telegram/webhook`, updates the row, and rewrites the same message in
place so the group stays a list of orders rather than a status changelog. The
CMS mirrors this: changing a status there edits the Telegram card too.

**Daily flow is expected to happen in Telegram.** The CMS is for menu edits,
settings and history.

---

## Verifying a deployment

- [ ] `npm run build` and `npm run typecheck` both clean
- [ ] Order round trip: add dishes → checkout → row in `orders` + `order_items`
      → card arrives in Telegram → tap ✅ → status flips in the DB and the CMS
- [ ] Snapshot proof: place an order, change that dish's price, reload the
      order — the historical total must be unchanged
- [ ] RLS proof: with the anon key, try `insert into orders` and try selecting
      an unavailable dish. Both must fail
- [ ] Kill switch: turn off *Accepting online orders* in Settings → the order
      button is replaced with a note to call
- [ ] Switch to አማርኛ on every page: no English leaks, no `undefined`
- [ ] 360px → 1920px, no horizontal scroll

---

## Known gaps

- No online payment. Orders are requests; staff confirm by phone. Telebirr or
  Chapa is a later iteration.
- The logo is a JPG with a white background — an SVG or transparent PNG is
  needed.
- No exterior photograph of the building, which is the one image a "find us"
  page most wants.
- The CMS screens beyond the login page have not been exercised against a live
  Supabase project yet; they build and typecheck, but the first run against
  real data should be watched.
