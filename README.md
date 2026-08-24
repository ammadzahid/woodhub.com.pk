# WoodHub

Handmade wooden home decor store for Pakistan. Next.js 15 (App Router), TypeScript, Tailwind CSS.

Cash on delivery, JazzCash, Easypaisa and bank transfer. Google sign-in with delivery-form autofill.
Mobile bottom tab bar. Full technical SEO — see `SEO.md`.

---

## Chalane ka tareeqa

```bash
npm install
cp .env.example .env.local     # values bhar do (neeche dekho)
npm run dev                    # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Build abhi clean hai — 71 pages, zero errors, zero type errors.

---

## Environment variables

Sab optional hain. Kuch bhi set na karo to site phir bhi chalegi (Google sign-in off rahega,
orders server log me jayenge).

| Variable | Kaam |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, OG tags. **Live karne se pehle ye zaroor set karo.** |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in on karta hai. Khali ho to guest checkout kaam karta rehta hai. |
| `AUTH_SECRET` | Session cookie sign karne ke liye. Production me lazmi. `openssl rand -base64 32` |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Database. Products, orders, customers, stock — sab. Service role key sirf server par. |
| `ADMIN_EMAILS` | Comma separated Google accounts jo `/admin` me aa sakte hain. |
| `ADMIN_PASSWORD` | Admin panel ke liye shared password (alternative to allowlist). |
| `ORDER_WEBHOOK_URL` | Har order yahan POST hoga (Zapier / Make / n8n / Google Sheets). |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp number, country code ke saath, bina `+` ke. `923171713002` |
| `NEXT_PUBLIC_PHONE` / `NEXT_PUBLIC_EMAIL` | Footer, contact page, schema. |

---

## Google sign-in setup

1. [console.cloud.google.com](https://console.cloud.google.com) → naya project
2. **APIs & Services → OAuth consent screen** → External → app ka naam aur support email
3. **Credentials → Create credentials → OAuth client ID → Web application**
4. **Authorised JavaScript origins** me add karo:
   - `http://localhost:3000`
   - `https://woodhub.pk` (apna real domain)
5. Client ID copy karke `NEXT_PUBLIC_GOOGLE_CLIENT_ID` me daal do

ID token client se aata hai lekin **server par Google se verify hota hai**
(`src/app/api/auth/google/route.ts`), phir HMAC-signed httpOnly cookie set hoti hai.
Browser ka bheja hua token kabhi blindly trust nahi kiya jata.

Sign-in ke baad naam aur email checkout form me khud bhar jate hain. Address pehli baar
type karna padta hai, phir wo device par save ho jata hai aur agli dafa auto-fill hota hai.

---

## Payments

Chaaron methods `src/lib/site.ts` me hain. Apne account numbers wahan daalo:

```ts
export const PAYMENT_ACCOUNTS = {
  jazzcash:  { title: 'WoodHub Pakistan', number: '0317 1713002' },
  easypaisa: { title: 'WoodHub Pakistan', number: '0345 1713002' },
  bank:      { title: 'WoodHub Pakistan', bank: 'Meezan Bank', number: 'PK00 ...', branch: 'Lahore Main' },
};
```

**Flow:** JazzCash / Easypaisa / bank par customer pehle payment bhejta hai, phir transaction ID
checkout me enter karta hai. Order `awaiting-verification` status me aata hai. Tum payment match
karke dispatch karte ho. Ye chhote PK businesses ka standard tareeqa hai — koi merchant API
credentials nahi chahiye.

Baad me real JazzCash API lagani ho to `src/app/api/orders/route.ts` me `payment` handle karne
wali jagah hook laga do; baaqi flow same rahega.

**Order pricing server-side hai.** Client sirf slug aur qty bhejta hai; price catalog se uthti hai.
Client price bhej kar discount nahi kar sakta.

---

## Database

**Supabase (Postgres).** Setup:

1. [supabase.com](https://supabase.com) par project banao
2. SQL Editor me `supabase-schema.sql` paste karke Run karo (dobara chalana bhi safe hai)
3. Settings → API se `SUPABASE_URL` aur **service role** key `.env.local` me daalo
4. `/admin` kholo → "Import the seed catalogue" dabao → 45 products chale jayenge

### Tables

| Table | Kya rakhta hai |
|---|---|
| `categories` | 6 categories |
| `products` | Poora catalog, `stock` / `active` / `featured` ke saath |
| `orders` | Order + customer jsonb + lines + status + tracking + admin notes |
| `customers` | Orders se khud ban'te hain, `orders_count` aur `total_spent` counters ke saath |

### Functions

- `apply_stock(lines)` / `restore_stock(lines)` — order par stock kam, cancel par wapas
- `record_customer(...)` — customer upsert with counters
- `admin_dashboard(days)` — dashboard ke saare numbers ek round trip me

### RLS

`orders` aur `customers` par koi public policy nahi = browser se bilkul readable nahi.
`products` aur `categories` sirf read-only public hain. Site server par **service role** key
use karti hai jo RLS bypass karti hai — is liye wo key kabhi client code me mat daalna.

### DB na ho to?

Site phir bhi chalti hai. Products `catalog.ts` ke seed se aate hain, orders webhook ya server
log me jate hain, aur admin panel setup screen dikhata hai. Kuch crash nahi hota.

---

## Admin panel — `/admin`

`noindex`, `robots.txt` me blocked.

| Page | Kya kar sakte ho |
|---|---|
| `/admin` | Revenue, orders, AOV, customers (previous period se % change), revenue chart, payment aur status split, top sellers, low stock, latest orders. 7/30/90 din toggle. |
| `/admin/orders` | Status / payment / search filters, pagination. Detail par status change, payment verify, tracking, internal notes, customer ko WhatsApp/call. |
| `/admin/products` | Table me hi inline stock +/−, category aur low-stock filters, full create/edit form, delete, live/hidden toggle. |
| `/admin/customers` | Orders count, lifetime spend, repeat buyers. |

### Admin login

Do raaste, dono `.env.local` me:

```bash
# Option A (behtar) — koi password store nahi hota
ADMIN_EMAILS="you@woodhub.pk,ops@woodhub.pk"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="...apps.googleusercontent.com"

# Option B — shared password, jaldi shuru karne ke liye
ADMIN_PASSWORD="a-long-random-string"
```

Admin cookie customer session se **alag purpose prefix** se sign hoti hai, is liye ek ko doosre
ki jagah use nahi kiya ja sakta. 12-ghante expiry, `sameSite: strict`, aur login route par
5-attempt throttle. `ADMIN_EMAILS` se koi email hatao to us ki live session turant mar jati hai.

Ye sab `node --experimental-strip-types` se test kiya gaya hai — 12/12 pass.

> `/admin` path bots ka pehla guess hota hai. Auth, throttle aur noindex laga hua hai; agar aur
> chhupana ho to Vercel/Nginx par ek rewrite laga kar `/wh-panel` jaisa path de sakte ho.

---

## Orders kahan jate hain

`src/lib/orders.ts` — do sinks, dono optional:

1. **Supabase** — order insert, customer record, aur **stock decrement**, sab automatic
2. **Webhook** — `ORDER_WEBHOOK_URL` (Google Sheets / Zapier / n8n ke liye)

Dono khali hon to order server log me jata hai. Storage fail ho jaye to bhi customer ka order
**cancel nahi hota** — error sirf log hota hai.

---

## Products edit karna

DB connected ho to **`/admin/products`** se — code chhune ki zarurat nahi.

DB na ho to seed file: **`src/lib/catalog.ts`**

```ts
{
  id: 'p001', slug: 'carved-mandala-wall-art',
  name: "Carved Mandala Wall Art",
  category: 'wall-decor', price: 8900, compareAt: 11500,
  wood: "Sheesham", dimensions: "24 x 24 in", finish: "Matte lacquer",
  ...
}
```

- Naya product: array me object add karo + image `public/products/<slug>.jpg` rakh do
- Naam/price badalna: seedha usi object me edit karo
- Nayi category: `CATEGORIES` array + `CategorySlug` type + `SEO_COPY` (collections page me)

Images abhi placeholder hain (tumhari di hui). Apni real product photos se replace karte waqt
file name wahi slug rakhna, aur portrait 4:5 crop best lagta hai.

---

## Design system

| Token | Value | Kaam |
|---|---|---|
| `ink` | `#0F1A15` | Page background |
| `bark` / `raise` | `#16241D` / `#1D3028` | Cards, raised surfaces |
| `edge` | `#274036` | Borders, hairlines |
| `birch` | `#EDEAE0` | Text |
| `muted` | `#93A79C` | Secondary text |
| `patina` | `#57C3A7` | Accent, CTA, links |

Fonts npm se self-hosted hain (Google Fonts ki koi external request nahi):
Fraunces (display), Manrope (body), JetBrains Mono (spec/labels).

**Signature element:** end-grain rings — lakri ka cross-section. Hero par load hote waqt khud
draw hota hai (`src/components/EndGrain.tsx`), aur har product card par ek monospace
"maker's stamp" chalta hai: `SHEESHAM · 24 × 24 IN · MATTE`.

Har cheez `prefers-reduced-motion` respect karti hai aur keyboard focus visible hai.

---

## Deploy

**Vercel** (sabse seedha):

```bash
npx vercel
```

Dashboard me environment variables add karo, phir `NEXT_PUBLIC_SITE_URL` apne live domain par set
karke redeploy karo (canonical URLs aur sitemap isi se bante hain).

**Apna server (VPS / Hostinger):**

```bash
npm run build
pm2 start npm --name woodhub -- start
```

Nginx se port 3000 par reverse proxy kar do.

---

## Structure

```
src/
  app/
    page.tsx                 home
    shop/                    saara catalog, filters + search
    collections/[slug]/      category landing (SEO copy per category)
    product/[slug]/          product detail
    cart/  checkout/  order/[number]/  account/
    guides/  guides/[slug]/  long-form SEO articles
    about/ contact/ faq/ shipping/ privacy/ terms/
    admin/
      (panel)/     dashboard, orders, products, customers  <- auth guard yahan
      login/       guard ke bahar, warna redirect loop banta
      setup/
    api/auth/{google,session,logout}/  api/orders/
    api/admin/{login,logout,seed,orders,products}/
    sitemap.ts  robots.ts  not-found.tsx
  components/                UI
  lib/
    catalog.ts       seed products + categories (DB na ho to fallback)
    supabase.ts      service-role client + dbReady flag
    data/products.ts DB-or-seed product accessors
    data/orders.ts   orders, customers, dashboard stats
    admin-token.ts   admin cookie crypto + allowlist (pure, testable)
    admin.ts         currentAdmin() guard
    site.ts          brand, payments, shipping, cities
    seo.ts           metadata + JSON-LD
    cart.tsx         cart state
    auth.tsx         Google sign-in + saved address
    orders.ts        order sink
    guides.ts        article content
```
