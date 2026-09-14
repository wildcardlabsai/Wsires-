/**
 * Database types for the CymruSites Supabase schema.
 *
 * Mirrors supabase/migrations/*.sql. Regenerate with:
 *   supabase gen types typescript --linked > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type UserRole = 'customer' | 'admin';
export type CustomerStatus = 'active' | 'suspended' | 'cancelled';

export type WebsiteStatus =
  | 'lead'
  | 'purchased'
  | 'awaiting_information'
  | 'in_production'
  | 'awaiting_customer_approval'
  | 'changes_requested'
  | 'approved'
  | 'domain_setup'
  | 'live'
  | 'suspended'
  | 'cancelled';

export type SiteLocale = 'en' | 'cy';
export type SiteLanguageMode = 'en' | 'cy' | 'bilingual';

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type OrderKind = 'setup' | 'subscription' | 'one_off';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export type DomainStatus = 'pending' | 'connected' | 'verified' | 'live' | 'failed';
export type DnsStatus = 'pending' | 'propagating' | 'verified' | 'failed';
export type SslStatus = 'pending' | 'issuing' | 'active' | 'failed';
export type DomainKind = 'custom' | 'subdomain';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory =
  | 'website_changes'
  | 'technical'
  | 'billing'
  | 'domain_email'
  | 'new_feature'
  | 'other';

export type MediaKind = 'logo' | 'photo' | 'gallery' | 'attachment' | 'template_preview';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected' | 'applied';
export type OnboardingStatus = 'draft' | 'submitted';
export type AnalyticsEventType = 'pageview' | 'session_start' | 'enquiry';
export type NotificationType =
  | 'account'
  | 'order'
  | 'website'
  | 'billing'
  | 'support'
  | 'lead'
  | 'domain'
  | 'system';

/* ------------------------------------------------------------------ */
/* Row shapes                                                          */
/* ------------------------------------------------------------------ */

interface Timestamped {
  created_at: string;
  updated_at: string;
}

export interface ProfileRow extends Timestamped {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_demo: boolean;
  last_seen_at: string | null;
}

export interface PlanRow extends Timestamped {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  setup_price_pence: number;
  monthly_price_pence: number;
  currency: string;
  max_pages: number;
  features: string[];
  stripe_setup_price_id: string | null;
  stripe_monthly_price_id: string | null;
  stripe_product_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface CustomerRow extends Timestamped {
  id: string;
  profile_id: string;
  business_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  status: CustomerStatus;
  stripe_customer_id: string | null;
  plan_id: string | null;
  is_demo: boolean;
}

export interface OpeningHour {
  day: string;
  opens: string | null;
  closes: string | null;
  closed: boolean;
}

export interface BusinessService {
  title: string;
  description?: string;
  icon?: string;
  image_url?: string;
  price_from?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  x?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
}

export interface BrandColors {
  primary?: string;
  secondary?: string;
  scheme?: string;
}

export interface BusinessRow extends Timestamped {
  id: string;
  customer_id: string;
  name: string;
  industry: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  whatsapp_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  google_maps_url: string | null;
  google_business_profile_url: string | null;
  companies_house_number: string | null;
  vat_number: string | null;
  services: BusinessService[];
  service_areas: string[];
  opening_hours: OpeningHour[];
  social_links: SocialLinks;
  brand_colors: BrandColors;
  logo_url: string | null;
  accreditations: string[];
  is_demo: boolean;
}

export interface TemplateStyleTokens {
  accent?: string;
  surface?: string;
  ink?: string;
  muted?: string;
  headingFont?: 'sans' | 'display';
  layout?: string;
  radius?: string;
  heroStyle?: string;
  navStyle?: string;
}

export interface WebsiteTemplateRow extends Timestamped {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  best_for: string | null;
  preview_image_url: string | null;
  style_tokens: TemplateStyleTokens;
  supported_sections: string[];
  default_sections: string[];
  is_active: boolean;
  sort_order: number;
}

export interface WebsiteSeo {
  title?: string;
  description?: string;
  og_image?: string;
  keywords?: string[];
  noindex?: boolean;
  canonical?: string;
}

export interface WebsiteTheme {
  accent?: string;
  surface?: string;
  ink?: string;
  muted?: string;
  scheme?: string;
}

export interface WebsiteRow extends Timestamped {
  id: string;
  customer_id: string;
  business_id: string | null;
  template_id: string | null;
  plan_id: string | null;
  name: string;
  slug: string;
  subdomain: string | null;
  status: WebsiteStatus;
  language_mode: SiteLanguageMode;
  default_locale: SiteLocale;
  theme: WebsiteTheme;
  seo: WebsiteSeo;
  preview_token: string;
  primary_domain: string | null;
  requested_pages: string[];
  launch_notes: string | null;
  published_at: string | null;
  last_updated_by: string | null;
  is_demo: boolean;
}

export interface WebsiteStatusHistoryRow {
  id: string;
  website_id: string;
  from_status: WebsiteStatus | null;
  to_status: WebsiteStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface WebsitePageRow extends Timestamped {
  id: string;
  website_id: string;
  slug: string;
  page_type: string;
  title: string;
  nav_label: string | null;
  show_in_nav: boolean;
  show_in_footer: boolean;
  is_published: boolean;
  is_home: boolean;
  sort_order: number;
  seo: WebsiteSeo;
}

export interface WebsiteContentRow extends Timestamped {
  id: string;
  website_id: string;
  page_id: string | null;
  section_key: string;
  section_type: string;
  locale: SiteLocale;
  data: Record<string, Json>;
  is_visible: boolean;
  sort_order: number;
}

export interface ContentChangeRequestRow extends Timestamped {
  id: string;
  website_id: string;
  customer_id: string;
  submitted_by: string | null;
  target_table: string;
  target_id: string | null;
  summary: string;
  changes: Record<string, Json>;
  status: ChangeRequestStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface MediaRow extends Timestamped {
  id: string;
  customer_id: string | null;
  website_id: string | null;
  uploaded_by: string | null;
  bucket: string;
  storage_path: string;
  public_url: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  kind: MediaKind;
  alt_text: string | null;
  is_demo: boolean;
}

export interface DomainRow extends Timestamped {
  id: string;
  customer_id: string;
  website_id: string | null;
  domain: string;
  kind: DomainKind;
  status: DomainStatus;
  dns_status: DnsStatus;
  ssl_status: SslStatus;
  is_primary: boolean;
  registrar: string | null;
  verification_token: string;
  notes: string | null;
  verified_at: string | null;
  live_at: string | null;
  is_demo: boolean;
}

export interface SubscriptionRow extends Timestamped {
  id: string;
  customer_id: string;
  plan_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  amount_pence: number;
  currency: string;
  is_demo: boolean;
}

export interface OrderRow extends Timestamped {
  id: string;
  customer_id: string;
  plan_id: string | null;
  website_id: string | null;
  kind: OrderKind;
  reference: string;
  status: OrderStatus;
  amount_pence: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  metadata: Record<string, Json>;
  paid_at: string | null;
  is_demo: boolean;
}

export interface PaymentRow extends Timestamped {
  id: string;
  customer_id: string;
  order_id: string | null;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  stripe_charge_id: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  receipt_url: string | null;
  description: string | null;
  amount_pence: number;
  currency: string;
  status: PaymentStatus;
  failure_reason: string | null;
  paid_at: string | null;
  is_demo: boolean;
}

export interface StripeEventRow {
  id: string;
  type: string;
  payload: Json | null;
  processed_at: string;
}

export interface OnboardingSubmissionRow extends Timestamped {
  id: string;
  customer_id: string;
  website_id: string | null;
  plan_id: string | null;
  status: OnboardingStatus;
  current_step: number;
  data: Record<string, Json>;
  submitted_at: string | null;
  is_demo: boolean;
}

export interface LeadRow extends Timestamped {
  id: string;
  customer_id: string;
  website_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  service: string | null;
  source: string;
  page_url: string | null;
  status: LeadStatus;
  notes: string | null;
  contacted_at: string | null;
  is_demo: boolean;
}

export interface ContactSubmissionRow extends Timestamped {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  business_type: string | null;
  current_website: string | null;
  requirement: string | null;
  budget: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  handled_by: string | null;
  notes: string | null;
  is_demo: boolean;
}

export interface SupportTicketRow extends Timestamped {
  id: string;
  customer_id: string;
  website_id: string | null;
  reference: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  created_by: string | null;
  assigned_to: string | null;
  last_message_at: string;
  resolved_at: string | null;
  is_demo: boolean;
}

export interface TicketAttachment {
  name: string;
  url: string;
  size?: number;
  mime_type?: string;
}

export interface SupportMessageRow {
  id: string;
  ticket_id: string;
  author_id: string | null;
  author_role: UserRole;
  author_name: string | null;
  body: string;
  is_internal: boolean;
  attachments: TicketAttachment[];
  created_at: string;
}

export interface NotificationRow {
  id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface AdminNoteRow {
  id: string;
  customer_id: string | null;
  website_id: string | null;
  author_id: string | null;
  author_name: string | null;
  body: string;
  is_demo: boolean;
  created_at: string;
}

export interface AnalyticsEventRow {
  id: string;
  website_id: string;
  event_type: AnalyticsEventType;
  path: string;
  page_title: string | null;
  referrer: string | null;
  source: string;
  session_id: string | null;
  device: string | null;
  country: string | null;
  locale: SiteLocale | null;
  is_demo: boolean;
  occurred_at: string;
}

export interface AnalyticsDailyRow extends Timestamped {
  id: string;
  website_id: string;
  date: string;
  pageviews: number;
  sessions: number;
  enquiries: number;
  top_pages: { path: string; views: number }[];
  sources: { source: string; visits: number }[];
  is_demo: boolean;
}

export interface SettingRow extends Timestamped {
  key: string;
  value: Json;
  group_name: string;
  label: string | null;
  description: string | null;
  updated_by: string | null;
}

/* ------------------------------------------------------------------ */
/* Database shape                                                      */
/* ------------------------------------------------------------------ */

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, 'id' | 'email'>;
      plans: Table<PlanRow, 'slug' | 'name'>;
      customers: Table<CustomerRow, 'profile_id' | 'business_name' | 'email'>;
      businesses: Table<BusinessRow, 'customer_id' | 'name'>;
      website_templates: Table<WebsiteTemplateRow, 'slug' | 'name'>;
      websites: Table<WebsiteRow, 'customer_id' | 'name' | 'slug'>;
      website_status_history: Table<WebsiteStatusHistoryRow, 'website_id' | 'to_status'>;
      website_pages: Table<WebsitePageRow, 'website_id' | 'slug' | 'title'>;
      website_content: Table<WebsiteContentRow, 'website_id' | 'section_key' | 'section_type'>;
      content_change_requests: Table<
        ContentChangeRequestRow,
        'website_id' | 'customer_id' | 'target_table' | 'summary'
      >;
      media: Table<MediaRow, 'storage_path' | 'file_name' | 'mime_type'>;
      domains: Table<DomainRow, 'customer_id' | 'domain'>;
      subscriptions: Table<SubscriptionRow, 'customer_id'>;
      orders: Table<OrderRow, 'customer_id'>;
      payments: Table<PaymentRow, 'customer_id'>;
      stripe_events: Table<StripeEventRow, 'id' | 'type'>;
      onboarding_submissions: Table<OnboardingSubmissionRow, 'customer_id'>;
      leads: Table<LeadRow, 'customer_id' | 'name'>;
      contact_submissions: Table<ContactSubmissionRow, 'name' | 'email'>;
      support_tickets: Table<SupportTicketRow, 'customer_id' | 'subject'>;
      support_messages: Table<SupportMessageRow, 'ticket_id' | 'body'>;
      notifications: Table<NotificationRow, 'profile_id' | 'title'>;
      admin_notes: Table<AdminNoteRow, 'body'>;
      analytics_events: Table<AnalyticsEventRow, 'website_id'>;
      analytics_daily: Table<AnalyticsDailyRow, 'website_id' | 'date'>;
      settings: Table<SettingRow, 'key' | 'value'>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      my_customer_id: { Args: Record<string, never>; Returns: string };
      owns_customer: { Args: { target: string }; Returns: boolean };
      owns_website: { Args: { target: string }; Returns: boolean };
      rollup_analytics_daily: { Args: { target_date?: string }; Returns: undefined };
    };
    Enums: {
      user_role: UserRole;
      customer_status: CustomerStatus;
      website_status: WebsiteStatus;
      site_locale: SiteLocale;
      site_language_mode: SiteLanguageMode;
      subscription_status: SubscriptionStatus;
      order_status: OrderStatus;
      order_kind: OrderKind;
      payment_status: PaymentStatus;
      domain_status: DomainStatus;
      dns_status: DnsStatus;
      ssl_status: SslStatus;
      domain_kind: DomainKind;
      lead_status: LeadStatus;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      ticket_category: TicketCategory;
      media_kind: MediaKind;
      change_request_status: ChangeRequestStatus;
      onboarding_status: OnboardingStatus;
      analytics_event_type: AnalyticsEventType;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
}
