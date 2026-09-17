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
            'Enquiry details: if you fill in a form on this website, we collect the name, business name, email address, phone number and message you provide.',
            'Business details: anything you tell us about your business during a call, email or onboarding conversation, so that we can quote for and build your website.',
            'Support correspondence: the emails and messages you send us once you are a customer.',
          ],
        },
        {
          heading: 'Why we use it',
          list: [
            'To reply to your enquiry and provide a quote (legitimate interests).',
            'To provide the service you have bought — building, hosting and maintaining your website (performance of a contract).',
            'To send you emails about your account, website and billing (contract).',
            'To provide support when you contact us (contract).',
          ],
        },
        {
          heading: 'Enquiries from your website',
          paragraphs: [
            'If your CymruSites website has a contact form, submissions are emailed straight to you and are not stored on any server we operate. For that data you are the data controller — we simply relay it to you.',
            'You are responsible for how you use those enquiries and for any privacy notice shown on your own website. We will help you get that right if you ask.',
          ],
        },
        {
          heading: 'Who we share it with',
          paragraphs: [
            'We use a small number of carefully chosen processors to run the service. Each one is bound by a data processing agreement and handles only what it needs to.',
          ],
          list: [
            'Vercel — application hosting and content delivery.',
            'Resend — sending transactional email.',
          ],
        },
        {
          heading: 'How long we keep it',
          paragraphs: [
            'Enquiry and contact-form emails live in our mailbox for as long as any mailbox message does — we delete them once they are no longer needed.',
            'We keep financial records for six years, because HMRC requires it.',
          ],
        },
        {
          heading: 'Cookies',
          paragraphs: [
            'This website does not use cookies, and there is no cookie banner because there is nothing to consent to.',
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
            'Data is encrypted in transit. Access to any information you send us is restricted to the people who need it.',
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
