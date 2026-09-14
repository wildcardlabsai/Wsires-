import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { getSiteContent } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description:
    'Answers about CymruSites websites: timescales, pricing, ownership, domains, Welsh language sites, changes and support.',
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const content = await getSiteContent();

  /* Group by category, preserving the order they appear in. */
  const categories: { name: string; faqs: typeof content.faqs }[] = [];
  for (const faq of content.faqs) {
    const name = faq.category ?? 'General';
    let bucket = categories.find((c) => c.name === name);
    if (!bucket) {
      bucket = { name, faqs: [] };
      categories.push(bucket);
    }
    bucket.faqs.push(faq);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section tone="default" className="pb-10 pt-14 sm:pt-20">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered properly"
          description="If what you need isn’t here, send us a message — we answer every one ourselves."
          align="center"
        />
      </Section>

      <Section tone="default" className="pt-0">
        <div className="mx-auto max-w-3xl space-y-14">
          {categories.map((category) => (
            <div key={category.name}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-cymru-600">
                {category.name}
              </h2>
              <Accordion type="single" collapsible className="mt-4">
                {category.faqs.map((faq, i) => (
                  <AccordionItem key={faq.question} value={`${category.name}-${i}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="rounded-xl border border-border bg-cream-100 p-7 text-center">
            <h2 className="text-lg font-semibold text-charcoal-900">Still got a question?</h2>
            <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-charcoal-600">
              Ask us anything, including the awkward ones about ownership and contracts. We would rather answer
              now than have you wondering.
            </p>
            <Button asChild className="mt-5">
              <Link href="/contact">Ask us a question</Link>
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
