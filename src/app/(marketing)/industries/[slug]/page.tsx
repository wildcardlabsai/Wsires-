import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertCircle, ArrowRight, Check, FileText } from 'lucide-react';

import { PricingCards } from '@/components/marketing/pricing-cards';
import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import { SitePreview } from '@/components/marketing/site-preview';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { defaultIndustries } from '@/lib/content/defaults';
import { getIndustries, getIndustry, getPlans, getPortfolio } from '@/lib/content/settings';
import { absoluteUrl } from '@/lib/env';

export function generateStaticParams() {
  return defaultIndustries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustry(slug);
  if (!industry) return { title: 'Not found' };

  return {
    title: industry.seoTitle,
    description: industry.seoDescription,
    alternates: { canonical: `/industries/${industry.slug}` },
    openGraph: {
      title: industry.seoTitle,
      description: industry.seoDescription,
      url: absoluteUrl(`/industries/${industry.slug}`),
    },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [industry, plans, portfolio, allIndustries] = await Promise.all([
    getIndustry(slug),
    getPlans(),
    getPortfolio(),
    getIndustries(),
  ]);

  if (!industry) notFound();

  const example = industry.exampleSlug
    ? portfolio.find((p) => p.slug === industry.exampleSlug)
    : undefined;

  const related = allIndustries.filter((i) => i.slug !== industry.slug).slice(0, 5);

  /* FAQ structured data helps these pages earn rich results. */
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: industry.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="surface-cream border-b border-border">
        <div className="site-container grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-charcoal-500">
              <Link href="/industries" className="hover:text-charcoal-900 hover:underline">
                Industries
              </Link>
              <span className="mx-2" aria-hidden>
                /
              </span>
              <span className="text-charcoal-700">{industry.name}</span>
            </nav>

            <h1 className="text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] text-charcoal-900 sm:text-display-md">
              {industry.headline}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal-600">{industry.subheading}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get your website started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>

          {example && (
            <div>
              <SitePreview
                businessName={example.businessName}
                location={example.location}
                accent={example.accent}
                template={example.templateSlug}
              />
              <p className="mt-3 text-center text-xs text-charcoal-500">
                Example site · {example.businessName} is a demonstration business
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Intro + pain points */}
      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-[1.125rem] leading-relaxed text-charcoal-700">{industry.intro}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-7 shadow-subtle">
            <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-900">
              <AlertCircle className="h-4 w-4 text-cymru-600" aria-hidden />
              What we hear most often
            </h2>
            <ul className="mt-5 space-y-3">
              {industry.painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-charcoal-600">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-charcoal-300" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* What we build */}
      <Section tone="cream">
        <SectionHeading
          eyebrow="What we build"
          title={`What a ${industry.name.toLowerCase()} website needs`}
          description="These are the parts that make a difference to enquiries. They are included as standard."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industry.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 rounded-lg border border-border bg-white p-5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss-600" strokeWidth={2.5} aria-hidden />
              <span className="text-[0.9375rem] leading-relaxed text-charcoal-700">{feature}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Typical pages */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Typical structure"
            title="The pages we would start with"
            description="Your final site may differ — this is the shape that tends to work for your trade."
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {industry.typicalPages.map((page, index) => (
              <li key={page} className="flex items-center gap-3 rounded-lg border border-border bg-cream-100 px-4 py-3.5">
                <FileText className="h-4 w-4 shrink-0 text-charcoal-400" aria-hidden />
                <span className="text-[0.9375rem] font-medium text-charcoal-800">{page}</span>
                <span className="ml-auto text-xs text-charcoal-400">{index + 1}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* FAQs */}
      {industry.faqs.length > 0 && (
        <Section tone="cream">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="Questions" title={`${industry.name}: common questions`} align="center" />
            <Accordion type="single" collapsible className="mt-10">
              {industry.faqs.map((faq, i) => (
                <AccordionItem key={faq.question} value={`i-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      )}

      {/* Pricing */}
      <Section tone="white">
        <SectionHeading
          eyebrow="Pricing"
          title="Same clear pricing, whatever your trade"
          align="center"
        />
        <PricingCards plans={plans} className="mt-12" />
      </Section>

      {/* Related industries */}
      <Section tone="cream" className="py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-400">
          Other industries
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {related.map((other) => (
            <Link
              key={other.slug}
              href={`/industries/${other.slug}`}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm text-charcoal-700 transition-colors hover:border-charcoal-300 hover:text-charcoal-900"
            >
              {other.name}
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand
        heading={`Ready for a ${industry.name.toLowerCase()} website that brings in work?`}
        body="Choose a plan, tell us about your business, and we will have a preview with you within a week."
        primary="Get your website started"
        secondary="See how it works"
      />
    </>
  );
}
