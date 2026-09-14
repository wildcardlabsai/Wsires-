import { Check, MapPin, Phone, Star } from 'lucide-react';

import { telHref } from '@/lib/utils';
import type { BusinessRow } from '@/types/database';
import type { ResolvedTheme } from '../theme';
import { radiusClass } from '../theme';

const headingClass = (theme: ResolvedTheme) => (theme.headingFont === 'display' ? 'font-display' : 'font-sans');

export function TrustSection({ items, theme }: { items: string[]; theme: ResolvedTheme }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="border-y py-6" style={{ borderColor: `${theme.ink}0F`, backgroundColor: theme.muted }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 sm:px-8">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: `${theme.ink}99` }}>
          <MapPin className="h-3.5 w-3.5" /> Covering
        </span>
        {items.map((item) => (
          <span key={item} className="text-sm font-medium" style={{ color: theme.ink }}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

interface ServiceItem {
  title: string;
  description?: string;
  price_from?: string;
}

export function ServicesSection({ items, theme, id }: { items: ServiceItem[]; theme: ResolvedTheme; id?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <section id={id} className="py-16 sm:py-24" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className={`text-3xl font-semibold ${headingClass(theme)}`} style={{ color: theme.ink }}>
          Our services
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service) => (
            <div key={service.title} className={`border p-6 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
              <div className="h-8 w-8" style={{ backgroundColor: theme.accent, borderRadius: 6 }} />
              <h3 className="mt-4 text-lg font-semibold" style={{ color: theme.ink }}>
                {service.title}
              </h3>
              {service.description && <p className="mt-2 text-sm leading-relaxed" style={{ color: `${theme.ink}99` }}>{service.description}</p>}
              {service.price_from && (
                <p className="mt-3 text-sm font-semibold" style={{ color: theme.accent }}>
                  From {service.price_from}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection({
  body,
  team,
  theme,
  id,
}: {
  body: string;
  team?: { name: string; role?: string; bio?: string }[];
  theme: ResolvedTheme;
  id?: string;
}) {
  if (!body && (!team || team.length === 0)) return null;
  return (
    <section id={id} className="py-16 sm:py-24" style={{ backgroundColor: theme.muted }}>
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <h2 className={`text-3xl font-semibold ${headingClass(theme)}`} style={{ color: theme.ink }}>
          About us
        </h2>
        {body && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed" style={{ color: `${theme.ink}CC` }}>{body}</p>}
        {team && team.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className={`border bg-white p-5 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
                <p className="font-semibold" style={{ color: theme.ink }}>
                  {member.name}
                </p>
                {member.role && <p className="text-sm" style={{ color: theme.accent }}>{member.role}</p>}
                {member.bio && <p className="mt-2 text-sm" style={{ color: `${theme.ink}99` }}>{member.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function GallerySection({ images, theme, id }: { images: { url: string; alt?: string }[]; theme: ResolvedTheme; id?: string }) {
  if (!images || images.length === 0) return null;
  return (
    <section id={id} className="py-16 sm:py-24" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className={`text-3xl font-semibold ${headingClass(theme)}`} style={{ color: theme.ink }}>
          Our work
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={image.url}
              alt={image.alt ?? ''}
              className={`aspect-square w-full object-cover ${radiusClass(theme.radius)}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AreasSection({ items, theme, id }: { items: string[]; theme: ResolvedTheme; id?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <section id={id} className="py-16 sm:py-24" style={{ backgroundColor: theme.muted }}>
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h2 className={`text-3xl font-semibold ${headingClass(theme)}`} style={{ color: theme.ink }}>
          Areas we cover
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {items.map((area) => (
            <span
              key={area}
              className={`inline-flex items-center gap-1.5 border bg-white px-4 py-2 text-sm font-medium ${radiusClass(theme.radius)}`}
              style={{ borderColor: `${theme.ink}14`, color: theme.ink }}
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: theme.accent }} />
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

interface Testimonial {
  quote: string;
  author: string;
  location?: string;
  rating?: number;
}

export function TestimonialsSection({ items, theme, id }: { items: Testimonial[]; theme: ResolvedTheme; id?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <section id={id} className="py-16 sm:py-24" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className={`text-3xl font-semibold ${headingClass(theme)}`} style={{ color: theme.ink }}>
          What customers say
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <figure key={i} className={`border p-6 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
              {t.rating && (
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" style={{ color: theme.accent }} />
                  ))}
                </div>
              )}
              <blockquote className="mt-3 text-sm leading-relaxed" style={{ color: `${theme.ink}CC` }}>
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold" style={{ color: theme.ink }}>
                {t.author}
                {t.location && <span className="font-normal" style={{ color: `${theme.ink}80` }}> · {t.location}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

interface Faq {
  question: string;
  answer: string;
}

export function FaqSection({ items, theme, id }: { items: Faq[]; theme: ResolvedTheme; id?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <section id={id} className="py-16 sm:py-24" style={{ backgroundColor: theme.muted }}>
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className={`text-3xl font-semibold ${headingClass(theme)}`} style={{ color: theme.ink }}>
          Frequently asked questions
        </h2>
        <dl className="mt-8 space-y-5">
          {items.map((faq) => (
            <div key={faq.question} className={`border bg-white p-5 ${radiusClass(theme.radius)}`} style={{ borderColor: `${theme.ink}14` }}>
              <dt className="font-semibold" style={{ color: theme.ink }}>
                {faq.question}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed" style={{ color: `${theme.ink}99` }}>
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function CtaSection({
  heading,
  body,
  phone,
  theme,
}: {
  heading: string;
  body?: string;
  phone?: string | null;
  theme: ResolvedTheme;
}) {
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: theme.ink }}>
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className={`text-3xl font-semibold text-white ${headingClass(theme)}`}>{heading}</h2>
        {body && <p className="mt-3 text-white/70">{body}</p>}
        <div className="mt-7 flex justify-center gap-3">
          {phone && (
            <a
              href={telHref(phone) ?? '#'}
              className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white ${radiusClass(theme.radius)}`}
              style={{ backgroundColor: theme.accent }}
            >
              <Phone className="h-4 w-4" /> {phone}
            </a>
          )}
          <a href="#contact" className={`inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm font-semibold text-white ${radiusClass(theme.radius)}`}>
            <Check className="h-4 w-4" /> Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
