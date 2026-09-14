import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * The CymruSites mark: three stacked slate courses — a quiet nod to Welsh
 * slate and the valleys, rather than a dragon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn('h-8 w-8', className)}
      aria-hidden
      focusable="false"
    >
      <rect width="32" height="32" rx="7" className="fill-charcoal-900" />
      <path d="M7 20.5 16 9l9 11.5H7Z" className="fill-cymru-500" />
      <path d="M7 24h18" stroke="white" strokeWidth="1.75" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  href?: string;
  invert?: boolean;
  showWordmark?: boolean;
}

export function Logo({ className, href = '/', invert = false, showWordmark = true }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {showWordmark && (
        <span
          className={cn(
            'text-[1.0625rem] font-semibold tracking-tight',
            invert ? 'text-white' : 'text-charcoal-900',
          )}
        >
          Cymru<span className="text-cymru-500">Sites</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="rounded-md focus-visible:ring-2 focus-visible:ring-ring" aria-label="CymruSites home">
      {content}
    </Link>
  );
}
