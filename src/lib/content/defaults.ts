import type { Faq, IndustryContent, PortfolioExample, SiteContent, Testimonial } from './types';

/**
 * Default marketing copy.
 *
 * Every block here is overridable from Admin → Content, which writes the same
 * keys into the `settings` table. These defaults are what the site falls back
 * to, so a fresh install is never blank.
 */

export const defaultSiteContent: SiteContent = {
  brand: {
    name: 'CymruSites',
    tagline: 'Professional websites for Welsh businesses. Made simple.',
    email: 'hello@cymrusites.co.uk',
    phone: '029 2000 0000',
    addressLines: ['CymruSites', 'Cardiff', 'Wales'],
    social: {},
  },

  hero: {
    eyebrow: 'Websites for Welsh businesses',
    heading: 'Professional websites for Welsh businesses.',
    subheading:
      'Get a modern, mobile-friendly website without the agency price tag or the hassle. We build, host and maintain your website for you.',
    primaryCta: { label: 'Get your website started', href: '/signup' },
    secondaryCta: { label: 'See examples', href: '/examples' },
    bullets: [
      'Live in about two weeks',
      'Hosting, SSL and updates included',
      'No contracts you can’t leave',
    ],
  },

  trustStrip: {
    heading: 'Trusted by Welsh businesses',
    items: [
      'Plumbers',
      'Electricians',
      'Builders',
      'Roofers',
      'Landscapers',
      'Garages',
      'Cafés',
      'Accountants',
    ],
    stats: [
      { value: '14 days', label: 'Typical time to launch' },
      { value: 'From £29', label: 'Per month, all-in' },
      { value: '100%', label: 'Built and hosted in-house' },
    ],
  },

  promise: {
    heading: 'You run your business. We’ll run your website.',
    body: 'Most tradespeople we speak to have either no website, or one a relative built years ago that nobody can log into any more. We fix that properly — and then we look after it.',
    points: [
      'You don’t need to understand websites.',
      'You don’t need to deal with hosting, domains or SSL certificates.',
      'You don’t need to hire an expensive agency or pay for hours you don’t use.',
      'We build it. We host it. We maintain it. You run your business.',
    ],
  },

  howItWorks: {
    heading: 'How it works',
    subheading: 'Five steps, and only one of them needs anything from you.',
    steps: [
      {
        title: 'Tell us about your business',
        description:
          'A short form covering what you do, where you work and who you help. Around fifteen minutes, and you can save and come back to it.',
        detail: 'Fifteen minutes of your time',
      },
      {
        title: 'We build your website',
        description:
          'We write the words, lay out the pages and set everything up properly — including the technical bits nobody wants to think about.',
        detail: 'Usually 5–7 working days',
      },
      {
        title: 'You approve it',
        description:
          'We send you a private preview link. Have a look on your phone, share it with whoever you like, and tell us what you want changed.',
        detail: 'Unlimited changes before launch',
      },
      {
        title: 'We launch it',
        description:
          'We connect your domain, install your SSL certificate and put your site live. If you don’t have a domain yet, we’ll sort one.',
        detail: 'Domain and SSL included',
      },
      {
        title: 'We keep it running',
        description:
          'Hosting, backups, security updates and content changes are all part of your monthly plan. Email or ring when you need something changed.',
        detail: 'Included every month',
      },
    ],
  },

  whyUs: {
    heading: 'Why CymruSites',
    subheading: 'Built for small Welsh businesses, priced like it.',
    items: [
      {
        title: 'A fair monthly price',
        description:
          'A one-off setup fee and a clear monthly cost. No surprise invoices, no hourly rates, no charge every time you need a phone number changed.',
        icon: 'wallet',
      },
      {
        title: 'We do the work',
        description:
          'You will not be handed a login to a page builder and wished luck. Tell us what you need changed and we change it.',
        icon: 'hammer',
      },
      {
        title: 'Found by local customers',
        description:
          'Every site is set up for local search from day one — your towns, your services, your Google Business Profile.',
        icon: 'map-pin',
      },
      {
        title: 'Fast on a phone',
        description:
          'Most of your customers will find you on a mobile, standing in their kitchen. Our sites are built for that first.',
        icon: 'smartphone',
      },
      {
        title: 'Welsh and bilingual',
        description:
          'Proper Welsh content where you want it, written and reviewed by people — not machine translated and left.',
        icon: 'languages',
      },
      {
        title: 'You own your website',
        description:
          'Your domain stays in your name and your content is yours. If you ever leave, we hand it over properly.',
        icon: 'shield-check',
      },
    ],
  },

  included: {
    heading: 'What’s included',
    subheading: 'Every plan, no exceptions.',
    items: [
      'Design and build by a real person',
      'Written content for every page',
      'Mobile, tablet and desktop layouts',
      'Hosting on fast UK-facing infrastructure',
      'SSL certificate and automatic renewal',
      'Contact form that emails you instantly',
      'Enquiries collected in your dashboard',
      'WhatsApp and click-to-call buttons',
      'Google Maps and directions',
      'Search engine basics done properly',
      'Daily backups',
      'Website changes when you need them',
    ],
  },

  welsh: {
    heading: 'Welsh and bilingual websites',
    body: 'If your customers speak Welsh, your website should too. We build genuine bilingual sites with a language switch, separate content for each language and correct metadata — not an automatic translation nobody has read.',
    points: [
      'Separate English and Welsh content, stored properly',
      'A language switch your customers will actually find',
      'Welsh copy written or reviewed by a person before it goes live',
      'Correct hreflang and metadata so search engines index both',
    ],
  },

  localSeo: {
    heading: 'Found by people nearby',
    body: 'Being on the internet is not the same as being found. Every CymruSites website is set up so that when someone in your area searches for what you do, you have a chance of appearing.',
    points: [
      'A page for each town or area you cover',
      'LocalBusiness structured data so Google understands who you are',
      'Google Business Profile connected and consistent',
      'Page titles and descriptions written for real searches',
      'Fast loading — a slow site ranks worse and loses customers',
    ],
  },

  testimonials: defaultTestimonials(),
  faqs: defaultFaqs(),

  finalCta: {
    heading: 'Ready for a website you don’t have to think about?',
    body: 'Tell us about your business and we’ll take it from there. No obligation, and we’ll tell you honestly if we’re not the right fit.',
    primary: 'Get your website started',
    secondary: 'See how it works',
  },

  seo: {
    title: 'CymruSites — Professional websites for Welsh businesses',
    description:
      'Affordable, professionally designed websites for small businesses across Wales. We build, host and maintain your website for you. From £299 setup and £29 a month.',
  },
};

function defaultTestimonials(): Testimonial[] {
  return [
    {
      quote:
        'I had put off getting a website for about four years because I thought it would be a nightmare. It took one phone call and a form. Two weeks later I was getting enquiries through it.',
      author: 'Gareth L.',
      role: 'Plumbing & heating',
      location: 'Pontypridd',
      rating: 5,
    },
    {
      quote:
        'The bit I actually value is that when I want something changed, I email them and it’s done. I don’t have to log into anything or remember a password.',
      author: 'Siân M.',
      role: 'Electrical contractor',
      location: 'Caerphilly',
      rating: 5,
    },
    {
      quote:
        'We wanted it in Welsh and English and everyone else quoted us a fortune for it. CymruSites did both properly and it reads like a person wrote it, because one did.',
      author: 'Dylan R.',
      role: 'Landscaping',
      location: 'Aberdare',
      rating: 5,
    },
    {
      quote:
        'Straightforward pricing was what sold it. I know exactly what I pay each month and it hasn’t changed.',
      author: 'Hayley P.',
      role: 'Independent garage',
      location: 'Bridgend',
      rating: 5,
    },
  ];
}

function defaultFaqs(): Faq[] {
  return [
    {
      question: 'How long does it take to get my website live?',
      answer:
        'Most websites go live within two weeks of us receiving your information. The build itself takes five to seven working days; the rest is your review and connecting your domain. If you need it faster, tell us — we can often prioritise.',
      category: 'Getting started',
    },
    {
      question: 'What do I actually have to do?',
      answer:
        'Fill in one form about your business — what you do, where you work, your phone number and a few photos if you have them. That is around fifteen minutes and you can save it and come back. After that you review the site we build and tell us about anything you want changed.',
      category: 'Getting started',
    },
    {
      question: 'What if I don’t have any photos?',
      answer:
        'That is very common and it is not a problem. We use high quality stock photography that suits your trade, and you can send us your own photos later at any time — we will swap them in for you.',
      category: 'Getting started',
    },
    {
      question: 'Do I need to buy a domain name first?',
      answer:
        'No. If you already have one we will connect it. If you do not, we will help you choose and register one — and it stays registered in your name, not ours.',
      category: 'Domains & hosting',
    },
    {
      question: 'Who owns the website?',
      answer:
        'You own your domain name and your content. The website is built and hosted on our platform as part of your monthly plan, in the same way as most website care plans. If you decide to leave, we will export your content and hand over your domain properly.',
      category: 'Domains & hosting',
    },
    {
      question: 'What does the monthly fee cover?',
      answer:
        'Hosting, your SSL certificate, daily backups, security updates, monitoring, support and website changes. On Business and Pro it also covers ongoing content updates. There is nothing else to buy.',
      category: 'Pricing',
    },
    {
      question: 'Is there a long contract?',
      answer:
        'No. The monthly plan runs month to month and you can cancel from your dashboard at any time. Your website stays live until the end of the period you have paid for.',
      category: 'Pricing',
    },
    {
      question: 'Can I change my plan later?',
      answer:
        'Yes. You can move up a plan at any time from your billing page and the change applies immediately, pro-rated. Moving down takes effect at your next renewal.',
      category: 'Pricing',
    },
    {
      question: 'Can I make changes to the website myself?',
      answer:
        'We deliberately do not hand you a page builder to fight with. When you want something changed — a phone number, opening hours, a new photo, a testimonial — you tell us from your dashboard and we make the change. You can still upload photos and review your enquiries yourself; the site itself is looked after by us.',
      category: 'Managing your site',
    },
    {
      question: 'How many changes are included?',
      answer:
        'Starter includes minor updates such as contact details, text corrections and photo swaps. Business includes monthly content updates. Pro includes more frequent updates and priority turnaround. We have never actually charged anyone extra for a sensible request.',
      category: 'Managing your site',
    },
    {
      question: 'Do you build websites in Welsh?',
      answer:
        'Yes. We build English-only, Welsh-only and fully bilingual websites. Bilingual sites are included from the Business plan upward. We do not simply run your English text through a translator — Welsh content is written or reviewed by a person.',
      category: 'Welsh & bilingual',
    },
    {
      question: 'Will my website appear on Google?',
      answer:
        'Every site is built with the search basics done properly and submitted to Google. For local searches we set up location pages, LocalBusiness structured data and your Google Business Profile. Nobody honest can guarantee a ranking position, but we give you a genuine foundation.',
      category: 'Being found',
    },
    {
      question: 'What happens to enquiries from my website?',
      answer:
        'They are emailed to you straight away and also saved in your dashboard, so nothing gets lost in a spam folder. You can mark each one as contacted, quoted, won or lost.',
      category: 'Being found',
    },
    {
      question: 'Do you work with businesses outside Wales?',
      answer:
        'Our focus is Welsh businesses and that is what we are set up for. If you are just over the border and you like what we do, get in touch and we will have an honest conversation about whether we are the right fit.',
      category: 'Getting started',
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Industries                                                          */
/* ------------------------------------------------------------------ */

export const defaultIndustries: IndustryContent[] = [
  {
    slug: 'trades',
    name: 'Trades',
    navLabel: 'All trades',
    headline: 'Websites for Welsh tradespeople',
    subheading:
      'Built for the way people actually find a trade: on a phone, in a hurry, looking for someone local they can ring now.',
    intro:
      'Most of your work comes from recommendation, and that is a good thing. But the first thing someone does when they are given your name is look you up. If they find nothing, or a Facebook page last updated in 2019, you lose a job you had already won.',
    heroImage: '/images/industries/trades.svg',
    painPoints: [
      'You are quoted four figures by an agency for something you do not understand',
      'Your only web presence is a Facebook page you cannot control',
      'Customers cannot find your phone number quickly on a mobile',
      'You are invisible in searches for your own town',
    ],
    features: [
      'Click-to-call and WhatsApp buttons on every page',
      'Service pages for each thing you do',
      'Area pages for each town you cover',
      'Gallery for photos of your work',
      'Accreditations and insurance shown clearly',
      'Enquiry form that reaches you within seconds',
    ],
    typicalPages: ['Home', 'Services', 'Areas we cover', 'Gallery', 'About', 'Contact'],
    faqs: [
      {
        question: 'I only work by word of mouth. Do I need a website?',
        answer:
          'Word of mouth gets your name mentioned. A website is what happens next — people check you exist, look legitimate and are still trading. It closes the jobs recommendation opens.',
      },
      {
        question: 'I am not very good with computers.',
        answer:
          'That is precisely who this service is for. You fill in one form, we do everything else, and when you want something changed you ring or email us.',
      },
    ],
    seoTitle: 'Websites for tradespeople in Wales | CymruSites',
    seoDescription:
      'Affordable professional websites for Welsh tradespeople. Click-to-call, service and area pages, local SEO. From £299 setup and £29/month.',
  },
  {
    slug: 'plumbers',
    name: 'Plumbers',
    navLabel: 'Plumbers',
    headline: 'Websites for plumbers and heating engineers',
    subheading:
      'When someone has water coming through a ceiling, they ring the first plumber who looks trustworthy and available.',
    intro:
      'Plumbing searches are urgent and local. People search on a phone, they search at odd hours, and they ring rather than fill in forms. Your website needs to make that ring take one tap.',
    heroImage: '/images/industries/plumbers.svg',
    painPoints: [
      'Emergency customers cannot find your number fast enough',
      'No way to show you are Gas Safe registered',
      'Competitors appear above you for your own town',
      'Boiler enquiries go to the national companies',
    ],
    features: [
      'Emergency call-out banner with tap-to-call',
      'Gas Safe and accreditation badges',
      'Separate pages for boilers, bathrooms, leaks and heating',
      'Service area pages for each town',
      'Before-and-after gallery',
      '24 hour availability shown clearly',
    ],
    typicalPages: ['Home', 'Emergency plumbing', 'Boilers & heating', 'Bathrooms', 'Areas', 'Contact'],
    exampleSlug: 'cwm-valley-plumbing',
    faqs: [
      {
        question: 'Can you show that I am Gas Safe registered?',
        answer:
          'Yes — we display your registration number and badge prominently, which is one of the strongest trust signals on a plumbing website.',
      },
      {
        question: 'Can I show that I do 24 hour call-outs?',
        answer:
          'Yes. We can put a permanent emergency bar across the top of the site with a tap-to-call number and your hours.',
      },
    ],
    seoTitle: 'Websites for plumbers in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh plumbers and heating engineers. Emergency call-to-action, Gas Safe badges, local SEO. From £299 setup.',
  },
  {
    slug: 'electricians',
    name: 'Electricians',
    navLabel: 'Electricians',
    headline: 'Websites for electricians and electrical contractors',
    subheading:
      'Show your qualifications, your certifications and the work you do — domestic, commercial or both.',
    intro:
      'Electrical work is bought on trust and credentials. Customers want to see that you are registered with a competent person scheme before they let you near their consumer unit.',
    heroImage: '/images/industries/electricians.svg',
    painPoints: [
      'NICEIC or NAPIT registration is not visible anywhere online',
      'Commercial clients cannot find case studies or references',
      'EICR and landlord certificate work goes elsewhere',
      'No clear separation between domestic and commercial services',
    ],
    features: [
      'NICEIC / NAPIT / ELECSA registration badges',
      'Separate domestic and commercial sections',
      'EICR and landlord certificate enquiry forms',
      'EV charger installation pages',
      'Project gallery with descriptions',
      'Certificate and compliance information',
    ],
    typicalPages: ['Home', 'Domestic', 'Commercial', 'EV charging', 'EICR & testing', 'Contact'],
    exampleSlug: 'rhys-electrical',
    faqs: [
      {
        question: 'Can I have separate sections for domestic and commercial work?',
        answer:
          'Yes, and we recommend it. They are different buyers with different questions, so they get their own pages and their own enquiry forms.',
      },
      {
        question: 'Can you add EV charger installation?',
        answer:
          'Yes — it is one of the highest value searches in the trade at the moment and it deserves its own page.',
      },
    ],
    seoTitle: 'Websites for electricians in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh electricians. NICEIC badges, domestic and commercial sections, EV charging pages, local SEO. From £299 setup.',
  },
  {
    slug: 'builders',
    name: 'Builders',
    navLabel: 'Builders',
    headline: 'Websites for builders and construction firms',
    subheading: 'Your work is your best argument. We build the website around the photographs.',
    intro:
      'Extensions, renovations and new builds are considered purchases. People look at a lot of websites before they ring anyone, and they are looking for evidence you have done work like theirs before.',
    heroImage: '/images/industries/builders.svg',
    painPoints: [
      'Years of good work with nowhere to show it',
      'Losing bigger jobs to firms that simply look more established',
      'No way to demonstrate scale or capability',
      'Enquiries arrive with no detail about the project',
    ],
    features: [
      'Full-width project galleries',
      'Project case studies with before and after',
      'Detailed enquiry form that captures project type and budget',
      'Insurance, guarantees and memberships displayed',
      'Team page to show the people behind the firm',
      'Service pages for extensions, renovations and new builds',
    ],
    typicalPages: ['Home', 'Extensions', 'Renovations', 'Projects', 'About', 'Contact'],
    exampleSlug: 'taff-roofing',
    faqs: [
      {
        question: 'How many project photos can I show?',
        answer:
          'As many as you like. Galleries are unlimited on every plan — send us the photos and we will crop, compress and lay them out.',
      },
      {
        question: 'Can the enquiry form ask about budget?',
        answer:
          'Yes. Advanced lead forms are included on the Pro plan and we can add budget, timescale and project type fields so you can qualify enquiries before you ring back.',
      },
    ],
    seoTitle: 'Websites for builders in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh builders and construction firms. Project galleries, case studies, detailed lead forms. From £299 setup.',
  },
  {
    slug: 'roofers',
    name: 'Roofers',
    navLabel: 'Roofers',
    headline: 'Websites for roofers',
    subheading: 'Storm damage, leaks and full re-roofs — ready for the call that comes at short notice.',
    intro:
      'Roofing enquiries spike with the weather. When a storm goes through the valleys, the firms that get the calls are the ones people can find and ring immediately.',
    heroImage: '/images/industries/roofers.svg',
    painPoints: [
      'Missing the surge of enquiries after bad weather',
      'Customers cannot tell whether you do flat roofs, tiles or both',
      'No proof of guarantees or insurance work experience',
      'Rogue trader worries putting people off ringing',
    ],
    features: [
      'Emergency repair call-to-action',
      'Service pages for re-roofs, flat roofs, repairs and guttering',
      'Insurance work and storm damage information',
      'Guarantee and warranty details',
      'Before and after gallery',
      'Free inspection enquiry form',
    ],
    typicalPages: ['Home', 'Roof repairs', 'New roofs', 'Flat roofing', 'Gallery', 'Contact'],
    exampleSlug: 'taff-roofing',
    faqs: [
      {
        question: 'Can I highlight emergency storm damage work?',
        answer:
          'Yes — we can put an emergency banner at the top of the site and switch its wording seasonally if you want.',
      },
      {
        question: 'Can I show my guarantee?',
        answer:
          'Yes. Guarantees and insurance-backed warranties are one of the main things roofing customers look for, so we make them prominent.',
      },
    ],
    seoTitle: 'Websites for roofers in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh roofing companies. Emergency repairs, storm damage, guarantees and galleries. From £299 setup.',
  },
  {
    slug: 'landscapers',
    name: 'Landscapers',
    navLabel: 'Landscapers',
    headline: 'Websites for landscapers and garden designers',
    subheading: 'A visual trade deserves a visual website.',
    intro:
      'Landscaping sells on transformation. The right photographs, laid out well, do more for you than any amount of text — so the website gets out of their way.',
    heroImage: '/images/industries/landscapers.svg',
    painPoints: [
      'Beautiful work buried in a Facebook album',
      'Seasonal work with no way to promote what is available now',
      'Design clients and maintenance clients need different things',
      'No way to show the scale of what you can take on',
    ],
    features: [
      'Large photographic galleries',
      'Before and after sliders',
      'Seasonal service highlights',
      'Separate design, build and maintenance pages',
      'Project case studies',
      'Quote request form with site size and access questions',
    ],
    typicalPages: ['Home', 'Garden design', 'Landscaping', 'Maintenance', 'Gallery', 'Contact'],
    exampleSlug: 'dragon-landscapes',
    faqs: [
      {
        question: 'Can I show before and after photos?',
        answer: 'Yes, and we strongly recommend it — it is the single most persuasive thing on a landscaping website.',
      },
      {
        question: 'Can I promote seasonal work?',
        answer:
          'Yes. Tell us what you want pushed and we will update the homepage — that is included in your monthly plan.',
      },
    ],
    seoTitle: 'Websites for landscapers in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh landscapers and garden designers. Photographic galleries, before and after, seasonal promotion. From £299 setup.',
  },
  {
    slug: 'automotive',
    name: 'Automotive',
    navLabel: 'Automotive',
    headline: 'Websites for garages, MOT centres and mobile mechanics',
    subheading: 'Make it easy to see what you do, what it costs and how to book it.',
    intro:
      'Independent garages compete with national chains that spend heavily on advertising. What you have that they do not is a local reputation — the website’s job is to make that visible.',
    heroImage: '/images/industries/automotive.svg',
    painPoints: [
      'Losing MOT bookings to national chains',
      'No way for customers to request a booking out of hours',
      'Servicing prices not visible, so people do not ring',
      'Specialisms such as diagnostics or EV are invisible',
    ],
    features: [
      'MOT and service booking enquiry form',
      'Price list or "from" pricing',
      'Opening hours prominently displayed',
      'Specialisms and manufacturer expertise',
      'Reviews section',
      'Directions and parking information',
    ],
    typicalPages: ['Home', 'MOT', 'Servicing', 'Repairs', 'Book in', 'Contact'],
    exampleSlug: 'valleys-auto-care',
    faqs: [
      {
        question: 'Can customers book online?',
        answer:
          'Booking request forms are available on every plan, and structured online booking is included on Pro. Requests come into your dashboard and your inbox.',
      },
      {
        question: 'Should I show my prices?',
        answer:
          'For MOTs and standard servicing it nearly always increases enquiries. We can show fixed prices or "from" prices, whichever suits you.',
      },
    ],
    seoTitle: 'Websites for garages and mechanics in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh garages, MOT centres and mobile mechanics. Booking forms, price lists, reviews. From £299 setup.',
  },
  {
    slug: 'hospitality',
    name: 'Hospitality',
    navLabel: 'Hospitality',
    headline: 'Websites for cafés, pubs, restaurants and B&Bs',
    subheading: 'Menus that are actually readable on a phone, and opening hours people can trust.',
    intro:
      'Hospitality customers want three things quickly: are you open, what do you serve, and how do I book. Everything else is decoration.',
    heroImage: '/images/industries/hospitality.svg',
    painPoints: [
      'Menus shared as PDFs nobody can read on a phone',
      'Opening hours wrong in three different places online',
      'Booking enquiries lost in social media messages',
      'No way to show the atmosphere of the place',
    ],
    features: [
      'Menus as proper web pages, not PDFs',
      'Opening hours in one place, easy to update',
      'Booking and enquiry forms',
      'Photo galleries of the room and the food',
      'Events and specials',
      'Directions, parking and accessibility information',
    ],
    typicalPages: ['Home', 'Menu', 'Book a table', 'Events', 'Gallery', 'Find us'],
    faqs: [
      {
        question: 'Can I update my menu myself?',
        answer:
          'Send us your updated menu whenever it changes — by email or from your dashboard — and we will have it live the same day. No need to fight with a page builder to swap a price or add a dish.',
      },
      {
        question: 'Can I take bookings?',
        answer:
          'Booking enquiry forms are included on every plan. Structured booking with dates and party size is included on Pro.',
      },
    ],
    seoTitle: 'Websites for cafés, pubs and restaurants in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh hospitality businesses. Mobile-friendly menus, booking forms, events and galleries. From £299 setup.',
  },
  {
    slug: 'professional-services',
    name: 'Professional services',
    navLabel: 'Professional services',
    headline: 'Websites for accountants, solicitors and consultants',
    subheading: 'Credible, calm and clear — the way a professional practice should read.',
    intro:
      'Professional services are bought on confidence. Your website needs to look considered, explain what you do without jargon, and make it obvious how to start a conversation.',
    heroImage: '/images/industries/professional.svg',
    painPoints: [
      'A website that looks less established than the practice is',
      'Services described in language clients do not use',
      'No clear next step for a nervous first-time enquirer',
      'Nothing that distinguishes you from a national firm',
    ],
    features: [
      'Clear service pages written in plain English',
      'Team profiles and qualifications',
      'Sector or specialism pages',
      'Consultation booking enquiry',
      'Client testimonials and case studies',
      'Regulatory and professional body information',
    ],
    typicalPages: ['Home', 'Services', 'Sectors', 'Our team', 'Insights', 'Contact'],
    faqs: [
      {
        question: 'Can you write the content for us?',
        answer:
          'Yes. We write the first draft from your onboarding answers and a short conversation, then you review and correct it before anything goes live.',
      },
      {
        question: 'Can we publish articles or updates?',
        answer:
          'A news or insights section is included on the Pro plan, and we publish posts for you when you send them across.',
      },
    ],
    seoTitle: 'Websites for accountants and solicitors in Wales | CymruSites',
    seoDescription:
      'Professional websites for Welsh accountants, solicitors and consultants. Clear service pages, team profiles, consultation booking. From £299 setup.',
  },
];

/* ------------------------------------------------------------------ */
/* Portfolio examples                                                  */
/* ------------------------------------------------------------------ */

export const PORTFOLIO_CATEGORIES = [
  'Trades',
  'Automotive',
  'Hospitality',
  'Professional',
  'Health & Beauty',
  'Local Services',
] as const;

export const defaultPortfolio: PortfolioExample[] = [
  {
    slug: 'rhys-electrical',
    businessName: 'Rhys Electrical',
    industry: 'Electrical',
    category: 'Trades',
    location: 'Cardiff',
    description:
      'Domestic and commercial electrical contractor. Split hero, NICEIC credentials front and centre, and separate enquiry routes for households and commercial clients.',
    pages: ['Home', 'Domestic', 'Commercial', 'EV charging', 'Areas', 'Contact'],
    features: ['Click-to-call', 'Accreditation badges', 'Service areas', 'Enquiry form', 'Local SEO'],
    templateSlug: 'y-cwm',
    accent: '#2F5444',
    demoHref: '/demo/rhys-electrical',
  },
  {
    slug: 'cwm-valley-plumbing',
    businessName: 'Cwm Valley Plumbing',
    industry: 'Plumbing & heating',
    category: 'Trades',
    location: 'Pontypridd',
    description:
      '24 hour emergency plumber. Built around the phone call — a permanent call-out bar, tap-to-call and Gas Safe registration visible on every page.',
    pages: ['Home', 'Emergency', 'Boilers', 'Bathrooms', 'Contact'],
    features: ['Emergency call bar', 'WhatsApp button', 'Gas Safe badge', 'Google Maps', 'Reviews'],
    templateSlug: 'y-bont',
    accent: '#B45309',
    demoHref: '/demo/cwm-valley-plumbing',
  },
  {
    slug: 'taff-roofing',
    businessName: 'Taff Roofing',
    industry: 'Roofing',
    category: 'Trades',
    location: 'Merthyr Tydfil',
    description:
      'Roofing contractor covering the Heads of the Valleys. A photographic template that leads with completed work and a free roof inspection offer.',
    pages: ['Home', 'Roof repairs', 'New roofs', 'Flat roofing', 'Gallery', 'Contact'],
    features: ['Full-width gallery', 'Storm damage banner', 'Guarantee details', 'Free inspection form'],
    templateSlug: 'y-glannau',
    accent: '#C8102E',
    demoHref: '/demo/taff-roofing',
  },
  {
    slug: 'dragon-landscapes',
    businessName: 'Dragon Landscapes',
    industry: 'Landscaping',
    category: 'Local Services',
    location: 'Caerphilly',
    description:
      'Garden design and landscaping. Bilingual site with large photography, seasonal highlights and a quote form that asks the right questions up front.',
    pages: ['Home', 'Garden design', 'Landscaping', 'Maintenance', 'Gallery', 'Contact'],
    features: ['Bilingual (EN/CY)', 'Before & after gallery', 'Seasonal sections', 'Quote form'],
    templateSlug: 'y-glannau',
    accent: '#3F6C58',
    demoHref: '/demo/dragon-landscapes',
  },
  {
    slug: 'valleys-auto-care',
    businessName: 'Valleys Auto Care',
    industry: 'Garage & MOT',
    category: 'Automotive',
    location: 'Aberdare',
    description:
      'Independent garage and MOT centre. Prices shown openly, opening hours impossible to miss and a booking request form that feeds straight into the dashboard.',
    pages: ['Home', 'MOT', 'Servicing', 'Repairs', 'Book in', 'Contact'],
    features: ['Booking requests', 'Price list', 'Opening hours', 'Reviews', 'Directions'],
    templateSlug: 'y-bont',
    accent: '#1D4ED8',
    demoHref: '/demo/valleys-auto-care',
  },
  {
    slug: 'caffi-bryn',
    businessName: 'Caffi Bryn',
    industry: 'Café',
    category: 'Hospitality',
    location: 'Swansea',
    description:
      'Independent café and bakery. An editorial layout with readable mobile menus, today’s specials and a table booking enquiry.',
    pages: ['Home', 'Menu', 'Book a table', 'Events', 'Find us'],
    features: ['Mobile menus', 'Opening hours', 'Booking enquiry', 'Gallery', 'Bilingual (EN/CY)'],
    templateSlug: 'y-castell',
    accent: '#7C2D45',
    demoHref: '/demo/caffi-bryn',
  },
];

/* ------------------------------------------------------------------ */
/* Settings key map                                                    */
/* ------------------------------------------------------------------ */

/**
 * Keys stored in the `settings` table. Admin → Content edits these; anything
 * missing falls back to the defaults above.
 */
export const SETTINGS_KEYS = {
  brand: 'content.brand',
  hero: 'content.hero',
  trustStrip: 'content.trust_strip',
  promise: 'content.promise',
  howItWorks: 'content.how_it_works',
  whyUs: 'content.why_us',
  included: 'content.included',
  welsh: 'content.welsh',
  localSeo: 'content.local_seo',
  testimonials: 'content.testimonials',
  faqs: 'content.faqs',
  finalCta: 'content.final_cta',
  seo: 'content.seo',
  industries: 'content.industries',
  portfolio: 'content.portfolio',
  adminAllowlist: 'admin_email_allowlist',
} as const;
