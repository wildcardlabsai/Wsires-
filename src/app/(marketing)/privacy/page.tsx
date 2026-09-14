import type { Metadata } from 'next';

import { LegalPage } from '@/components/marketing/legal-page';
import { getSiteContent } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description:
    'How CymruSites collects, uses and protects personal data, and the rights you have under UK GDPR.',
  alternates: { canonical: '/privacy' },
};

export default async function PrivacyPage() {
  const content = await getSiteContent();

  return (
    <LegalPage
      title="Privacy notice"
      updated="14 September 2026"
      intro={`This notice explains what personal data ${content.brand.name} collects, why we collect it, and what rights you have. We collect as little as we can get away with, and we do not sell any of it.`}
      sections={[
        {
          heading: 'Who we are',
          paragraphs: [
            `${content.brand.name} is the data controller for the information described in this notice. You can reach us at ${content.brand.email}.`,
          ],
        },
        {
          heading: 'What we collect',
          list: [
            'Account details: your name, email address, phone number and password (stored only as a secure hash).',
            'Business details: your business name, address, services, service areas and anything else you provide during onboarding so that we can build your website.',
            'Billing details: your billing address and a Stripe customer reference. We never see or store your card number.',
            'Support correspondence: the tickets and messages you send us.',
            'Website analytics: page views, sessions and referral sources for your website, recorded without cookies or cross-site tracking.',
            'Enquiries from your website: the name, contact details and message of anyone who fills in a form on your site.',
          ],
        },
        {
          heading: 'Why we use it',
          list: [
            'To provide the service you have bought — building, hosting and maintaining your website (performance of a contract).',
            'To take payment and keep accurate financial records (contract and legal obligation).',
            'To send you transactional emails about your account, website and billing (contract).',
            'To provide support when you contact us (contract).',
            'To keep the platform secure and prevent abuse (legitimate interests).',
          ],
        },
        {
          heading: 'Enquiries from your website',
          paragraphs: [
            'When someone fills in a contact form on your website, we store their message so that it appears in your dashboard and email it to you. For that data you are the data controller and we are your processor — we handle it only to pass it to you and never use it for anything else.',
            'You are responsible for how you use those enquiries and for any privacy notice shown on your own website. We will help you get that right if you ask.',
          ],
        },
        {
          heading: 'Who we share it with',
          paragraphs: [
            'We use a small number of carefully chosen processors to run the service. Each one is bound by a data processing agreement and handles only what it needs to.',
          ],
          list: [
            'Supabase — database, authentication and file storage.',
            'Vercel — application hosting and content delivery.',
            'Stripe — payment processing and card handling.',
            'Resend — sending transactional email.',
          ],
        },
        {
          heading: 'How long we keep it',
          paragraphs: [
            'We keep your account and website data for as long as you are a customer, and for 30 days after cancellation so that you can change your mind.',
            'We keep financial records for six years, because HMRC requires it.',
            'Website analytics are kept for 24 months and then deleted.',
            'Support tickets are kept for two years after they are resolved.',
          ],
        },
        {
          heading: 'Cookies',
          paragraphs: [
            'The CymruSites application uses one essential cookie to keep you signed in. We do not use advertising or cross-site tracking cookies, and there is no cookie banner because there is nothing to consent to.',
            'The analytics we provide for your website count page views without setting a tracking cookie or building a profile of individual visitors.',
          ],
        },
        {
          heading: 'Where your data is held',
          paragraphs: [
            'Data is held on servers within the United Kingdom and the European Economic Area wherever possible. Where a processor transfers data outside the UK, it does so under an approved transfer mechanism such as the UK International Data Transfer Addendum.',
          ],
        },
        {
          heading: 'Your rights',
          list: [
            'Ask for a copy of the personal data we hold about you.',
            'Ask us to correct anything that is wrong.',
            'Ask us to delete your data, where we are not required to keep it.',
            'Ask us to restrict or object to how we use it.',
            'Ask for your data in a portable format.',
            'Complain to the Information Commissioner’s Office at ico.org.uk.',
          ],
          paragraphs: [
            `To exercise any of these, email ${content.brand.email}. We will respond within one month.`,
          ],
        },
        {
          heading: 'Security',
          paragraphs: [
            'Data is encrypted in transit and at rest. Access to customer data is restricted to the people who need it, and every database table enforces row-level access rules so one customer can never read another customer’s data.',
            'If a data breach affects your personal data and poses a risk to you, we will tell you and the ICO within 72 hours.',
          ],
        },
        {
          heading: 'Changes to this notice',
          paragraphs: [
            'If we make a material change to this notice we will email customers at least 30 days beforehand. The date at the top always shows when it was last revised.',
          ],
        },
      ]}
      footer={
        <p className="text-sm leading-relaxed text-charcoal-600">
          Any question about your data, however small, goes to{' '}
          <a href={`mailto:${content.brand.email}`} className="font-medium text-cymru-700 hover:underline">
            {content.brand.email}
          </a>
          .
        </p>
      }
    />
  );
}
