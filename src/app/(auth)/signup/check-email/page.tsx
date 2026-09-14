import type { Metadata } from 'next';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export const metadata: Metadata = { title: 'Check your email', robots: { index: false } };

export default function CheckEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cymru-50">
        <MailCheck className="h-6 w-6 text-cymru-600" aria-hidden />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal-900">Check your email</h1>
      <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
        We’ve sent a confirmation link to your email address. Click it to activate your account, then log in to
        continue.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm font-medium text-cymru-700 hover:underline">
        Back to log in
      </Link>
    </div>
  );
}
