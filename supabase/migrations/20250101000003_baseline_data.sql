-- =====================================================================
-- CymruSites — baseline production data (packages + templates).
-- This is real configuration, not demo data: prices are editable from
-- the admin dashboard afterwards.
-- =====================================================================

insert into public.plans
  (slug, name, tagline, description, setup_price_pence, monthly_price_pence,
   max_pages, features, is_featured, sort_order)
values
  (
    'starter', 'Starter', 'Everything a local business needs to be found.',
    'A clean, fast three page website that makes you look established and gets the phone ringing.',
    29900, 2900, 3,
    '[
      "Up to 3 pages",
      "Mobile responsive website",
      "Contact form",
      "WhatsApp button",
      "Google Maps",
      "SSL certificate",
      "Hosting included",
      "Basic SEO",
      "Basic analytics",
      "Business email setup guidance",
      "Minor website updates"
    ]'::jsonb,
    false, 1
  ),
  (
    'business', 'Business', 'For businesses that want to be found locally.',
    'More pages, local SEO and a bilingual option — built for tradespeople covering several towns.',
    49900, 3900, 6,
    '[
      "Everything in Starter",
      "Up to 6 pages",
      "Local SEO setup",
      "Google Business Profile integration",
      "Reviews section",
      "Image gallery",
      "Multiple service areas",
      "Welsh / bilingual option",
      "Monthly content updates"
    ]'::jsonb,
    true, 2
  ),
  (
    'pro', 'Pro', 'For established businesses that want to grow.',
    'Advanced local SEO, booking and lead capture with priority support and frequent updates.',
    79900, 5900, 10,
    '[
      "Everything in Business",
      "Up to 10 pages",
      "Advanced local SEO",
      "Blog / news section",
      "Booking functionality",
      "Advanced lead forms",
      "Analytics dashboard",
      "Priority support",
      "More frequent content updates"
    ]'::jsonb,
    false, 3
  )
on conflict (slug) do nothing;

insert into public.website_templates
  (slug, name, description, best_for, style_tokens, supported_sections, default_sections, sort_order)
values
  (
    'y-glannau', 'Y Glannau',
    'Confident and photographic. A full-bleed hero image with a bold headline over it — the strongest choice when you have good photos of your work.',
    'Builders, roofers, landscapers',
    '{"accent":"#C8102E","surface":"#FFFFFF","ink":"#1C1B19","muted":"#F4EFE6","headingFont":"display","layout":"photographic","radius":"lg","heroStyle":"image-overlay","navStyle":"transparent"}'::jsonb,
    '["header","hero","trust","services","about","gallery","areas","testimonials","faq","cta","contact","footer"]'::jsonb,
    '["header","hero","trust","services","about","gallery","testimonials","cta","contact","footer"]'::jsonb,
    1
  ),
  (
    'y-cwm', 'Y Cwm',
    'Clean and structured. A split hero with your details on the left and a photograph on the right, then clear service cards. Works with only a handful of photos.',
    'Plumbers, electricians, professional services',
    '{"accent":"#2F5444","surface":"#FBF9F5","ink":"#1C1B19","muted":"#F2F6F4","headingFont":"sans","layout":"split","radius":"md","heroStyle":"split","navStyle":"solid"}'::jsonb,
    '["header","hero","trust","services","about","areas","testimonials","faq","cta","contact","footer"]'::jsonb,
    '["header","hero","trust","services","about","areas","testimonials","faq","cta","contact","footer"]'::jsonb,
    2
  ),
  (
    'y-bont', 'Y Bont',
    'Direct and practical. Phone number front and centre with a strong call-to-action bar. Built for emergency call-out trades where people ring first and read later.',
    'Emergency call-outs, automotive, 24hr services',
    '{"accent":"#B45309","surface":"#FFFFFF","ink":"#1C1B19","muted":"#FEF6EC","headingFont":"sans","layout":"utility","radius":"sm","heroStyle":"callout","navStyle":"solid"}'::jsonb,
    '["header","hero","trust","services","areas","about","testimonials","faq","cta","contact","footer"]'::jsonb,
    '["header","hero","services","trust","areas","testimonials","cta","contact","footer"]'::jsonb,
    3
  ),
  (
    'y-castell', 'Y Castell',
    'Warm and editorial. Generous type, cream backgrounds and a calm layout. Suits businesses selling an experience rather than an emergency call-out.',
    'Hospitality, health & beauty, professional services',
    '{"accent":"#7C2D45","surface":"#FAF7F2","ink":"#2F2D2A","muted":"#F4EFE6","headingFont":"display","layout":"editorial","radius":"xl","heroStyle":"centered","navStyle":"solid"}'::jsonb,
    '["header","hero","trust","about","services","gallery","testimonials","faq","cta","contact","footer"]'::jsonb,
    '["header","hero","about","services","gallery","testimonials","faq","cta","contact","footer"]'::jsonb,
    4
  )
on conflict (slug) do nothing;

-- Seed the one setting the auth trigger reads. Add your own address here
-- (or via the admin dashboard) to have new signups become admins.
insert into public.settings (key, value, group_name, label, description)
values (
  'admin_email_allowlist', '[]'::jsonb, 'private', 'Admin email allowlist',
  'Email addresses that are granted the admin role automatically on signup.'
)
on conflict (key) do nothing;
