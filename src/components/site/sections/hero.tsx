import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';

import { telHref, whatsappHref } from '@/lib/utils';
import type { BusinessRow } from '@/types/database';
import type { ResolvedTheme } from '../theme';
import { radiusClass } from '../theme';

interface HeroData {
  heading?: string;
  subheading?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
}

const STOCK_IMAGE: Record<string, string> = {
  plumbing: 'https://images.unsplash.com/photo-1607472829224-3d0c1b220b56?auto=format&fit=crop&w=1600&q=70',
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=70',
  building: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=70',
  roofing: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=70',
  landscaping: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=70',
  automotive: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=70',
  hospitality: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=70',
  default: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=70',
};

export function HeroSection({
  data,
  business,
  theme,
}: {
  data: HeroData;
  business: BusinessRow | null;
  theme: ResolvedTheme;
}) {
  const heading = data.heading || business?.name || 'Welcome';
  const subheading = data.subheading || business?.tagline || business?.description || '';
  const phone = business?.phone;
  const whatsapp = whatsappHref(business?.whatsapp_number || phone, `Hello, I'd like to get in touch about ${business?.name ?? ''}`);
  const image = STOCK_IMAGE[business?.industry ?? 'default'] ?? STOCK_IMAGE.default;
  const headingClass = theme.headingFont === 'display' ? 'font-display' : 'font-sans';

  const ctas = (
    <div className="mt-8 flex flex-wrap gap-3">
      {phone && (
        <a
          href={telHref(phone) ?? '#'}
          className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white ${radiusClass(theme.radius)}`}
          style={{ backgroundColor: theme.accent }}
        >
          <Phone className="h-4 w-4" /> {data.primaryCtaLabel || 'Call now'}
        </a>
      )}
      <Link
        href="/contact"
        className={`inline-flex items-center gap-2 border px-6 py-3 text-sm font-semibold ${radiusClass(theme.radius)}`}
        style={{ borderColor: theme.ink, color: theme.ink }}
      >
        {data.secondaryCtaLabel || 'Get in touch'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );

  if (theme.heroStyle === 'image-overlay') {
    return (
      <section className="relative flex min-h-[560px] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-40 sm:px-8">
          <h1 className={`max-w-2xl text-4xl font-bold leading-[1.05] text-white sm:text-5xl ${headingClass}`}>{heading}</h1>
          {subheading && <p className="mt-5 max-w-xl text-lg text-white/85">{subheading}</p>}
          {ctas}
        </div>
      </section>
    );
  }

  if (theme.heroStyle === 'callout') {
    return (
      <section style={{ backgroundColor: theme.muted }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span
                className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ${radiusClass(theme.radius)}`}
                style={{ backgroundColor: theme.accent }}
              >
                {whatsapp ? 'Call or WhatsApp us today' : 'Call us today'}
              </span>
              <h1 className={`mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl ${headingClass}`} style={{ color: theme.ink }}>
                {heading}
              </h1>
              {subheading && <p className="mt-5 max-w-xl text-lg" style={{ color: `${theme.ink}CC` }}>{subheading}</p>}
              {ctas}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className={`h-72 w-full object-cover sm:h-96 ${radiusClass(theme.radius)}`} />
          </div>
        </div>
      </section>
    );
  }

  if (theme.heroStyle === 'centered') {
    return (
      <section style={{ backgroundColor: theme.surface }}>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <h1 className={`text-4xl font-semibold leading-[1.1] sm:text-5xl ${headingClass}`} style={{ color: theme.ink }}>
            {heading}
          </h1>
          {subheading && (
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed" style={{ color: `${theme.ink}99` }}>
              {subheading}
            </p>
          )}
          <div className="mt-9 flex justify-center">{ctas}</div>
        </div>
      </section>
    );
  }

  /* Default: split */
  return (
    <section style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className={`text-4xl font-semibold leading-[1.08] sm:text-5xl ${headingClass}`} style={{ color: theme.ink }}>
            {heading}
          </h1>
          {subheading && (
            <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: `${theme.ink}99` }}>
              {subheading}
            </p>
          )}
          {ctas}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className={`h-72 w-full object-cover sm:h-[420px] ${radiusClass(theme.radius)}`} />
      </div>
    </section>
  );
}
