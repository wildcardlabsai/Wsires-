import type { Metadata } from 'next';
import { LayoutTemplate } from 'lucide-react';

import { SitePreview } from '@/components/marketing/site-preview';
import { TemplateActiveToggle } from '@/components/admin/template-toggle';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import type { WebsiteTemplateRow } from '@/types/database';

export const metadata: Metadata = { title: 'Templates', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminTemplatesPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: templates } = (await supabase
    .from('website_templates')
    .select('*')
    .order('sort_order')) as { data: WebsiteTemplateRow[] | null };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="The website styles customers can choose from during onboarding."
      />

      {!templates || templates.length === 0 ? (
        <EmptyState icon={LayoutTemplate} title="No templates" description="Run the database migrations to seed the default templates." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const accent = (template.style_tokens as { accent?: string })?.accent ?? '#C8102E';
            return (
              <Card key={template.id}>
                <CardContent className="p-5">
                  <SitePreview businessName="Example Business" location="Wales" accent={accent} template={template.slug} compact />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-charcoal-900">{template.name}</p>
                      <p className="mt-0.5 text-xs text-charcoal-500">{template.best_for}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <TemplateActiveToggle templateId={template.id} isActive={template.is_active} />
                      <Label className="text-[0.625rem] text-charcoal-400">{template.is_active ? 'Active' : 'Hidden'}</Label>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-charcoal-500">{template.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
