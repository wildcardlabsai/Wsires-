import type { Metadata } from 'next';

import { LegalPage } from '@/components/marketing/legal-page';
import { getSiteContent } from '@/lib/content/settings';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'The terms on which CymruSites provides website design, hosting and maintenance services.',
  alternates: { canonical: '/terms' },
};

export default async function TermsPage() {
  const content = await getSiteContent();

  return (
    <LegalPage
      title="Terms of service"
      updated="14 September 2026"
      intro={`These terms set out the agreement between you and ${content.brand.name} when you buy a website package from us. We have tried to write them in plain English. If anything is unclear, ask us before you sign up and we will explain it.`}
      sections={[
        {
          heading: 'What we provide',
          paragraphs: [
            'We design, build, host and maintain a website for your business according to the package you choose. The specification of each package — the number of pages and the features included — is set out on our pricing page at the time you purchase.',
            'We write the initial content for your website based on the information you give us during onboarding. You are responsible for checking that content for accuracy before approving it.',
          ],
        },
        {
          heading: 'Fees and payment',
          paragraphs: [
            'Each package has a one-off setup fee and a recurring monthly fee. The setup fee is payable before we begin work. The monthly fee begins when your website goes live, and we will agree a payment method with you — by card, bank transfer or invoice.',
            'If a monthly payment is missed, we will contact you. If payment remains outstanding after 14 days we may suspend your website until the account is brought up to date.',
          ],
        },
        {
          heading: 'Your responsibilities',
          list: [
            'Provide accurate information about your business during onboarding.',
            'Check and approve your website before it goes live.',
            'Ensure you hold the rights to any logo, photographs or text you send us.',
            'Keep your contact and billing details up to date.',
            'Comply with the law in anything you ask us to publish.',
          ],
        },
        {
          heading: 'Changes and support',
          paragraphs: [
            'Your monthly fee includes support and website changes at the level described for your package. Minor updates — contact details, opening hours, text corrections, photograph swaps and pricing changes — are included on every package.',
            'Substantial new work, such as adding pages beyond your package limit, a redesign, or building new functionality, is quoted separately before we start.',
            'We aim to make requested changes within two working days. Priority support customers are prioritised within the same queue.',
          ],
        },
        {
          heading: 'Ownership',
          paragraphs: [
            'You own your domain name. Where we register one on your behalf it is registered in your name and we will transfer it to another registrar on request.',
            'You own the content of your website — your text, photographs and business information. On cancellation we will export it for you in a usable format.',
            'We retain ownership of the underlying platform, templates and code that power the website. You are licensed to use them for as long as your subscription is active.',
          ],
        },
        {
          heading: 'Cancellation',
          paragraphs: [
            'You may cancel your monthly subscription at any time by emailing or calling us. Your website remains live until the end of the period you have already paid for.',
            'The setup fee is not refundable once work has begun, because it pays for work already completed. If you cancel before we have started building, we will refund it in full.',
            'We may cancel your service with 30 days’ notice, or immediately if you use the service unlawfully or fail to pay.',
          ],
        },
        {
          heading: 'Availability',
          paragraphs: [
            'We aim for 99.9% uptime and monitor all sites continuously, but we do not guarantee uninterrupted service. Scheduled maintenance is carried out outside normal business hours wherever possible.',
            'We take daily backups of every website and can restore from them if something goes wrong.',
          ],
        },
        {
          heading: 'Liability',
          paragraphs: [
            'We provide our services with reasonable skill and care. We are not liable for loss of profit, loss of business or indirect losses arising from your use of the website.',
            'Our total liability in any twelve month period is limited to the total fees you have paid us in that period.',
            'Nothing in these terms limits liability for death, personal injury or fraud.',
          ],
        },
        {
          heading: 'Search engine performance',
          paragraphs: [
            'We build every website following current search engine best practice and set up the technical foundations for local search. We cannot guarantee any particular ranking position, and we would be suspicious of anyone who does.',
          ],
        },
        {
          heading: 'Changes to these terms',
          paragraphs: [
            'We may update these terms from time to time. If we make a material change we will email you at least 30 days before it takes effect. Continuing to use the service after that constitutes acceptance.',
          ],
        },
        {
          heading: 'Governing law',
          paragraphs: [
            'These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction.',
          ],
        },
      ]}
      footer={
        <p className="text-sm leading-relaxed text-charcoal-600">
          Questions about these terms? Email{' '}
          <a href={`mailto:${content.brand.email}`} className="font-medium text-cymru-700 hover:underline">
            {content.brand.email}
          </a>{' '}
          and we will answer them properly.
        </p>
      }
    />
  );
}
