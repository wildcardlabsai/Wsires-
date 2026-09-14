import type { Metadata } from 'next';

import { JsonSettingEditor } from '@/components/admin/json-setting-editor';
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SETTINGS_KEYS } from '@/lib/content/defaults';
import { getIndustries, getPortfolio, getSiteContent } from '@/lib/content/settings';

export const metadata: Metadata = { title: 'Content', robots: { index: false } };
export const dynamic = 'force-dynamic';

interface Section {
  key: string;
  label: string;
  description: string;
  value: unknown;
}

export default async function AdminContentPage() {
  const [content, industries, portfolio] = await Promise.all([
    getSiteContent(),
    getIndustries(),
    getPortfolio(),
  ]);

  const sections: Section[] = [
    { key: SETTINGS_KEYS.brand, label: 'Brand & contact details', description: 'Company name, tagline, email, phone, address, social links.', value: content.brand },
    { key: SETTINGS_KEYS.hero, label: 'Homepage hero', description: 'Headline, subheading, call-to-action buttons.', value: content.hero },
    { key: SETTINGS_KEYS.trustStrip, label: 'Trusted-by strip', description: 'Trade tags and headline stats shown below the hero.', value: content.trustStrip },
    { key: SETTINGS_KEYS.promise, label: 'The promise section', description: '"You run your business" section copy.', value: content.promise },
    { key: SETTINGS_KEYS.howItWorks, label: 'How it works', description: 'The five-step process.', value: content.howItWorks },
    { key: SETTINGS_KEYS.whyUs, label: 'Why CymruSites', description: 'Value proposition tiles.', value: content.whyUs },
    { key: SETTINGS_KEYS.included, label: 'What’s included', description: 'The included-features checklist.', value: content.included },
    { key: SETTINGS_KEYS.welsh, label: 'Welsh & bilingual section', description: 'Copy for the Welsh-language section.', value: content.welsh },
    { key: SETTINGS_KEYS.localSeo, label: 'Local SEO section', description: 'Copy for the local SEO section.', value: content.localSeo },
    { key: SETTINGS_KEYS.testimonials, label: 'Testimonials', description: 'Homepage and FAQ testimonials.', value: content.testimonials },
    { key: SETTINGS_KEYS.faqs, label: 'FAQs', description: 'Every FAQ shown on the homepage and /faq page.', value: content.faqs },
    { key: SETTINGS_KEYS.finalCta, label: 'Final call to action', description: 'The closing banner shown at the bottom of every marketing page.', value: content.finalCta },
    { key: SETTINGS_KEYS.seo, label: 'Default SEO', description: 'Fallback page title and meta description.', value: content.seo },
    { key: SETTINGS_KEYS.industries, label: 'Industries', description: 'All /industries/[slug] pages — headline, pain points, features, FAQs.', value: industries },
    { key: SETTINGS_KEYS.portfolio, label: 'Portfolio examples', description: 'The example websites shown on /examples.', value: portfolio },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Content" description="Edit the copy on the public marketing website — no code changes required." />

      <Alert variant="info">
        <Info />
        <AlertDescription>
          Each item edits as JSON so every field is covered honestly, including nested lists like FAQs and
          testimonials. Edit the text between the quotes and keep the structure the same.
        </AlertDescription>
      </Alert>

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.key}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-semibold text-charcoal-900">{section.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-charcoal-500">{section.description}</p>
              </div>
              <JsonSettingEditor settingKey={section.key} label={section.label} description={section.description} value={section.value} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
