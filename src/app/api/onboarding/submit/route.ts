import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { buildInitialContent } from '@/lib/websites/content-builder';
import { DEFAULT_PAGE_KEYS, pageCatalogItem } from '@/lib/websites/pages-catalog';
import { sendAdminOnboardingNotification, sendInformationReceivedEmail } from '@/lib/email/templates';
import { requireAdminSupabase } from '@/lib/supabase/server';
import { onboardingDataSchema } from '@/lib/validation/schemas';

/**
 * Finalises onboarding: validates the accumulated draft, writes the
 * business record, provisions the website's pages and initial content, and
 * moves the website into the production queue.
 *
 * This is the one-time brief a customer hands the agency — not an editing
 * session — so every write goes through the service role once
 * requireApiCustomer() has confirmed the caller owns this submission.
 * `businesses`, `website_pages` and `website_content` have no (or, for
 * businesses, no longer any) customer write policy: those tables are
 * agency-managed from here on.
 */
export async function POST() {
  return handleRoute(async () => {
    const { actor, customer } = await requireApiCustomer();
    const supabase = requireAdminSupabase();

    const { data: submission } = await supabase
      .from('onboarding_submissions')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!submission) {
      return NextResponse.json({ error: 'No onboarding draft found.' }, { status: 404 });
    }

    const parsed = onboardingDataSchema.safeParse(submission.data);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: `Some information is still needed: ${firstIssue?.message ?? 'please complete every step'}.`,
          issues: parsed.error.issues,
        },
        { status: 422 },
      );
    }
    const data = parsed.data;

    let websiteId = submission.website_id;
    if (!websiteId) {
      return NextResponse.json({ error: 'No website is linked to this submission.' }, { status: 500 });
    }

    /* Template lookup */
    const { data: template } = await supabase
      .from('website_templates')
      .select('id, slug')
      .eq('slug', data.templateSlug)
      .maybeSingle();

    /* 1. Upsert the business record */
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    const businessPayload = {
      customer_id: customer.id,
      name: data.businessName,
      industry: data.industry,
      description: data.description,
      phone: data.phone,
      email: data.email,
      whatsapp_number: data.whatsappNumber ?? data.phone,
      address_line1: data.addressLine1 ?? null,
      address_line2: data.addressLine2 ?? null,
      city: data.city ?? null,
      postcode: data.postcode,
      services: data.services,
      service_areas: data.serviceAreas,
      opening_hours: data.openingHours ?? [],
      social_links: data.socialLinks ?? {},
      brand_colors: {
        primary: data.primaryColour || undefined,
        secondary: data.secondaryColour || undefined,
        scheme: data.colourScheme,
      },
      logo_url: data.logoUrl || null,
    };

    let businessId: string;
    if (existingBusiness) {
      const { error } = await supabase.from('businesses').update(businessPayload).eq('id', existingBusiness.id);
      if (error) return NextResponse.json({ error: 'Could not save your business details.' }, { status: 500 });
      businessId = existingBusiness.id;
    } else {
      const { data: created, error } = await supabase
        .from('businesses')
        .insert(businessPayload)
        .select('id')
        .single();
      if (error || !created)
        return NextResponse.json({ error: 'Could not save your business details.' }, { status: 500 });
      businessId = created.id;
    }

    /* 2. Update the website record */
    const { error: websiteError } = await supabase
      .from('websites')
      .update({
        business_id: businessId,
        template_id: template?.id ?? null,
        name: data.businessName,
        status: 'in_production',
        language_mode: data.languageMode,
        default_locale: data.languageMode === 'cy' ? 'cy' : 'en',
        theme: {
          primary: data.primaryColour || undefined,
          secondary: data.secondaryColour || undefined,
          scheme: data.colourScheme,
        },
        requested_pages: data.pages,
        seo: {
          title: `${data.businessName} | ${data.city ?? 'Wales'}`,
          description: data.description?.slice(0, 155),
        },
        last_updated_by: actor.userId,
      })
      .eq('id', websiteId);

    if (websiteError) {
      return NextResponse.json({ error: 'Could not update your website.' }, { status: 500 });
    }

    /* 3. Create the requested pages */
    const pageKeys = data.pages.length > 0 ? data.pages : DEFAULT_PAGE_KEYS;
    const pageRows = pageKeys
      .map((key, index) => {
        const item = pageCatalogItem(key);
        if (!item) return null;
        return {
          website_id: websiteId!,
          slug: item.slug,
          page_type: item.pageType,
          title: item.title,
          nav_label: item.navLabel,
          is_home: Boolean(item.isHome),
          sort_order: index,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (pageRows.length > 0) {
      await supabase.from('website_pages').upsert(pageRows, { onConflict: 'website_id,slug' });
    }

    const { data: homePage } = await supabase
      .from('website_pages')
      .select('id')
      .eq('website_id', websiteId)
      .eq('is_home', true)
      .maybeSingle();

    /* 4. Seed initial content sections on the home page */
    const sections = buildInitialContent(data);
    const contentRows = sections.map((section) => ({
      website_id: websiteId!,
      page_id: homePage?.id ?? null,
      section_key: section.sectionKey,
      section_type: section.sectionType,
      locale: 'en' as const,
      data: section.data,
      sort_order: section.sortOrder,
    }));

    if (contentRows.length > 0) {
      await supabase
        .from('website_content')
        .upsert(contentRows, { onConflict: 'website_id,page_id,section_key,locale' });
    }

    /* 5. Close out the submission */
    await supabase
      .from('onboarding_submissions')
      .update({ status: 'submitted', submitted_at: new Date().toISOString(), website_id: websiteId })
      .eq('id', submission.id);

    void sendInformationReceivedEmail({
      to: customer.email,
      name: customer.contact_name,
      businessName: data.businessName,
    }).catch(() => {});
    void sendAdminOnboardingNotification({ businessName: data.businessName, customerId: customer.id }).catch(
      () => {},
    );

    return NextResponse.json({ data: { websiteId } });
  });
}
