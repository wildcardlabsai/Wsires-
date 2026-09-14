import type { BusinessRow, WebsiteRow } from '@/types/database';
import { interpolate } from '@/lib/websites/interpolate';
import type { RenderablePage, RenderableSite } from '@/lib/websites/render-data';
import { resolveTheme } from './theme';
import { SiteAnalytics } from './site-analytics';
import { SiteFooter } from './site-footer';
import { SiteHeader, type NavItem } from './site-header';
import { WhatsAppFloatButton } from './whatsapp-button';
import { HeroSection } from './sections/hero';
import {
  AboutSection,
  AreasSection,
  CtaSection,
  FaqSection,
  GallerySection,
  ServicesSection,
  TestimonialsSection,
  TrustSection,
} from './sections/content-sections';
import { ContactSection } from './sections/contact-section';

/**
 * Renders one page of a customer website: header, its sections, footer.
 *
 * `basePath`/`linkSuffix` let the same renderer work under a path-prefixed
 * route — the private preview link (`/preview/<slug>/<page>?token=…`) needs
 * every internal nav link to stay inside that prefix and keep the token,
 * where a real domain or subdomain serves pages at the site root.
 */
export function SiteRenderer({
  site,
  page,
  basePath = '',
  linkSuffix = '',
  switchLocaleQuery,
}: {
  site: RenderableSite;
  page: RenderablePage;
  basePath?: string;
  linkSuffix?: string;
  /** Query string (e.g. "?lang=cy") that switches the *current* page to the other language, for bilingual sites. */
  switchLocaleQuery?: string;
}) {
  const theme = resolveTheme(site.template?.style_tokens, site.website.theme);
  const nav: NavItem[] = site.pages
    .filter((p) => p.show_in_nav)
    .map((p) => ({
      label: p.nav_label ?? p.title,
      href: `${basePath}${p.is_home ? '/' : `/${p.slug}`}${linkSuffix}`,
    }));
  const languageSwitch = switchLocaleQuery
    ? {
        currentLocale: site.locale,
        href: `${basePath}${page.is_home ? '/' : `/${page.slug}`}${switchLocaleQuery}`,
      }
    : undefined;

  return (
    <div style={{ backgroundColor: theme.surface }}>
      <SiteAnalytics websiteId={site.website.id} locale={site.locale} />
      <SiteHeader
        businessName={site.business?.name ?? site.website.name}
        logoUrl={site.business?.logo_url}
        phone={site.business?.phone}
        nav={nav}
        theme={theme}
        currentPath={`${basePath}${page.is_home ? '/' : `/${page.slug}`}`}
        languageSwitch={languageSwitch}
      />

      <main>
        {page.sections.map((section) => (
          <SectionSwitch
            key={section.id}
            type={section.section_type}
            data={section.data}
            business={site.business}
            website={site.website}
            theme={theme}
          />
        ))}
      </main>

      <SiteFooter
        businessName={site.business?.name ?? site.website.name}
        business={site.business}
        nav={nav}
        theme={theme}
        isDemo={site.website.is_demo}
      />

      <WhatsAppFloatButton phone={site.business?.whatsapp_number || site.business?.phone} businessName={site.business?.name ?? site.website.name} />
    </div>
  );
}

function SectionSwitch({
  type,
  data,
  business,
  website,
  theme,
}: {
  type: string;
  data: Record<string, unknown>;
  business: BusinessRow | null;
  website: WebsiteRow;
  theme: ReturnType<typeof resolveTheme>;
}) {
  switch (type) {
    case 'hero':
      return (
        <HeroSection
          data={{
            heading: interpolate(data.heading as string, business, website),
            subheading: interpolate(data.subheading as string, business, website),
            primaryCtaLabel: data.primaryCtaLabel as string,
            secondaryCtaLabel: data.secondaryCtaLabel as string,
          }}
          business={business}
          theme={theme}
        />
      );
    case 'trust':
      return <TrustSection items={(data.items as string[]) ?? []} theme={theme} />;
    case 'services':
      return <ServicesSection items={(data.items as never[]) ?? []} theme={theme} id="services" />;
    case 'about':
      return <AboutSection body={interpolate(data.body as string, business, website)} team={data.team as never[]} theme={theme} id="about" />;
    case 'gallery':
      return <GallerySection images={(data.images as never[]) ?? []} theme={theme} id="gallery" />;
    case 'areas':
      return <AreasSection items={(data.items as string[]) ?? []} theme={theme} id="areas" />;
    case 'testimonials':
      return <TestimonialsSection items={(data.items as never[]) ?? []} theme={theme} id="reviews" />;
    case 'faq':
      return <FaqSection items={(data.items as never[]) ?? []} theme={theme} id="faq" />;
    case 'cta':
      return (
        <CtaSection
          heading={interpolate(data.heading as string, business, website)}
          body={data.body as string}
          phone={business?.phone}
          theme={theme}
        />
      );
    case 'contact':
      return <ContactSection websiteId={website.id} business={business} theme={theme} />;
    default:
      return null;
  }
}
