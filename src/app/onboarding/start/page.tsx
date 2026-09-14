import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Set up your website', robots: { index: false } };

/**
 * Reached only if a signed-in user has no customer record yet — normally
 * impossible via /signup, but this covers edge cases (e.g. an account
 * created directly in Supabase).
 */
export default function OnboardingStartPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-100 px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cymru-50">
          <AlertCircle className="h-6 w-6 text-cymru-600" aria-hidden />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-charcoal-900">Let’s set up your account first</h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
          We couldn’t find a business account linked to your profile yet. Choose a plan to get started, or get
          in touch if you think this is a mistake.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/pricing">Choose a plan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
