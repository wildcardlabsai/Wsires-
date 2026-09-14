import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        /* Signed-in areas and previews must never be indexed. */
        disallow: ['/dashboard', '/admin', '/onboarding', '/preview', '/api/', '/auth/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
