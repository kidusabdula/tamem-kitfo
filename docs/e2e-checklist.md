# End-to-end test checklist — Tamem Kitfo

Production: https://tamem-kitfo.vercel.app · CMS: /admin

Work top to bottom. Sections **A–C** must pass before the owners touch it;
**D–F** before you tell anyone the URL.

Legend: ☐ not run · ✅ pass · ❌ fail

---

## A. Telegram bot setup

Do this once, then test it in section C.

### A1 · Create the bot

☐ Open Telegram, message **@BotFather**
☐ Send `/newbot`
☐ Name: `Tamem Kitfo Orders`
☐ Username: something ending in `bot`, e.g. `tamem_kitfo_orders_bot`
☐ Copy the token it gives you — looks like `8123456789:AAF...`

### A2 · Create the staff group and get its chat ID

☐ Create a Telegram **group** (not a channel), e.g. "Tamem Orders"
☐ Add the bot to the group
☐ **Send any message in the group** — the bot cannot see the group until
  someone posts
☐ Open in a browser:
  `https://api.telegram.org/bot<TOKEN>/getUpdates`
☐ Find `"chat":{"id":-1001234567890` — **the group ID is negative**. A positive
  ID is your personal DM, not the group.

> If `getUpdates` returns an empty `result`, the bot has privacy mode on and
> cannot read group messages. Send `/setprivacy` to BotFather → select the bot
> → **Disable**. Then post in the group again and retry.

### A3 · Wire it up

☐ Both values set on Vercel (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)
☐ Redeployed after setting them — env vars only apply to new deployments
☐ Webhook registered, returns `{"ok":true,"result":true}`
☐ `getWebhookInfo` shows the right URL and `pending_update_count: 0`

---

## B. Public site

### B1 · Renders

☐ `/en` and `/am` both load
☐ Amharic renders in Ethiopic type, not boxes or a fallback serif
☐ All six pages in both languages: menu, catering, events, gallery, contact, book
☐ No English leaking into Amharic pages, no `undefined` anywhere
☐ Menu shows **9 dishes with prices** (proves it is reading Supabase, not fixtures)
☐ Gallery shows **11 photographs**
☐ Language switch keeps you on the same page, not back to home

### B2 · Resilience — the ones people skip

☐ **JavaScript disabled** → `/en` still shows all content. This is the single
  most important check on the whole site. DevTools → Settings → Debugger →
  Disable JavaScript, then hard reload.
☐ Throttle to Slow 3G → hero appears within a few seconds, page is readable
  before images finish
☐ `prefers-reduced-motion` → no scroll animations, no Ken Burns drift

### B3 · Responsive & a11y

☐ 360px → 1920px, no horizontal scroll on any page
☐ Tab through the order flow with keyboard only — every control reachable,
  focus ring always visible
☐ Header is legible over the hero photo at every width

---

## C. Ordering — the money path

### C1 · Happy path

☐ Add 2–3 dishes to the cart from `/en/menu`
☐ Cart badge in the header updates
☐ Reload the page → cart survives (localStorage)
☐ `/en/order` shows correct line items and total
☐ Submit with a real Ethiopian number
☐ Confirmation shows a code like `TMM-XXXX`
☐ **Telegram card arrives in the group** within a few seconds
☐ Card shows name, phone, items, total, fulfilment type

### C2 · Telegram inline buttons

☐ Tap **✅ Confirm** → the card edits **in place** (no second message)
☐ Status in the card changes to Confirmed
☐ `/admin/orders` shows the same order as Confirmed
☐ Tap **Preparing**, then **Completed** → each updates in both places
☐ A completed order shows no further buttons

### C3 · CMS → Telegram, the other direction

☐ Change an order's status in `/admin/orders`
☐ The Telegram card updates to match

### C4 · Order lookup

☐ `/en/order/<code>` with the correct phone → shows status and items
☐ Correct code + **wrong** phone → generic "not found", never "wrong phone"
☐ Made-up code → same generic message

### C5 · The other three forms

☐ Catering form → row in `catering_inquiries` + Telegram card
☐ Table booking → row in `table_bookings` + Telegram card
☐ Contact form → row in `contact_messages` + Telegram card

### C6 · Kill switch

☐ `/admin/settings` → turn **Accepting online orders** off, save
☐ `/en/order` replaces the submit button with a message to call
☐ Turn it back on → ordering works again

---

## D. Security — do not skip these

☐ **Price tampering:** POST to `/api/orders` with `"price_etb": 1` for the
  1450 ETB agelgil → order is stored at **1450**
☐ **anon write:** with the anon key, `INSERT` into `orders` → denied
☐ **anon read of orders:** with the anon key, `SELECT` from `orders` → denied
☐ **Webhook without the secret:** POST to `/api/telegram/webhook` with no
  `X-Telegram-Bot-Api-Secret-Token` header → **401**
☐ **Webhook with a wrong secret** → **401**
☐ **Admin guard:** open `/admin` signed out → redirected to `/admin/login`
☐ **Non-staff:** sign in as a user with no `staff_profiles` row → sees "not
  staff yet", no data
☐ **Rate limit:** submit the contact form 6 times quickly → later ones return
  429
☐ **Honeypot:** submit a form with the `website` field filled → returns a fake
  success code, no database row
☐ `/admin` returns `noindex`; `robots.txt` disallows `/admin` and `/api`

---

## E. CMS

☐ Sign in at `/admin/login`
☐ Wrong password → one generic error, never "no such user"
☐ Language toggle switches the whole CMS, survives reload
☐ **Dashboard** counts match reality
☐ **Menu:** edit a dish price → live site shows the new price
☐ **Menu:** upload a dish photo → appears on the site
☐ **Menu:** untick "On the menu" → dish disappears from `/en/menu`
☐ **Gallery:** upload a photo → appears in `/en/gallery`
☐ **Gallery:** untick "Visible" → disappears
☐ **Text:** override the homepage story → live site shows your words
☐ **Text:** press "Use the built-in text" → reverts
☐ **Settings:** change phone/hours → footer and contact page update
☐ **Snapshot proof:** place an order, then change that dish's price, then
  reload the order — the historical total is **unchanged**

---

## F. SEO & sharing

☐ `/sitemap.xml` lists both languages with hreflang pairs
☐ `/robots.txt` correct
☐ Homepage JSON-LD validates at https://search.google.com/test/rich-results
☐ Paste the URL into Telegram and WhatsApp → preview card shows the photo
☐ Canonical tags point at the real domain once it is attached

---

## G. Known-placeholder — confirm before launch

Everything below is transcribed from the previous vendor's unverified site.

☐ Phone `+251116670707`
☐ Address `Bole Dabi Complex, Ground Floor, opposite Ramada Hotel`
☐ Hours `07:00 – 23:30 every day`
☐ All 9 dish names and prices
☐ Email `info@tamemkitfo.com`

See `docs/questions-for-the-owners.md`.
