import Link from 'next/link';
import {
  ArrowRight,
  Hammer,
  Languages,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Smartphone,
  Star,
  Wallet,
} from 'lucide-react';

import { PricingCards } from '@/components/marketing/pricing-cards';
import {
  CheckList,
  CtaBand,
  DemoBadge,
  Section,
  SectionHeading,
} from '@/components/marketing/sections';
import { SitePreview } from '@/components/marketing/site-preview';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { getPlans, getPortfolio, getSiteContent } from '@/lib/content/settings';

const ICONS: Record<string, typeof Wallet> = {
  wallet: Wallet,
  hammer: Hammer,
  'map-pin': MapPin,
  smartphone: Smartphone,
  languages: Languages,
  'shield-check': ShieldCheck,
};

const INDUSTRY_TILES = [
  { label: 'Plumbers', href: '/industries/plumbers' },
  { label: 'Electricians', href: '/industries/electricians' },
  { label: 'Builders', href: '/industries/builders' },
  { label: 'Roofers', href: '/industries/roofers' },
  { label: 'Landscapers', href: '/industries/landscapers' },
  { label: 'Automotive', href: '/industries/automotive' },
  { label: 'Hospitality', href: '/industries/hospitality' },
  { label: 'Professional services', href: '/industries/professional-services' },
];

export default async function HomePage() {
  const [content, plans, portfolio] = await Promise.all([
    getSiteContent(),
    getPlans(),
    getPortfolio(),
  ]);

  const featured = portfolio.slice(0, 3);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="surface-cream relative overflow-hidden border-b border-border">
        <div className="site-container relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:py-28">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-charcoal-600 shadow-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-cymru-500" aria-hidden />
              {content.hero.eyebrow}
            </p>

            <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-charcoal-900 sm:text-display-lg lg:text-[4rem]">
              {content.hero.heading}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal-600">
              {content.hero.subheading}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href={content.hero.primaryCta.href}>
                  {content.hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href={content.hero.secondaryCta.href}>{content.hero.secondaryCta.label}</Link>
              </Button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {content.hero.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2 text-sm text-charcoal-600">
                  <span className="h-1 w-1 rounded-full bg-cymru-500" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Example sites, stacked */}
          <div className="relative animate-fade-in lg:h-[460px]">
            <div className="relative mx-auto max-w-[420px] lg:max-w-none">
              <div className="lg:absolute lg:right-0 lg:top-4 lg:w-[330px]">
                <SitePreview
                  businessName="Cwm Valley Plumbing"
                  location="Pontypridd"
                  accent="#B45309"
                  template="y-bont"
                  domain="cwmvalleyplumbing.co.uk"
                  compact
                />
              </div>
              <div className="mt-5 lg:absolute lg:-left-4 lg:top-32 lg:mt-0 lg:w-[320px]">
                <SitePreview
                  businessName="Rhys Electrical"
                  location="Cardiff"
                  accent="#2F5444"
                  template="y-cwm"
                  domain="rhyselectrical.co.uk"
                  compact
                />
              </div>
              <div className="mt-5 hidden lg:absolute lg:right-10 lg:top-[250px] lg:mt-0 lg:block lg:w-[300px]">
                <SitePreview
                  businessName="Taff Roofing"
                  location="Merthyr Tydfil"
                  accent="#C8102E"
                  template="y-glannau"
                  domain="taffroofing.co.uk"
                  compact
                />
              </div>
            </div>
            <div className="mt-4 flex justify-center lg:absolute lg:bottom-0 lg:left-0 lg:mt-0">
              <DemoBadge />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Trusted by                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-border bg-white py-10">
        <div className="site-container">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-400">
            {content.trustStrip.heading}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {content.trustStrip.items.map((item) => (
              <span key={item} className="text-[0.9375rem] font-medium text-charcoal-500">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            {content.trustStrip.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold tracking-tight text-charcoal-900">{stat.value}</p>
                <p className="mt-1 text-sm text-charcoal-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The promise                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="default">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="The straightforward version"
            title={content.promise.heading}
            description={content.promise.body}
          />
          <div className="space-y-5">
            {content.promise.points.map((point, index) => (
              <div key={point} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-charcoal-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-[1.0625rem] leading-relaxed text-charcoal-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                     */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="cream" id="how-it-works">
        <SectionHeading
          eyebrow="How it works"
          title={content.howItWorks.heading}
          description={content.howItWorks.subheading}
          align="center"
        />
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {content.howItWorks.steps.map((step, index) => (
            <li key={step.title} className="relative flex flex-col rounded-xl border border-border bg-white p-6 shadow-subtle">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cymru-50 text-sm font-semibold text-cymru-700">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold leading-snug text-charcoal-900">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal-600">{step.description}</p>
              {step.detail && (
                <p className="mt-4 border-t border-border pt-3 text-xs font-medium text-charcoal-400">
                  {step.detail}
                </p>
              )}
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/how-it-works">
              See the whole process
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Website examples                                                 */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Website examples"
            title="Sites we’ve built for businesses like yours"
            description="Every one of these is a working demonstration site built on the same platform your website would use. They are examples, not customers."
          />
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/examples">
              See all examples
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {featured.map((example) => (
            <article key={example.slug} className="group flex flex-col">
              <SitePreview
                businessName={example.businessName}
                location={example.location}
                accent={example.accent}
                template={example.templateSlug}
                className="transition-shadow group-hover:shadow-lift"
              />
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-charcoal-900">{example.businessName}</h3>
                  <p className="mt-0.5 text-sm text-charcoal-500">
                    {example.industry} · {example.location}
                  </p>
                </div>
                <DemoBadge className="shrink-0" />
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal-600">{example.description}</p>
              <Link
                href={example.demoHref}
                className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-cymru-700 hover:underline"
              >
                View demo
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Industries                                                       */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="cream">
        <SectionHeading
          eyebrow="Industries"
          title="Built around how your customers actually search"
          description="A plumber and a café need very different websites. We start from what works for your trade rather than dropping you into a generic template."
          align="center"
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRY_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-charcoal-300 hover:shadow-card"
            >
              <span className="text-[0.9375rem] font-medium text-charcoal-800">{tile.label}</span>
              <ArrowRight
                className="h-4 w-4 text-charcoal-300 transition-all group-hover:translate-x-0.5 group-hover:text-cymru-600"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Why CymruSites                                                   */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="white">
        <SectionHeading
          eyebrow="Why CymruSites"
          title={content.whyUs.heading}
          description={content.whyUs.subheading}
        />
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {content.whyUs.items.map((item) => {
            const Icon = ICONS[item.icon] ?? ShieldCheck;
            return (
              <div key={item.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-200 text-charcoal-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-semibold text-charcoal-900">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-charcoal-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Pricing                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="cream" id="pricing">
        <SectionHeading
          eyebrow="Pricing"
          title="One setup fee, then a clear monthly price"
          description="No hourly rates and no surprise invoices. Every plan includes hosting, SSL, backups, support and the changes you ask for."
          align="center"
        />
        <PricingCards plans={plans} className="mt-14" />
        <p className="mt-10 text-center text-sm text-charcoal-500">
          Not sure which fits?{' '}
          <Link href="/contact" className="font-medium text-cymru-700 hover:underline">
            Tell us about your business
          </Link>{' '}
          and we’ll tell you honestly.
        </p>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* What's included                                                  */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow="What’s included"
            title={content.included.heading}
            description={content.included.subheading}
          />
          <CheckList items={content.included.items} columns={2} />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Welsh + Local SEO                                                */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="charcoal">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cream-100">
              <Languages className="h-3.5 w-3.5" aria-hidden />
              Cymraeg
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">{content.welsh.heading}</h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-charcoal-300">{content.welsh.body}</p>
            <CheckList items={content.welsh.points} invert className="mt-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cream-100">
              <Search className="h-3.5 w-3.5" aria-hidden />
              Local SEO
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">{content.localSeo.heading}</h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-charcoal-300">{content.localSeo.body}</p>
            <CheckList items={content.localSeo.points} invert className="mt-7" />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Testimonials                                                     */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="default">
        <SectionHeading
          eyebrow="What customers say"
          title="Straight from Welsh business owners"
          align="center"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {content.testimonials.map((testimonial) => (
            <figure
              key={testimonial.author}
              className="flex flex-col rounded-xl border border-border bg-white p-7 shadow-subtle"
            >
              {testimonial.rating && (
                <div className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5`}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-cymru-500 text-cymru-500" aria-hidden />
                  ))}
                </div>
              )}
              <blockquote className="mt-4 flex-1 text-[1.0625rem] leading-relaxed text-charcoal-700">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4 text-sm">
                <span className="font-semibold text-charcoal-900">{testimonial.author}</span>
                <span className="text-charcoal-500">
                  {' '}
                  · {testimonial.role}, {testimonial.location}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                              */}
      {/* ---------------------------------------------------------------- */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Questions" title="The things people ask us first" />
            <div className="mt-8 rounded-xl border border-border bg-cream-100 p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-charcoal-900">
                <PhoneCall className="h-4 w-4 text-cymru-600" aria-hidden />
                Would rather just talk to someone?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-600">
                That is usually quicker. Send us a message and we will ring you back at a time that suits.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/contact">Arrange a call</Link>
              </Button>
            </div>
          </div>

          <div>
            <Accordion type="single" collapsible className="w-full">
              {content.faqs.slice(0, 8).map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button asChild variant="link" className="mt-4 px-0">
              <Link href="/faq">
                Read all questions
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      <CtaBand
        heading={content.finalCta.heading}
        body={content.finalCta.body}
        primary={content.finalCta.primary}
        secondary={content.finalCta.secondary}
      />
    </>
  );
}
