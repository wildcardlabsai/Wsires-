import { cn } from '@/lib/utils';

/**
 * A miniature of a customer website inside a browser chrome.
 *
 * Drawn with CSS rather than a screenshot so it always reflects the real
 * template layout, stays sharp at any size and costs nothing to load. The
 * "View demo" link next to it opens the actual working site.
 */

interface SitePreviewProps {
  businessName: string;
  location: string;
  accent: string;
  template: string;
  domain?: string;
  className?: string;
  compact?: boolean;
}

export function SitePreview({
  businessName,
  location,
  accent,
  template,
  domain,
  className,
  compact = false,
}: SitePreviewProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-charcoal-200 bg-white shadow-card',
        className,
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-charcoal-100 bg-charcoal-50 px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-charcoal-200" />
          <span className="h-2 w-2 rounded-full bg-charcoal-200" />
          <span className="h-2 w-2 rounded-full bg-charcoal-200" />
        </div>
        <div className="ml-1 flex-1 truncate rounded bg-white px-2 py-0.5 text-[0.5625rem] text-charcoal-400 ring-1 ring-charcoal-100">
          {domain ?? `${businessName.toLowerCase().replace(/[^a-z]+/g, '')}.co.uk`}
        </div>
      </div>

      {/* Page body */}
      <div className={cn('bg-white', compact ? 'p-3' : 'p-4')}>
        {/* Site nav */}
        <div className="flex items-center justify-between border-b border-charcoal-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: accent }} aria-hidden />
            <span className="text-[0.5625rem] font-semibold text-charcoal-800">{businessName}</span>
          </div>
          <div className="hidden gap-1.5 sm:flex" aria-hidden>
            {['Home', 'Services', 'Contact'].map((l) => (
              <span key={l} className="text-[0.5rem] text-charcoal-400">
                {l}
              </span>
            ))}
          </div>
          <span
            className="rounded px-1.5 py-0.5 text-[0.5rem] font-medium text-white"
            style={{ backgroundColor: accent }}
          >
            Call
          </span>
        </div>

        {templateLayout(template, accent, businessName, location, compact)}
      </div>
    </div>
  );
}

function templateLayout(
  template: string,
  accent: string,
  businessName: string,
  location: string,
  compact: boolean,
) {
  const bars = (n: number, widths: string[]) =>
    Array.from({ length: n }).map((_, i) => (
      <span
        key={i}
        className="block rounded-full bg-charcoal-100"
        style={{ width: widths[i % widths.length], height: 3 }}
        aria-hidden
      />
    ));

  const cards = (n: number) => (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rounded border border-charcoal-100 p-1.5">
          <span className="block h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: accent }} />
          <span className="mt-1 block h-[3px] w-3/4 rounded-full bg-charcoal-200" />
          <span className="mt-1 block h-[3px] w-full rounded-full bg-charcoal-100" />
        </div>
      ))}
    </div>
  );

  switch (template) {
    /* Photographic: full-bleed hero with text over it. */
    case 'y-glannau':
      return (
        <div className={cn('space-y-2', compact ? 'pt-2' : 'pt-3')}>
          <div
            className="relative flex h-16 flex-col justify-end overflow-hidden rounded p-2 sm:h-20"
            style={{ background: `linear-gradient(135deg, ${accent}E6, ${accent}99), #2F2D2A` }}
          >
            <span className="text-[0.625rem] font-semibold leading-tight text-white">{businessName}</span>
            <span className="text-[0.5rem] text-white/80">{location} and surrounding areas</span>
            <span className="mt-1 w-fit rounded bg-white px-1.5 py-0.5 text-[0.5rem] font-medium" style={{ color: accent }}>
              Get a free quote
            </span>
          </div>
          {cards(3)}
          <div className="grid grid-cols-3 gap-1" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="block h-6 rounded bg-charcoal-100" />
            ))}
          </div>
        </div>
      );

    /* Split: content left, image right. */
    case 'y-cwm':
      return (
        <div className={cn('space-y-2', compact ? 'pt-2' : 'pt-3')}>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <span className="block text-[0.625rem] font-semibold leading-tight text-charcoal-900">
                {businessName}
              </span>
              <div className="space-y-1">{bars(3, ['100%', '90%', '60%'])}</div>
              <span
                className="mt-1 inline-block rounded px-1.5 py-0.5 text-[0.5rem] font-medium text-white"
                style={{ backgroundColor: accent }}
              >
                Request a quote
              </span>
            </div>
            <div className="rounded" style={{ backgroundColor: `${accent}22`, minHeight: 56 }} aria-hidden />
          </div>
          {cards(3)}
        </div>
      );

    /* Utility: phone number bar, direct and practical. */
    case 'y-bont':
      return (
        <div className={cn('space-y-2', compact ? 'pt-2' : 'pt-3')}>
          <div
            className="flex items-center justify-between rounded px-2 py-1.5"
            style={{ backgroundColor: accent }}
          >
            <span className="text-[0.5625rem] font-bold text-white">24hr call-out</span>
            <span className="rounded bg-white px-1.5 py-0.5 text-[0.5rem] font-bold" style={{ color: accent }}>
              029 2000 0000
            </span>
          </div>
          <div className="space-y-1 pt-1">
            <span className="block text-[0.625rem] font-semibold text-charcoal-900">{businessName}</span>
            {bars(2, ['100%', '75%'])}
          </div>
          {cards(2)}
          <div className="rounded border border-charcoal-100 p-1.5" aria-hidden>
            <span className="block h-[3px] w-1/3 rounded-full bg-charcoal-200" />
            <div className="mt-1 grid grid-cols-4 gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="block h-3 rounded-sm bg-charcoal-50" />
              ))}
            </div>
          </div>
        </div>
      );

    /* Editorial: centred, generous, calm. */
    default:
      return (
        <div className={cn('space-y-2 text-center', compact ? 'pt-3' : 'pt-4')}>
          <span className="block text-[0.6875rem] font-semibold tracking-tight text-charcoal-900">
            {businessName}
          </span>
          <span className="mx-auto block text-[0.5rem] text-charcoal-400">{location}</span>
          <span className="mx-auto block h-px w-8" style={{ backgroundColor: accent }} aria-hidden />
          <div className="mx-auto w-3/4 space-y-1 pt-1">{bars(2, ['100%', '80%'])}</div>
          <span
            className="mx-auto inline-block rounded-full px-2 py-0.5 text-[0.5rem] font-medium text-white"
            style={{ backgroundColor: accent }}
          >
            Book a table
          </span>
          <div className="grid grid-cols-2 gap-1.5 pt-1" aria-hidden>
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="block h-8 rounded" style={{ backgroundColor: `${accent}1A` }} />
            ))}
          </div>
        </div>
      );
  }
}
