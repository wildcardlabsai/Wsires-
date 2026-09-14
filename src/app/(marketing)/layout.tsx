import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { getSiteContent } from '@/lib/content/settings';
import { getSessionUser } from '@/lib/auth/session';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [content, user] = await Promise.all([getSiteContent(), getSessionUser()]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={Boolean(user)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter brand={content.brand} />
    </div>
  );
}
