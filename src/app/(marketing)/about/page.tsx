import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Heart, Mountain, Users } from 'lucide-react';

import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import { Button } from '@/components/ui/button';
import { getSiteContent } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'CymruSites builds, hosts and maintains websites for small businesses across Wales — particularly tradespeople and local service businesses.',
  alternates: { canonical: '/about' },
};

const PRINCIPLES = [
  {
    icon: Heart,
    title: 'Say what things cost',
    body: 'Our prices are on the website. There is no discovery call designed to work out what you can afford, and no quote that arrives three times higher than you expected.',
  },
  {
    icon: Users,
    title: 'Do the work ourselves',
    body: 'You are not handed a login and left to it. If you want your phone number changed, you tell us and we change it. That is what the monthly fee is for.',
  },
  {
    icon: Mountain,
    title: 'Build for Wales',
    body: 'We understand service areas that span three valleys, customers who search in Welsh, and businesses whose best marketing is still a van and a good reputation.',
  },
];

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <>
      <Section tone="default" className="pb-10 pt-14 sm:pt-20">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-cymru-600">About us</p>
          <h1 className="text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] text-charcoal-900 sm:text-display-md">
            A web company for the businesses web companies usually ignore
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-charcoal-600">
            CymruSites exists because there is a gap between a £40 template you have to build yourself and a
            £4,000 agency project with a three month timeline. Most Welsh small businesses need something in
            between: a proper website, built by someone who knows what they are doing, for a price that makes
            sense on a plumber’s margins.
          </p>
        </div>
      </Section>

      <Section tone="default" className="pt-0">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="prose-cymru space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal-900">Why we started</h2>
            <p>
              Ask around any trade in the valleys and you will hear the same three stories. Someone paid a lot
              of money for a website that never appeared. Someone had a site built by a relative who has since
              moved away and taken the passwords with them. Someone is still relying entirely on a Facebook
              page they do not control.
            </p>
            <p>
              None of those people were badly served because they made a foolish decision. They were badly
              served because the options available to them were poor. A good website is not complicated to
              build — but it does need building, hosting, securing and maintaining, and that is precisely the
              work most people do not want to think about.
            </p>
            <p>
              So we do that part. You tell us about your business once, we build the site, and then we look
              after it. When you want something changed, you email us and it changes.
            </p>
          </div>

          <div className="space-y-6">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="rounded-xl border border-border bg-white p-6 shadow-subtle">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-200 text-charcoal-700">
                  <principle.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-charcoal-900">{principle.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-charcoal-600">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* How we work */}
      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeading
            eyebrow="How we work"
            title="Commitments we’re happy to be held to"
            description="These are not marketing lines. If we fall short on any of them, tell us and we will put it right."
          />
          <ul className="space-y-4">
            {[
              'Your domain is registered in your name, not ours.',
              'Your content belongs to you and we will export it if you leave.',
              'Prices are published and we do not negotiate a different one for each customer.',
              'No contract longer than a month.',
              'Changes are included — we do not bill by the hour for a phone number.',
              'A real person replies to your email, and usually the same day.',
              'If we think you do not need what you are asking for, we will tell you.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-white px-5 py-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss-600" strokeWidth={2.5} aria-hidden />
                <span className="text-[0.9375rem] leading-relaxed text-charcoal-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Where we work */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <SectionHeading
            eyebrow="Where we work"
            title="Across Wales"
            description="Most of our work is in the south Wales valleys and along the M4 corridor, but we build for businesses right across the country."
          />
          <div>
            <div className="flex flex-wrap gap-2">
              {[
                'Cardiff',
                'Newport',
                'Swansea',
                'Pontypridd',
                'Caerphilly',
                'Bridgend',
                'Merthyr Tydfil',
                'Aberdare',
                'Barry',
                'Neath',
                'Port Talbot',
                'Llanelli',
                'Wrexham',
                'Bangor',
                'Aberystwyth',
                'Carmarthen',
              ].map((place) => (
                <span
                  key={place}
                  className="rounded-full border border-border bg-cream-100 px-3.5 py-1.5 text-sm text-charcoal-700"
                >
                  {place}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-charcoal-500">
              Everything is done remotely by default, which keeps the price where it is. If you would rather sit
              down with someone in person and you are within reach of Cardiff, we can usually arrange that.
            </p>
          </div>
        </div>
      </Section>

      {/* Contact strip */}
      <Section tone="cream" className="py-14">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal-900">
            Want to talk to a person about it?
          </h2>
          <p className="max-w-xl text-[1.0625rem] leading-relaxed text-charcoal-600">
            Email {content.brand.email} or ring {content.brand.phone}. We are a small team and you will speak
            to someone who actually builds the sites.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Get in touch</Link>
          </Button>
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
