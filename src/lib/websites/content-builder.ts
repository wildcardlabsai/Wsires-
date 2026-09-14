import type { OnboardingData } from '@/lib/validation/schemas';

/**
 * Turns a completed onboarding submission into the initial set of
 * `website_content` section rows. This is the one place that decides what
 * shape section data takes — the template renderer (lib/websites/render)
 * reads the same shapes back out.
 */
export interface SectionSeed {
  sectionKey: string;
  sectionType: string;
  data: Record<string, unknown>;
  sortOrder: number;
}

export function buildInitialContent(data: OnboardingData): SectionSeed[] {
  const sections: SectionSeed[] = [];
  let order = 0;

  sections.push({
    sectionKey: 'hero',
    sectionType: 'hero',
    sortOrder: order++,
    data: {
      heading: data.businessName,
      subheading: data.description?.slice(0, 220) ?? '',
      primaryCtaLabel: 'Get in touch',
      secondaryCtaLabel: data.services?.[0]?.title ? `Our ${data.services[0].title.toLowerCase()}` : 'Our services',
    },
  });

  sections.push({
    sectionKey: 'trust',
    sectionType: 'trust',
    sortOrder: order++,
    data: { items: data.serviceAreas ?? [] },
  });

  sections.push({
    sectionKey: 'services',
    sectionType: 'services',
    sortOrder: order++,
    data: { items: data.services ?? [] },
  });

  sections.push({
    sectionKey: 'about',
    sectionType: 'about',
    sortOrder: order++,
    data: {
      body: data.aboutText ?? data.description ?? '',
      team: data.teamMembers ?? [],
    },
  });

  if ((data.photoUrls?.length ?? 0) > 0) {
    sections.push({
      sectionKey: 'gallery',
      sectionType: 'gallery',
      sortOrder: order++,
      data: { images: (data.photoUrls ?? []).map((url) => ({ url, alt: data.businessName })) },
    });
  }

  sections.push({
    sectionKey: 'areas',
    sectionType: 'areas',
    sortOrder: order++,
    data: { items: data.serviceAreas ?? [] },
  });

  if ((data.testimonials?.length ?? 0) > 0) {
    sections.push({
      sectionKey: 'testimonials',
      sectionType: 'testimonials',
      sortOrder: order++,
      data: { items: data.testimonials ?? [] },
    });
  }

  if ((data.faqs?.length ?? 0) > 0) {
    sections.push({
      sectionKey: 'faq',
      sectionType: 'faq',
      sortOrder: order++,
      data: { items: data.faqs ?? [] },
    });
  }

  sections.push({
    sectionKey: 'cta',
    sectionType: 'cta',
    sortOrder: order++,
    data: { heading: `Ready to talk to ${data.businessName}?`, body: 'Get in touch and we’ll get back to you quickly.' },
  });

  sections.push({
    sectionKey: 'contact',
    sectionType: 'contact',
    sortOrder: order++,
    data: {
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsappNumber ?? data.phone,
      addressLine1: data.addressLine1 ?? '',
      addressLine2: data.addressLine2 ?? '',
      city: data.city ?? '',
      postcode: data.postcode ?? '',
      openingHours: data.openingHours ?? [],
      socialLinks: data.socialLinks ?? {},
    },
  });

  return sections;
}
