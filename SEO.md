# SEO — kya laga hua hai aur aage kya karna hai

## Technical, already shipped

| Cheez | Kahan | Note |
|---|---|---|
| Per-page `<title>` + meta description | `src/lib/seo.ts` → `buildMeta()` | Har page ka apna, template `%s \| WoodHub` |
| Canonical URLs | `buildMeta()` | `NEXT_PUBLIC_SITE_URL` se bante hain |
| OpenGraph + Twitter cards | `buildMeta()` | Product pages apni image use karte hain |
| `robots` directives | `buildMeta()` | Cart / checkout / account / order `noindex` |
| XML sitemap | `src/app/sitemap.ts` | 63 URLs, auto-generated, priority + changefreq ke saath |
| `robots.txt` | `src/app/robots.ts` | Private routes blocked, AI crawlers allowed |
| ISR (`revalidate = 300`) | shop, product, collection pages | Pre-rendered rehte hain lekin admin edits 5 minute me live ho jate hain |
| `noindex` on `/admin` | `admin/layout.tsx` + `robots.ts` | Panel kabhi index nahi hota |
| Semantic HTML | sab pages | Ek `h1` per page, headings ki proper nesting, `<nav>` par aria-label |
| Image alt text | `ProductCard`, product page | Product naam + wood + dimensions se banta hai, generic nahi |
| Responsive images | `next/image` | AVIF/WebP, srcset, hero par `priority` |
| Mobile-first | Tailwind + bottom tab bar | Core Web Vitals ke liye mobile pehle |
| Self-hosted fonts | npm fontsource | Google Fonts ki external request nahi → LCP behtar |
| Breadcrumbs | product, collection, guide | Visible + JSON-LD dono |

## Structured data (JSON-LD)

`src/lib/seo.ts` me sab generators hain:

- **OnlineStore** — har page par. Naam, address, phone, payment methods, area served
- **WebSite + SearchAction** — Google sitelinks searchbox ke liye
- **Product** — price, currency, availability, SKU, brand, material, `aggregateRating`
- **Offer** — `hasMerchantReturnPolicy` (7 days) + `shippingDetails` (rate, transit time)
  → ye do properties Google Merchant rich results ke liye ab **required** hain
- **ItemList** — shop + collection pages par
- **CollectionPage** — category pages
- **BreadcrumbList** — product, collection, guide
- **FAQPage** — `/faq` aur har guide ke neeche
- **Article** — guides, `datePublished` + `dateModified` ke saath

Test karne ke liye: [search.google.com/test/rich-results](https://search.google.com/test/rich-results)

## Keyword strategy

Har page ka apna intent hai — koi do pages ek hi keyword par compete nahi karte.

**Category pages** (`/collections/*`) — commercial intent, `SEO_COPY` object me har category ka apna title/description/keywords:

| Page | Primary keyword |
|---|---|
| wall-decor | wooden wall art Pakistan |
| shelves | wooden wall shelf price in Pakistan |
| kitchen | wooden chopping board Pakistan |
| desk | wooden desk organizer Pakistan |
| lighting | wooden lamp Pakistan |
| gifts | engraved wooden gifts Pakistan |

**Product pages** — long-tail transactional. `generateMetadata()` har product ke liye
`<name> price in Pakistan`, `<wood> <category>`, `buy online Pakistan cash on delivery` banata hai.

**Guides** (`/guides/*`) — informational, top-of-funnel. Ye traffic laate hain jo abhi khareedne
ke liye tayyar nahi, phir internal links se product pages par jata hai:

- `how-to-choose-wood` → "sheesham vs walnut", "best wood for furniture in Pakistan"
- `how-to-hang-a-wall-shelf` → "wall anchor for brick wall", "how to hang a wooden shelf"
- `caring-for-wooden-boards` → "how to oil a wooden chopping board"

Har guide ke saath FAQPage schema hai — featured snippets aur AI overviews me aane ka sabse
seedha raasta.

---

## Live jane se pehle — checklist

1. **`NEXT_PUBLIC_SITE_URL`** apne real domain par set karo. Ye galat hua to saare canonical URLs
   aur sitemap galat ho jayenge. Ye sabse zaroori step hai.
2. **Google Search Console** me domain verify karo, `sitemap.xml` submit karo
3. **Bing Webmaster Tools** — Search Console se import ho jata hai, 2 minute ka kaam
4. **Google Business Profile** banao (Lahore address ke saath) — local pack ke liye
5. **Rich Results Test** ek product page aur ek guide par chala lo
6. **PageSpeed Insights** mobile par chala lo — abhi structure theek hai, real images ke baad dobara check karna

## Pehle 90 din

**Product images** — abhi placeholder hain. Apni asli photos daalo, aur file name slug wahi rakhna.
Real photos hi asal me conversion aur image search dono badhati hain.

**Reviews** — `rating` aur `reviews_count` abhi placeholder hain. In par asli customer reviews
aane chahiye, warna `AggregateRating` schema me galat data jayega — Google is par manual action de
sakta hai. Ab ye DB me hain, is liye `/admin/products` se har product par seedha update kar sakte
ho. Simple tareeqa: delivery ke 5 din baad WhatsApp par review maango.

**Stock aur availability** — ab `stock` DB se aata hai aur order par khud kam hota hai, is liye
Product schema ka `availability` (`InStock` / `OutOfStock`) hamesha sach bolta hai. Ye matter karta
hai: Google out-of-stock products ko demote karta hai, aur galat availability se Merchant listings
suspend ho sakti hain.

**Content cadence** — mahine me 2 guides. Ideas jo tumhare catalog se seedha judte hain:
- "Chhote drawing room me wall shelf kahan lagayen"
- "Wooden vs metal wall decor — Pakistani ghar ke liye kya behtar hai"
- "Shaadi par kya gift karein — engraved wooden gifts guide"
- "Sheesham furniture ki care — monsoon me kya karein"

**Local SEO** — agar Lahore, Karachi, Islamabad target karna hai to city landing pages banao
(`/lahore-wooden-decor` type). Pattern collection page jaisa hi hai, bas `LocalBusiness` schema
add kar dena.

**Internal linking** — abhi guides → shop, products → collections, collections → collections
sab linked hain. Naya content likhte waqt hamesha kam se kam 2 product pages par link do.

**Backlinks** — Pakistani home decor blogs, interior designers, aur local business directories.
Instagram/TikTok se referral traffic bhi rankings me count hota hai.

---

## Kya deliberately nahi kiya

- **Keyword stuffing** — descriptions insaanon ke liye likhi hain. Google 2026 me stuffing par
  penalise karta hai, reward nahi.
- **Fake urgency banners** — "sirf 2 baaki!" jaise counters. Bounce rate barhate hain, trust girate hain.
- **Blog spam** — 3 achhi guides 30 patli posts se behtar hain.
- **Doorway pages** — har city ke liye same content wale pages Google ki policy ke khilaf hain.
  City pages tabhi banana jab unme wo shehar ke liye asli, alag information ho.
