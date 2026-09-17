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

/** Turn a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
