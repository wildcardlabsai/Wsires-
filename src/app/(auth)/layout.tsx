import Link from 'next/link';

import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12 sm:py-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-charcoal-400 lg:text-left">
          © {new Date().getFullYear()} CymruSites ·{' '}
          <Link href="/" className="hover:text-charcoal-600 hover:underline">
            Back to the website
          </Link>
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-charcoal-950 lg:block">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-end p-16">
          <blockquote className="max-w-md text-2xl font-medium leading-snug tracking-tight text-white">
            “I had put off getting a website for about four years. It took one phone call and a form.”
          </blockquote>
          <p className="mt-5 text-sm text-charcoal-400">Gareth L. · Plumbing &amp; heating, Pontypridd</p>
        </div>
      </div>
    </div>
  );
}
