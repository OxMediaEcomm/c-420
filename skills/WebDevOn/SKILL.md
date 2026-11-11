---
name: WebDevOn
description: A Next.js build playbook, distilled from real production codebases — a therapy-practice marketing site (Next.js 16 + Tailwind 4, OKLCH design tokens, colored neomorphism, a hand-tuned canvas generative-tree hero effect), a storefront + admin app (Next.js 16 + Drizzle + NextAuth commerce/admin, plain CSS custom properties, live Stripe checkout), and a family of sibling-brand client sites (Next.js 16 + Drizzle/Supabase/Prisma + Neon + NextAuth) sharing one standardized admin-panel + client-editable-CMS pattern. Covers design-token architecture, sister-brand re-skins, real-content sourcing (including free stock-photo workflows and brand-color extraction), accessible-by-default styling, scroll-reveal patterns, canvas/generative decorative effects, contact-form hardening, the standard admin-auth + prod-seeding + login-verification pattern across NextAuth/Supabase/Prisma stacks, the full-copy "every visible string is client-editable" CMS pattern, SEO/structured data, Vercel + Neon deploy ops, a WebGL "product billboard shelf" pattern (2.5D real-photo cutouts on a lit three.js shelf, with local rembg/birefnet background removal), going live with real Stripe payments (account-clearance verification, server-enforced kill switches, safe env-var/secret handling on Windows), a parallel security+functionality full-site audit workflow, cart stock/price revalidation against the DB, the "shared admin mutation must be a partial patch, not a full overwrite" bug pattern, and a catalog of hard-won CSS/animation/canvas/build gotchas actually hit in production. Use when building, restyling, or extending any Next.js marketing site, storefront, or admin app.
---

# WebDevOn

This is not generic frontend advice — every pattern here was pulled from three real, shipped-or-shipping codebases this user owns:

- **Client Site A** (therapy practice, `client-site-a-redesign`) — a from-scratch Next.js 16 / React 19 / Tailwind 4 marketing site for a real Denver therapy practice. Colored neomorphism design system, OKLCH tokens, real scraped content and staff photos, WCAG contrast fixes done with actual math, SEO/JSON-LD pass.
- **Client Site B** (`client-site-b-storefront`) — a Next.js 16 / React 19 storefront + admin app. Drizzle ORM over Postgres (Neon in prod, PGlite embedded locally), NextAuth v5 beta credentials auth, a legacy static site's vanilla-JS interactions ported into a client component, DB-backed editable content fields.
- **Client Site C** (`client-site-c`, live at your-domain.com) — a client-supplied static HTML/CSS ZIP ported to Next.js 16, then **re-skinned to wear a sibling brand's visual language** (the sibling brand). Same infra shape as Client Site B (Drizzle + Neon/PGlite, NextAuth v5 credentials, editable-field CMS). Shipped the whole way: Vercel prod, Neon via the Vercel Storage integration, Resend contact forms with a graceful `mailto:` fallback, dynamic OG image, `ProfessionalService` JSON-LD.

Where the projects made different choices (Tailwind vs. plain CSS, from-scratch design vs. sister-brand re-skin, React-component reveal vs. ported-vanilla-JS reveal), all are documented below as valid — pick based on whether you're building fresh, porting a static site as-is, or re-skinning a port to match an existing brand.

## Stack Baseline

- Next.js 16 App Router, React 19, TypeScript, `next/image` for every raster image (explicit `width`/`height` or `fill` + `sizes`, never a bare `<img>`)
- Zod for any form/API input validation (`lib/validation.ts`), Resend for transactional email
- Styling is **either** Tailwind 4 with CSS-custom-property tokens bridged through `@theme inline`, **or** plain CSS custom properties with semantic utility classes (`.container`, `.btn--amber`) — never mix the two systems in one project, and know which one you're in before writing a single class name
- Drizzle ORM + Postgres for anything with an admin panel, orders, or persisted user-editable content; a flat typed data module (`lib/content.ts`) is enough for a pure marketing site with no CMS need
- `AGENTS.md`/`CLAUDE.md` in each repo carries a Next.js-version warning ("this is not the Next.js you know, read `node_modules/next/dist/docs/` before writing code") — respect it, this version genuinely has breaking API changes from training data

## Design Token Architecture

Both projects centralize color/spacing/motion as named CSS custom properties in `:root` — never hardcoded hex/rgba scattered through components.

**Tailwind 4 flavor** (Client Site A): define raw tokens in `:root`, then re-declare them inside `@theme inline` so Tailwind generates utilities (`bg-forest`, `text-terracotta`, `fill-forest-deep`) automatically:

```css
:root {
  --color-forest: oklch(30% 0.055 155);
  --color-forest-deep: oklch(19% 0.045 155);
  --color-terracotta: oklch(50% 0.15 38);
}
@theme inline {
  --color-forest: var(--color-forest);
  --color-forest-deep: var(--color-forest-deep);
  --color-terracotta: var(--color-terracotta);
}
```

Adding a new token means touching **both** blocks — forgetting the `@theme inline` half is the most common reason a new `bg-*`/`text-*`/`fill-*` class silently does nothing.

**Plain-CSS flavor** (Client Site B): flat hex tokens, no build-step bridge needed, referenced directly with `var(--forest-deep)`:

```css
:root {
  --forest-deep: #152A1F;
  --amber: #C06818;
  --cream-warm: #F8F4EC;
}
```

**Naming convention**: base / `-deep` (darker, for text-on-light or emphasis) / `-soft` (much lighter, for tints and backgrounds). Name by role in the palette (`forest`, `terracotta`, `wheat`), never by literal color (`green-1`, `orange`).

**Document contrast decisions in the CSS comment, not just in your head.** Real example from Client Site A:

```css
/* Darker than a typical "terracotta" swatch on purpose: at 60% lightness
   this only hit 3.9-4.1:1 contrast against parchment (fails WCAG AA 4.5:1
   for normal text) in both text-on-bg and bg-with-light-text roles, since
   it's used for both. 50%/43% clear 5.9:1+ in both directions. */
--color-terracotta: oklch(50% 0.15 38);
```

That comment is load-bearing — it stops a future "let's brighten this up" edit from silently reintroducing an accessibility failure.

## Re-skinning a Port to Match a Sister Brand

The Client Site C mode: a client hands you a static HTML/CSS site (their structure, sections, and copy) **and** they already run a sibling/parent brand with a live site. "Rework the design" here means *port the sibling's visual system onto this structure* — not invent a new one.

- **Lead with the on-brand option.** When a live sibling/parent site exists, propose "port that system" first. A from-scratch direction (even a good one) is likely to be rejected — the user wants brand coherence across the family of sites. (This is the `feedback_design_match_sister_site.md` lesson — a from-scratch "Editorial Authority" direction for FBS was built and thrown out before the mandate landed as "keep FBS's structure, wear FPS's skin.")
- **What you swap** (the sibling's visual language): font pairing, the `:root` color tokens, button shape/weight/case, card radius + treatments (top gradient bar, icon tiles), hero gradient, section dividers, dark-section styling, shadow scale.
- **What you leave alone:** section order, headings, body copy, nav, component structure, form fields. The port's information architecture is the client's; only the skin changes.
- **Homepage is the reference build.** Compose it fully in the new skin, then roll the shared class names + tokens across the inner pages. Inner pages leaning on shared classes (`.page-hero`, `.cards`, `.cta-band`, `.split`) rather than bespoke per-page composition is acceptable for this kind of build — don't gold-plate every route.
- **Section-transition dividers** (FPS house style, `components/WaveDivider.tsx`): a decorative SVG wave between two sections. `fill` = the colour of the section the wave *pours into*; `flip` puts the fill on top. Rule of thumb: only add the flipped/exit wave when the section **after** the dark one is light — a dark→dark or dark→gradient hand-off gets no wave (it just muddies).
- **"Remove the decorative element" means remove it — not replace it with a smaller one.** Asked to strip sequence numbers (`01 Define`, `02 Qualify`…) and keep the labels, the first pass swapped each number for a green dot / dash / gradient rule. All of it was rejected ("I don't want any of that in those areas"). When the user says take something out, take it out and let the space breathe; adding a subtler ornament in its place is still not what they asked for.

## Real Content Over Placeholders

When redesigning an existing business's site, pull their **actual** content, not lorem ipsum or invented copy:

- `curl` the live page's raw HTML directly rather than relying on `WebFetch`'s markdown conversion — WebFetch drops image URLs, `data-bg-url`/`srcset` attributes, and JSON-LD that a plain fetch/markdown pass discards. Grep the raw HTML for `data-bg=`, `srcset=`, or the CMS's known image-upload path (e.g. `/wp-content/uploads/`).
- Cross-reference scraped assets by filename **and** DOM order before attaching a name to a photo — don't assume; verify (Client Site A matched 24 staff headshots to bios this way, confirming via initials like `JD.png` → "Jane Doe").
- If a real asset doesn't exist (a staff member with no photo on the live site), don't fabricate one — use a deliberate fallback (a monogram-initial tile) instead of a stock photo standing in for a real person.
- Verify any striking or informal-sounding text (an unusually candid bio, a specific claim) is genuinely on the source site before using it — don't assume a surprising detail is a hallucination, but don't take a scrape at face value either; check the raw source.
- Before writing schema.org/JSON-LD claims (business type, `aggregateRating`, `openingHoursSpecification`, geo coordinates), verify the entity's actual legal/registration status rather than assuming from the domain — a `.org` domain doesn't mean a registered nonprofit. Omit fields you can't verify rather than guessing.

## Sourcing Real Images & Colors

**Stock photo mood swaps** (e.g. "these images feel depressing, find something more uplifting"): Shutterstock's search pages return a flat `403` to any fetch tool (bot-blocked) — don't burn time retrying it. Pexels doesn't block fetches and its license is free for commercial use with no attribution required:

1. `WebFetch` a Pexels search URL (`https://www.pexels.com/search/<query>/`) with a prompt asking for photo page URLs + a mood description per result — this returns real, usable results, not just a category link like Shutterstock does.
2. Extract the photo ID from each `/photo/<slug>-<id>/` URL and build a direct CDN link: `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=1600`.
3. `curl` a shortlist of candidates to the scratchpad directory, then actually **`Read` each image file** (multimodal) before wiring any of them in — a text description like "family sitting on a couch with a counselor" can still be tonally wrong (arms crossed, kid looking away, muted lighting) in ways only visible in the image itself. Don't trust the search tool's own mood description as ground truth.
4. Overwrite the existing files at their **same paths** when doing a straight swap (no `lib/content.ts` changes needed) — but see the Next.js image-cache gotcha below, this always requires a `.next` wipe.

**Extracting a brand's real colors from an existing asset** (e.g. "use the colors from our logo") instead of eyeballing them off a screenshot: if `python3`/`python` on `PATH` fails with a "Python was not found — install from the Microsoft Store" stub, that's a Windows App Execution Alias shim, not proof Python is unavailable — check for a real install under `AppData\Local\Programs\Python\Python3XX\python.exe` and call that full path directly; Pillow (`pip show pillow`) is often already installed there even when the bare `python3` command is a dead stub. A short inline Pillow script that loads the image, buckets pixels by `(r//12*12, g//12*12, b//12*12)`, skips low-saturation/near-transparent pixels, and prints the most common buckets gives real sampled RGB values for a palette — far more reliable than reading hex off a rendered screenshot.

**Bulk background removal for product cutouts:** local `rembg` with the `birefnet-general` model, not `u2net`. Full workflow, failure modes, and the hard-threshold + largest-connected-component post-process are in the *Product Billboard Shelf* section below.

## Accessible By Default

- **Compute contrast, don't eyeball it.** Write a throwaway Node script that converts your OKLCH/hex tokens to sRGB and calculates the real ratio against every surface the color actually appears on (text-on-bg **and** bg-with-light-text-on-top, since a color used both ways needs to clear 4.5:1 in both directions). Fix failures at the token level so every usage across the site corrects at once, instead of patching individual components.
- In a neomorphic or shadow-driven UI, **shape must carry state, not just color** — "raised" (pressable) vs. "pressed"/inset (selected/active) needs to be visible in grayscale and to colorblind users. Don't rely on a color shift alone to communicate selection.
- Respect `prefers-reduced-motion` **globally**, once, in `globals.css` — not per-component:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

  Once this exists, new animations don't need their own reduced-motion escape hatch — this rule already neutralizes them.
- Interactive tile/card grids (a staff directory, a product grid) need `aria-pressed`/`aria-selected` on the trigger and an `aria-live="polite"` announcement region for the panel that updates when a selection changes — screen reader users need to hear "Now viewing Dr. Kelli" the same way sighted users see the profile panel scroll into view.

## Scroll Reveal: Two Valid Patterns

**Pattern A — React wrapper component** (right choice for a from-scratch build): a small client component using `IntersectionObserver`, exposing a `delayMs` prop, adding a class once visible:

```tsx
"use client";
export default function Reveal({ children, className = "", delayMs = 0, ...rest }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.setTimeout(() => node.classList.add("is-visible"), delayMs);
        observer.unobserve(node);
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [delayMs]);
  return <div ref={ref} className={`reveal ${className}`} {...rest}>{children}</div>;
}
```

Paired with a plain CSS `.reveal { opacity: 0; transform: translateY(1.25rem); transition: ...; } .reveal.is-visible { opacity: 1; transform: translateY(0); }`.

**Pattern B — ported vanilla JS** (right choice when migrating an existing static site's `main.js` into Next.js almost verbatim): one client component living in the root layout, wiring up `data-reveal`/`data-reveal-stagger` attributes via `querySelectorAll` + `IntersectionObserver`, plus any carousels/rotators the old site had:

```tsx
"use client";
export default function SiteInteractions() {
  const pathname = usePathname();
  useEffect(() => {
    // querySelectorAll('[data-reveal]') + IntersectionObserver, carousel timers,
    // smooth-anchor-scroll handlers, quote rotators — all wired here, all cleaned
    // up in the returned function.
    return () => cleanups.forEach((fn) => fn());
  }, [pathname]); // re-run on every route change
  return null;
}
```

**Critical detail**: this component must depend on `pathname` (or similar) and re-run its setup on every value change. It lives in the root layout, which persists across client-side navigations — a one-time effect (`[]` deps) only ever wires up whatever page happened to be loaded first, silently breaking reveal/carousel behavior on every subsequent route.

## Contact Form Hardening Checklist

The mature pattern (Client Site A) vs. an earlier simpler one (Client Site B) — use the mature one for anything new:

- [ ] Zod schema colocated in `lib/validation.ts`, `safeParse`d server-side (never trust client validation alone)
- [ ] Honeypot field (`_company`) that must stay empty — `z.string().max(0).optional().or(z.literal(""))`
- [ ] Timing check — a hidden `renderedAt` timestamp set on mount; reject (silently) submissions faster than ~1200ms, long enough to catch bots, short enough that real autofill doesn't get flagged
- [ ] On honeypot-filled or too-fast submission: return `{ ok: true }` with a 200, **not** an error — a bot that gets an error will retry with adjustments; a bot that gets silent success moves on
- [ ] In-memory (or persistent, for multi-instance deploys) rate limiting keyed by IP, e.g. 5 requests/hour
- [ ] `escapeHtml()` every user-supplied field before interpolating into the email's HTML body (name, message, anything) — send both `html` and `text` bodies
- [ ] Validate required env vars (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) **inside the request handler**, not just at import time — a misconfigured env in one deploy target shouldn't crash the whole route module
- [ ] `export const runtime = "nodejs"; export const dynamic = "force-dynamic";` on the route if it does anything stateful (the in-memory rate-limit map needs a warm Node process)
- [ ] **Graceful degradation when email isn't configured yet** (FBS pattern — lets the site ship before Resend is wired): if `RESEND_API_KEY` is missing, the route returns `503` with `{ error: "not_configured" }` instead of a hard failure; the client submit helper treats `503 not_configured` (and any network error) as a signal to fall back to the form's original `mailto:` behaviour — build the `mailto:` link from the same field list, `window.location.href` it, and show the success state. Net effect: forms work day one on `mailto:`, then silently upgrade to real server-side send the moment the key lands in the env — no code change, no broken form in the gap.
- [ ] Sanitize anything that lands in an email **header** (the `replyTo` display name / address) separately from body escaping — strip `\r`/`\n`, cap length. Body `escapeHtml()` doesn't cover header injection.

## Database & Auth (Drizzle + NextAuth, for storefront/admin apps)

**Schema conventions** (from `client-site-b-storefront/db/schema.ts`):
- `uuid("id").primaryKey().defaultRandom()` for all PKs
- Money as `integer(..._cents)`, never `float`/`numeric` — no rounding surprises
- Soft delete via `active: boolean().notNull().default(true)` on catalog rows — hide without destroying history
- **Snapshot** denormalized fields on write-once records: `order_items.productNameSnapshot`/`variantLabelSnapshot`/`unitPriceCents` are copied at purchase time so a later product rename or price change doesn't silently rewrite historical orders
- `pgEnum` for finite status fields (`order_status`: `awaiting_payment | paid | fulfilled | cancelled | refunded`)
- `.references(() => table.id, { onDelete: "cascade" })` on child rows (images, variants, order items)

**Dual local/prod database, zero code changes**:

```ts
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
async function createDb() {
  if (connectionString) {
    // real Postgres (Neon/Vercel Postgres) in prod
    const client = postgres(connectionString, { max: 1 }); // max:1 avoids pool exhaustion in serverless
    return drizzle(client, { schema });
  }
  // PGlite: real Postgres compiled to WASM, same schema/SQL/migrations, for local dev
  const client = new PGlite("./.pglite-data");
  return drizzle(client, { schema });
}
```

Cache the `dbPromise` on `globalThis` outside production so Next.js dev's hot-reload doesn't reopen the embedded DB file on every request.

**Gotcha**: any one-off script (`db:seed-admin`, migrations run by hand) needs `DATABASE_URL`/`POSTGRES_URL` **explicitly exported in that shell**, or it silently connects to local PGlite instead of the real prod database — a script can "succeed" while writing to the wrong place entirely. Always echo the connection target before a seed/migration touches prod.

**Auth**: NextAuth v5 beta, `Credentials` provider, `bcryptjs` for password hashing, JWT session strategy, and keep the token/session payload minimal (id + email — don't cram the whole user row into a JWT):

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [Credentials({ /* ...bcrypt compare against db... */ })],
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token; },
    async session({ session, token }) { if (session.user) session.user.id = token.id; return session; },
  },
});
```

## Admin Panel — The Standard (auth + prod seeding + full-copy CMS)

Every client site this user ships gets an admin panel to this spec. It's proven across four Force-family sites on three different auth stacks. Build to it by default — don't reinvent per project.

### The client login

- **One canonical client admin account per site**, same email + password across the whole family so the client has one credential to remember. Current standard: `admin@your-domain.com` (Force family) — the client's real business email, **not** a site-specific address.
- **Password is bcrypt-only in the database. Never** written to `.env`, a tracked file, a commit, or the skill. Plaintext appears exactly once, inline on the seed command in a non-interactive shell.
- The client can rotate it themselves at `/admin/account` (change-password form, verifies current password before applying).
- **Role model:** a single `ADMIN` / `owner` role that unlocks the entire content CMS. No granular per-section permissions — the line isn't "which fields", it's "content vs. design" (see CMS scope below).

### Seeding the prod admin — per stack

The repo carries a `db:seed-admin` script (or equivalent) that **upserts** — creating the account or resetting its password, idempotent, safe to re-run. It reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from env when set, else prompts.

- **NextAuth v5 + Drizzle + Neon** (FBS, FPS): pull the prod connection string, then run the seed with it **explicitly exported** or it silently writes local PGlite (the [[feedback_ibmd_seed_admin_env]] trap):
  ```
  vercel env pull prod.env --environment=production --yes
  POSTGRES_URL="<from prod.env>" npx tsx db/migrate.ts        # idempotent, "relation already exists" NOTICE is fine
  POSTGRES_URL="<...>" ADMIN_EMAIL="<client@biz.com>" ADMIN_PASSWORD="<pw>" npx tsx db/seed-admin.ts
  ```
  Seed hashes with `bcryptjs` cost 12; `auth.ts` verifies with `compare`. Echo the DB host before running so you know you hit prod, not PGlite.
- **Supabase** (Client Site D): create the auth user via the Admin API (service-role key), then set the gate row: `UPDATE profiles SET role='owner' WHERE email='<client>'`. The gate is `requireAdmin()` in `lib/admin-auth.ts` checking `['admin','owner'].includes(profile.role)`.
- **Prisma + jose JWT** (Client Site E): if the DB URL is reachable, a Prisma seed script. If **DB creds live only in Vercel as a sensitive var** (can't be pulled), hand the user idempotent SQL to run in the Supabase SQL Editor — `INSERT … ON CONFLICT (email) DO UPDATE SET "passwordHash"=EXCLUDED."passwordHash", role='ADMIN'`, with a bcrypt hash (cost 10) generated locally via `bcryptjs`. Keep that `.sql` in scratchpad. `UserRole` enum is `ADMIN | AFFILIATE | GUEST`.

### Verify the login actually works — don't assume the seed took

- **NextAuth:** `GET /api/auth/csrf` (keep the cookie) → `POST /api/auth/callback/credentials` with `csrfToken` + `email` + `password` form-encoded → expect `302 → /admin`; then `GET /api/auth/session` returns the user. Full curl chain, against the live domain.
- **Supabase:** `POST <url>/auth/v1/token?grant_type=password` with the anon key in the `apikey` header → expect `200` + `access_token`. Then confirm the `profiles.role` row with the service key.
- **Prisma/jose (Client Site E):** `/api/login` curl **401s even when browser login works** — a known, unexplained curl-vs-browser gap on that stack. Don't rabbit-hole it. Confirm via a real browser login or by SELECT-ing the seeded row; treat curl 401 there as inconclusive, not failure.

### Client-Editable Content — every visible string (the standard)

The old bar was "a handful of hero paragraphs." **The new bar: every user-facing string on every page is editable**, short of major design changes. Layout, spacing, color, component structure, adding/removing sections = still code. Copy, headings, card titles/bodies, list items, button/link labels, nav labels, FAQ Q&A, SEO title/description/OG, image `alt` text, footer, legal pages = all CMS.

Same primitive as before — a typed field registry, a DB override, a hardcoded fallback — just applied exhaustively:

```tsx
export async function EditableText({ fieldKey, as: Tag = "p", className }) {
  const field = getFieldByKey(fieldKey);      // throws if fieldKey is a typo — fails loud, not silent
  const content = await getAllSiteContent();  // one query, cached per-request; swallows DB errors → {} so copy never 500s
  const value = content[fieldKey] ?? field.fallback;
  return <Tag className={className}>{value}</Tag>;
}
```

- **Schema:** one `site_content` table, `key text primary key`, `value text`, `updated_at`. An empty value on save **deletes the row** so the field falls back to the code default rather than rendering blank.
- **Keys:** stable `page.section.item` dotted strings (`home.hero.intro`, `about.team.card3.body`, `seo.services.title`). The current on-page string becomes the field's `fallback` — the site renders identically before anyone edits anything.
- **Registry** (`lib/content-fields.ts`): every field is `{ key, label, section, type: "text" | "textarea", fallback }`. Section enum + `SECTION_LABELS` map drive the editor grouping.
- **Editor UI** is registry-driven — it renders whatever's in the registry, so adding a field is a one-line registry entry + swapping the literal for `<EditableText>`. At full-copy scale (150–300 fields) add a **page → section** accordion grouping and a client-side filter/search box; don't ship a 300-row flat form.
- **Rollout per page:** walk every component the route renders, extract each hardcoded user-facing literal, give it a key, add it to the registry with the current text as `fallback`, replace the literal with `<EditableText>` (or `getEditableValue()` in a non-component context). Then `next build`, `vercel --prod`, and re-verify the client can edit a field and see it change live.
- Server actions that write content are admin-gated (`auth()` / `assertAdmin()` / jose verify) — run `security-review` on any new write route or action regardless, per the hard rules.
- **Images:** text-only by default. Image-upload (Vercel Blob + a `brand.logo`-style field) has been built and then removed on this user's call more than once — don't add it unless explicitly asked, and if asked, keep it as a separable commit.

## SEO / Structured Data Pass

Standard checklist for a marketing site going live:
- `app/sitemap.ts` and `app/robots.ts` (typed Next.js route handlers, not static XML files)
- `app/opengraph-image.tsx` — generate the share image, no static asset to keep in sync
- A `<JsonLd>` component rendering the entity's real schema.org type (verify LLC vs. nonprofit vs. sole proprietor before picking `MedicalClinic` vs `Organization` vs whatever fits) sourced from the same typed content module the page itself uses — one source of truth, not a separately-maintained JSON blob. For a local service business, a single `@graph` array wiring `Organization` + `WebSite` + `ProfessionalService` (`areaServed`, `hasOfferCatalog`, `founder`) together by `@id` is the shape (FBS did this inline in `layout.tsx` `<head>`)
- `app/manifest.ts` (typed `MetadataRoute.Manifest`) — name, `theme_color` from the brand token, favicon; cheap, and Lighthouse/PWA audits ask for it
- Keep the layout `openGraph`/`twitter` metadata's `images` array **empty** once `app/opengraph-image.tsx` exists — the file convention emits the `og:image`/`twitter:image` tags itself; a hand-set `images: [{ width, height }]` that points at a logo of the wrong dimensions just contradicts it
- `metadataBase` + per-page canonical/OG/Twitter metadata on every route
- `public/llms.txt` as a GEO/AI-crawler index alongside the traditional sitemap
- Deliberately omit fields you can't verify (`geo`, `openingHoursSpecification`, `aggregateRating`) rather than fabricate plausible-looking values — flag them to pull from Google Business Profile once claimed

## Deploy & Ops (Vercel + Neon + Resend)

Shipping FBS end-to-end surfaced a set of operational gotchas that never show up in local dev:

- **Vercel deploys are manual (`vercel --prod`) whenever the Vercel team ≠ the GitHub repo's org.** FBS's repo is under `your-github-org`; the Vercel project is under `your-vercel-team`. They can't be git-linked without sharing the repo across, so there's no push-to-deploy — every ship is an explicit `vercel --prod --yes` from the project dir. Confirm the **aliased** production URL in the CLI output (`Aliased: https://<project>.vercel.app`), not just the per-deployment URL.
- **Env var changes do NOT reach the running deployment.** Adding `POSTGRES_URL` / `RESEND_API_KEY` in the dashboard or via `vercel env add` only affects the *next* build. After changing prod env, redeploy (`vercel --prod`) or the live site keeps running on the old env.
- **Neon via the Vercel Storage integration** injects ~18 vars at once (`POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `DATABASE_URL`, `PG*`, `NEON_PROJECT_ID`, …) into all three environments automatically — you don't hand-add them. Provisioning is browser-gated (`vercel integration add` can't complete a DB marketplace install headless); the user does that step, then you `vercel env pull` or read the connection string. Run **migrations against the non-pooling URL** (`POSTGRES_URL_NON_POOLING` / `*_UNPOOLED`), app runtime uses the pooled one with `postgres(url, { max: 1 })`.
- **Seeding a prod admin without leaking the password:** pass it inline to the one seed command (`ADMIN_EMAIL=… ADMIN_PASSWORD=… POSTGRES_URL=<non-pooling> npm run db:seed-admin`) — a non-interactive shell doesn't persist to history, the script stores only the bcrypt hash, and it never touches `.env.local` or any tracked file. Verify after with a throwaway `bcrypt.compare` against the stored hash, then a real `curl` login flow (`/api/auth/csrf` → POST `/api/auth/callback/credentials` → expect `302 /admin` + `__Secure-authjs.session-token`).
- **Resend domain verification can hang in `pending` forever with no error** if the published SPF record doesn't match what Resend currently wants. FBS's `send` TXT was Resend's newer *SPF-macro* form (`v=spf1 include:<hash>._spfm.send.<domain> ~all` + a separate `_spfm` record), but the account's API was checking for the plain `v=spf1 include:amazonses.com ~all`. Diagnose by hitting `GET https://api.resend.com/domains/{id}` with the API key to see the **exact** records Resend expects right now, and `dig`/resolve against the registrar's *authoritative* nameservers (not `8.8.8.8`, which caches stale) to see what's actually published. Fix = make DNS match the API's current expectation, delete the orphaned record, re-trigger `POST /domains/{id}/verify`.
- **`app/opengraph-image.tsx` (`next/og` / Satori): every `<div>` with more than one child needs an explicit `display: flex`** (or `contents`/`none`), or `next build` aborts with `Expected <div> to have explicit "display: flex"…`. Text + `<br/>` + text counts as multiple children — split into stacked flex divs instead of using `<br/>`. Fails only at build, never in `next dev`.
- **`"PGlite failed to initialize" / "RuntimeError: Aborted()" printed during `next build` is non-fatal** when every DB-reading page is `export const dynamic = "force-dynamic"` (so none are prerendered). The worker logs the error trying to open the embedded DB during page-data collection, then the build completes with exit 0 and all routes marked `ƒ`. Don't chase it; do keep the `force-dynamic` on every route that reads the DB.
- **`server-only` may not be hoisted** even though `next` depends on it — if `import "server-only"` in a secret-holding module (`lib/email.ts`) fails to resolve, just `npm i server-only` (it's the official tiny React package, zero runtime cost).

## Canvas / Generative Decorative Effects

Hard-won from tuning Client Site A's hero `GenerativeTreeBackground.tsx` (a hand-rolled branching-tree `<canvas>` effect, ported from a MIT-licensed source) through many rounds of live user feedback.

- **Decouple "ambient" opacity from "accent" opacity.** A single CSS `opacity` on the whole `<canvas>` element dims *everything* drawn on it uniformly — no matter how saturated an accent color is set in code, it's capped at that percentage. If part of the effect should stay a faint backdrop (wood/branches) while another part should read as vivid (colorful blooms), don't rely on element-level opacity at all: bake the ambient dimming into the individual draw calls' own alpha (`rgba(r,g,b, baseAlpha * opacity)`), and let the accent draw calls use their own independent, higher alpha untouched by that multiplier.
- **A wide gradient falloff reads as a blurry blotch, not a soft glow, once dots are packed close together.** `createRadialGradient` with a color stop at ~40% of the radius fading out to 0% at 100% looks fine in isolation but merges into an "ink blot" mass when many such dots sit near each other (e.g. clustered at branch tips). Keep the stop near-solid out to ~75% of the radius before a quick edge fade — same total radius, much crisper, distinct shape.
- **Extending a canvas past its own section's box, to visually bleed into an adjacent section, is a 3-part problem, not 1:** (a) the owning section's `overflow` must not clip it (scope any `overflow-hidden` you still need to a narrower wrapper around just the elements that require it); (b) the effect's own internal size/proportion math must be computed off the **logical** section height, not the physically-extended canvas height — basing branch-length math on the inflated height re-introduces exactly the edge-clipping you were trying to fix, just somewhere else; (c) whether the bleed renders **in front of or behind** the adjacent section is governed by CSS stacking order among positioned elements (see the stacking-bucket gotcha below), not by which section's DOM subtree the canvas physically lives in.
- **Randomized visual properties (color, size, position) must be decided once at creation and stored on the object, never recomputed every frame** — a per-frame `Math.random()` in a draw function causes visible flicker/strobing. Assign colors/jitter as fields on the object when it's created (mirroring however other "born-once" properties like sway phase or curvature are already handled), and just read them back on every subsequent frame.
- **A screenshot with the user's own circles/arrows on it is ground truth — trust it over your mental model of what the code should be producing.** A single annotated screenshot ("see the red area, the line is going *in front of* the green, I want it *behind*") can disprove a stacking assumption in seconds that would take much longer to re-derive from reading the code alone.

## Product Billboard Shelf (WebGL 2.5D, real-photo cutouts)

Hard-won across ~10 rounds on Client Site B's `/shop` — the brief was "walk into a hat store, hats sitting on a shelf, browse sideways instead of scrolling a grid." For a small catalog (≤ ~20 SKUs) this is the pattern that won.

**Do NOT build a tinted 3D model of the product.** We spent many rounds on a CC-BY trucker-cap `.glb`: the mesh back rendered solid (an inner shell sitting behind the alpha-mask netting), per-colorway tint never matched the real photos, the model shipped its own baked-in patch geometry ("GAMBÁS" text) that had to be detected-and-hidden, orientation was a guess, and it needed a whole GLB-optimization pipeline (`gltf-transform` meshopt + Python surgery to fix an `LA`-mode texture that made libvips choke + dropping a 32k-tri stitch mesh). A tinted model **cannot** match real product photography, and with no browser to QA WebGL, every wrong guess is a full user round-trip. Kill this approach early.

**The winning approach — 2.5D billboards:**
- Each product = a transparent-background cutout photo of the real item on a `PlaneGeometry` + `MeshBasicMaterial({ transparent: true, alphaTest: 0.5, depthWrite: true })`, standing upright on a lit shelf.
- Shelf = a wood `BoxGeometry` board + a back-wall `PlaneGeometry` + `RoomEnvironment` (`three/examples/jsm/environments/RoomEnvironment.js`, procedural, no HDRI file) + a warm 3-point light rig. Per item, a soft **contact shadow**: a flat plane with a canvas-drawn radial-gradient texture (`createRadialGradient`, black→transparent), `rotation.x = -Math.PI/2`, sat just behind the item's base.
- Interaction mirrors the DOM layer exactly: camera lerps along X to the active item; active eases forward (`+z`) and scales up ~1.07 while the rest dim via `material.color.lerp(warmGrey, 0.12)`. Drag, mouse-wheel (notch-stepped, ~260ms cooldown), arrow keys, click-active-to-open.
- Photo-accurate (it *is* the product), ~30× lighter than a model (16 quads vs ~1M tris), zero GLTFLoader/meshopt/Draco, no orientation/UV/tint problems. Keep `three` only for the lit shelf + camera; the scene is otherwise trivial.
- Tradeoff: front-only, no rotate-to-see-back. On a store shelf that's how you see products anyway — fine, and confirm it's fine with the user before committing.

**Progressive-enhancement architecture (do this from the start):**
- The **DOM shelf is the product** — a server-rendered semantic `<ol>` of `<Link>` cards, CSS `scroll-snap-type: x mandatory`, real `/shop/[slug]` links, keyboard nav, an `aria-live="polite"` "Now viewing" readout, marker dots. This is the SEO + a11y + no-JS + mobile layer *and* the fallback.
- The WebGL `ShelfScene` is `next/dynamic(() => import("./ShelfScene"), { ssr: false })`, gated by `canRun3d()`: WebGL context available **and** not `prefers-reduced-motion` **and** `innerWidth >= 900` **and** not `navigator.connection?.saveData`. Run the check in `requestAnimationFrame(() => setUse3d(canRun3d()))` inside a mount effect — deferring past first paint also sidesteps the `react-hooks/set-state-in-effect` lint error from `eslint-config-next` 16.3+.
- On `ShelfScene`'s `onReady`, add a `.sceneMode` class that visually hides the DOM track (`opacity: 0; pointer-events: none`) but leaves it in the a11y tree; `.sceneMode .track:focus-within { opacity: 1 }` snaps it back so keyboard users can still tab the product links.
- **Folder-driven roster.** The server component does `readdirSync('public/shelf/hats')` and filters products to those with a matching `<slug>.webp` cutout. The shelf then shows *exactly* the items that have an image — drop a file in and it appears, the filename **is** the product mapping, no whitelist constant, no code change. Wrap the `readdirSync` in try/catch returning an empty set.

**Bulk background removal (Python, local, no API):**
- `pip install rembg pillow-heif onnxruntime scipy`. Windows: use the real `python` (the `python3` command is a Store shim); `PIL`/`open()` need a real `C:\…` path, not the git-bash `/c/…` form.
- **Model choice dominates quality.** `birefnet-general` (≈973 MB one-time download, SOTA) gives dramatically cleaner edges than `u2net` / `isnet-general-use` — full item incl. thin parts (a cap bill), crisp, no shadow bleed. Default to it.
- **Where birefnet fails:** when the product's colour blends into the studio backdrop (dark / muted / camo items on a dark surface) it locks onto the highest-contrast sub-region — e.g. a bright label — and returns *only that*. Detect: `(mask_area / input_area) < ~0.12`, or a tiny result bbox. Fall back to `u2net`/`isnet` for those (still ~60–70% hit rate; the genuinely hard ones need a human).
- **Never use `alpha_matting=True`** — its soft edges then ghost/smear as billboards. Hard-threshold instead: `a > 140 ? 255 : 0`, then keep only the **largest connected component** (`scipy.ndimage.label` + `argmax` on region sizes) to drop detached shadow blobs and hang-tags, then a ~0.6px Gaussian for edge AA. Material `alphaTest: 0.5` discards any remaining fringe.
- **The reliable final set is the user hand-cutting their own PNGs** in a photo editor. Accept those over auto-cuts, wire them straight in. When you can't auto-cut some, hand the *specific* failures back by name and ask — don't burn 6 rounds tuning rembg params.

**Gotchas hit building this:**
- **CSS grid parent with only `grid-template-rows` set (no columns):** the implicit single column sizes to `max-content`, so a wide flex child (a scroll track of N cards) blows the whole section out horizontally and `overflow: hidden` clips it with nothing scrollable — looked like "I only see the first 3 items, can't scroll." Fix: `grid-template-columns: minmax(0, 1fr)` on the parent **and** `min-width: 0` on the scroll container.
- **`scroll-snap-type: x mandatory` eats `element.scrollLeft += delta`.** Wiring a vertical mouse-wheel to horizontal scroll by nudging `scrollLeft` does nothing — mandatory snap yanks the small increment straight back. Fix: don't nudge pixels, step a whole item per wheel notch with `slotEl.scrollIntoView({ inline: "center", behavior: reducedMotion ? "auto" : "smooth" })`, debounced ~260ms so a trackpad flick doesn't rocket through the list.
- **Inline `.map()` into a `next/dynamic` child's prop rebuilds the whole scene every render.** `<ShelfScene products={products.map(p => ({slug: p.slug}))} />` creates a new array identity on every parent render → the child's `useEffect([products])` tears down and re-inits the entire three.js scene (re-loads every texture) on every `active` change — visually "all the items blink out and come back" on each scroll. `useMemo` the mapped array.

## Known CSS/Animation Gotchas

Hard-won, hit in actual production debugging — check this list before assuming a visual bug is mysterious.

**Tailwind v4 cascade layers**: plain, unlayered CSS in `globals.css` silently beats a *layered* Tailwind utility class targeting the same property, regardless of source order or specificity math. If a plain `.some-class { border-radius: ...; box-shadow: ...; }` rule exists, adding Tailwind's `rounded-full` or `ring-2` to an element using that class will **not** override it — the utility is layered, the plain rule isn't, and layered CSS always loses to unlayered CSS in the cascade. Fix: either don't apply the shared plain-CSS class to that element at all (give it its own one-off class), or bake the override directly into another plain, unlayered rule.

**Animated `transform` completely replaces the base value, including any centering translate.** If an element is positioned via `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` (Tailwind's transform-based centering trick) and *also* has a `@keyframes` animation that sets `transform: scale(...)`, the keyframe's `scale(...)` **overwrites** the translate entirely for the animation's duration — the element snaps to being anchored at its 50%/50% point with no offset, then scales from there, visually jumping out of its centered position and appearing to grow lopsided toward one corner. Fix: either bake the same translate into every keyframe (`transform: translate(-50%, -50%) scale(1.08);`), or avoid transform-based centering for anything that will also be `transform`-animated — use `inset`-based centering instead (next gotcha).

**Percentage `width`/`height` on an absolutely-positioned grid-item child is fragile.** `height: 118%` inside an element that's itself a CSS Grid item (even one using `aspect-square`) can resolve against an unexpected ancestor instead of the intended parent, because percentage heights require a well-defined ancestor height and grid layout can leave that ambiguous. Symptom: the element renders at a wildly wrong size/position — e.g. appearing to overlap content in a completely different grid column. Fix: use `inset`-based sizing instead of explicit width/height + centering transform — `-inset-[9%]` (offsetting all four edges outward by a percentage of the element's own box) only depends on well-defined edges, not on percentage-height resolution, and is inherently centered with no transform needed at all.

**Blur + low opacity + a small/thin shape reads as invisible, not just subtle.** A blurred glow's visible spread is capped by its own size; shrinking an element to "tighten" a halo while keeping the same large `blur()` radius doesn't make a tighter glow, it smears what little color there was into nothing — especially against a similarly-light page background. When tightening a glow/halo effect, reduce the blur radius roughly in proportion to the size reduction, and expect to raise opacity to compensate.

**A gradient with high lightness inherently can't hold much saturation.** In OKLCH (and perceptually in general), pushing a color's lightness up toward white shrinks how much chroma/saturation it can carry before clipping back to gray — "make it lighter" by raising `L` alone, without also raising `C`, produces a washed-out near-white result regardless of the hue. If a color needs to read as both "light" and "vividly colored," raise lightness moderately (not into the 80s%+) and raise chroma to compensate, don't just brighten.

**Verify a color/CSS change actually shipped before assuming the wrong root cause.** When a described visual fix doesn't show up for the user, fetch the actual compiled/served CSS (`curl` the page, find the linked stylesheet chunk, grep for the rule) before re-diagnosing — confirming the source change *compiled correctly* rules out half of the possible explanations immediately and stops wasted iteration on the wrong hypothesis.

**Bottom-of-circle `textPath` needs the opposite sweep direction from top-of-circle text**, or it renders upside-down. For an SVG arc `A rx ry 0 large-arc-flag sweep-flag x y` laid out left-point → right-point, `sweep-flag=1` (clockwise) routes through the *top* and reads right-side-up there; the *same* left→right ordering through the *bottom* requires `sweep-flag=0` for the text to stay upright, because the glyph-orientation rule is a fixed rotation relative to the path's local direction of travel, not "whichever way looks right" — trace the tangent direction at the extremal point instead of guessing.

**A non-positioned element paints in an earlier stacking bucket than a positioned one, regardless of DOM order.** Per the CSS painting-order algorithm, in-flow non-positioned descendants (`position: static`) are painted as a group *before* any positioned descendant (`position: relative/absolute` with `z-index: auto`) within the same stacking context — document order only decides ranking *within* each bucket, not between them. Concretely: a decorative `<div>` (an SVG wave divider between two sections, say) with no `position` set will render **underneath** a `position: absolute` canvas/overlay from an *earlier* section in the DOM, even though the div comes later in the page — because "non-positioned" always loses the bucket race to "positioned," independent of source order. Symptom looks like a z-index bug but a `z-index` change does nothing, because the elements aren't even competing in the same bucket yet. Fix: give the non-positioned element `position: relative` (no `z-index` needed) so it joins the same document-order-respecting bucket as everything else, then normal "later in DOM = painted on top" reasoning applies.

**Third-party trademarked logos** (insurance carriers, partner brands, "as seen in" badges) are fine to use for factual "we accept/partner with X" statements — standard, common practice — but flag brand-usage-guideline risk (color alteration, clear-space rules) to the user before a real launch, rather than silently treating it as a solved problem once the asset is wired in.

## Going Live with Real Payments (Stripe) — Checklist

From taking Client Site B's checkout from `CHECKOUT_ENABLED = false` (mock provider) to real live-mode Stripe in one session.

- **Verify the Stripe account is actually cleared before flipping anything on**, don't trust "the user pasted a live key" as proof: `stripe.accounts.retrieve()` and check `charges_enabled`, `payouts_enabled`, `details_submitted` are all `true` and `requirements.disabled_reason` is unset. A live secret key can exist for an account Stripe hasn't finished verifying.
- **A UI-only kill switch (`CHECKOUT_ENABLED` gating just the Add-to-Cart button) is not a real gate.** If the API route that actually creates orders/Stripe sessions doesn't independently check the same flag, anyone who calls the endpoint directly bypasses the "disabled" storefront entirely — this is a CRITICAL finding, not a nitpick, the moment real keys are in the environment. Every kill switch needs to be enforced at the server boundary that does the sensitive thing, not just hidden from the UI that normally triggers it.
- **Never let secrets round-trip through the chat transcript if you can avoid it** — when a user is about to paste a live key, say so and suggest they drop it straight into `.env.local` themselves first. If they paste it anyway, don't echo it back in your response; write it to the file and confirm by describing what changed, not by repeating the value.
- **Rotating a Vercel env var doesn't require reading the old value.** `vercel env pull` to inspect an existing secret gets auto-mode-blocked ("Credential Materialization") on a security-conscious harness — don't fight that. Just `vercel env rm NAME production --yes` then `vercel env add NAME production` piped from a file; you never needed to see the old value to replace it.
- **Windows gotcha: Node's temp dir ≠ Bash's `/tmp`.** A Node one-liner writing to `os.tmpdir()` (or a literal `/tmp/...` path in a `node -e` script) lands under `AppData\Local\Temp\...`, which the Bash tool's `/tmp` doesn't see — `ls /tmp/*.val` comes back empty even though the write succeeded. Write cross-tool temp files to the harness's own scratchpad directory (passed in as an env/path at session start) instead, from both the Node script and the Bash command that reads it back.
- **Reading/writing the *production* database directly from a shell command can get auto-mode-blocked** ("Production Reads") even for something as small as a `SELECT count(*)`. Don't fight it or route around it with a different tool — either ask the user to run the query, or restructure the fix so it doesn't need the read (e.g. an additive-only migration with a `DEFAULT` doesn't need to know the existing data first).
- **Confirm the live account, not just the code, before declaring "checkout is live.**" After deploying, hit the real endpoint with a throwaway request (`curl -X POST /api/checkout/create -d '{}'`) and confirm it now validates input (400) instead of returning the old disabled-state response (403/404) — that's a five-second sanity check that the deploy + env vars actually took effect together, not just individually.
- After going live, the one thing you genuinely cannot verify yourself without a browser is a real end-to-end purchase — say so explicitly and ask the user to run one small real transaction and check the Stripe dashboard's webhook delivery log for that event.

## Full-Site Audit Workflow (Security + Functionality in Parallel)

When asked to "audit the whole site" (not just the feature just shipped), don't run one pass — launch two independent subagents in parallel, each scoped to not overlap:

- **Security agent**: auth/session handling, all API routes, admin CRUD authorization (IDOR), file uploads, XSS, SQL/query safety, secrets, CSRF, security headers, rate-limit coverage. Explicitly tell it to skip whatever a prior focused review (e.g. the checkout-specific pass) already covered, so it doesn't re-litigate solved problems.
- **Functionality agent**: told explicitly to skip security/auth/injection (that's the other agent's job) and instead hunt for actual bugs — broken flows, stale-state, race conditions, silent data loss, dead schema, missing error boundaries. Give it the exact business logic to interrogate (e.g. "does this enum split have an edge case where a row falls through with no fallback").
- **Fact-check subagent findings that make claims about the environment**, don't just relay them. A security agent flagged a repo's `AGENTS.md` (a Next.js-generated file explaining a training-data-breaking-changes disclaimer) as a possible prompt-injection payload — it read as suspicious in isolation, but a 5-second `test -f node_modules/next/dist/server/lib/generate-agent-files.js` confirmed it's real, shipped Next.js tooling. An agent's "this looks suspicious" is a lead to verify, not a fact to relay.
- The highest-value finding of this pattern (Client Site B, 2026-09-16): a shared admin `updateVariant()` mutation was a **full-row overwrite**, not a partial patch. The Inventory quick-update form called it with `priceCents: null` and a hardcoded `lowStockThreshold: 5` in a comment that said "this page only manages stock, price stays whatever it was" — the comment lied, and every stock update on a live store was silently resetting the product's actual price. **Any admin quick-edit surface that shares a mutation function with a full-edit form is a live bug waiting to happen unless that mutation takes a genuine `Partial<>` and does `.set(input)` rather than `.set({ field: input.field, otherField: input.otherField, ... })` naming every column.** Audit every shared update function in an admin panel for this shape specifically — it's invisible in code review unless you trace what each caller actually passes.

## Cart/Checkout Stock & Price Revalidation

A client-only cart (localStorage, `priceCents` captured once at add-to-cart) will drift from the DB the moment an admin edits a price or another customer buys the last unit — and the generic "your cart is invalid" rejection at checkout doesn't tell the customer which line item is the problem. The fix that's worth building proactively on any storefort with a persistent client cart:

- A small read-only endpoint (`POST /api/cart/status`, rate-limited, capped list size) that takes variant IDs and returns current `{ stockCount, priceCents }` straight from the DB — the same price-resolution logic (`variant.priceCents ?? product.basePriceCents`) the real order-creation path uses, so there's exactly one source of truth for "what does this actually cost."
- Cart page calls it once on hydration, then: clamps quantity to `min(cartQty, realStock, MAX_QUANTITY_PER_LINE)`, patches the displayed price to the real one, and shows an inline per-line notice ("Only 2 left — quantity adjusted" / "Price updated"), plus disables checkout entirely while any line is sold out.
- Give the cart's state provider a `patchItem(id, { priceCents?, quantity? })` that merges in place — resist the temptation to implement a price/qty refresh as `removeItem` + `addItem`, which silently reorders the list (the new entry lands at the end) since `addItem` always appends.

## Working With This User: Iteration Style

This user iterates on visual details in rapid small steps (size, color, position, one at a time) and **will send screenshots** — trust the screenshot over your own prediction of what a CSS change did. After every visual tweak:

1. Run `tsc --noEmit` and `eslint` on the touched files
2. Confirm the dev server still serves 200
3. If a color, position, or size change is in doubt, actually fetch and grep the compiled CSS rather than asserting it worked from the source diff alone
4. If the user reports something isn't showing up after two attempts at the same fix, stop tweaking parameters and re-derive the actual root cause structurally (wrong containing block, cascade-layer conflict, transform override) — the fix is almost never "more of the same knob"
5. When a whole approach gets rejected ("remove that altogether", "put it back to the original"), revert cleanly — remove the dead CSS/keyframes too, don't leave unused classes behind
