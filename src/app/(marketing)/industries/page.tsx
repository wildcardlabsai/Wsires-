import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import { getIndustries } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'Industries we build for',
  description:
    'Websites for Welsh plumbers, electricians, builders, roofers, landscapers, garages, hospitality and professional services.',
  alternates: { canonical: '/industries' },
};

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <>
      <Section tone="default" className="pb-10 pt-14 sm:pt-20">
        <SectionHeading
          eyebrow="Industries"
          title="We start from what works for your trade"
          description="A roofer and an accountant need very different websites. These pages set out what we build for each, and why."
        />
      </Section>

      <Section tone="default" className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-white p-7 shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <h2 className="text-lg font-semibold tracking-tight text-charcoal-900">{industry.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal-600">{industry.subheading}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-cymru-700">
                What we build
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand
        heading="Not on the list?"
        body="We build for plenty of businesses that do not fit a neat category. Tell us what you do and we will tell you what we would build."
        primary="Get your website started"
        secondary="See how it works"
      />
    </>
  );
}
