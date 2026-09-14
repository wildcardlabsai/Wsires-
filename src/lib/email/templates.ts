import 'server-only';

import { absoluteUrl, env } from '@/lib/env';
import { formatDate, formatPrice } from '@/lib/utils';
import { escapeHtml, paragraphs } from './layout';
import { sendEmail, type SendResult } from './send';

/**
 * Every transactional email CymruSites sends.
 *
 * Each function is a thin wrapper over sendEmail so call sites read as
 * `await sendWebsiteLiveEmail({ ... })` and the copy lives in one place.
 */

interface Recipient {
  to: string;
  name?: string | null;
}

const firstName = (name?: string | null) => (name ? escapeHtml(name.split(' ')[0]!) : 'there');

/* ------------------------------------------------------------------ */
/* Account                                                             */
/* ------------------------------------------------------------------ */

export function sendWelcomeEmail(opts: Recipient & { businessName: string }): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Welcome to CymruSites',
    template: {
      preheader: 'Your account is ready — here’s what happens next.',
      heading: `Croeso, ${firstName(opts.name)}`,
      body: paragraphs(
        `Your CymruSites account for <strong>${escapeHtml(opts.businessName)}</strong> is set up.`,
        'The next step is to tell us about your business. It takes about fifteen minutes and you can save it and come back to it whenever you like.',
        'Once we have your details, we start building — and you will have a preview to look at within about a week.',
      ),
      button: { label: 'Start your onboarding', url: absoluteUrl('/onboarding') },
      footnote:
        'If you did not create this account, reply to this email and we will remove it straight away.',
    },
  });
}

export function sendVerificationEmail(opts: Recipient & { verifyUrl: string }): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Confirm your email address',
    template: {
      preheader: 'One click and your CymruSites account is confirmed.',
      heading: 'Confirm your email address',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        'Please confirm your email address so we can send you updates about your website.',
      ),
      button: { label: 'Confirm email address', url: opts.verifyUrl },
      footnote: 'This link expires in 24 hours. If you did not sign up, you can ignore this email.',
    },
  });
}

export function sendPasswordResetEmail(opts: Recipient & { resetUrl: string }): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Reset your CymruSites password',
    template: {
      preheader: 'A link to set a new password.',
      heading: 'Reset your password',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        'Use the button below to set a new password. The link is valid for one hour.',
      ),
      button: { label: 'Set a new password', url: opts.resetUrl },
      footnote:
        'If you did not ask to reset your password, you can ignore this email — your password will not change.',
    },
  });
}

/* ------------------------------------------------------------------ */
/* Orders and billing                                                  */
/* ------------------------------------------------------------------ */

export function sendPurchaseConfirmationEmail(
  opts: Recipient & {
    planName: string;
    setupPence: number;
    monthlyPence: number;
    reference: string;
  },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: `Order confirmed — ${opts.planName} website`,
    template: {
      preheader: 'Payment received. Next: tell us about your business.',
      heading: 'Thank you — your order is confirmed',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        `We have received your payment for the <strong>${escapeHtml(opts.planName)}</strong> package — your setup fee and first month together. Your subscription will then renew automatically each month.`,
        'The next step is the onboarding form. Once that is with us, we start building.',
      ),
      details: [
        { label: 'Package', value: opts.planName },
        { label: 'Setup fee', value: formatPrice(opts.setupPence) },
        { label: 'Monthly from launch', value: `${formatPrice(opts.monthlyPence)}/month` },
        { label: 'Order reference', value: opts.reference },
      ],
      button: { label: 'Start your onboarding', url: absoluteUrl('/onboarding') },
    },
  });
}

export function sendPaymentSucceededEmail(
  opts: Recipient & { amountPence: number; description: string; invoiceUrl?: string | null },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: `Payment received — ${formatPrice(opts.amountPence)}`,
    template: {
      preheader: 'Your monthly payment went through.',
      heading: 'Payment received',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        'Thank you — your payment has gone through and your website continues as normal. Nothing for you to do.',
      ),
      details: [
        { label: 'Amount', value: formatPrice(opts.amountPence) },
        { label: 'For', value: opts.description },
        { label: 'Date', value: formatDate(new Date()) },
      ],
      button: opts.invoiceUrl
        ? { label: 'View invoice', url: opts.invoiceUrl }
        : { label: 'View billing', url: absoluteUrl('/dashboard/billing') },
    },
  });
}

export function sendPaymentFailedEmail(
  opts: Recipient & { amountPence: number; reason?: string | null; updateUrl?: string },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'We couldn’t take your payment',
    template: {
      preheader: 'Please update your card — your website stays up in the meantime.',
      heading: 'We couldn’t take your payment',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        `We tried to take ${escapeHtml(formatPrice(opts.amountPence))} and the payment was declined${
          opts.reason ? ` (${escapeHtml(opts.reason)})` : ''
        }.`,
        'This is usually an expired card. Your website stays online — please update your payment details when you get a moment and we will try again.',
      ),
      button: { label: 'Update payment details', url: opts.updateUrl ?? absoluteUrl('/dashboard/billing') },
      footnote: 'If you think this is a mistake, reply to this email and we will look into it.',
    },
  });
}

export function sendSubscriptionCancelledEmail(
  opts: Recipient & { endsAt?: string | null },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Your CymruSites subscription has been cancelled',
    template: {
      preheader: 'Here’s what happens to your website now.',
      heading: 'Your subscription is cancelled',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        opts.endsAt
          ? `Your subscription has been cancelled. Your website stays live until <strong>${escapeHtml(formatDate(opts.endsAt))}</strong>, which is the end of the period you have already paid for.`
          : 'Your subscription has been cancelled and your website has been taken offline.',
        'Your domain remains registered in your name. If you would like an export of your website content, just ask and we will send it over.',
        'If you change your mind, you can restart at any time from your dashboard — we keep your content for 30 days.',
      ),
      button: { label: 'Restart your plan', url: absoluteUrl('/dashboard/billing') },
    },
  });
}

/* ------------------------------------------------------------------ */
/* Website lifecycle                                                   */
/* ------------------------------------------------------------------ */

export function sendOnboardingStartedEmail(opts: Recipient): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Let’s get your website started',
    template: {
      preheader: 'About fifteen minutes, and you can save as you go.',
      heading: 'Time to tell us about your business',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        'To build your website we need to know what you do, where you work and how customers should reach you.',
        'The form saves as you go, so you can do half of it now and the rest this evening.',
      ),
      button: { label: 'Continue onboarding', url: absoluteUrl('/onboarding') },
      footnote: 'Stuck on any of it? Leave it blank and we will ring you about that part.',
    },
  });
}

export function sendInformationReceivedEmail(
  opts: Recipient & { businessName: string },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'We’ve got everything we need',
    template: {
      preheader: 'Your website build starts now.',
      heading: 'Thank you — that’s everything',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        `We have your details for <strong>${escapeHtml(opts.businessName)}</strong> and your website is now in the build queue.`,
        'We will write your content, lay out your pages and set up the technical side. You will get a preview link within about five working days.',
      ),
      button: { label: 'Track progress', url: absoluteUrl('/dashboard') },
    },
  });
}

export function sendPreviewReadyEmail(
  opts: Recipient & { previewUrl: string; businessName: string },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Your website is ready to look at',
    template: {
      preheader: 'Have a look and tell us what you’d like changed.',
      heading: 'Your website preview is ready',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        `We have finished the first build of <strong>${escapeHtml(opts.businessName)}</strong>. Have a proper look on your phone as well as a computer — that is how most of your customers will see it.`,
        'If anything is wrong or you want something changed, tell us from your dashboard. There is no limit on changes before launch.',
      ),
      button: { label: 'View your preview', url: opts.previewUrl },
      secondaryButton: { label: 'Approve or request changes', url: absoluteUrl('/dashboard/website') },
    },
  });
}

export function sendChangesRequestedEmail(
  opts: Recipient & { summary: string },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'We’re making your changes',
    template: {
      preheader: 'Your requested changes are in hand.',
      heading: 'We’re on it',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        'Thank you — we have your changes and we are working through them now. We will let you know when there is an updated preview to look at.',
        `<strong>What you asked for:</strong><br>${escapeHtml(opts.summary)}`,
      ),
      button: { label: 'View your website', url: absoluteUrl('/dashboard/website') },
    },
  });
}

export function sendWebsiteApprovedEmail(opts: Recipient): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Thanks for approving your website',
    template: {
      preheader: 'Next: connecting your domain.',
      heading: 'Approved — now let’s get you live',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        'Thank you for approving your website. We are now connecting your domain and issuing your SSL certificate.',
        'Domain changes can take up to 48 hours to propagate across the internet. We will email you the moment your site is live.',
      ),
      button: { label: 'Check your domain status', url: absoluteUrl('/dashboard/domain') },
    },
  });
}

export function sendWebsiteLiveEmail(
  opts: Recipient & { websiteUrl: string; businessName: string },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: 'Your website is live',
    template: {
      preheader: 'You’re online. Here’s your address.',
      heading: 'Your website is live',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        `<strong>${escapeHtml(opts.businessName)}</strong> is now online and working. Enquiries from your contact form will be emailed to you and saved in your dashboard.`,
        'A few things worth doing this week: put the address on your van and your invoices, add it to your Google Business Profile, and send it to a few customers who might leave you a review.',
        'When you want anything changed, just email us.',
      ),
      button: { label: 'Visit your website', url: opts.websiteUrl },
      secondaryButton: { label: 'Go to your dashboard', url: absoluteUrl('/dashboard') },
    },
  });
}

/* ------------------------------------------------------------------ */
/* Leads and support                                                   */
/* ------------------------------------------------------------------ */

export function sendNewLeadEmail(
  opts: Recipient & {
    leadName: string;
    leadEmail?: string | null;
    leadPhone?: string | null;
    message: string;
    websiteName: string;
  },
): Promise<SendResult> {
  const details = [{ label: 'Name', value: opts.leadName }];
  if (opts.leadEmail) details.push({ label: 'Email', value: opts.leadEmail });
  if (opts.leadPhone) details.push({ label: 'Phone', value: opts.leadPhone });
  details.push({ label: 'From', value: opts.websiteName });

  return sendEmail({
    to: opts.to,
    replyTo: opts.leadEmail ?? undefined,
    subject: `New enquiry from ${opts.leadName}`,
    template: {
      preheader: `${opts.leadName} has sent an enquiry through your website.`,
      heading: 'You have a new enquiry',
      body: paragraphs(
        'Someone has just filled in the contact form on your website.',
        `<strong>Their message:</strong><br>${escapeHtml(opts.message).replace(/\n/g, '<br>')}`,
      ),
      details,
      button: { label: 'View in your dashboard', url: absoluteUrl('/dashboard/leads') },
      footnote: 'Replying to this email goes straight back to them.',
    },
  });
}

export function sendTicketReceivedEmail(
  opts: Recipient & { reference: string; subject: string },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: `We’ve got your request (${opts.reference})`,
    template: {
      preheader: 'A real person will reply shortly.',
      heading: 'We’ve received your request',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        'Thank you — your support request is with us and someone will reply within one working day.',
      ),
      details: [
        { label: 'Reference', value: opts.reference },
        { label: 'Subject', value: opts.subject },
      ],
      button: { label: 'View your ticket', url: absoluteUrl('/dashboard/support') },
    },
  });
}

export function sendTicketReplyEmail(
  opts: Recipient & { reference: string; subject: string; preview: string; ticketId: string },
): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    subject: `Re: ${opts.subject} (${opts.reference})`,
    template: {
      preheader: 'We’ve replied to your support request.',
      heading: 'We’ve replied to your request',
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        `<strong>Our reply:</strong><br>${escapeHtml(opts.preview).replace(/\n/g, '<br>')}`,
      ),
      button: { label: 'View and reply', url: absoluteUrl(`/dashboard/support/${opts.ticketId}`) },
    },
  });
}

/* ------------------------------------------------------------------ */
/* Internal notifications                                              */
/* ------------------------------------------------------------------ */

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
      button: { label: 'Open in admin', url: absoluteUrl('/admin/leads') },
    },
  });
}

export function sendAdminOrderNotification(opts: {
  businessName: string;
  planName: string;
  amountPence: number;
  customerId: string;
}): Promise<SendResult> {
  return sendEmail({
    to: env.adminEmail,
    subject: `New order — ${opts.businessName} (${opts.planName})`,
    template: {
      preheader: 'A setup fee has been paid.',
      heading: 'New order received',
      body: paragraphs(
        `<strong>${escapeHtml(opts.businessName)}</strong> has purchased the ${escapeHtml(opts.planName)} package.`,
      ),
      details: [
        { label: 'Business', value: opts.businessName },
        { label: 'Package', value: opts.planName },
        { label: 'Setup fee', value: formatPrice(opts.amountPence) },
      ],
      button: { label: 'Open customer', url: absoluteUrl(`/admin/customers/${opts.customerId}`) },
    },
  });
}

export function sendAdminOnboardingNotification(opts: {
  businessName: string;
  customerId: string;
}): Promise<SendResult> {
  return sendEmail({
    to: env.adminEmail,
    subject: `Onboarding submitted — ${opts.businessName}`,
    template: {
      preheader: 'A customer has submitted their website information.',
      heading: 'Onboarding submitted',
      body: paragraphs(
        `<strong>${escapeHtml(opts.businessName)}</strong> has completed their onboarding form. The website is ready to be built.`,
      ),
      button: { label: 'Open customer', url: absoluteUrl(`/admin/customers/${opts.customerId}`) },
    },
  });
}

export function sendAdminTicketNotification(opts: {
  businessName: string;
  reference: string;
  subject: string;
  ticketId: string;
}): Promise<SendResult> {
  return sendEmail({
    to: env.adminEmail,
    subject: `Support: ${opts.subject} — ${opts.businessName}`,
    template: {
      preheader: 'A customer has opened a support ticket.',
      heading: 'New support ticket',
      body: paragraphs(`<strong>${escapeHtml(opts.businessName)}</strong> has opened a support ticket.`),
      details: [
        { label: 'Reference', value: opts.reference },
        { label: 'Subject', value: opts.subject },
      ],
      button: { label: 'Open ticket', url: absoluteUrl(`/admin/support/${opts.ticketId}`) },
    },
  });
}

/** Free-form email an admin composes from the customer record. */
export function sendAdminCustomerEmail(opts: {
  to: string;
  name?: string | null;
  subject: string;
  message: string;
}): Promise<SendResult> {
  return sendEmail({
    to: opts.to,
    replyTo: env.adminEmail,
    subject: opts.subject,
    template: {
      preheader: opts.message.slice(0, 120),
      heading: opts.subject,
      body: paragraphs(
        `Hello ${firstName(opts.name)},`,
        escapeHtml(opts.message).replace(/\n\n/g, '</p><p style="margin:14px 0 0 0;">').replace(/\n/g, '<br>'),
      ),
      button: { label: 'Go to your dashboard', url: absoluteUrl('/dashboard') },
      footnote: 'Replying to this email reaches us directly.',
    },
  });
}
