import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { ContactForm } from '@/components/marketing/contact-form';
import { Section } from '@/components/marketing/sections';
import { getSiteContent } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'Contact us',
  description:
    'Talk to CymruSites about a website for your Welsh business. Tell us what you do and we’ll tell you honestly what we’d build and what it would cost.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const content = await getSiteContent();

  return (
    <Section tone="default" className="pt-14 sm:pt-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-cymru-600">Contact</p>
          <h1 className="text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] text-charcoal-900 sm:text-display-md">
            Tell us about your business
          </h1>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-charcoal-600">
            Fill in as much as you like and we will come back to you within one working day with what we would
            build and what it would cost. If we are not the right fit, we will say so.
          </p>

          <dl className="mt-10 space-y-6">
            <div className="flex gap-4">
              <dt className="shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-200 text-charcoal-700">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <span className="sr-only">Email</span>
              </dt>
              <dd>
                <a
                  href={`mailto:${content.brand.email}`}
                  className="text-[0.9375rem] font-medium text-charcoal-900 hover:underline"
                >
                  {content.brand.email}
                </a>
                <p className="mt-0.5 text-sm text-charcoal-500">We reply within one working day.</p>
              </dd>
            </div>

            <div className="flex gap-4">
              <dt className="shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-200 text-charcoal-700">
                  <Phone className="h-4 w-4" aria-hidden />
                </span>
                <span className="sr-only">Phone</span>
              </dt>
              <dd>
                <a
                  href={`tel:${content.brand.phone.replace(/\s/g, '')}`}
                  className="text-[0.9375rem] font-medium text-charcoal-900 hover:underline"
                >
                  {content.brand.phone}
                </a>
                <p className="mt-0.5 text-sm text-charcoal-500">
                  If we are on another call, leave a message and we will ring back.
                </p>
              </dd>
            </div>

            <div className="flex gap-4">
              <dt className="shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-200 text-charcoal-700">
                  <Clock className="h-4 w-4" aria-hidden />
                </span>
                <span className="sr-only">Hours</span>
              </dt>
              <dd>
                <p className="text-[0.9375rem] font-medium text-charcoal-900">Monday to Friday, 8am–6pm</p>
                <p className="mt-0.5 text-sm text-charcoal-500">
                  Existing customers with a site down can reach us any time.
                </p>
              </dd>
            </div>

            <div className="flex gap-4">
              <dt className="shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-200 text-charcoal-700">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <span className="sr-only">Where we are</span>
              </dt>
              <dd>
                <p className="text-[0.9375rem] font-medium text-charcoal-900">
                  {content.brand.addressLines.join(', ')}
                </p>
                <p className="mt-0.5 text-sm text-charcoal-500">
                  We work with businesses across Wales, remotely and in person.
                </p>
              </dd>
            </div>
          </dl>

          <div className="mt-10 rounded-xl border border-border bg-white p-6">
            <p className="text-sm font-medium text-charcoal-900">Already a customer?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal-600">
              Raise a support ticket from your dashboard — it reaches the right person faster than this form.
            </p>
            <Link
              href="/dashboard/support"
              className="mt-3 inline-block text-sm font-medium text-cymru-700 hover:underline"
            >
              Go to support
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-subtle sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
