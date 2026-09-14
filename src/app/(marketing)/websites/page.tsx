import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Camera,
  FileText,
  Globe,
  Inbox,
  Languages,
  LayoutTemplate,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Smartphone,
  Zap,
} from 'lucide-react';

import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import { SitePreview } from '@/components/marketing/site-preview';
import { Button } from '@/components/ui/button';
import { getPortfolio } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'What you get',
  description:
    'What a CymruSites website includes: mobile-first design, click-to-call, WhatsApp, local SEO, enquiry capture, hosting, SSL and ongoing support.',
  alternates: { canonical: '/websites' },
};

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Built for a phone first',
    body: 'Most of your customers will find you on a mobile. Every layout is designed at phone width first and then opened out, not squeezed down from a desktop design.',
  },
  {
    icon: Phone,
    title: 'One tap to ring you',
    body: 'A permanent call button that dials your number. For urgent trades we can put an emergency bar across the top of every page.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp enquiries',
    body: 'A WhatsApp button that opens a message to your business with the first line already written. Many customers prefer it to a form.',
  },
  {
    icon: Inbox,
    title: 'Enquiries you don’t lose',
    body: 'Every form submission is emailed to you immediately and saved in your dashboard, so nothing disappears into a spam folder.',
  },
  {
    icon: Search,
    title: 'Local search done properly',
    body: 'Page titles, descriptions, LocalBusiness structured data and a page for each area you cover — the foundations that let you be found nearby.',
  },
  {
    icon: MapPin,
    title: 'Areas you actually cover',
    body: 'A page for each town or region so someone searching for "electrician in Caerphilly" has something of yours to find.',
  },
  {
    icon: Camera,
    title: 'Your work, shown well',
    body: 'Galleries that load fast and look sharp. Send us photos from your phone and we will crop, compress and place them.',
  },
  {
    icon: Languages,
    title: 'English, Welsh or both',
    body: 'Genuine bilingual sites with separate content for each language, a language switch and the right metadata — not machine translation.',
  },
  {
    icon: Lock,
    title: 'Secure and backed up',
    body: 'SSL certificate, daily backups, security patching and uptime monitoring. All included, none of it your problem.',
  },
  {
    icon: Zap,
    title: 'Fast',
    body: 'Pages are served from a global edge network and images are optimised automatically. A slow site loses customers and ranks worse.',
  },
  {
    icon: BarChart3,
    title: 'Simple analytics',
    body: 'Visitors, pages and enquiries in plain numbers. Enough to see what is working, without a dashboard you need training for.',
  },
  {
    icon: Globe,
    title: 'Your own domain',
    body: 'We connect the domain you have or help you register one. It stays registered in your name.',
  },
];

const PAGE_TYPES = [
  { name: 'Home', detail: 'Who you are, what you do, where you work and how to reach you.' },
  { name: 'Services', detail: 'A page or section for each thing you do, written for how people search.' },
  { name: 'Areas we cover', detail: 'A page per town so local searches have something to find.' },
  { name: 'Gallery', detail: 'Your work, cropped and laid out properly.' },
  { name: 'About', detail: 'The people behind the business — often the most-read page on a trade site.' },
  { name: 'Reviews', detail: 'Testimonials and your Google rating, pulled together in one place.' },
  { name: 'FAQ', detail: 'The questions you answer on the phone twenty times a week.' },
  { name: 'Contact', detail: 'Form, phone, WhatsApp, map and opening hours.' },
];

export default async function WebsitesPage() {
  const portfolio = await getPortfolio();

  return (
    <>
      <Section tone="default" className="pb-12 pt-14 sm:pt-20">
        <SectionHeading
          eyebrow="What you get"
          title="A website that does the job, not one that wins awards"
          description="Everything below is included as standard. We have built these sites for enough Welsh businesses to know which parts actually bring in work."
          align="center"
        />
      </Section>

      <Section tone="default" className="pt-0">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-white p-6 shadow-subtle">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-200 text-charcoal-700">
                <feature.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-charcoal-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Templates */}
      <Section tone="cream">
        <SectionHeading
          eyebrow="Website styles"
          title="Four starting points, then built around you"
          description="We start from the layout that suits your trade and then shape it to your business — your colours, your photographs, your words. Two CymruSites websites should not look like each other."
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {[
            {
              name: 'Y Glannau',
              for: 'Builders, roofers, landscapers',
              body: 'A full-bleed photograph with your headline over it. The strongest choice when you have good pictures of your work.',
              accent: '#C8102E',
              template: 'y-glannau',
              business: 'Taff Roofing',
              location: 'Merthyr Tydfil',
            },
            {
              name: 'Y Cwm',
              for: 'Plumbers, electricians, professional services',
              body: 'A split hero with your details on one side and an image on the other, then clear service cards. Works with only a handful of photos.',
              accent: '#2F5444',
              template: 'y-cwm',
              business: 'Rhys Electrical',
              location: 'Cardiff',
            },
            {
              name: 'Y Bont',
              for: 'Emergency call-outs, garages, 24hr services',
              body: 'Phone number front and centre with a permanent call-out bar. Built for trades where people ring first and read later.',
              accent: '#B45309',
              template: 'y-bont',
              business: 'Cwm Valley Plumbing',
              location: 'Pontypridd',
            },
            {
              name: 'Y Castell',
              for: 'Hospitality, health & beauty, professional',
              body: 'Warm, editorial and calm. Generous type on a cream background — for businesses selling an experience rather than an emergency.',
              accent: '#7C2D45',
              template: 'y-castell',
              business: 'Caffi Bryn',
              location: 'Swansea',
            },
          ].map((template) => (
            <article key={template.name} className="rounded-xl border border-border bg-white p-6 shadow-subtle">
              <SitePreview
                businessName={template.business}
                location={template.location}
                accent={template.accent}
                template={template.template}
                compact
              />
              <div className="mt-5 flex items-start gap-3">
                <LayoutTemplate className="mt-1 h-4 w-4 shrink-0 text-charcoal-400" aria-hidden />
                <div>
                  <h3 className="text-base font-semibold text-charcoal-900">{template.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-wide text-cymru-600">{template.for}</p>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{template.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Pages */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeading
            eyebrow="Pages"
            title="The pages that earn their place"
            description="You do not need twenty pages. You need the right six or seven, each written for something a customer actually types into Google."
          />
          <dl className="divide-y divide-border">
            {PAGE_TYPES.map((page) => (
              <div key={page.name} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8">
                <dt className="flex items-center gap-2 text-[0.9375rem] font-semibold text-charcoal-900 sm:w-44 sm:shrink-0">
                  <FileText className="h-4 w-4 text-charcoal-300" aria-hidden />
                  {page.name}
                </dt>
                <dd className="text-[0.9375rem] leading-relaxed text-charcoal-600">{page.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Examples strip */}
      <Section tone="cream">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="See it in practice" title="Working demonstration sites" />
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/examples">
              All examples
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.slice(0, 3).map((example) => (
            <Link key={example.slug} href={example.demoHref} className="group">
              <SitePreview
                businessName={example.businessName}
                location={example.location}
                accent={example.accent}
                template={example.templateSlug}
                compact
                className="transition-shadow group-hover:shadow-lift"
              />
              <p className="mt-3 text-sm font-medium text-charcoal-900">{example.businessName}</p>
              <p className="text-xs text-charcoal-500">{example.industry}</p>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand
        heading="Let’s get yours built"
        body="Choose a plan, tell us about your business and we will have a preview with you within a week."
        primary="Get your website started"
        secondary="See how it works"
      />
    </>
  );
}
