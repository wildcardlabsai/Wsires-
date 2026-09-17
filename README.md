# CymruSites

**Professional websites for Welsh businesses. Made simple.**

A production web design and marketing agency platform: a marketing
website, customer and admin dashboards, a multi-tenant website renderer,
Stripe billing and transactional email — built on Next.js 15, Supabase
and Stripe.

**Content model:** CymruSites builds and maintains every customer's
website — there is no self-service page builder. A customer's onboarding
submission is a one-time brief (including an *optional* website-style
preference); after that, every change goes through a support ticket or a
change request, both reviewed and actioned by an admin. This is enforced
at the database level, not just in the UI — see "Security" below.

This is a working application, not a prototype. Every button, form and
dashboard listed below does what it says: writes to a real database,
enforces real access control, sends a real email once the relevant API
key is configured.

---

## Stack

- **Next.js 15** (App Router) + **TypeScript**, strict mode
- **Tailwind CSS** + a small shadcn/ui-style component library
- **Supabase** — Postgres, Auth, Storage, Row Level Security
- **Stripe** — Checkout, Billing Portal, webhooks
- **Resend** — transactional email
- Deploys to **Vercel** with zero configuration beyond environment variables

## Project structure

```
src/
  app/
    (marketing)/        Public website — home, pricing, industries, examples…
    (auth)/              Login, signup, password reset
    onboarding/          10-step onboarding wizard
    dashboard/           Customer dashboard (10 sections — read/track your
                          site, media, domain, analytics, leads, billing;
                          changes go through Support, not self-editing)
    admin/               Admin dashboard (14 sections, incl. Change requests)
    sites/domain/[domain]/[[...path]]      Customer sites on their own domain
    sites/subdomain/[slug]/[[...path]]     Customer sites on *.cymrusites.co.uk
    demo/[slug]/[[...path]]                /examples portfolio demo sites
    preview/[slug]/[[...path]]             Private pre-launch preview links
    api/                 Every server mutation — auth, billing, onboarding,
                          website management, admin actions, Stripe webhook
  components/
    ui/                  Design-system primitives (button, card, dialog…)
    marketing/            Marketing-site sections
    dashboard/, admin/    Dashboard-specific components
    site/                 The website template renderer (header, hero
                          variants, sections, contact form)
    onboarding/           The onboarding wizard's steps
  lib/
    supabase/             Browser / server / service-role Supabase clients
    auth/                 Session helpers and API route guards
    email/                Branded email layout + every transactional template
    stripe/                Stripe client, checkout, portal, webhook helpers
    websites/              Template rendering, SEO, provisioning, content
    content/               Marketing-site copy defaults + the settings-table
                            override layer that powers Admin → Content
    validation/             Every Zod schema used by a form or API route
supabase/migrations/       Full schema, RLS policies, storage policies, seed data
scripts/                    Stripe price sync, demo data seed/removal
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values described below
npm run dev
```

The marketing site, and every page that doesn't need a database, renders
immediately with no configuration. Sign-up, dashboards and payments need
Supabase (and Stripe, for payments) connected first.

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run every file in `supabase/migrations/` against it, in order — either
   paste each into the SQL editor, or `supabase db push` if you have the
   Supabase CLI linked to the project. This creates the full schema, every
   Row Level Security policy, storage buckets, and the starter plans/
   templates.
3. Copy the project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the service role key into
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
4. To make your own account an admin automatically on signup, add your
   email under **Admin → Settings → Admin access** once you're signed in
   as a customer — or insert it directly:
   ```sql
   update settings set value = '["you@example.com"]'::jsonb
   where key = 'admin_email_allowlist';
   ```
5. **Recommended:** point Supabase's own auth emails (confirmation,
   password reset) through Resend for consistent deliverability — Project
   Settings → Auth → SMTP Settings, host `smtp.resend.com`, port `465`,
   username `resend`, password your `RESEND_API_KEY`.

### 2. Stripe

1. Create a [Stripe](https://stripe.com) account (test mode is fine to
   start) and copy the secret/publishable keys into `.env.local`.
2. Run `npm run stripe:sync` — this creates a Product and two Prices
   (setup fee + monthly) in Stripe for every row in the `plans` table, and
   writes the resulting price IDs back onto each plan. Re-run it any time
   pricing changes.
3. In the Stripe dashboard, add a webhook endpoint at
   `<your-domain>/api/webhooks/stripe` listening for
   `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `customer.subscription.updated` and `customer.subscription.deleted`.
   Paste its signing secret into `STRIPE_WEBHOOK_SECRET`.
4. For local development, use the Stripe CLI to forward events:
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

Until Stripe is configured, checkout shows a clear "payments aren't
connected yet" message and offers to continue straight to onboarding —
nothing pretends to charge a card that isn't really being charged.

### 3. Resend

1. Create a [Resend](https://resend.com) account and verify a sending
   domain.
2. Add `RESEND_API_KEY` and set `EMAIL_FROM` to an address on that domain.

Until this is set, every transactional email is logged to the server
console instead of sent — the application keeps working, you just don't
receive the emails.

### 4. Demo data

```bash
npm run seed:demo     # 6 live example websites + 4 in-pipeline customers,
                       # subscriptions, leads, support tickets, 30 days of
                       # analytics — everything flagged is_demo = true
npm run seed:remove   # deletes every row (and auth user) the seed created
```

Demo customer accounts sign in with the password printed at the end of
the seed run. Demo rows are clearly labelled in both dashboards ("Demo"
badges) and never mixed into real customer counts silently — they're
regular rows with `is_demo = true`, so removing them is exact and safe.

## Multi-tenant architecture

Every customer website is one row in `websites`, reachable three ways —
and the same rendering pipeline (`src/components/site/`, driven by
`src/lib/websites/`) serves all three:

- their own domain, once DNS is pointed at this deployment and the domain
  is marked `live` in Admin → Domains
- `<slug>.cymrusites.co.uk`, issued automatically
- `/preview/<slug>?token=…`, a private link shown before launch

`middleware.ts` inspects the request `Host` header and rewrites to
`/sites/domain/[domain]/…` or `/sites/subdomain/[slug]/…` accordingly;
anything on the platform's own root domain is untouched. `/examples` on
the marketing site links to `/demo/<slug>` — ordinary `websites` rows
flagged `is_demo`, rendered through the exact same pipeline.

**Known limitation:** `/sitemap.xml` and `/robots.txt` currently resolve
to the platform's own files on every host, including customer domains
(they're excluded from the middleware rewrite as static-looking paths).
Individual customer pages still carry correct canonical URLs, meta tags
and JSON-LD, which covers the SEO fundamentals; a dedicated per-tenant
sitemap route is a natural next addition (see "Future work" below).

## Security

- Row Level Security is enabled on every table; policies are defined in
  `supabase/migrations/20250101000001_rls.sql`, with
  `20250101000004_agency_model.sql` tightening `businesses` and
  `websites` so a customer can read but never write either directly —
  the agency-managed content model is enforced by the database, not just
  hidden from the UI. Onboarding and admin routes write through the
  service role after verifying the caller's identity in application code.
- Customers can only ever read or write rows tied to their own
  `customers.id`; admins are checked by a `SECURITY DEFINER` `is_admin()`
  function, not a client-side flag.
- Triggers block a customer from editing their own `role`, subscription
  status, or website status/slug/plan directly, even with a valid session.
- Every API route re-derives the caller's identity server-side
  (`lib/auth/api.ts`) — the frontend's role check is a UX convenience, not
  the access boundary.
- File uploads are validated server-side (type, size, filename) regardless
  of what the browser claims, and stored under a path namespaced by
  customer id, matched against storage policies.
- Public forms (contact, site enquiries, signup, login) are rate-limited
  per IP.
- Stripe webhook payloads are signature-verified and processed
  idempotently via a `stripe_events` ledger.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next's ESLint config |
| `npm run stripe:sync` | Create/refresh Stripe Products & Prices from `plans` |
| `npm run seed:demo` | Seed demo customers, websites, billing, leads, analytics |
| `npm run seed:remove` | Remove every row the demo seed created |

## Future work

The codebase is deliberately structured so these can be added without
restructuring anything (see `docs/` for more detail where noted):

- AI-assisted content drafting during onboarding
- Automated domain/DNS provisioning (Domains are currently confirmed
  manually by an admin — the status model already supports automation
  slotting in underneath)
- Google Business Profile / Google Analytics integration
- Native booking, review management, email marketing
- Agency/white-label accounts, referrals
- Per-tenant `sitemap.xml` (see "Known limitation" above)
