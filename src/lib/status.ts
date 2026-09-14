import type {
  ChangeRequestStatus,
  CustomerStatus,
  DomainStatus,
  LeadStatus,
  OrderStatus,
  PaymentStatus,
  SubscriptionStatus,
  TicketStatus,
  WebsiteStatus,
} from '@/types/database';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'cymru'
  | 'demo';

export interface StatusMeta {
  label: string;
  variant: BadgeVariant;
  /** What this means for the customer, in plain English. */
  customerMessage: string;
  /** Position in the production pipeline, for progress indicators. */
  step: number;
  dot: string;
}

/**
 * The website production pipeline. The customer dashboard shows exactly
 * where a site is; admin can move it to any stage.
 */
export const WEBSITE_STATUS: Record<WebsiteStatus, StatusMeta> = {
  lead: {
    label: 'Enquiry',
    variant: 'secondary',
    customerMessage: 'We have your enquiry and will be in touch shortly.',
    step: 0,
    dot: 'bg-charcoal-400',
  },
  purchased: {
    label: 'Purchased',
    variant: 'info',
    customerMessage: 'Thank you — your payment is confirmed. Next, tell us about your business.',
    step: 1,
    dot: 'bg-blue-500',
  },
  awaiting_information: {
    label: 'Awaiting your information',
    variant: 'warning',
    customerMessage:
      'We’re waiting on your business details before we can start. It takes about fifteen minutes.',
    step: 2,
    dot: 'bg-amber-500',
  },
  in_production: {
    label: 'In production',
    variant: 'info',
    customerMessage: 'Our team is building your website now. We’ll send you a preview when it’s ready.',
    step: 3,
    dot: 'bg-blue-500',
  },
  awaiting_customer_approval: {
    label: 'Ready for your review',
    variant: 'cymru',
    customerMessage:
      'Your preview is ready. Have a look and either approve it or tell us what you’d like changed.',
    step: 4,
    dot: 'bg-cymru-500',
  },
  changes_requested: {
    label: 'Changes in progress',
    variant: 'warning',
    customerMessage: 'We’re working through the changes you asked for.',
    step: 4,
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    variant: 'success',
    customerMessage: 'You’ve approved your website. We’re preparing it for launch.',
    step: 5,
    dot: 'bg-moss-500',
  },
  domain_setup: {
    label: 'Connecting domain',
    variant: 'info',
    customerMessage:
      'We’re connecting your domain and issuing your SSL certificate. This can take up to 48 hours.',
    step: 6,
    dot: 'bg-blue-500',
  },
  live: {
    label: 'Live',
    variant: 'success',
    customerMessage: 'Your website is live. Enquiries will appear in your dashboard.',
    step: 7,
    dot: 'bg-moss-500',
  },
  suspended: {
    label: 'Suspended',
    variant: 'danger',
    customerMessage:
      'Your website is temporarily suspended. Please check your billing details or contact support.',
    step: 7,
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'secondary',
    customerMessage: 'This website has been cancelled.',
    step: 7,
    dot: 'bg-charcoal-400',
  },
};

/** The ordered pipeline shown as a progress tracker. */
export const WEBSITE_PIPELINE: WebsiteStatus[] = [
  'purchased',
  'awaiting_information',
  'in_production',
  'awaiting_customer_approval',
  'approved',
  'domain_setup',
  'live',
];

export const WEBSITE_STATUS_OPTIONS = Object.entries(WEBSITE_STATUS).map(([value, meta]) => ({
  value: value as WebsiteStatus,
  label: meta.label,
}));

export const LEAD_STATUS: Record<LeadStatus, { label: string; variant: BadgeVariant }> = {
  new: { label: 'New', variant: 'cymru' },
  contacted: { label: 'Contacted', variant: 'info' },
  qualified: { label: 'Qualified', variant: 'warning' },
  won: { label: 'Won', variant: 'success' },
  lost: { label: 'Lost', variant: 'secondary' },
};

export const TICKET_STATUS: Record<TicketStatus, { label: string; variant: BadgeVariant }> = {
  open: { label: 'Open', variant: 'cymru' },
  in_progress: { label: 'In progress', variant: 'info' },
  waiting_for_customer: { label: 'Waiting for you', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
};

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
  website_changes: 'Website changes',
  technical: 'Technical problem',
  billing: 'Billing',
  domain_email: 'Domain or email',
  new_feature: 'Something new',
  other: 'Something else',
};

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; variant: BadgeVariant }> = {
  incomplete: { label: 'Incomplete', variant: 'warning' },
  incomplete_expired: { label: 'Expired', variant: 'secondary' },
  trialing: { label: 'Trial', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  past_due: { label: 'Past due', variant: 'danger' },
  canceled: { label: 'Cancelled', variant: 'secondary' },
  unpaid: { label: 'Unpaid', variant: 'danger' },
  paused: { label: 'Paused', variant: 'warning' },
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'warning' },
  succeeded: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'secondary' },
};

export const DOMAIN_STATUS: Record<DomainStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'warning' },
  connected: { label: 'Connected', variant: 'info' },
  verified: { label: 'Verified', variant: 'info' },
  live: { label: 'Live', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
};

export const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Active', variant: 'success' },
  suspended: { label: 'Suspended', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

export const CHANGE_REQUEST_STATUS: Record<ChangeRequestStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Awaiting review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Not applied', variant: 'secondary' },
  applied: { label: 'Live on your site', variant: 'success' },
};

export const INDUSTRY_LABELS: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  building: 'Building',
  roofing: 'Roofing',
  landscaping: 'Landscaping',
  automotive: 'Automotive',
  hospitality: 'Hospitality',
  professional_services: 'Professional services',
  other: 'Other',
};

export function industryLabel(value: string | null | undefined): string {
  if (!value) return 'Other';
  return INDUSTRY_LABELS[value] ?? value.replace(/_/g, ' ');
}
