import type { ReactNode } from 'react';

import { Section } from '@/components/marketing/sections';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

/** Shared layout for the terms and privacy pages. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
  footer,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  footer?: ReactNode;
}) {
  return (
    <Section tone="default" className="pt-14 sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cymru-600">Legal</p>
        <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-charcoal-900">
          {title}
        </h1>
        <p className="mt-3 text-sm text-charcoal-500">Last updated: {updated}</p>
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-charcoal-700">{intro}</p>

        <nav aria-label="On this page" className="mt-10 rounded-xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal-400">On this page</p>
          <ol className="mt-3 space-y-1.5">
            {sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-sm text-charcoal-600 hover:text-cymru-700 hover:underline"
                >
                  {index + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-10">
          {sections.map((section, index) => (
            <section key={section.heading} id={`section-${index + 1}`} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-tight text-charcoal-900">
                {index + 1}. {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-[0.9375rem] leading-relaxed text-charcoal-600">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-4 space-y-2">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[0.9375rem] leading-relaxed text-charcoal-600"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-charcoal-300" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {footer && <div className="mt-14 rounded-xl border border-border bg-cream-100 p-6">{footer}</div>}
      </div>
    </Section>
  );
}
