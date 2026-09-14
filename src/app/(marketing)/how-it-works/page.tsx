import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, HelpCircle, Mail } from 'lucide-react';

import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import { Button } from '@/components/ui/button';
import { getSiteContent } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Five steps from enquiry to a live website: tell us about your business, we build it, you approve it, we launch it and we keep it running.',
  alternates: { canonical: '/how-it-works' },
};

const WHAT_WE_NEED = [
  { label: 'Your business name and contact details', required: true },
  { label: 'The services you offer', required: true },
  { label: 'The towns and areas you cover', required: true },
  { label: 'A short description of what you do', required: true },
  { label: 'Your logo, if you have one', required: false },
  { label: 'Photos of your work', required: false },
  { label: 'Reviews or testimonials from customers', required: false },
  { label: 'Accreditations such as Gas Safe or NICEIC', required: false },
];

const TIMELINE = [
  { day: 'Day 0', event: 'You choose a plan and pay the setup fee.' },
  { day: 'Day 0', event: 'You complete the onboarding form — about fifteen minutes.' },
  { day: 'Days 1–5', event: 'We write your content and build the site.' },
  { day: 'Day 5', event: 'We send you a private preview link.' },
  { day: 'Days 5–9', event: 'You review it and we make any changes you want.' },
  { day: 'Day 10', event: 'You approve it and we connect your domain.' },
  { day: 'Days 10–12', event: 'DNS propagates and your SSL certificate is issued.' },
  { day: 'Day 12', event: 'Your website is live and collecting enquiries.' },
];

export default async function HowItWorksPage() {
  const content = await getSiteContent();

  return (
    <>
      <Section tone="default" className="pb-10 pt-14 sm:pt-20">
        <SectionHeading
          eyebrow="How it works"
          title="From enquiry to live website in about two weeks"
          description="Here is exactly what happens, what we need from you and when. There are no surprises in this process — that is rather the point."
          align="center"
        />
      </Section>

      {/* The five steps */}
      <Section tone="default" className="pt-0">
        <ol className="space-y-4">
          {content.howItWorks.steps.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-5 rounded-xl border border-border bg-white p-6 shadow-subtle sm:grid-cols-[auto_1fr_auto] sm:items-start sm:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-900 text-lg font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-charcoal-900">{step.title}</h2>
                <p className="mt-2 max-w-2xl text-[1.0625rem] leading-relaxed text-charcoal-600">
                  {step.description}
                </p>
              </div>
              {step.detail && (
                <span className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full bg-cream-200 px-3.5 py-1.5 text-xs font-medium text-charcoal-600">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {step.detail}
                </span>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* What we need */}
      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="What we need from you"
              title="One form, about fifteen minutes"
              description="You can save it and come back to it. If you get stuck on any of it, leave it blank and we will ring you about that bit."
            />
            <Button asChild className="mt-8">
              <Link href="/signup">
                Start your website
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>

          <ul className="space-y-3">
            {WHAT_WE_NEED.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white px-4 py-3.5"
              >
                <span className="text-[0.9375rem] text-charcoal-700">{item.label}</span>
                <span
                  className={
                    item.required
                      ? 'shrink-0 rounded-full bg-cymru-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-cymru-700'
                      : 'shrink-0 rounded-full bg-charcoal-100 px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-charcoal-500'
                  }
                >
                  {item.required ? 'Needed' : 'Optional'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Timeline */}
      <Section tone="white">
        <SectionHeading
          eyebrow="Typical timeline"
          title="What happens, and when"
          description="This is a real schedule from a recent Starter build. Bigger sites take a few days longer; urgent jobs can be pushed through faster."
        />
        <div className="mt-12 max-w-3xl">
          <ol className="relative border-l border-border pl-8">
            {TIMELINE.map((item, index) => (
              <li key={index} className="relative pb-8 last:pb-0">
                <span
                  className="absolute -left-[2.3rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-cymru-500 shadow-subtle"
                  aria-hidden
                />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal-400">{item.day}</p>
                <p className="mt-1 text-[1.0625rem] text-charcoal-800">{item.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* After launch */}
      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeading
            eyebrow="After you’re live"
            title="What ongoing support actually means"
            description="This is the part that most people have been let down on before, so here is what we commit to."
          />
          <div className="space-y-5">
            {[
              {
                title: 'You email or ring us with changes',
                body: 'New phone number, a price change, a new service, different photos. We make the change — usually the same working day, always within two.',
              },
              {
                title: 'You can edit the everyday things yourself',
                body: 'Opening hours, contact details, services, photos and testimonials can be updated from your dashboard whenever you like. Bigger changes come to us.',
              },
              {
                title: 'We keep the technical side working',
                body: 'Hosting, SSL renewal, backups, security updates and uptime monitoring happen without you needing to know they exist.',
              },
              {
                title: 'Your enquiries land in one place',
                body: 'Every form submission is emailed to you and saved in your dashboard so you can track what you have followed up.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-white p-6">
                <h3 className="text-base font-semibold text-charcoal-900">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-charcoal-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Still unsure */}
      <Section tone="white">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-2xl border border-border bg-cream-100 px-8 py-12 text-center">
          <HelpCircle className="h-8 w-8 text-cymru-600" aria-hidden />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal-900">
            Still not sure it’s for you?
          </h2>
          <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-charcoal-600">
            Send us a message describing your business and what you are hoping for. We will tell you what we
            would build and roughly what it would cost — and if we think you would be better off elsewhere, we
            will say so.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/contact">
                <Mail className="h-4 w-4" aria-hidden />
                Ask us a question
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/faq">Read the FAQ</Link>
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
