import type { Metadata, Viewport } from 'next';

import { Toaster } from '@/components/ui/toaster';
import { env } from '@/lib/env';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: 'CymruSites — Professional websites for Welsh businesses',
    template: '%s | CymruSites',
  },
  description:
    'Affordable, professionally designed websites for small businesses across Wales. We build, host and maintain your website for you.',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'CymruSites',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1C1B19',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
