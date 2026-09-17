import 'server-only';

import { env } from '@/lib/env';
import { escapeHtml, paragraphs } from './layout';
import { sendEmail, type SendResult } from './send';

/** The one transactional email this site sends — a new contact enquiry. */
export function sendAdminContactNotification(opts: {
  name: string;
  email: string;
  businessName?: string | null;
  phone?: string | null;
  businessType?: string | null;
  budget?: string | null;
  message: string;
}): Promise<SendResult> {
  const details = [
    { label: 'Name', value: opts.name },
    { label: 'Email', value: opts.email },
  ];
  if (opts.businessName) details.push({ label: 'Business', value: opts.businessName });
  if (opts.phone) details.push({ label: 'Phone', value: opts.phone });
  if (opts.businessType) details.push({ label: 'Trade', value: opts.businessType });
  if (opts.budget) details.push({ label: 'Budget', value: opts.budget });

  return sendEmail({
    to: env.adminEmail,
    replyTo: opts.email,
    subject: `New website enquiry — ${opts.name}${opts.businessName ? ` (${opts.businessName})` : ''}`,
    template: {
      preheader: 'A new enquiry has come in through the website.',
      heading: 'New enquiry from the website',
      body: paragraphs(`<strong>Message:</strong><br>${escapeHtml(opts.message).replace(/\n/g, '<br>')}`),
      details,
    },
  });
}
