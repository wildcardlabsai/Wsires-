'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'cs_sid';

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Fires a single pageview beacon per navigation. No cookies, no fingerprinting. */
export function SiteAnalytics({ websiteId, locale }: { websiteId: string; locale: 'en' | 'cy' }) {
  const pathname = usePathname();

  useEffect(() => {
    const body = JSON.stringify({
      websiteId,
      path: pathname,
      title: document.title,
      referrer: document.referrer || undefined,
      sessionId: getSessionId(),
      locale,
    });

    const payload = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/site/track', payload);
    } else {
      fetch('/api/site/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(
        () => {},
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, websiteId]);

  return null;
}
