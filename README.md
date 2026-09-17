# CymruSites

**Professional websites for Welsh businesses. Made simple.**

The marketing website for a web design and marketing agency, built on
Next.js 15. This is a plain, static-friendly frontend — there is no
database, no authentication, no dashboards and no payments backend.
Customers are onboarded, billed and supported by the agency directly
(email, phone, invoice), not through this application.

This is a working website, not a prototype. Every page renders real
content and the contact form sends a real email once Resend is
configured — nothing here is a stub or a placeholder.

---

## Stack

- **Next.js 15** (App Router) + **TypeScript**, strict mode
- **Tailwind CSS** + a small shadcn/ui-style component library
- **Resend** — sends the one email this site needs (a contact-form
  notification)
- Deploys to **Vercel** with zero required configuration

## Project structure

```
src/
  app/
    (marketing)/        The entire public website — home, pricing,
                          industries, examples, about, contact, FAQ,
                          terms, privacy
    api/contact/         The only server route: validates the contact
                          form, rate-limits it, and emails you via Resend
    robots.ts, sitemap.ts
  components/
    ui/                  Design-system primitives (button, card, select…)
    marketing/            Marketing-site sections, header, footer,
                           pricing cards, the contact form
    shared/               Small shared pieces (logo, form fields, states)
  lib/
    content/               Marketing-site copy and pricing plans — edit
                            these files directly to change content
    email/                  Branded email layout, send helper and the
                             one transactional template
    validation/             The contact form's Zod schema
    rate-limit.ts, env.ts, utils.ts
```

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — only needed for the contact form email
npm run dev
```

Every page renders immediately with no configuration at all. The only
optional step is Resend, for the contact form to actually send an email
instead of just logging it.

### Resend (optional)

1. Create a [Resend](https://resend.com) account and verify a sending
   domain.
2. Add `RESEND_API_KEY` and set `EMAIL_FROM` to an address on that domain,
   and `ADMIN_NOTIFICATION_EMAIL` to where enquiries should land.

Until this is set, contact-form submissions are logged to the server
console instead of emailed — the form still works, you just don't receive
the email.

## Editing content

There is no admin panel or database. To change copy, pricing or the
industries/examples shown:

- `src/lib/content/defaults.ts` — all marketing copy (hero, FAQs,
  testimonials, industries, portfolio examples, etc.)
- `src/lib/content/plans.ts` — the three pricing plans

Both are plain TypeScript objects — edit, save, redeploy.

## Security

- The contact form is rate-limited per IP and includes a honeypot field.
- Contact-form submissions are emailed directly and never stored on any
  server this application runs — there is no database.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are set on every response.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next's ESLint config |
