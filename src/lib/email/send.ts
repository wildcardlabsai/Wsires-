import 'server-only';

import { Resend } from 'resend';

import { env, isResendConfigured } from '@/lib/env';
import { renderEmail, toPlainText, type EmailLayoutOptions } from './layout';

/**
 * Transactional email.
 *
 * Sending never throws into the calling flow: a customer must not fail to
 * sign up because an email provider had a bad minute. Failures are logged and
 * returned so the caller can decide whether to surface them.
 */

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!isResendConfigured()) return null;
  if (!client) client = new Resend(env.resendApiKey!);
  return client;
}

export interface SendResult {
  sent: boolean;
  id?: string;
  error?: string;
  skipped?: 'not_configured';
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  replyTo?: string;
  template: EmailLayoutOptions;
}): Promise<SendResult> {
  const resend = getClient();

  if (!resend) {
    /* Without RESEND_API_KEY we log what would have gone out, so local
       development and preview environments remain fully usable. */
    console.info(
      `[email] RESEND_API_KEY not set — skipped "${options.subject}" to ${
        Array.isArray(options.to) ? options.to.join(', ') : options.to
      }`,
    );
    return { sent: false, skipped: 'not_configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: env.emailFrom,
      to: options.to,
      subject: options.subject,
      replyTo: options.replyTo,
      html: renderEmail(options.template),
      text: toPlainText(options.template),
    });

    if (error) {
      console.error('[email] send failed', error);
      return { sent: false, error: error.message };
    }
    return { sent: true, id: data?.id };
  } catch (error) {
    console.error('[email] send threw', error);
    return { sent: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
