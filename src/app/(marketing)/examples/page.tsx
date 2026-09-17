import type { Metadata } from 'next';

import { ExamplesGrid } from '@/components/marketing/examples-grid';
import { CtaBand, Section, SectionHeading } from '@/components/marketing/sections';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { PORTFOLIO_CATEGORIES } from '@/lib/content/defaults';
import { getPortfolio } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'Website examples',
  description:
    'Illustrative examples of the kind of websites we build for Welsh trades, garages, cafés and professional services.',
  alternates: { canonical: '/examples' },
};

export default async function ExamplesPage() {
  const portfolio = await getPortfolio();

  return (
    <>
      <Section tone="default" className="pb-8 pt-14 sm:pt-20">
        <SectionHeading
          eyebrow="Examples"
          title="The kind of websites we build"
          description="Each of these is an illustration of a layout and approach we would build for that trade — not a clickable live site."
        />
        <Alert variant="info" className="mt-8 max-w-3xl">
          <Info />
          <AlertDescription>
            <strong className="font-semibold">These are demonstration businesses, not customers.</strong> They
            were invented to show what different trades and layouts look like in practice. No real business is
            represented here.
          </AlertDescription>
        </Alert>
      </Section>

      <Section tone="default" className="pt-0">
        <ExamplesGrid examples={portfolio} categories={PORTFOLIO_CATEGORIES} />
      </Section>

      <CtaBand
        heading="Yours could be live in a fortnight"
        body="Tell us about your business and we will build something that suits it — not a recoloured version of somebody else’s site."
        primary="Get your website started"
        secondary="See how it works"
      />
    </>
  );
}
