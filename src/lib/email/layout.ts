import { absoluteUrl, env } from '@/lib/env';

/**
 * Branded HTML email shell.
 *
 * Written as inline-styled tables because that is what email clients
 * reliably render. The palette matches the application: cream paper,
 * charcoal ink, a single Cymru red accent.
 */

export interface EmailButton {
  label: string;
  url: string;
}

export interface EmailLayoutOptions {
  preheader: string;
  heading: string;
  body: string;
  button?: EmailButton;
  secondaryButton?: EmailButton;
  footnote?: string;
  /** Rendered as a bordered detail panel, e.g. order summaries. */
  details?: { label: string; value: string }[];
}

const INK = '#1C1B19';
const MUTED = '#6B675F';
const ACCENT = '#C8102E';
const BORDER = '#E8E4DC';
const PAPER = '#FAF7F2';

export function renderEmail({
  preheader,
  heading,
  body,
  button,
  secondaryButton,
  footnote,
  details,
}: EmailLayoutOptions): string {
  const year = new Date().getFullYear();

  const detailRows = details
    ?.map(
      (row) => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${MUTED};">${escapeHtml(row.label)}</td>
          <td style="padding:8px 0;font-size:14px;color:${INK};font-weight:600;text-align:right;">${escapeHtml(row.value)}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">

        <tr>
          <td style="padding:28px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <div style="width:30px;height:30px;background-color:${INK};border-radius:7px;text-align:center;line-height:30px;">
                    <span style="color:${ACCENT};font-size:16px;font-weight:700;">▲</span>
                  </div>
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:17px;font-weight:600;color:${INK};letter-spacing:-0.02em;">Cymru<span style="color:${ACCENT};">Sites</span></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px 0 32px;">
            <h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:23px;line-height:1.25;font-weight:600;color:${INK};letter-spacing:-0.02em;">${escapeHtml(heading)}</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${MUTED};">
            ${body}
          </td>
        </tr>

        ${
          detailRows
            ? `<tr><td style="padding:24px 32px 0 32px;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};border:1px solid ${BORDER};border-radius:8px;padding:14px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                   ${detailRows}
                 </table>
               </td></tr>`
            : ''
        }

        ${
          button
            ? `<tr><td style="padding:28px 32px 0 32px;">
                 <table role="presentation" cellpadding="0" cellspacing="0">
                   <tr><td style="background-color:${ACCENT};border-radius:6px;">
                     <a href="${escapeAttr(button.url)}" style="display:inline-block;padding:13px 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(button.label)}</a>
                   </td></tr>
                 </table>
               </td></tr>`
            : ''
        }

        ${
          secondaryButton
            ? `<tr><td style="padding:14px 32px 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;">
                 <a href="${escapeAttr(secondaryButton.url)}" style="color:${MUTED};text-decoration:underline;">${escapeHtml(secondaryButton.label)}</a>
               </td></tr>`
            : ''
        }

        ${
          footnote
            ? `<tr><td style="padding:26px 32px 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#87837A;">${footnote}</td></tr>`
            : ''
        }

        <tr>
          <td style="padding:32px 32px 28px 32px;">
            <div style="border-top:1px solid ${BORDER};padding-top:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#87837A;">
              <p style="margin:0 0 6px 0;">CymruSites — professional websites for Welsh businesses.</p>
              <p style="margin:0;">
                <a href="${absoluteUrl('/contact')}" style="color:#87837A;text-decoration:underline;">Contact us</a> ·
                <a href="${absoluteUrl('/privacy')}" style="color:#87837A;text-decoration:underline;">Privacy</a>
              </p>
              <p style="margin:10px 0 0 0;">© ${year} CymruSites · ${escapeHtml(env.rootDomain)}</p>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;');
}

/** `<p>` paragraphs from plain strings, escaped. */
export function paragraphs(...lines: string[]): string {
  return lines
    .map((line, i) => `<p style="margin:${i === 0 ? '0' : '14px 0 0 0'};">${line}</p>`)
    .join('');
}

/** Plain-text alternative, so the email is readable without HTML. */
export function toPlainText(options: EmailLayoutOptions): string {
  const parts = [options.heading, '', stripTags(options.body)];
  if (options.details?.length) {
    parts.push('');
    for (const detail of options.details) parts.push(`${detail.label}: ${detail.value}`);
  }
  if (options.button) parts.push('', `${options.button.label}: ${options.button.url}`);
  if (options.footnote) parts.push('', stripTags(options.footnote));
  parts.push('', '—', 'CymruSites — professional websites for Welsh businesses.');
  return parts.join('\n');
}

function stripTags(html: string): string {
  return html
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
