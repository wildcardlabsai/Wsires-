'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';

import { telHref, whatsappHref } from '@/lib/utils';
import type { BusinessRow } from '@/types/database';
import type { ResolvedTheme } from '../theme';
import { radiusClass } from '../theme';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ContactSection({
  websiteId,
  business,
  theme,
  id = 'contact',
}: {
  websiteId: string;
  business: BusinessRow | null;
  theme: ResolvedTheme;
  id?: string;
}) {
  const pathname = usePathname();
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const headingClass = theme.headingFont === 'display' ? 'font-display' : 'font-sans';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    const data = new FormData(event.currentTarget);
    const payload = {
      websiteId,
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      message: String(data.get('message') ?? ''),
      pageUrl: typeof window !== 'undefined' ? window.location.href : pathname,
      company_website: String(data.get('company_website') ?? ''),
    };

    try {
      const response = await fetch('/api/site/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = await response.json();
        setErrorMessage(result.error ?? 'Could not send your message.');
        setStatus('error');
        return;
      }
      setStatus('success');
      event.currentTarget.reset();
    } catch {
      setErrorMessage('Could not reach the server. Please try again, or call us directly.');
      setStatus('error');
    }
  }

  const whatsapp = whatsappHref(business?.whatsapp_number || business?.phone);
  const hours = (business?.opening_hours ?? []).slice().sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  return (
    <section id={id} className="py-16 sm:py-24" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className={`text-3xl font-semibold ${headingClass}`} style={{ color: theme.ink }}>
          Get in touch
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {business?.phone && (
              <a href={telHref(business.phone) ?? '#'} className={`flex items-center gap-3 border p-4 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
                <Phone className="h-4 w-4" style={{ color: theme.accent }} />
                <span style={{ color: theme.ink }}>{business.phone}</span>
              </a>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer" className={`flex items-center gap-3 border p-4 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
                <MessageCircle className="h-4 w-4" style={{ color: theme.accent }} />
                <span style={{ color: theme.ink }}>WhatsApp us</span>
              </a>
            )}
            {business?.email && (
              <a href={`mailto:${business.email}`} className={`flex items-center gap-3 border p-4 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
                <Mail className="h-4 w-4" style={{ color: theme.accent }} />
                <span style={{ color: theme.ink }}>{business.email}</span>
              </a>
            )}
            {(business?.address_line1 || business?.city) && (
              <div className={`flex items-start gap-3 border p-4 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.accent }} />
                <span style={{ color: theme.ink }}>
                  {[business?.address_line1, business?.address_line2, business?.city, business?.postcode].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {hours.length > 0 && (
              <div className={`border p-4 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: theme.ink }}>
                  <Clock className="h-4 w-4" style={{ color: theme.accent }} /> Opening hours
                </p>
                <ul className="space-y-1 text-sm" style={{ color: `${theme.ink}99` }}>
                  {hours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4">
                      <span>{h.day}</span>
                      <span>{h.closed ? 'Closed' : `${h.opens} – ${h.closes}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={`border p-6 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14`, backgroundColor: theme.muted }}>
            {status === 'success' ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="h-10 w-10" style={{ color: theme.accent }} />
                <p className="mt-4 font-semibold" style={{ color: theme.ink }}>
                  Message sent
                </p>
                <p className="mt-2 text-sm" style={{ color: `${theme.ink}99` }}>
                  Thank you — we’ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: theme.ink }}>
                    Name
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full border bg-white px-3.5 py-2.5 text-sm"
                    style={{ borderColor: `${theme.ink}22`, borderRadius: 6 }}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: theme.ink }}>
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      className="w-full border bg-white px-3.5 py-2.5 text-sm"
                      style={{ borderColor: `${theme.ink}22`, borderRadius: 6 }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: theme.ink }}>
                      Phone
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      className="w-full border bg-white px-3.5 py-2.5 text-sm"
                      style={{ borderColor: `${theme.ink}22`, borderRadius: 6 }}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: theme.ink }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full border bg-white px-3.5 py-2.5 text-sm"
                    style={{ borderColor: `${theme.ink}22`, borderRadius: 6 }}
                  />
                </div>
                <div className="hidden" aria-hidden>
                  <input name="company_website" tabIndex={-1} autoComplete="off" />
                </div>
                {errorMessage && <p className="text-sm font-medium text-red-600">{errorMessage}</p>}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 ${radiusClass(theme.radius)}`}
                  style={{ backgroundColor: theme.accent }}
                >
                  <Send className="h-4 w-4" />
                  {status === 'submitting' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
