import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** £299 / £29 — pence in, display string out. */
export function formatPrice(pence: number, options?: { showPence?: boolean; currency?: string }) {
  const { showPence = pence % 100 !== 0, currency = 'GBP' } = options ?? {};
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: showPence ? 2 : 0,
    maximumFractionDigits: showPence ? 2 : 0,
  }).format(pence / 100);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-GB').format(value);
}

export function formatDate(value: string | Date | null | undefined, style: 'short' | 'long' = 'short') {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** "3 days ago" / "in 2 months" — used across dashboards. */
export function formatRelative(value: string | Date | null | undefined) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';

  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['week', 604800000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ];

  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

/** URL/DNS-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

export function initials(name: string | null | undefined, fallback = 'CS'): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const result = parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
  return result || fallback;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function truncate(input: string, length = 120): string {
  if (input.length <= length) return input;
  return `${input.slice(0, length - 1).trimEnd()}…`;
}

/** Very small helper so we never render "null" into the UI. */
export function orDash<T>(value: T | null | undefined): T | '—' {
  return value === null || value === undefined || value === '' ? '—' : value;
}

export function pluralise(count: number, singular: string, plural?: string) {
  return `${formatNumber(count)} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Normalise a UK phone number into a tel: href. */
export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return null;
  return `tel:${cleaned}`;
}

/** Normalise a UK mobile into a wa.me link. */
export function whatsappHref(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) digits = `44${digits.slice(1)}`;
  if (!digits.startsWith('44') && digits.length === 10) digits = `44${digits}`;
  if (digits.length < 11) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}

export function isValidUkPostcode(value: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(value.trim());
}
