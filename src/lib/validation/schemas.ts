import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

export const phoneSchema = z
  .string()
  .trim()
  .min(9, 'Enter a valid phone number')
  .max(24, 'Enter a valid phone number')
  .regex(/^[\d\s()+-]+$/, 'Enter a valid phone number');

export const optionalPhone = z
  .union([phoneSchema, z.literal('')])
  .optional()
  .transform((v) => (v === '' ? undefined : v));

export const postcodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, 'Enter a valid UK postcode')
  .transform((v) => v.toUpperCase().replace(/\s+/g, ' '));

export const optionalUrl = z
  .union([z.string().trim().url('Enter a valid URL'), z.literal('')])
  .optional()
  .transform((v) => (v === '' ? undefined : v));

export const hexColour = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a hex colour such as #C8102E');

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(63)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');

export const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/,
    'Enter a domain such as yourbusiness.co.uk',
  );

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Passwords must be 72 characters or fewer')
  .regex(/[a-zA-Z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name').max(120),
  businessName: z.string().trim().min(2, 'Enter your business name').max(160),
  email: emailSchema,
  phone: optionalPhone,
  password: passwordSchema,
  planSlug: z.string().trim().optional(),
  marketingOptIn: z.boolean().optional().default(false),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const resetRequestSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ------------------------------------------------------------------ */
/* Public contact form                                                 */
/* ------------------------------------------------------------------ */

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120),
  businessName: z.string().trim().max(160).optional(),
  email: emailSchema,
  phone: optionalPhone,
  businessType: z.string().trim().max(80).optional(),
  currentWebsite: z.string().trim().max(200).optional(),
  requirement: z.string().trim().max(120).optional(),
  budget: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(4000),
  /* Honeypot — real people leave this empty. */
  company_website: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */

export const INDUSTRIES = [
  'plumbing',
  'electrical',
  'building',
  'roofing',
  'landscaping',
  'automotive',
  'hospitality',
  'professional_services',
  'other',
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const serviceSchema = z.object({
  title: z.string().trim().min(2, 'Enter a service name').max(90),
  description: z.string().trim().max(600).optional(),
  price_from: z.string().trim().max(40).optional(),
  image_url: optionalUrl,
});

export const openingHourSchema = z.object({
  day: z.string(),
  opens: z.string().nullable(),
  closes: z.string().nullable(),
  closed: z.boolean(),
});

export const onboardingStep1 = z.object({
  businessName: z.string().trim().min(2, 'Enter your business name').max(160),
  contactName: z.string().trim().min(2, 'Enter a contact name').max(120),
  email: emailSchema,
  phone: phoneSchema,
  addressLine1: z.string().trim().max(160).optional(),
  addressLine2: z.string().trim().max(160).optional(),
  city: z.string().trim().max(80).optional(),
  postcode: postcodeSchema,
  existingWebsite: z.string().trim().max(200).optional(),
  description: z.string().trim().min(20, 'Tell us about your business (at least 20 characters)').max(2000),
});

export const onboardingStep2 = z.object({
  industry: z.enum(INDUSTRIES),
  industryOther: z.string().trim().max(80).optional(),
});

export const onboardingStep3 = z.object({
  services: z.array(serviceSchema).min(1, 'Add at least one service').max(24),
});

export const onboardingStep4 = z.object({
  serviceAreas: z.array(z.string().trim().min(2).max(80)).min(1, 'Add at least one area you cover').max(40),
});

export const onboardingStep5 = z.object({
  logoUrl: z.string().trim().optional(),
  colourScheme: z.string().trim().min(1, 'Choose a colour scheme'),
  primaryColour: z.union([hexColour, z.literal('')]).optional(),
  secondaryColour: z.union([hexColour, z.literal('')]).optional(),
  photoUrls: z.array(z.string().trim()).max(40).optional().default([]),
});

export const onboardingStep6 = z.object({
  templateSlug: z.string().trim().min(1, 'Choose a website style'),
});

export const onboardingStep7 = z.object({
  pages: z.array(z.string().trim()).min(1, 'Choose at least one page').max(12),
});

export const onboardingStep8 = z.object({
  languageMode: z.enum(['en', 'cy', 'bilingual']),
});

export const onboardingStep9 = z.object({
  aboutText: z.string().trim().max(4000).optional(),
  teamMembers: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(90),
        role: z.string().trim().max(90).optional(),
        bio: z.string().trim().max(600).optional(),
        photo_url: z.string().trim().optional(),
      }),
    )
    .max(20)
    .optional()
    .default([]),
  testimonials: z
    .array(
      z.object({
        quote: z.string().trim().min(10).max(800),
        author: z.string().trim().min(2).max(90),
        location: z.string().trim().max(90).optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .max(24)
    .optional()
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(5).max(200),
        answer: z.string().trim().min(5).max(2000),
      }),
    )
    .max(24)
    .optional()
    .default([]),
  openingHours: z.array(openingHourSchema).optional(),
  socialLinks: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      x: optionalUrl,
      linkedin: optionalUrl,
      tiktok: optionalUrl,
      youtube: optionalUrl,
    })
    .optional(),
  whatsappNumber: optionalPhone,
});

/** Every onboarding answer, as persisted in onboarding_submissions.data. */
export const onboardingDataSchema = onboardingStep1
  .merge(onboardingStep2)
  .merge(onboardingStep3)
  .merge(onboardingStep4)
  .merge(onboardingStep5)
  .merge(onboardingStep6)
  .merge(onboardingStep7)
  .merge(onboardingStep8)
  .merge(onboardingStep9);

export type OnboardingData = z.infer<typeof onboardingDataSchema>;

export const onboardingSaveSchema = z.object({
  step: z.number().int().min(1).max(10),
  data: z.record(z.unknown()),
});

/* ------------------------------------------------------------------ */
/* Website management (customer-editable fields)                       */
/* ------------------------------------------------------------------ */

export const businessDetailsSchema = z.object({
  name: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(4000).optional(),
  phone: optionalPhone,
  email: z.union([emailSchema, z.literal('')]).optional(),
  whatsappNumber: optionalPhone,
  addressLine1: z.string().trim().max(160).optional(),
  addressLine2: z.string().trim().max(160).optional(),
  city: z.string().trim().max(80).optional(),
  postcode: z.union([postcodeSchema, z.literal('')]).optional(),
  googleMapsUrl: optionalUrl,
  services: z.array(serviceSchema).max(24).optional(),
  serviceAreas: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  openingHours: z.array(openingHourSchema).optional(),
  socialLinks: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      x: optionalUrl,
      linkedin: optionalUrl,
      tiktok: optionalUrl,
      youtube: optionalUrl,
    })
    .optional(),
  testimonials: z
    .array(
      z.object({
        quote: z.string().trim().min(10).max(800),
        author: z.string().trim().min(2).max(90),
        location: z.string().trim().max(90).optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .max(24)
    .optional(),
});
export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;

/* ------------------------------------------------------------------ */
/* Leads, support, domains                                             */
/* ------------------------------------------------------------------ */

export const siteEnquirySchema = z.object({
  websiteId: z.string().uuid(),
  name: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.union([emailSchema, z.literal('')]).optional(),
  phone: optionalPhone,
  service: z.string().trim().max(120).optional(),
  message: z.string().trim().min(5, 'Please add a short message').max(4000),
  pageUrl: z.string().trim().max(400).optional(),
  company_website: z.string().max(0).optional(),
});

export const leadUpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost']).optional(),
  notes: z.string().trim().max(4000).optional(),
});

export const ticketCreateSchema = z.object({
  subject: z.string().trim().min(4, 'Enter a subject').max(160),
  category: z.enum(['website_changes', 'technical', 'billing', 'domain_email', 'new_feature', 'other']),
  message: z.string().trim().min(10, 'Tell us what you need (at least 10 characters)').max(6000),
  websiteId: z.string().uuid().optional(),
  attachments: z
    .array(
      z.object({
        name: z.string().max(200),
        url: z.string().max(1000),
        size: z.number().optional(),
        mime_type: z.string().max(120).optional(),
      }),
    )
    .max(5)
    .optional()
    .default([]),
});

export const ticketReplySchema = z.object({
  body: z.string().trim().min(1, 'Enter a message').max(6000),
  isInternal: z.boolean().optional().default(false),
  status: z.enum(['open', 'in_progress', 'waiting_for_customer', 'resolved']).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string().max(200),
        url: z.string().max(1000),
        size: z.number().optional(),
        mime_type: z.string().max(120).optional(),
      }),
    )
    .max(5)
    .optional()
    .default([]),
});

export const domainRequestSchema = z.object({
  domain: domainSchema,
  websiteId: z.string().uuid().optional(),
  registrar: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const domainAdminUpdateSchema = z.object({
  status: z.enum(['pending', 'connected', 'verified', 'live', 'failed']).optional(),
  dnsStatus: z.enum(['pending', 'propagating', 'verified', 'failed']).optional(),
  sslStatus: z.enum(['pending', 'issuing', 'active', 'failed']).optional(),
  notes: z.string().trim().max(2000).optional(),
  websiteId: z.string().uuid().nullable().optional(),
  isPrimary: z.boolean().optional(),
});

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const websiteStatusUpdateSchema = z.object({
  status: z.enum([
    'lead',
    'purchased',
    'awaiting_information',
    'in_production',
    'awaiting_customer_approval',
    'changes_requested',
    'approved',
    'domain_setup',
    'live',
    'suspended',
    'cancelled',
  ]),
  note: z.string().trim().max(2000).optional(),
  notifyCustomer: z.boolean().optional().default(true),
});

export const planUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  name: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(1000).optional(),
  setupPricePence: z.number().int().min(0).max(10_000_00),
  monthlyPricePence: z.number().int().min(0).max(10_000_00),
  maxPages: z.number().int().min(1).max(100),
  features: z.array(z.string().trim().min(1).max(200)).max(40),
  stripeSetupPriceId: z.string().trim().max(120).optional(),
  stripeMonthlyPriceId: z.string().trim().max(120).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().min(0).max(100),
});

export const settingUpdateSchema = z.object({
  key: z.string().trim().min(1).max(120),
  value: z.unknown(),
  groupName: z.string().trim().max(60).optional(),
});

export const adminNoteSchema = z.object({
  customerId: z.string().uuid().optional(),
  websiteId: z.string().uuid().optional(),
  body: z.string().trim().min(1, 'Enter a note').max(4000),
});

export const adminEmailSchema = z.object({
  customerId: z.string().uuid(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(8000),
});

export const customerAdminUpdateSchema = z.object({
  businessName: z.string().trim().min(2).max(160).optional(),
  contactName: z.string().trim().max(120).optional(),
  email: emailSchema.optional(),
  phone: optionalPhone,
  addressLine1: z.string().trim().max(160).optional(),
  city: z.string().trim().max(80).optional(),
  postcode: z.union([postcodeSchema, z.literal('')]).optional(),
  status: z.enum(['active', 'suspended', 'cancelled']).optional(),
  planId: z.string().uuid().nullable().optional(),
});

export const changeRequestReviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().trim().max(2000).optional(),
});

/* ------------------------------------------------------------------ */
/* Website content editing (admin)                                     */
/* ------------------------------------------------------------------ */

export const sectionUpsertSchema = z.object({
  websiteId: z.string().uuid(),
  pageId: z.string().uuid().nullable().optional(),
  sectionKey: z.string().trim().min(1).max(80),
  sectionType: z.string().trim().min(1).max(80),
  locale: z.enum(['en', 'cy']).default('en'),
  data: z.record(z.unknown()),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(200).optional(),
});

export const pageUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  websiteId: z.string().uuid(),
  slug: z.string().trim().max(63),
  title: z.string().trim().min(1).max(120),
  navLabel: z.string().trim().max(60).optional(),
  pageType: z.string().trim().max(40).optional(),
  showInNav: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isHome: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
  seo: z
    .object({
      title: z.string().trim().max(70).optional(),
      description: z.string().trim().max(180).optional(),
      noindex: z.boolean().optional(),
    })
    .optional(),
});

/* ------------------------------------------------------------------ */
/* Uploads                                                             */
/* ------------------------------------------------------------------ */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const;

export const ALLOWED_ATTACHMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/** Server-side upload validation — never trust the client's declared type alone. */
export function validateUpload(
  file: { name: string; type: string; size: number },
  { allowed = ALLOWED_IMAGE_TYPES as readonly string[], maxBytes = MAX_UPLOAD_BYTES } = {},
): { ok: true } | { ok: false; error: string } {
  if (file.size <= 0) return { ok: false, error: 'That file appears to be empty.' };
  if (file.size > maxBytes) {
    return { ok: false, error: `Files must be ${Math.round(maxBytes / 1024 / 1024)}MB or smaller.` };
  }
  if (!allowed.includes(file.type)) {
    return { ok: false, error: `${file.type || 'That file type'} is not supported.` };
  }
  if (/[/\\]|\.\./.test(file.name)) {
    return { ok: false, error: 'That file name is not allowed.' };
  }
  return { ok: true };
}

/** Turn a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
