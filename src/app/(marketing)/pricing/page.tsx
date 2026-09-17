import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';

import { PricingCards } from '@/components/marketing/pricing-cards';
import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPlans, getSiteContent } from '@/lib/content/settings';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Clear website pricing for Welsh businesses. One setup fee, then a fixed monthly price that includes hosting, SSL, support and updates. From £299 setup and £29 a month.',
  alternates: { canonical: '/pricing' },
};

/* The comparison grid is derived from plan features so it stays in step
   with whatever pricing the admin has configured. */
const COMPARISON_ROWS = [
  { label: 'Pages included', kind: 'pages' as const },
  { label: 'Mobile responsive', matches: ['Mobile responsive website'], allFrom: 0 },
  { label: 'Contact form', matches: ['Contact form'], allFrom: 0 },
  { label: 'WhatsApp button', matches: ['WhatsApp button'], allFrom: 0 },
  { label: 'Google Maps', matches: ['Google Maps'], allFrom: 0 },
  { label: 'SSL & hosting', matches: ['SSL certificate', 'Hosting included'], allFrom: 0 },
  { label: 'Basic SEO', matches: ['Basic SEO'], allFrom: 0 },
  { label: 'Analytics', matches: ['Basic analytics'], allFrom: 0 },
  { label: 'Local SEO setup', matches: ['Local SEO setup'], allFrom: 1 },
  { label: 'Google Business Profile', matches: ['Google Business Profile integration'], allFrom: 1 },
  { label: 'Reviews section', matches: ['Reviews section'], allFrom: 1 },
  { label: 'Image gallery', matches: ['Image gallery'], allFrom: 1 },
  { label: 'Multiple service areas', matches: ['Multiple service areas'], allFrom: 1 },
  { label: 'Welsh / bilingual option', matches: ['Welsh / bilingual option'], allFrom: 1 },
  { label: 'Advanced local SEO', matches: ['Advanced local SEO'], allFrom: 2 },
  { label: 'Blog / news section', matches: ['Blog / news section'], allFrom: 2 },
  { label: 'Booking functionality', matches: ['Booking functionality'], allFrom: 2 },
  { label: 'Advanced lead forms', matches: ['Advanced lead forms'], allFrom: 2 },
  { label: 'Priority support', matches: ['Priority support'], allFrom: 2 },
];

export default async function PricingPage() {
  const [plans, content] = await Promise.all([getPlans(), getSiteContent()]);
  const pricingFaqs = content.faqs.filter((f) => f.category === 'Pricing');

  return (
    <>
      <Section tone="default" className="pb-10 pt-14 sm:pt-20">
        <SectionHeading
          eyebrow="Pricing"
          title="Honest pricing, written down"
          description="A one-off setup fee covers design, content and build. The monthly fee covers hosting, SSL, backups, support and your changes. That is the whole thing."
          align="center"
        />
      </Section>

      <Section tone="default" className="py-0">
        <PricingCards plans={plans} />
        <div className="mt-10 rounded-xl border border-border bg-white p-6 text-center shadow-subtle">
          <p className="text-sm text-charcoal-600">
            Every plan is month-to-month. Cancel whenever you like by emailing or calling us — your site stays
            up until the end of the period you have paid for.
          </p>
        </div>
      </Section>

      {/* Comparison table */}
      <Section tone="cream">
        <SectionHeading
          eyebrow="Compare"
          title="What you get on each plan"
          align="center"
        />
        <div className="mt-12 overflow-hidden rounded-xl border border-border bg-white shadow-subtle">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[200px]">Feature</TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.id} className="text-center">
                    <span className="block text-sm font-semibold normal-case tracking-normal text-charcoal-900">
                      {plan.name}
                    </span>
                    <span className="block text-[0.6875rem] font-normal normal-case tracking-normal text-charcoal-500">
                      {formatPrice(plan.monthlyPricePence)}/mo
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_ROWS.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium text-charcoal-800">{row.label}</TableCell>
                  {plans.map((plan, planIndex) => (
                    <TableCell key={plan.id} className="text-center">
                      {'kind' in row && row.kind === 'pages' ? (
                        <span className="text-sm font-medium text-charcoal-800">{plan.maxPages}</span>
                      ) : planIndex >= (row.allFrom ?? 0) ? (
                        <Check className="mx-auto h-4 w-4 text-moss-600" strokeWidth={2.5} aria-label="Included" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-charcoal-200" aria-label="Not included" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* What's not charged extra */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="No hidden costs"
              title="Things other people charge extra for"
              description="These are all included in your monthly fee. We have listed them because we know you have been stung before."
            />
          </div>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              'SSL certificate',
              'Hosting',
              'Daily backups',
              'Security updates',
              'Uptime monitoring',
              'Contact form',
              'Phone number changes',
              'Opening hours changes',
              'Photo swaps',
              'Text corrections',
              'Support by email',
              'Domain connection',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[0.9375rem] text-charcoal-700">
                <Check className="h-4 w-4 shrink-0 text-moss-600" strokeWidth={2.5} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Pricing FAQs */}
      <Section tone="cream">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Pricing questions" title="Before you decide" align="center" />
          <Accordion type="single" collapsible className="mt-10">
            {pricingFaqs.map((faq, i) => (
              <AccordionItem key={faq.question} value={`p-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/faq">
                All frequently asked questions
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      <CtaBand
        heading="Pick a plan and we’ll take it from there"
        body="You can change plan later, and you are not tied in. If you would rather talk it through first, we are happy to do that."
        primary="Get your website started"
        secondary="See how it works"
      />
    </>
  );
}
