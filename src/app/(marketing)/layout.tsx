import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { getSiteContent } from '@/lib/content/settings';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter brand={content.brand} />
    </div>
  );
}
